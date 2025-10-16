// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BountyManager
 * @dev Production-ready bounty management system for Farcaster on Base blockchain
 * @notice Supports ETH and ERC20 token rewards, designed for Base Sepolia testnet → Base mainnet
 */
contract BountyManager is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ Structs ============

    enum BountyStatus {
        Active,      // Open for submissions
        Completed,   // Winner selected and paid
        Cancelled    // Cancelled by creator, funds refunded
    }

    enum PaymentToken {
        ETH,         // Native ETH
        ERC20        // ERC20 token (USDC, DAI, etc.)
    }

    struct Bounty {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 reward;
        PaymentToken paymentType;
        address tokenAddress;      // Only used for ERC20
        BountyStatus status;
        address winner;
        uint256 createdAt;
        uint256 deadline;
        string farcasterCastHash;  // Link to Farcaster post
    }

    struct Submission {
        uint256 id;
        uint256 bountyId;
        address submitter;
        string description;
        string proofUrl;           // Link to report/proof
        uint256 submittedAt;
        bool accepted;
        string farcasterUsername;  // Optional: link to Farcaster profile
    }

    // ============ State Variables ============

    uint256 public nextBountyId = 1;
    uint256 public nextSubmissionId = 1;
    uint256 public platformFeePercent = 500; // 5% in basis points (500/10000)
    address public feeCollector;

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission) public submissions;
    mapping(uint256 => uint256[]) public bountySubmissions; // bountyId => submissionIds[]
    mapping(address => uint256[]) public userBounties;      // creator => bountyIds[]
    mapping(address => uint256[]) public userSubmissions;   // submitter => submissionIds[]

    // Supported ERC20 tokens (optional whitelist for safety)
    mapping(address => bool) public supportedTokens;
    bool public whitelistEnabled = false;

    // ============ Events ============

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        PaymentToken paymentType,
        address tokenAddress,
        uint256 deadline,
        string farcasterCastHash
    );

    event SubmissionCreated(
        uint256 indexed submissionId,
        uint256 indexed bountyId,
        address indexed submitter,
        string farcasterUsername
    );

    event BountyCompleted(
        uint256 indexed bountyId,
        uint256 indexed submissionId,
        address indexed winner,
        uint256 rewardAmount,
        uint256 platformFee
    );

    event BountyCancelled(
        uint256 indexed bountyId,
        address indexed creator,
        uint256 refundAmount
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    event TokenWhitelisted(address indexed token, bool status);

    // ============ Constructor ============

    constructor(address _feeCollector) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new bounty with ETH reward
     * @param _title Bounty title
     * @param _description Detailed description
     * @param _deadline Submission deadline (unix timestamp)
     * @param _farcasterCastHash Link to Farcaster announcement post
     */
    function createBountyETH(
        string calldata _title,
        string calldata _description,
        uint256 _deadline,
        string calldata _farcasterCastHash
    ) external payable whenNotPaused returns (uint256) {
        require(msg.value > 0, "Reward must be > 0");
        require(_deadline > block.timestamp, "Deadline must be future");
        require(bytes(_title).length > 0, "Title required");

        uint256 bountyId = nextBountyId++;

        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: msg.sender,
            title: _title,
            description: _description,
            reward: msg.value,
            paymentType: PaymentToken.ETH,
            tokenAddress: address(0),
            status: BountyStatus.Active,
            winner: address(0),
            createdAt: block.timestamp,
            deadline: _deadline,
            farcasterCastHash: _farcasterCastHash
        });

        userBounties[msg.sender].push(bountyId);

        emit BountyCreated(
            bountyId,
            msg.sender,
            _title,
            msg.value,
            PaymentToken.ETH,
            address(0),
            _deadline,
            _farcasterCastHash
        );

        return bountyId;
    }

    /**
     * @notice Create a new bounty with ERC20 token reward
     * @param _title Bounty title
     * @param _description Detailed description
     * @param _reward Amount of tokens
     * @param _tokenAddress ERC20 token contract address
     * @param _deadline Submission deadline
     * @param _farcasterCastHash Link to Farcaster post
     */
    function createBountyERC20(
        string calldata _title,
        string calldata _description,
        uint256 _reward,
        address _tokenAddress,
        uint256 _deadline,
        string calldata _farcasterCastHash
    ) external whenNotPaused returns (uint256) {
        require(_reward > 0, "Reward must be > 0");
        require(_tokenAddress != address(0), "Invalid token");
        require(_deadline > block.timestamp, "Deadline must be future");
        require(bytes(_title).length > 0, "Title required");

        if (whitelistEnabled) {
            require(supportedTokens[_tokenAddress], "Token not whitelisted");
        }

        // Transfer tokens to contract
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _reward);

        uint256 bountyId = nextBountyId++;

        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: msg.sender,
            title: _title,
            description: _description,
            reward: _reward,
            paymentType: PaymentToken.ERC20,
            tokenAddress: _tokenAddress,
            status: BountyStatus.Active,
            winner: address(0),
            createdAt: block.timestamp,
            deadline: _deadline,
            farcasterCastHash: _farcasterCastHash
        });

        userBounties[msg.sender].push(bountyId);

        emit BountyCreated(
            bountyId,
            msg.sender,
            _title,
            _reward,
            PaymentToken.ERC20,
            _tokenAddress,
            _deadline,
            _farcasterCastHash
        );

        return bountyId;
    }

    /**
     * @notice Submit a bug report/solution to a bounty
     * @param _bountyId Target bounty
     * @param _description Report description
     * @param _proofUrl Link to detailed report
     * @param _farcasterUsername Optional Farcaster username
     */
    function submitReport(
        uint256 _bountyId,
        string calldata _description,
        string calldata _proofUrl,
        string calldata _farcasterUsername
    ) external whenNotPaused returns (uint256) {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(block.timestamp < bounty.deadline, "Deadline passed");
        require(bounty.creator != msg.sender, "Cannot submit to own bounty");
        require(bytes(_description).length > 0, "Description required");

        uint256 submissionId = nextSubmissionId++;

        submissions[submissionId] = Submission({
            id: submissionId,
            bountyId: _bountyId,
            submitter: msg.sender,
            description: _description,
            proofUrl: _proofUrl,
            submittedAt: block.timestamp,
            accepted: false,
            farcasterUsername: _farcasterUsername
        });

        bountySubmissions[_bountyId].push(submissionId);
        userSubmissions[msg.sender].push(submissionId);

        emit SubmissionCreated(submissionId, _bountyId, msg.sender, _farcasterUsername);

        return submissionId;
    }

    /**
     * @notice Accept a submission and pay out the winner
     * @param _submissionId Winning submission
     */
    function acceptSubmission(uint256 _submissionId) external nonReentrant whenNotPaused {
        Submission storage submission = submissions[_submissionId];
        Bounty storage bounty = bounties[submission.bountyId];

        require(msg.sender == bounty.creator, "Only creator can accept");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(!submission.accepted, "Already accepted");

        // Mark as completed
        submission.accepted = true;
        bounty.status = BountyStatus.Completed;
        bounty.winner = submission.submitter;

        // Calculate fees
        uint256 platformFee = (bounty.reward * platformFeePercent) / 10000;
        uint256 payoutAmount = bounty.reward - platformFee;

        // Pay out based on payment type
        if (bounty.paymentType == PaymentToken.ETH) {
            (bool successWinner, ) = payable(submission.submitter).call{value: payoutAmount}("");
            require(successWinner, "Winner payout failed");

            if (platformFee > 0) {
                (bool successFee, ) = payable(feeCollector).call{value: platformFee}("");
                require(successFee, "Fee transfer failed");
            }
        } else {
            IERC20 token = IERC20(bounty.tokenAddress);
            token.safeTransfer(submission.submitter, payoutAmount);
            
            if (platformFee > 0) {
                token.safeTransfer(feeCollector, platformFee);
            }
        }

        emit BountyCompleted(submission.bountyId, _submissionId, submission.submitter, payoutAmount, platformFee);
    }

    /**
     * @notice Cancel a bounty and refund the creator
     * @param _bountyId Bounty to cancel
     */
    function cancelBounty(uint256 _bountyId) external nonReentrant whenNotPaused {
        Bounty storage bounty = bounties[_bountyId];

        require(msg.sender == bounty.creator, "Only creator can cancel");
        require(bounty.status == BountyStatus.Active, "Bounty not active");

        bounty.status = BountyStatus.Cancelled;

        // Refund based on payment type
        if (bounty.paymentType == PaymentToken.ETH) {
            (bool success, ) = payable(bounty.creator).call{value: bounty.reward}("");
            require(success, "Refund failed");
        } else {
            IERC20(bounty.tokenAddress).safeTransfer(bounty.creator, bounty.reward);
        }

        emit BountyCancelled(_bountyId, bounty.creator, bounty.reward);
    }

    // ============ View Functions ============

    /**
     * @notice Get all submissions for a bounty
     */
    function getBountySubmissions(uint256 _bountyId) external view returns (uint256[] memory) {
        return bountySubmissions[_bountyId];
    }

    /**
     * @notice Get all bounties created by a user
     */
    function getUserBounties(address _user) external view returns (uint256[] memory) {
        return userBounties[_user];
    }

    /**
     * @notice Get all submissions by a user
     */
    function getUserSubmissions(address _user) external view returns (uint256[] memory) {
        return userSubmissions[_user];
    }

    /**
     * @notice Get detailed bounty info
     */
    function getBounty(uint256 _bountyId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 reward,
        PaymentToken paymentType,
        address tokenAddress,
        BountyStatus status,
        address winner,
        uint256 deadline,
        string memory farcasterCastHash
    ) {
        Bounty memory bounty = bounties[_bountyId];
        return (
            bounty.creator,
            bounty.title,
            bounty.description,
            bounty.reward,
            bounty.paymentType,
            bounty.tokenAddress,
            bounty.status,
            bounty.winner,
            bounty.deadline,
            bounty.farcasterCastHash
        );
    }

    // ============ Admin Functions ============

    /**
     * @notice Update platform fee (max 10%)
     */
    function setPlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 1000, "Fee cannot exceed 10%");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(oldFee, _newFeePercent);
    }

    /**
     * @notice Update fee collector address
     */
    function setFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }

    /**
     * @notice Enable/disable token whitelist
     */
    function setWhitelistEnabled(bool _enabled) external onlyOwner {
        whitelistEnabled = _enabled;
    }

    /**
     * @notice Add/remove token from whitelist
     */
    function setTokenWhitelisted(address _token, bool _status) external onlyOwner {
        supportedTokens[_token] = _status;
        emit TokenWhitelisted(_token, _status);
    }

    /**
     * @notice Pause contract in emergency
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal (only if paused and approved by governance)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(paused(), "Must be paused");
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(owner(), _amount);
        }
    }

    // ============ Receive ETH ============

    receive() external payable {}
}
