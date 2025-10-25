// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BountyManagerV3
 * @notice Enhanced bug bounty platform with escrow and time locks
 * @dev Adds protection against creator abuse with time-locked escrow system
 */
contract BountyManagerV3 is Ownable, ReentrancyGuard {
    
    // ============ Enums ============
    
    enum Severity {
        Low,
        Medium,
        High,
        Critical
    }
    
    enum BountyStatus {
        Active,
        Locked,      // NEW: Locked after first response
        Completed,
        Cancelled,
        Disputed     // NEW: In dispute resolution
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
        uint256 deadline;
        uint256 responseCount;
        uint256 lockedAt;           // NEW: When bounty got locked
        uint256 selectionDeadline;  // NEW: Deadline for creator to select winner
    }
    
    struct Response {
        uint256 id;
        uint256 bountyId;
        address responder;
        string description;
        uint256 submittedAt;
        bool accepted;
    }
    
    // ============ Constants ============
    
    uint256 public constant SELECTION_PERIOD = 7 days; // Creator has 7 days to select
    uint256 public constant DISPUTE_COMPENSATION = 25; // 25% compensation to submitters
    
    // ============ State Variables ============
    
    uint256 public nextBountyId = 1;
    uint256 public nextResponseId = 1;
    uint256 public platformFee = 250; // 2.5% in basis points
    address public feeCollector;
    
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Response) public responses;
    mapping(uint256 => uint256[]) public bountyResponses;
    mapping(uint256 => mapping(address => bool)) public hasClaimedCompensation; // NEW
    
    // ============ Events ============
    
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        Severity severity,
        uint256 deadline
    );
    
    event ResponseSubmitted(
        uint256 indexed responseId,
        uint256 indexed bountyId,
        address indexed responder,
        string description
    );
    
    event BountyLocked(
        uint256 indexed bountyId,
        uint256 selectionDeadline
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
    
    event BountyDisputed(
        uint256 indexed bountyId,
        uint256 compensation
    );
    
    event CompensationClaimed(
        uint256 indexed bountyId,
        address indexed responder,
        uint256 amount
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
     */
    function createBounty(
        string memory _title,
        string memory _description,
        Severity _severity,
        uint256 _deadline,
        address _creator
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Reward must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
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
            deadline: _deadline,
            responseCount: 0,
            lockedAt: 0,
            selectionDeadline: 0
        });
        
        emit BountyCreated(bountyId, creator, _title, msg.value, _severity, _deadline);
        return bountyId;
    }
    
    /**
     * @notice Submit a response to a bounty
     * @dev First response locks the bounty and starts selection timer
     */
    function submitResponse(
        uint256 _bountyId,
        string memory _description
    ) external nonReentrant returns (uint256) {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(
            bounty.status == BountyStatus.Active || bounty.status == BountyStatus.Locked,
            "Bounty not accepting responses"
        );
        require(block.timestamp <= bounty.deadline, "Bounty deadline has passed");
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
        
        // Lock bounty on first response
        if (bounty.status == BountyStatus.Active && bounty.responseCount == 1) {
            bounty.status = BountyStatus.Locked;
            bounty.lockedAt = block.timestamp;
            bounty.selectionDeadline = block.timestamp + SELECTION_PERIOD;
            emit BountyLocked(_bountyId, bounty.selectionDeadline);
        }
        
        emit ResponseSubmitted(responseId, _bountyId, msg.sender, _description);
        return responseId;
    }
    
    /**
     * @notice Complete a bounty by accepting a response
     * @dev Can only be called by creator within selection period
     */
    function completeBounty(
        uint256 _bountyId,
        uint256 _responseId
    ) external nonReentrant {
        Bounty storage bounty = bounties[_bountyId];
        Response storage response = responses[_responseId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(msg.sender == bounty.creator, "Only creator can complete bounty");
        require(
            bounty.status == BountyStatus.Active || bounty.status == BountyStatus.Locked,
            "Bounty not active"
        );
        require(response.bountyId == _bountyId, "Response not for this bounty");
        require(!response.accepted, "Response already accepted");
        
        // If locked, must be within selection period
        if (bounty.status == BountyStatus.Locked) {
            require(
                block.timestamp <= bounty.selectionDeadline,
                "Selection deadline passed - bounty in dispute"
            );
        }
        
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
     * @notice Cancel a bounty (only if no responses or before lock)
     */
    function cancelBounty(uint256 _bountyId) external nonReentrant {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(msg.sender == bounty.creator, "Only creator can cancel");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(bounty.responseCount == 0, "Cannot cancel with responses - bounty is locked");
        
        uint256 refund = bounty.reward;
        bounty.status = BountyStatus.Cancelled;
        
        (bool success, ) = bounty.creator.call{value: refund}("");
        require(success, "Refund transfer failed");
        
        emit BountyCancelled(_bountyId, refund);
    }
    
    /**
     * @notice Trigger dispute if creator doesn't select winner within timeframe
     * @dev Can be called by anyone after selection deadline
     */
    function disputeBounty(uint256 _bountyId) external nonReentrant {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.Locked, "Bounty not locked");
        require(block.timestamp > bounty.selectionDeadline, "Selection period not over");
        require(bounty.responseCount > 0, "No responses to dispute");
        
        bounty.status = BountyStatus.Disputed;
        
        uint256 totalCompensation = (bounty.reward * DISPUTE_COMPENSATION) / 100;
        
        emit BountyDisputed(_bountyId, totalCompensation);
    }
    
    /**
     * @notice Claim compensation from a disputed bounty
     * @dev Each responder can claim equal share of compensation pool
     */
    function claimCompensation(uint256 _bountyId) external nonReentrant {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.Disputed, "Bounty not disputed");
        require(!hasClaimedCompensation[_bountyId][msg.sender], "Already claimed");
        
        // Verify caller submitted a response
        bool isResponder = false;
        uint256[] memory responseIds = bountyResponses[_bountyId];
        for (uint256 i = 0; i < responseIds.length; i++) {
            if (responses[responseIds[i]].responder == msg.sender) {
                isResponder = true;
                break;
            }
        }
        require(isResponder, "Not a responder");
        
        // Calculate compensation per responder
        uint256 totalCompensation = (bounty.reward * DISPUTE_COMPENSATION) / 100;
        uint256 compensation = totalCompensation / bounty.responseCount;
        
        hasClaimedCompensation[_bountyId][msg.sender] = true;
        
        (bool success, ) = msg.sender.call{value: compensation}("");
        require(success, "Compensation transfer failed");
        
        emit CompensationClaimed(_bountyId, msg.sender, compensation);
    }
    
    // ============ View Functions ============
    
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
    
    function getBountyResponses(uint256 _bountyId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return bountyResponses[_bountyId];
    }
    
    function totalBounties() external view returns (uint256) {
        return nextBountyId - 1;
    }
    
    function totalResponses() external view returns (uint256) {
        return nextResponseId - 1;
    }
    
    function canDisputeBounty(uint256 _bountyId) external view returns (bool) {
        Bounty storage bounty = bounties[_bountyId];
        return bounty.status == BountyStatus.Locked && 
               block.timestamp > bounty.selectionDeadline &&
               bounty.responseCount > 0;
    }
    
    // ============ Admin Functions ============
    
    function setFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }
    
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high (max 10%)");
        uint256 oldFee = platformFee;
        platformFee = _newFee;
        emit PlatformFeeUpdated(oldFee, _newFee);
    }
    
    receive() external payable {
        revert("Direct transfers not allowed");
    }
}
