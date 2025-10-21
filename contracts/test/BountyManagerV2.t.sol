// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Test.sol";
import "../src/BountyManagerV2.sol";

contract BountyManagerV2Test is Test {
    BountyManagerV2 public bountyManager;

    address public owner = address(1);
    address public feeCollector = address(2);
    address public creator = address(3);
    address public responder = address(4);

    uint256 public constant REWARD_AMOUNT = 1 ether;

    function setUp() public {
        // Deploy contract
        vm.prank(owner);
        bountyManager = new BountyManagerV2(feeCollector);

        // Fund test accounts
        vm.deal(creator, 10 ether);
        vm.deal(responder, 1 ether);
    }

    function testDeployment() public {
        assertEq(bountyManager.owner(), owner);
        assertEq(bountyManager.feeCollector(), feeCollector);
        assertEq(bountyManager.platformFee(), 250); // 2.5%
    }

    function testCreateBounty() public {
        vm.startPrank(creator);
        
        uint256 bountyId = bountyManager.createBounty{value: REWARD_AMOUNT}(
            "Fix login bug",
            "Users can't log in after update",
            BountyManagerV2.Severity.High,
            address(0) // creator = msg.sender
        );

        assertEq(bountyId, 1);
        
        (
            uint256 id,
            address bountyCreator,
            string memory title,
            ,
            uint256 reward,
            ,
            BountyManagerV2.BountyStatus status,
            ,
            ,
            
        ) = bountyManager.bounties(bountyId);

        assertEq(id, 1);
        assertEq(bountyCreator, creator);
        assertEq(title, "Fix login bug");
        assertEq(reward, REWARD_AMOUNT);
        assertTrue(status == BountyManagerV2.BountyStatus.Active);

        vm.stopPrank();
    }

    function testSubmitResponse() public {
        // Create bounty
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBounty{value: REWARD_AMOUNT}(
            "Bug Hunt",
            "Find bugs",
            BountyManagerV2.Severity.Medium,
            address(0)
        );

        // Submit response
        vm.startPrank(responder);
        
        uint256 responseId = bountyManager.submitResponse(
            bountyId,
            "Found the issue in auth.js line 42"
        );

        assertEq(responseId, 1);

        (
            uint256 id,
            uint256 responseBountyId,
            address responseSubmitter,
            string memory description,
            ,
            bool accepted
        ) = bountyManager.responses(responseId);

        assertEq(id, 1);
        assertEq(responseBountyId, bountyId);
        assertEq(responseSubmitter, responder);
        assertEq(description, "Found the issue in auth.js line 42");
        assertFalse(accepted);

        vm.stopPrank();
    }

    function testCompleteBounty() public {
        // Create bounty
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBounty{value: REWARD_AMOUNT}(
            "Bug Hunt",
            "Find bugs",
            BountyManagerV2.Severity.High,
            address(0)
        );

        // Submit response
        vm.prank(responder);
        uint256 responseId = bountyManager.submitResponse(
            bountyId,
            "Fixed the bug"
        );

        // Accept response
        uint256 initialResponderBalance = responder.balance;
        uint256 initialFeeBalance = feeCollector.balance;
        
        vm.prank(creator);
        bountyManager.completeBounty(bountyId, responseId);

        // Check balances
        uint256 expectedFee = (REWARD_AMOUNT * 250) / 10000; // 2.5%
        uint256 expectedPayout = REWARD_AMOUNT - expectedFee;

        assertEq(responder.balance, initialResponderBalance + expectedPayout);
        assertEq(feeCollector.balance, initialFeeBalance + expectedFee);

        // Check bounty status
        (,,,,,, BountyManagerV2.BountyStatus status, address winner,,) = bountyManager.bounties(bountyId);
        assertTrue(status == BountyManagerV2.BountyStatus.Completed);
        assertEq(winner, responder);
    }

    function testCancelBounty() public {
        // Create bounty
        vm.startPrank(creator);
        uint256 bountyId = bountyManager.createBounty{value: REWARD_AMOUNT}(
            "Bug Hunt",
            "Find bugs",
            BountyManagerV2.Severity.Low,
            address(0)
        );

        uint256 initialBalance = creator.balance;

        // Cancel bounty
        bountyManager.cancelBounty(bountyId);

        // Check refund
        assertEq(creator.balance, initialBalance + REWARD_AMOUNT);

        // Check status
        (,,,,,, BountyManagerV2.BountyStatus status,,,) = bountyManager.bounties(bountyId);
        assertTrue(status == BountyManagerV2.BountyStatus.Cancelled);

        vm.stopPrank();
    }

    function testCannotSubmitResponseToOwnBounty() public {
        // Create bounty
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBounty{value: REWARD_AMOUNT}(
            "Bug Hunt",
            "Find bugs",
            BountyManagerV2.Severity.Medium,
            address(0)
        );

        // Try to submit response as creator
        vm.prank(creator);
        vm.expectRevert("Creator cannot submit response");
        bountyManager.submitResponse(bountyId, "My own solution");
    }

    function testOnlyCreatorCanComplete() public {
        // Create bounty
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBounty{value: REWARD_AMOUNT}(
            "Bug Hunt",
            "Find bugs",
            BountyManagerV2.Severity.High,
            address(0)
        );

        // Submit response
        vm.prank(responder);
        uint256 responseId = bountyManager.submitResponse(bountyId, "Fixed");

        // Try to complete as non-creator
        vm.prank(responder);
        vm.expectRevert("Only creator can complete bounty");
        bountyManager.completeBounty(bountyId, responseId);
    }

    function testGetBounties() public {
        // Create multiple bounties
        vm.startPrank(creator);
        bountyManager.createBounty{value: 0.1 ether}("Bug 1", "Desc 1", BountyManagerV2.Severity.Low, address(0));
        bountyManager.createBounty{value: 0.2 ether}("Bug 2", "Desc 2", BountyManagerV2.Severity.Medium, address(0));
        bountyManager.createBounty{value: 0.3 ether}("Bug 3", "Desc 3", BountyManagerV2.Severity.High, address(0));
        vm.stopPrank();

        uint256[] memory bounties = bountyManager.getBounties(0, 10);
        assertEq(bounties.length, 3);
        assertEq(bounties[0], 1);
        assertEq(bounties[1], 2);
        assertEq(bounties[2], 3);
    }

    function testTotalBounties() public {
        assertEq(bountyManager.totalBounties(), 0);

        vm.prank(creator);
        bountyManager.createBounty{value: REWARD_AMOUNT}("Bug", "Desc", BountyManagerV2.Severity.Medium, address(0));

        assertEq(bountyManager.totalBounties(), 1);
    }

    function testSetFeeCollector() public {
        address newCollector = address(99);

        vm.prank(owner);
        bountyManager.setFeeCollector(newCollector);

        assertEq(bountyManager.feeCollector(), newCollector);
    }

    function testSetPlatformFee() public {
        vm.prank(owner);
        bountyManager.setPlatformFee(500); // 5%

        assertEq(bountyManager.platformFee(), 500);
    }

    function testCannotSetFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert("Fee too high (max 10%)");
        bountyManager.setPlatformFee(1001); // 10.01%
    }
}
