// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title BountyManager
 * @author Bug Bounty Platform Team
 * @notice Production-ready bounty management system for Farcaster on Base blockchain
 * @dev Supports ETH and ERC20 token rewards with platform fees. Security-hardened version.
 * @custom:security-contact security@bugbounty.com
 */
contract BountyManagerV2 is Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ Structs ============

    /// @notice Bounty lifecycle states
    enum BountyStatus {
        Active,      // Open for submissions
        Completed,   // Winner selected and paid
        Cancelled    // Cancelled by creator, funds refunded
    }

    /// @notice Supported payment methods
    enum PaymentToken {
        ETH,         // Native ETH
        ERC20        // ERC20 token (USDC, DAI, etc.)
    }

    /**
     * @notice Main bounty structure
     * @dev Variables ordered for optimal storage packing
     */
    struct Bounty {
        uint256 id;
        uint256 reward;
        uint256 createdAt;
        uint256 deadline;
        address creator;
        address tokenAddress;      // Only used for ERC20
        address winner;
        PaymentToken paymentType;
        BountyStatus status;
        string title;
        string description;
        string farcasterCastHash;  // Link to Farcaster post
    }

    /**
     * @notice Submission structure for bounty reports
     */
    struct Submission {
        uint256 id;
        uint256 bountyId;
        uint256 submittedAt;
        address submitter;
        string description;
        string proofUrl;           // Link to report/proof
        string farcasterUsername;  // Optional: link to Farcaster profile
        bool accepted;
    }

    // ============ State Variables ============

    /// @notice Next bounty ID counter
    uint256 public nextBountyId = 1;
    
    /// @notice Next submission ID counter
    uint256 public nextSubmissionId = 1;
    
    /// @notice Platform fee in basis points (500 = 5%)
    /// @dev Maximum fee is capped at 10% (1000 bps)
    uint256 public platformFeePercent = 500;
    
    /// @notice Address receiving platform fees
    address public feeCollector;

    /// @notice Bounty ID => Bounty data
    mapping(uint256 => Bounty) public bounties;
    
    /// @notice Submission ID => Submission data
    mapping(uint256 => Submission) public submissions;
    
    /// @notice Bounty ID => array of submission IDs
    mapping(uint256 => uint256[]) public bountySubmissions;
    
    /// @notice Creator address => array of bounty IDs
    mapping(address => uint256[]) public userBounties;
    
    /// @notice Submitter address => array of submission IDs
    mapping(address => uint256[]) public userSubmissions;

    /// @notice Whitelisted ERC20 tokens (when enabled)
    mapping(address => bool) public supportedTokens;
    
    /// @notice Whether token whitelist is enabled
    bool public whitelistEnabled = false;

    // ============ Events ============

    /**
     * @notice Emitted when a new bounty is created
     * @param bountyId Unique bounty identifier
     * @param creator Address of bounty creator
     * @param title Bounty title
     * @param reward Amount of reward
     * @param paymentType ETH or ERC20
     * @param tokenAddress Token contract (if ERC20)
     * @param deadline Submission deadline timestamp
     * @param farcasterCastHash Link to announcement
     */
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
    event WhitelistStatusUpdated(bool enabled);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);

    // ============ Constructor ============

    /**
     * @notice Initialize the contract
     * @dev Sets initial fee collector with validation
     * @param _feeCollector Address to receive platform fees
     */
    constructor(address _feeCollector) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_feeCollector != address(this), "Cannot be contract address");
        feeCollector = _feeCollector;
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new bounty with ETH reward
     * @dev Follows CEI pattern, validates all inputs
     * @param _title Bounty title
     * @param _description Detailed description
     * @param _deadline Submission deadline (unix timestamp)
     * @param _farcasterCastHash Link to Farcaster announcement post
     * @return bountyId Newly created bounty ID
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
        require(bytes(_title).length < 201, "Title too long");

        uint256 bountyId = nextBountyId++;

        Bounty storage bounty = bounties[bountyId];
        bounty.id = bountyId;
        bounty.creator = msg.sender;
        bounty.title = _title;
        bounty.description = _description;
        bounty.reward = msg.value;
        bounty.paymentType = PaymentToken.ETH;
        bounty.tokenAddress = address(0);
        bounty.status = BountyStatus.Active;
        bounty.winner = address(0);
        bounty.createdAt = block.timestamp;
        bounty.deadline = _deadline;
        bounty.farcasterCastHash = _farcasterCastHash;

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
     * @return bountyId Newly created bounty ID
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
        require(_tokenAddress != address(this), "Cannot use self as token");
        require(_deadline > block.timestamp, "Deadline must be future");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_title).length < 201, "Title too long");

        if (whitelistEnabled) {
            require(supportedTokens[_tokenAddress], "Token not whitelisted");
        }

        // Transfer tokens to contract
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _reward);

        uint256 bountyId = nextBountyId++;

        Bounty storage bounty = bounties[bountyId];
        bounty.id = bountyId;
        bounty.creator = msg.sender;
        bounty.title = _title;
        bounty.description = _description;
        bounty.reward = _reward;
        bounty.paymentType = PaymentToken.ERC20;
        bounty.tokenAddress = _tokenAddress;
        bounty.status = BountyStatus.Active;
        bounty.winner = address(0);
        bounty.createdAt = block.timestamp;
        bounty.deadline = _deadline;
        bounty.farcasterCastHash = _farcasterCastHash;

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
     * @return submissionId Newly created submission ID
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

        Submission storage submission = submissions[submissionId];
        submission.id = submissionId;
        submission.bountyId = _bountyId;
        submission.submitter = msg.sender;
        submission.description = _description;
        submission.proofUrl = _proofUrl;
        submission.submittedAt = block.timestamp;
        submission.accepted = false;
        submission.farcasterUsername = _farcasterUsername;

        bountySubmissions[_bountyId].push(submissionId);
        userSubmissions[msg.sender].push(submissionId);

        emit SubmissionCreated(submissionId, _bountyId, msg.sender, _farcasterUsername);

        return submissionId;
    }

    /**
     * @notice Accept a submission and pay out the winner
     * @dev CRITICAL SECURITY: Follows strict CEI pattern, emits events before transfers
     * @param _submissionId Winning submission
     * @custom:security Reentrancy protected, event-based reentrancy prevented
     */
    function acceptSubmission(uint256 _submissionId) external nonReentrant whenNotPaused {
        Submission storage submission = submissions[_submissionId];
        Bounty storage bounty = bounties[submission.bountyId];

        // Checks
        require(msg.sender == bounty.creator, "Only creator can accept");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(!submission.accepted, "Already accepted");
        require(block.timestamp <= bounty.deadline, "Deadline passed");
        require(submission.submitter != address(0), "Invalid submitter");

        // Effects (update state BEFORE external calls)
        submission.accepted = true;
        bounty.status = BountyStatus.Completed;
        bounty.winner = submission.submitter;

        // Calculate fees
        uint256 platformFee = (bounty.reward * platformFeePercent) / 10000;
        uint256 payoutAmount = bounty.reward - platformFee;

        require(payoutAmount > 0, "Invalid payout amount");

        // Emit event BEFORE external calls (prevents event-based reentrancy)
        emit BountyCompleted(submission.bountyId, _submissionId, submission.submitter, payoutAmount, platformFee);

        // Interactions (external calls LAST)
        if (bounty.paymentType == PaymentToken.ETH) {
            // Use .call with gas limit to prevent griefing
            (bool successWinner, ) = payable(submission.submitter).call{value: payoutAmount, gas: 10000}("");
            require(successWinner, "Winner payout failed");

            if (platformFee > 0) {
                (bool successFee, ) = payable(feeCollector).call{value: platformFee, gas: 10000}("");
                require(successFee, "Fee transfer failed");
            }
        } else {
            IERC20 token = IERC20(bounty.tokenAddress);
            token.safeTransfer(submission.submitter, payoutAmount);
            
            if (platformFee > 0) {
                token.safeTransfer(feeCollector, platformFee);
            }
        }
    }

    /**
     * @notice Cancel a bounty and refund the creator
     * @dev Only active bounties can be cancelled
     * @param _bountyId Bounty to cancel
     */
    function cancelBounty(uint256 _bountyId) external nonReentrant whenNotPaused {
        Bounty storage bounty = bounties[_bountyId];

        require(msg.sender == bounty.creator, "Only creator can cancel");
        require(bounty.status == BountyStatus.Active, "Bounty not active");

        // Effects
        bounty.status = BountyStatus.Cancelled;

        // Emit event before transfer
        emit BountyCancelled(_bountyId, bounty.creator, bounty.reward);

        // Interactions
        if (bounty.paymentType == PaymentToken.ETH) {
            (bool success, ) = payable(bounty.creator).call{value: bounty.reward, gas: 10000}("");
            require(success, "Refund failed");
        } else {
            IERC20(bounty.tokenAddress).safeTransfer(bounty.creator, bounty.reward);
        }
    }

    // ============ View Functions ============

    function getBountySubmissions(uint256 _bountyId) external view returns (uint256[] memory) {
        return bountySubmissions[_bountyId];
    }

    function getUserBounties(address _user) external view returns (uint256[] memory) {
        return userBounties[_user];
    }

    function getUserSubmissions(address _user) external view returns (uint256[] memory) {
        return userSubmissions[_user];
    }

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

    function setPlatformFee(uint256 _newFeePercent) external payable onlyOwner {
        require(_newFeePercent < 1001, "Fee cannot exceed 10%");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(oldFee, _newFeePercent);
    }

    function setFeeCollector(address _newCollector) external payable onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        require(_newCollector != address(this), "Cannot be contract");
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }

    function setWhitelistEnabled(bool _enabled) external payable onlyOwner {
        whitelistEnabled = _enabled;
        emit WhitelistStatusUpdated(_enabled);
    }

    function setTokenWhitelisted(address _token, bool _status) external payable onlyOwner {
        require(_token != address(0), "Invalid token");
        supportedTokens[_token] = _status;
        emit TokenWhitelisted(_token, _status);
    }

    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(paused(), "Must be paused");
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(owner(), _amount);
        }
    }

    /**
     * @notice Fallback to receive ETH
     * @dev Only accepts ETH, no data processing
     */
    receive() external payable {
        // Intentionally empty - accepts ETH for bounties
    }
}
