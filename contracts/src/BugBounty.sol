// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BugBounty
 * @dev A decentralized bug bounty platform on Base
 */
contract BugBounty is Ownable, ReentrancyGuard {
    struct Bounty {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 reward;
        bool active;
        bool completed;
        address winner;
        uint256 createdAt;
        uint256 deadline;
    }

    struct Response {
        uint256 id;
        uint256 bountyId;
        address responder;
        string description;
        uint256 submittedAt;
        bool accepted;
    }

    uint256 public nextBountyId = 1;
    uint256 public nextResponseId = 1;
    uint256 public platformFee = 250; // 2.5% in basis points
    
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Response) public responses;
    mapping(uint256 => uint256[]) public bountyResponses; // bountyId => responseIds
    
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        uint256 deadline
    );
    
    event ResponseSubmitted(
        uint256 indexed responseId,
        uint256 indexed bountyId,
        address indexed responder
    );
    
    event BountyCompleted(
        uint256 indexed bountyId,
        uint256 indexed responseId,
        address indexed winner,
        uint256 reward
    );
    
    event BountyCancelled(uint256 indexed bountyId);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new bug bounty
     */
    function createBounty(
        string memory _title,
        string memory _description,
        uint256 _deadline
    ) external payable returns (uint256) {
        require(msg.value > 0, "Reward must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        uint256 bountyId = nextBountyId++;
        
        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: msg.sender,
            title: _title,
            description: _description,
            reward: msg.value,
            active: true,
            completed: false,
            winner: address(0),
            createdAt: block.timestamp,
            deadline: _deadline
        });
        
        emit BountyCreated(bountyId, msg.sender, _title, msg.value, _deadline);
        
        return bountyId;
    }
    
    /**
     * @dev Submit a response to a bounty
     */
    function submitResponse(
        uint256 _bountyId,
        string memory _description
    ) external returns (uint256) {
        Bounty storage bounty = bounties[_bountyId];
        require(bounty.active, "Bounty is not active");
        require(!bounty.completed, "Bounty is already completed");
        require(block.timestamp < bounty.deadline, "Bounty deadline has passed");
        require(bounty.creator != msg.sender, "Cannot respond to your own bounty");
        
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
        
        emit ResponseSubmitted(responseId, _bountyId, msg.sender);
        
        return responseId;
    }
    
    /**
     * @dev Accept a response and complete the bounty
     */
    function acceptResponse(uint256 _responseId) external nonReentrant {
        Response storage response = responses[_responseId];
        Bounty storage bounty = bounties[response.bountyId];
        
        require(msg.sender == bounty.creator, "Only bounty creator can accept");
        require(bounty.active, "Bounty is not active");
        require(!bounty.completed, "Bounty is already completed");
        require(!response.accepted, "Response already accepted");
        
        // Mark response as accepted
        response.accepted = true;
        
        // Mark bounty as completed
        bounty.completed = true;
        bounty.active = false;
        bounty.winner = response.responder;
        
        // Calculate platform fee
        uint256 fee = (bounty.reward * platformFee) / 10000;
        uint256 payoutAmount = bounty.reward - fee;
        
        // Transfer reward to winner
        (bool success, ) = payable(response.responder).call{value: payoutAmount}("");
        require(success, "Transfer to winner failed");
        
        // Transfer fee to owner (if any)
        if (fee > 0) {
            (bool feeSuccess, ) = payable(owner()).call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        emit BountyCompleted(response.bountyId, _responseId, response.responder, payoutAmount);
    }
    
    /**
     * @dev Cancel a bounty and refund the creator
     */
    function cancelBounty(uint256 _bountyId) external nonReentrant {
        Bounty storage bounty = bounties[_bountyId];
        
        require(msg.sender == bounty.creator, "Only creator can cancel");
        require(bounty.active, "Bounty is not active");
        require(!bounty.completed, "Bounty is already completed");
        
        bounty.active = false;
        
        // Refund the creator
        (bool success, ) = payable(bounty.creator).call{value: bounty.reward}("");
        require(success, "Refund failed");
        
        emit BountyCancelled(_bountyId);
    }
    
    /**
     * @dev Get all response IDs for a bounty
     */
    function getBountyResponses(uint256 _bountyId) external view returns (uint256[] memory) {
        return bountyResponses[_bountyId];
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _newFee;
    }
}
