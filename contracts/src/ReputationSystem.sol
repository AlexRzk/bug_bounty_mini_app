// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ReputationSystem
 * @dev Track reporter and creator reputation with achievement badges (NFTs)
 * @notice Integrates with BountyManager to track on-chain reputation
 */
contract ReputationSystem is ERC721, Ownable {
    using Strings for uint256;

    // ============ Structs ============

    struct UserStats {
        // Reporter stats
        uint256 submissionsCount;
        uint256 acceptedSubmissions;
        uint256 totalEarned;          // Wei earned from bounties
        uint256 reputationScore;      // Calculated score (0-10000)
        
        // Creator stats
        uint256 bountiesCreated;
        uint256 bountiesCompleted;
        uint256 totalSpent;           // Wei spent on bounties
        uint256 avgResponseTime;      // Avg time to accept submissions
        
        // Engagement
        uint256 firstActivityDate;
        uint256 lastActivityDate;
        uint256 consecutiveDays;      // Streak
    }

    struct Badge {
        uint256 id;
        string name;
        string description;
        string imageURI;
        uint256 requirement;          // Points needed
        BadgeCategory category;
    }

    enum BadgeCategory {
        Reporter,       // Hunter achievements
        Creator,        // Bounty creator achievements
        Community,      // Community engagement
        Special         // Special events/milestones
    }

    // ============ State Variables ============

    address public bountyManager;     // Only BountyManager can update stats
    uint256 public nextBadgeId = 1;
    uint256 public nextTokenId = 1;
    
    mapping(address => UserStats) public userStats;
    mapping(uint256 => Badge) public badges;
    mapping(address => mapping(uint256 => bool)) public userBadges; // user => badgeId => claimed
    mapping(uint256 => uint256) public tokenIdToBadgeId;           // NFT tokenId => badgeId

    // Leaderboard arrays (top 10 for each category)
    address[] public topReporters;
    address[] public topCreators;

    // ============ Events ============

    event ReputationUpdated(
        address indexed user,
        uint256 newScore,
        uint256 submissionsAccepted,
        uint256 totalEarned
    );

    event BadgeAwarded(
        address indexed user,
        uint256 indexed badgeId,
        uint256 indexed tokenId,
        string badgeName
    );

    event StreakUpdated(
        address indexed user,
        uint256 consecutiveDays
    );

    // ============ Constructor ============

    constructor(address _bountyManager) 
        ERC721("BugBounty Achievement Badges", "BBADGE") 
        Ownable(msg.sender)
    {
        bountyManager = _bountyManager;
        _initializeBadges();
    }

    // ============ Modifiers ============

    modifier onlyBountyManager() {
        require(msg.sender == bountyManager, "Only BountyManager");
        _;
    }

    // ============ Core Functions ============

    /**
     * @notice Update reporter stats after submission acceptance
     * @param _reporter Address of the reporter
     * @param _amount Amount earned
     */
    function recordAcceptedSubmission(
        address _reporter,
        uint256 _amount
    ) external onlyBountyManager {
        UserStats storage stats = userStats[_reporter];
        
        // Initialize if first activity
        if (stats.firstActivityDate == 0) {
            stats.firstActivityDate = block.timestamp;
        }
        
        // Count this as a submission as well (ensures acceptance rate and activity reflect reality)
        stats.submissionsCount++;
        // Update reporter stats
        stats.acceptedSubmissions++;
        stats.totalEarned += _amount;
        
        // Update streak
        _updateStreak(_reporter);
        
        // Calculate new reputation score
        stats.reputationScore = _calculateReputationScore(_reporter);
        
        // Check for badge eligibility
        _checkAndAwardBadges(_reporter);
        
        // Update leaderboard
        _updateLeaderboard(_reporter, true);
        
        emit ReputationUpdated(
            _reporter,
            stats.reputationScore,
            stats.acceptedSubmissions,
            stats.totalEarned
        );
    }

    /**
     * @notice Record a new submission (accepted or not)
     */
    function recordSubmission(address _reporter) external onlyBountyManager {
        UserStats storage stats = userStats[_reporter];
        
        if (stats.firstActivityDate == 0) {
            stats.firstActivityDate = block.timestamp;
        }
        
        stats.submissionsCount++;
        
        _updateStreak(_reporter);

        // Award badges that depend on submissions count/streaks
        _checkAndAwardBadges(_reporter);
    }

    /**
     * @notice Record bounty creation
     */
    function recordBountyCreated(
        address _creator,
        uint256 _amount
    ) external onlyBountyManager {
        UserStats storage stats = userStats[_creator];
        
        if (stats.firstActivityDate == 0) {
            stats.firstActivityDate = block.timestamp;
        }
        
        stats.bountiesCreated++;
        stats.totalSpent += _amount;
        stats.lastActivityDate = block.timestamp;
        
        _updateLeaderboard(_creator, false);
    }

    /**
     * @notice Record bounty completion
     */
    function recordBountyCompleted(
        address _creator,
        uint256 _responseTime
    ) external onlyBountyManager {
        UserStats storage stats = userStats[_creator];
        
        stats.bountiesCompleted++;
        
        // Update average response time
        if (stats.avgResponseTime == 0) {
            stats.avgResponseTime = _responseTime;
        } else {
            stats.avgResponseTime = (stats.avgResponseTime + _responseTime) / 2;
        }
        
        _checkAndAwardBadges(_creator);
    }

    // ============ Reputation Calculation ============

    /**
     * @notice Calculate reputation score (0-10000)
     * @dev Formula: (acceptance_rate * 40%) + (total_earned * 30%) + (streak * 20%) + (submissions * 10%)
     */
    function _calculateReputationScore(address _user) internal view returns (uint256) {
        UserStats memory stats = userStats[_user];
        
        if (stats.submissionsCount == 0) return 0;
        
        // Acceptance rate (0-4000 points)
        uint256 acceptanceRate = (stats.acceptedSubmissions * 4000) / stats.submissionsCount;
        
        // Total earned normalized (0-3000 points)
        // Cap at 10 ETH for normalization
        uint256 earnedPoints = stats.totalEarned > 10 ether 
            ? 3000 
            : (stats.totalEarned * 3000) / 10 ether;
        
        // Streak bonus (0-2000 points)
        uint256 streakPoints = stats.consecutiveDays > 100 
            ? 2000 
            : (stats.consecutiveDays * 20);
        
        // Activity points (0-1000 points)
        uint256 activityPoints = stats.submissionsCount > 50 
            ? 1000 
            : (stats.submissionsCount * 20);
        
        return acceptanceRate + earnedPoints + streakPoints + activityPoints;
    }

    /**
     * @notice Update user's activity streak
     */
    function _updateStreak(address _user) internal {
        UserStats storage stats = userStats[_user];
        // Normalize to day counts to avoid off-by-seconds when warping
        if (stats.lastActivityDate == 0) {
            stats.consecutiveDays = 1;
        } else {
            uint256 lastDay = stats.lastActivityDate / 1 days;
            uint256 currentDay = block.timestamp / 1 days;
            if (currentDay > lastDay) {
                uint256 dayDelta = currentDay - lastDay;
                if (dayDelta == 1) {
                    stats.consecutiveDays++;
                    emit StreakUpdated(_user, stats.consecutiveDays);
                } else if (dayDelta > 1) {
                    stats.consecutiveDays = 1;
                }
                // if same day, no change
            }
        }
        // Always update the last activity time to now at the end
        stats.lastActivityDate = block.timestamp;
    }

    // ============ Badge System ============

    /**
     * @notice Initialize default achievement badges
     */
    function _initializeBadges() internal {
        // Reporter badges
        _createBadge("First Bug", "Submit your first report", "ipfs://first-bug", 1, BadgeCategory.Reporter);
        _createBadge("Bug Hunter", "Submit 10 reports", "ipfs://bug-hunter", 10, BadgeCategory.Reporter);
        _createBadge("Elite Hunter", "Submit 50 reports", "ipfs://elite-hunter", 50, BadgeCategory.Reporter);
        _createBadge("First Blood", "Get your first acceptance", "ipfs://first-blood", 1, BadgeCategory.Reporter);
        _createBadge("Consistent", "Maintain 10-day streak", "ipfs://consistent", 10, BadgeCategory.Reporter);
        _createBadge("High Earner", "Earn 1 ETH total", "ipfs://high-earner", 1 ether, BadgeCategory.Reporter);
        
        // Creator badges
        _createBadge("First Bounty", "Create your first bounty", "ipfs://first-bounty", 1, BadgeCategory.Creator);
        _createBadge("Generous", "Create bounties worth 5 ETH", "ipfs://generous", 5 ether, BadgeCategory.Creator);
        _createBadge("Fair Judge", "Complete 10 bounties", "ipfs://fair-judge", 10, BadgeCategory.Creator);
        
        // Community badges
        _createBadge("Early Adopter", "Join in first month", "ipfs://early-adopter", 0, BadgeCategory.Special);
    }

    function _createBadge(
        string memory _name,
        string memory _description,
        string memory _imageURI,
        uint256 _requirement,
        BadgeCategory _category
    ) internal {
        uint256 badgeId = nextBadgeId++;
        badges[badgeId] = Badge({
            id: badgeId,
            name: _name,
            description: _description,
            imageURI: _imageURI,
            requirement: _requirement,
            category: _category
        });
    }

    /**
     * @notice Check and award eligible badges
     */
    function _checkAndAwardBadges(address _user) internal {
        UserStats memory stats = userStats[_user];
        
        // Check reporter badges
        if (stats.submissionsCount >= 1) _tryAwardBadge(_user, 1); // First Bug
        if (stats.submissionsCount >= 10) _tryAwardBadge(_user, 2); // Bug Hunter
        if (stats.submissionsCount >= 50) _tryAwardBadge(_user, 3); // Elite Hunter
        if (stats.acceptedSubmissions >= 1) _tryAwardBadge(_user, 4); // First Blood
        if (stats.consecutiveDays >= 10) _tryAwardBadge(_user, 5); // Consistent
        if (stats.totalEarned >= 1 ether) _tryAwardBadge(_user, 6); // High Earner
        
        // Check creator badges
        if (stats.bountiesCreated >= 1) _tryAwardBadge(_user, 7); // First Bounty
        if (stats.totalSpent >= 5 ether) _tryAwardBadge(_user, 8); // Generous
        if (stats.bountiesCompleted >= 10) _tryAwardBadge(_user, 9); // Fair Judge
    }

    function _tryAwardBadge(address _user, uint256 _badgeId) internal {
        if (!userBadges[_user][_badgeId]) {
            userBadges[_user][_badgeId] = true;
            
            // Mint NFT badge
            uint256 tokenId = nextTokenId++;
            tokenIdToBadgeId[tokenId] = _badgeId;
            _safeMint(_user, tokenId);
            
            emit BadgeAwarded(_user, _badgeId, tokenId, badges[_badgeId].name);
        }
    }

    /**
     * @notice Manual badge award by admin for special events
     */
    function awardSpecialBadge(address _user, uint256 _badgeId) external onlyOwner {
        require(badges[_badgeId].category == BadgeCategory.Special, "Not special badge");
        _tryAwardBadge(_user, _badgeId);
    }

    // ============ Leaderboard ============

    function _updateLeaderboard(address _user, bool _isReporter) internal {
        address[] storage leaderboard = _isReporter ? topReporters : topCreators;
        
        // Simple insertion - could be optimized with binary search
        bool found = false;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i] == _user) {
                found = true;
                break;
            }
        }
        
        if (!found && leaderboard.length < 100) {
            leaderboard.push(_user);
        }
        
        // Sort top 10 (bubble sort for simplicity)
        _sortLeaderboard(leaderboard, _isReporter);
    }

    function _sortLeaderboard(address[] storage leaderboard, bool _isReporter) internal {
        uint256 length = leaderboard.length > 10 ? 10 : leaderboard.length;
        
        for (uint256 i = 0; i < length; i++) {
            for (uint256 j = i + 1; j < length; j++) {
                uint256 scoreI = _isReporter 
                    ? userStats[leaderboard[i]].reputationScore 
                    : userStats[leaderboard[i]].totalSpent;
                    
                uint256 scoreJ = _isReporter 
                    ? userStats[leaderboard[j]].reputationScore 
                    : userStats[leaderboard[j]].totalSpent;
                
                if (scoreJ > scoreI) {
                    address temp = leaderboard[i];
                    leaderboard[i] = leaderboard[j];
                    leaderboard[j] = temp;
                }
            }
        }
    }

    // ============ View Functions ============

    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }

    function getUserBadges(address _user) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextBadgeId; i++) {
            if (userBadges[_user][i]) count++;
        }
        
        uint256[] memory badgeIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextBadgeId; i++) {
            if (userBadges[_user][i]) {
                badgeIds[index++] = i;
            }
        }
        
        return badgeIds;
    }

    function getTopReporters(uint256 _count) external view returns (address[] memory) {
        uint256 length = _count > topReporters.length ? topReporters.length : _count;
        address[] memory top = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            top[i] = topReporters[i];
        }
        return top;
    }

    function getTopCreators(uint256 _count) external view returns (address[] memory) {
        uint256 length = _count > topCreators.length ? topCreators.length : _count;
        address[] memory top = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            top[i] = topCreators[i];
        }
        return top;
    }

    function getBadgeMetadata(uint256 _badgeId) external view returns (Badge memory) {
        return badges[_badgeId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 badgeId = tokenIdToBadgeId[tokenId];
        Badge memory badge = badges[badgeId];
        
        // Simple JSON metadata - could use base64 encoding for full on-chain metadata
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(string(abi.encodePacked(
                '{"name":"', badge.name, '",',
                '"description":"', badge.description, '",',
                '"image":"', badge.imageURI, '"}'
            ))))
        ));
    }

    // ============ Admin Functions ============

    function setBountyManager(address _newManager) external onlyOwner {
        bountyManager = _newManager;
    }

    function createCustomBadge(
        string calldata _name,
        string calldata _description,
        string calldata _imageURI,
        uint256 _requirement,
        BadgeCategory _category
    ) external onlyOwner {
        _createBadge(_name, _description, _imageURI, _requirement, _category);
    }

    // ============ Helper Functions ============

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        // Simple base64 encoding - you'd want to use a library like Base64.sol from OpenZeppelin
        // This is a placeholder
        return string(data);
    }
}
