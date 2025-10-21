// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BountyManagerV2
 * @notice A decentralized bug bounty platform on Base
 * @dev Production-ready contract with security features and fee system
 */
contract BountyManagerV2 is Ownable, ReentrancyGuard {
    
    // ============ Enums ============
    
    enum Severity {
        Low,
        Medium,
        High,
        Critical
    }
    
    enum BountyStatus {
        Active,
        Completed,
        Cancelled
    }
    
    // ============ Structs ============
    
    struct Bounty {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 reward;
        Severity severity;
        BountyStatus status;
        address winner;
        uint256 createdAt;
        uint256 responseCount;
    }
    
    struct Response {
        uint256 id;
        uint256 bountyId;
        address responder;
        string description;
        uint256 submittedAt;
        bool accepted;
    }
    
    // ============ State Variables ============
    
    uint256 public nextBountyId = 1;
    uint256 public nextResponseId = 1;
    uint256 public platformFee = 250; // 2.5% in basis points (250/10000)
    address public feeCollector;
    
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Response) public responses;
    mapping(uint256 => uint256[]) public bountyResponses; // bountyId => responseIds[]
    
    // ============ Events ============
    
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        Severity severity
    );
    
    event ResponseSubmitted(
        uint256 indexed responseId,
        uint256 indexed bountyId,
        address indexed responder,
        string description
    );
    
    event BountyCompleted(
        uint256 indexed bountyId,
        uint256 indexed responseId,
        address indexed winner,
        uint256 payout
    );
    
    event BountyCancelled(
        uint256 indexed bountyId,
        uint256 refund
    );
    
    event FeeCollectorUpdated(
        address indexed oldCollector,
        address indexed newCollector
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    // ============ Constructor ============
    
    constructor(address _feeCollector) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Create a new bug bounty
     * @param _title Bounty title
     * @param _description Detailed bounty description
     * @param _severity Bug severity level (0=Low, 1=Medium, 2=High, 3=Critical)
     * @param _creator Original creator address (for bot submissions)
     * @return bountyId The created bounty ID
     */
    function createBounty(
        string memory _title,
        string memory _description,
        Severity _severity,
        address _creator
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Reward must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        // Use _creator if provided (for bot), otherwise msg.sender
        address creator = _creator != address(0) ? _creator : msg.sender;
        
        uint256 bountyId = nextBountyId++;
        
        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: creator,
            title: _title,
            description: _description,
            reward: msg.value,
            severity: _severity,
            status: BountyStatus.Active,
            winner: address(0),
            createdAt: block.timestamp,
            responseCount: 0
        });
        
        emit BountyCreated(bountyId, creator, _title, msg.value, _severity);
        
        return bountyId;
    }
    
    /**
     * @notice Submit a response to a bounty
     * @param _bountyId The bounty ID
     * @param _description Response description/solution
     * @return responseId The created response ID
     */
    function submitResponse(
        uint256 _bountyId,
        string memory _description
    ) external nonReentrant returns (uint256) {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(msg.sender != bounty.creator, "Creator cannot submit response");
        
        uint256 responseId = nextResponseId++;
        
        responses[responseId] = Response({
            id: responseId,
            bountyId: _bountyId,
            responder: msg.sender,
            description: _description,
            submittedAt: block.timestamp,
            accepted: false
        });
        
        bountyResponses[_bountyId].push(responseId);
        bounty.responseCount++;
        
        emit ResponseSubmitted(responseId, _bountyId, msg.sender, _description);
        
        return responseId;
    }
    
    /**
     * @notice Complete a bounty by accepting a response
     * @param _bountyId The bounty ID
     * @param _responseId The winning response ID
     */
    function completeBounty(
        uint256 _bountyId,
        uint256 _responseId
    ) external nonReentrant {
        Bounty storage bounty = bounties[_bountyId];
        Response storage response = responses[_responseId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(msg.sender == bounty.creator, "Only creator can complete bounty");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(response.bountyId == _bountyId, "Response not for this bounty");
        require(!response.accepted, "Response already accepted");
        
        // Calculate fee and payout
        uint256 fee = (bounty.reward * platformFee) / 10000;
        uint256 payout = bounty.reward - fee;
        
        // Update state
        bounty.status = BountyStatus.Completed;
        bounty.winner = response.responder;
        response.accepted = true;
        
        // Transfer funds
        if (fee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        (bool payoutSuccess, ) = response.responder.call{value: payout}("");
        require(payoutSuccess, "Payout transfer failed");
        
        emit BountyCompleted(_bountyId, _responseId, response.responder, payout);
    }
    
    /**
     * @notice Cancel an active bounty and refund the creator
     * @param _bountyId The bounty ID to cancel
     */
    function cancelBounty(uint256 _bountyId) external nonReentrant {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(msg.sender == bounty.creator, "Only creator can cancel");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        
        uint256 refund = bounty.reward;
        bounty.status = BountyStatus.Cancelled;
        
        (bool success, ) = bounty.creator.call{value: refund}("");
        require(success, "Refund transfer failed");
        
        emit BountyCancelled(_bountyId, refund);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get all bounties (paginated)
     * @param _offset Starting index
     * @param _limit Number of bounties to return
     * @return Array of bounty IDs
     */
    function getBounties(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 total = nextBountyId - 1;
        if (_offset >= total) {
            return new uint256[](0);
        }
        
        uint256 end = _offset + _limit;
        if (end > total) {
            end = total;
        }
        
        uint256 length = end - _offset;
        uint256[] memory bountyIds = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            bountyIds[i] = _offset + i + 1;
        }
        
        return bountyIds;
    }
    
    /**
     * @notice Get responses for a bounty
     * @param _bountyId The bounty ID
     * @return Array of response IDs
     */
    function getBountyResponses(uint256 _bountyId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return bountyResponses[_bountyId];
    }
    
    /**
     * @notice Get total number of bounties
     * @return Total bounty count
     */
    function totalBounties() external view returns (uint256) {
        return nextBountyId - 1;
    }
    
    /**
     * @notice Get total number of responses
     * @return Total response count
     */
    function totalResponses() external view returns (uint256) {
        return nextResponseId - 1;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update the fee collector address
     * @param _newCollector New fee collector address
     */
    function setFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }
    
    /**
     * @notice Update the platform fee
     * @param _newFee New fee in basis points (max 10% = 1000)
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high (max 10%)");
        uint256 oldFee = platformFee;
        platformFee = _newFee;
        emit PlatformFeeUpdated(oldFee, _newFee);
    }
    
    // ============ Fallback ============
    
    receive() external payable {
        revert("Direct transfers not allowed");
    }
}
