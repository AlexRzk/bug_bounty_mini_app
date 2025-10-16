// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ReputationSystem.sol";

contract ReputationSystemTest is Test {
    ReputationSystem public reputation;
    address public bountyManager;
    address public reporter;
    address public creator;

    function setUp() public {
        bountyManager = makeAddr("bountyManager");
        reporter = makeAddr("reporter");
        creator = makeAddr("creator");
        
        reputation = new ReputationSystem(bountyManager);
    }

    // ============ Reporter Tests ============

    function test_RecordSubmission() public {
        vm.prank(bountyManager);
        reputation.recordSubmission(reporter);
        
        ReputationSystem.UserStats memory stats = reputation.getUserStats(reporter);
        assertEq(stats.submissionsCount, 1);
    }

    function test_RecordAcceptedSubmission() public {
        vm.prank(bountyManager);
        reputation.recordAcceptedSubmission(reporter, 1 ether);
        
        ReputationSystem.UserStats memory stats = reputation.getUserStats(reporter);
        
        assertEq(stats.acceptedSubmissions, 1);
        assertEq(stats.totalEarned, 1 ether);
        assertGt(stats.reputationScore, 0);
    }

    function test_ReputationScoreIncreases() public {
        vm.startPrank(bountyManager);
        
        // First submission
        reputation.recordSubmission(reporter);
        reputation.recordAcceptedSubmission(reporter, 0.5 ether);
        ReputationSystem.UserStats memory stats1 = reputation.getUserStats(reporter);
        
        // Second submission
        reputation.recordSubmission(reporter);
        reputation.recordAcceptedSubmission(reporter, 0.5 ether);
        ReputationSystem.UserStats memory stats2 = reputation.getUserStats(reporter);
        
        vm.stopPrank();
        
        assertGt(stats2.reputationScore, stats1.reputationScore, "Score should increase");
    }

    function test_BadgeAwardedOnFirstAcceptance() public {
        vm.prank(bountyManager);
        reputation.recordAcceptedSubmission(reporter, 1 ether);
        
        uint256[] memory badges = reputation.getUserBadges(reporter);
        assertGt(badges.length, 0, "Should have at least one badge");
        
        // Check NFT was minted
        assertEq(reputation.balanceOf(reporter), badges.length);
    }

    function test_MultipleSubmissionsUnlockBadges() public {
        vm.startPrank(bountyManager);
        
        // Submit 10 times
        for (uint256 i = 0; i < 10; i++) {
            reputation.recordSubmission(reporter);
        }
        
        vm.stopPrank();
        
        uint256[] memory badges = reputation.getUserBadges(reporter);
        assertGt(badges.length, 0, "Should unlock Bug Hunter badge");
    }

    // ============ Creator Tests ============

    function test_RecordBountyCreated() public {
        vm.prank(bountyManager);
        reputation.recordBountyCreated(creator, 1 ether);
        
        ReputationSystem.UserStats memory stats = reputation.getUserStats(creator);
        assertEq(stats.bountiesCreated, 1);
    }

    function test_RecordBountyCompleted() public {
        vm.startPrank(bountyManager);
        
        reputation.recordBountyCreated(creator, 1 ether);
        reputation.recordBountyCompleted(creator, 1 days);
        
        vm.stopPrank();
        
        ReputationSystem.UserStats memory stats = reputation.getUserStats(creator);
        assertEq(stats.bountiesCreated, 1);
        assertEq(stats.bountiesCompleted, 1);
    }

    // ============ Streak Tests ============

    function test_ConsecutiveDayStreak() public {
        vm.startPrank(bountyManager);
        
        // Day 1
        reputation.recordSubmission(reporter);
        ReputationSystem.UserStats memory stats1 = reputation.getUserStats(reporter);
        assertEq(stats1.consecutiveDays, 1);
        
        // Day 2
        vm.warp(block.timestamp + 1 days);
        reputation.recordSubmission(reporter);
        ReputationSystem.UserStats memory stats2 = reputation.getUserStats(reporter);
        assertEq(stats2.consecutiveDays, 2);
        
        // Day 3
        vm.warp(block.timestamp + 1 days);
        reputation.recordSubmission(reporter);
        ReputationSystem.UserStats memory stats3 = reputation.getUserStats(reporter);
        assertEq(stats3.consecutiveDays, 3);
        
        vm.stopPrank();
    }

    function test_StreakBreaks() public {
        vm.startPrank(bountyManager);
        
        reputation.recordSubmission(reporter);
        ReputationSystem.UserStats memory stats1 = reputation.getUserStats(reporter);
        assertEq(stats1.consecutiveDays, 1);
        
        // Skip 2 days
        vm.warp(block.timestamp + 3 days);
        reputation.recordSubmission(reporter);
        ReputationSystem.UserStats memory stats2 = reputation.getUserStats(reporter);
        assertEq(stats2.consecutiveDays, 1, "Streak should reset");
        
        vm.stopPrank();
    }

    // ============ Leaderboard Tests ============

    function test_LeaderboardUpdates() public {
        address reporter2 = makeAddr("reporter2");
        
        vm.startPrank(bountyManager);
        
        // Reporter 1: Low score
        reputation.recordSubmission(reporter);
        reputation.recordAcceptedSubmission(reporter, 0.1 ether);
        
        // Reporter 2: High score
        reputation.recordSubmission(reporter2);
        reputation.recordAcceptedSubmission(reporter2, 2 ether);
        
        vm.stopPrank();
        
        address[] memory topReporters = reputation.getTopReporters(2);
        assertEq(topReporters.length, 2);
        
        // Reporter 2 should be first (higher earnings)
        ReputationSystem.UserStats memory stats1 = reputation.getUserStats(topReporters[0]);
        ReputationSystem.UserStats memory stats2 = reputation.getUserStats(topReporters[1]);
        assertGe(stats1.reputationScore, stats2.reputationScore, "Leaderboard should be sorted");
    }

    // ============ Security Tests ============

    function test_RevertIf_NotBountyManager() public {
        vm.expectRevert("Only BountyManager");
        reputation.recordSubmission(reporter);
    }

    function test_RevertIf_NotOwnerAwardsSpecialBadge() public {
        vm.prank(reporter);
        vm.expectRevert();
        reputation.awardSpecialBadge(reporter, 10);
    }

    function test_OwnerCanUpdateBountyManager() public {
        address newManager = makeAddr("newManager");
        reputation.setBountyManager(newManager);
        assertEq(reputation.bountyManager(), newManager);
    }

    // ============ Badge Tests ============

    function test_BadgeMetadata() public view {
        ReputationSystem.Badge memory badge = reputation.getBadgeMetadata(1);
        
        assertEq(badge.id, 1);
        assertEq(badge.name, "First Bug");
        assertGt(bytes(badge.description).length, 0);
    }

    function test_UserCannotClaimSameBadgeTwice() public {
        vm.startPrank(bountyManager);
        
        reputation.recordAcceptedSubmission(reporter, 1 ether);
        
        // Try to trigger same badge again
        reputation.recordAcceptedSubmission(reporter, 1 ether);
        
        vm.stopPrank();
        
        // Check no duplicate badges exist
        uint256[] memory badges = reputation.getUserBadges(reporter);
        uint256 uniqueBadges = 0;
        for (uint256 i = 0; i < badges.length; i++) {
            bool isDuplicate = false;
            for (uint256 j = 0; j < i; j++) {
                if (badges[i] == badges[j]) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) uniqueBadges++;
        }
        
        assertEq(uniqueBadges, badges.length, "No duplicate badges");
    }

    // ============ View Function Tests ============

    function test_GetUserStats() public {
        vm.prank(bountyManager);
        reputation.recordAcceptedSubmission(reporter, 1 ether);
        
        ReputationSystem.UserStats memory stats = reputation.getUserStats(reporter);
        
        assertEq(stats.acceptedSubmissions, 1);
        assertEq(stats.totalEarned, 1 ether);
        assertGt(stats.reputationScore, 0);
    }

    function test_GetTopReporters() public {
        vm.prank(bountyManager);
        reputation.recordAcceptedSubmission(reporter, 1 ether);
        
        address[] memory top = reputation.getTopReporters(10);
        assertGt(top.length, 0);
    }
}
