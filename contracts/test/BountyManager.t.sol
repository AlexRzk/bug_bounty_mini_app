// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BountyManager.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract BountyManagerTest is Test {
    BountyManager public bountyManager;
    MockERC20 public mockToken;

    address public owner = address(1);
    address public feeCollector = address(2);
    address public creator = address(3);
    address public submitter1 = address(4);
    address public submitter2 = address(5);

    uint256 public constant REWARD_AMOUNT = 1 ether;
    uint256 public constant TOKEN_REWARD = 100 * 10**18;
    uint256 public constant DEADLINE = 7 days;

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        BountyManager.PaymentToken paymentType,
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

    function setUp() public {
        // Deploy contracts
        vm.prank(owner);
        bountyManager = new BountyManager(feeCollector);
        
        mockToken = new MockERC20();

        // Fund test accounts
        vm.deal(creator, 10 ether);
        vm.deal(submitter1, 1 ether);
        vm.deal(submitter2, 1 ether);

        mockToken.mint(creator, 1000 * 10**18);
    }

    // ============ ETH Bounty Tests ============

    function testCreateBountyETH() public {
        vm.startPrank(creator);
        
        uint256 deadline = block.timestamp + DEADLINE;
        
        vm.expectEmit(true, true, false, true);
        emit BountyCreated(
            1,
            creator,
            "Find SQL Injection",
            REWARD_AMOUNT,
            BountyManager.PaymentToken.ETH,
            address(0),
            deadline,
            "0x123abc"
        );

        uint256 bountyId = bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Find SQL Injection",
            "Looking for SQL injection vulnerabilities in our API",
            deadline,
            "0x123abc"
        );

        assertEq(bountyId, 1);
        
        (
            address bountyCreator,
            string memory title,
            ,
            uint256 reward,
            BountyManager.PaymentToken paymentType,
            ,
            BountyManager.BountyStatus status,
            ,
            ,
            
        ) = bountyManager.getBounty(bountyId);

        assertEq(bountyCreator, creator);
        assertEq(title, "Find SQL Injection");
        assertEq(reward, REWARD_AMOUNT);
        assertTrue(paymentType == BountyManager.PaymentToken.ETH);
        assertTrue(status == BountyManager.BountyStatus.Active);

        vm.stopPrank();
    }

    function testSubmitReport() public {
        // Create bounty
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Bug Hunt",
            "Find bugs",
            block.timestamp + DEADLINE,
            "cast123"
        );

        // Submit report
        vm.startPrank(submitter1);
        
        vm.expectEmit(true, true, true, true);
        emit SubmissionCreated(1, bountyId, submitter1, "@alice");

        uint256 submissionId = bountyManager.submitReport(
            bountyId,
            "Found critical XSS vulnerability",
            "https://github.com/report/123",
            "@alice"
        );

        assertEq(submissionId, 1);

        uint256[] memory submissions = bountyManager.getBountySubmissions(bountyId);
        assertEq(submissions.length, 1);
        assertEq(submissions[0], submissionId);

        vm.stopPrank();
    }

    function testAcceptSubmissionETH() public {
        // Create bounty
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Bug Hunt",
            "Find bugs",
            block.timestamp + DEADLINE,
            "cast123"
        );

        // Submit report
        vm.prank(submitter1);
        uint256 submissionId = bountyManager.submitReport(
            bountyId,
            "Found bug",
            "proof.com",
            "@alice"
        );

        // Accept submission
        uint256 initialBalance = submitter1.balance;
        uint256 initialFeeBalance = feeCollector.balance;

        vm.prank(creator);
        bountyManager.acceptSubmission(submissionId);

        // Check payouts
        uint256 expectedFee = (REWARD_AMOUNT * 500) / 10000; // 5%
        uint256 expectedPayout = REWARD_AMOUNT - expectedFee;

        assertEq(submitter1.balance, initialBalance + expectedPayout);
        assertEq(feeCollector.balance, initialFeeBalance + expectedFee);

        // Check bounty status
        (,,,,,, BountyManager.BountyStatus status, address winner,,) = bountyManager.getBounty(bountyId);
        assertTrue(status == BountyManager.BountyStatus.Completed);
        assertEq(winner, submitter1);
    }

    function testCancelBounty() public {
        // Create bounty
        vm.startPrank(creator);
        uint256 bountyId = bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Bug Hunt",
            "Find bugs",
            block.timestamp + DEADLINE,
            "cast123"
        );

        uint256 initialBalance = creator.balance;

        // Cancel bounty
        bountyManager.cancelBounty(bountyId);

        // Check refund
        assertEq(creator.balance, initialBalance + REWARD_AMOUNT);

        // Check status
        (,,,,,, BountyManager.BountyStatus status,,,) = bountyManager.getBounty(bountyId);
        assertTrue(status == BountyManager.BountyStatus.Cancelled);

        vm.stopPrank();
    }

    // ============ ERC20 Bounty Tests ============

    function testCreateBountyERC20() public {
        vm.startPrank(creator);
        
        mockToken.approve(address(bountyManager), TOKEN_REWARD);

        uint256 bountyId = bountyManager.createBountyERC20(
            "Token Bounty",
            "Find bugs, earn tokens",
            TOKEN_REWARD,
            address(mockToken),
            block.timestamp + DEADLINE,
            "cast456"
        );

        assertEq(bountyId, 1);
        assertEq(mockToken.balanceOf(address(bountyManager)), TOKEN_REWARD);

        vm.stopPrank();
    }

    function testAcceptSubmissionERC20() public {
        // Create ERC20 bounty
        vm.startPrank(creator);
        mockToken.approve(address(bountyManager), TOKEN_REWARD);
        uint256 bountyId = bountyManager.createBountyERC20(
            "Token Bounty",
            "Description",
            TOKEN_REWARD,
            address(mockToken),
            block.timestamp + DEADLINE,
            "cast"
        );
        vm.stopPrank();

        // Submit report
        vm.prank(submitter1);
        uint256 submissionId = bountyManager.submitReport(
            bountyId,
            "Found it",
            "proof",
            "@sub1"
        );

        // Accept
        uint256 initialBalance = mockToken.balanceOf(submitter1);
        uint256 initialFeeBalance = mockToken.balanceOf(feeCollector);

        vm.prank(creator);
        bountyManager.acceptSubmission(submissionId);

        uint256 expectedFee = (TOKEN_REWARD * 500) / 10000; // 5%
        uint256 expectedPayout = TOKEN_REWARD - expectedFee;

        assertEq(mockToken.balanceOf(submitter1), initialBalance + expectedPayout);
        assertEq(mockToken.balanceOf(feeCollector), initialFeeBalance + expectedFee);
    }

    // ============ Access Control Tests ============

    function testOnlyCreatorCanAccept() public {
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Bug",
            "Desc",
            block.timestamp + DEADLINE,
            "cast"
        );

        vm.prank(submitter1);
        uint256 submissionId = bountyManager.submitReport(bountyId, "Report", "proof", "@sub");

        // Try to accept as non-creator
        vm.prank(submitter2);
        vm.expectRevert("Only creator can accept");
        bountyManager.acceptSubmission(submissionId);
    }

    function testCannotSubmitToOwnBounty() public {
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Bug",
            "Desc",
            block.timestamp + DEADLINE,
            "cast"
        );

        vm.prank(creator);
        vm.expectRevert("Cannot submit to own bounty");
        bountyManager.submitReport(bountyId, "Report", "proof", "@creator");
    }

    function testCannotSubmitAfterDeadline() public {
        uint256 deadline = block.timestamp + DEADLINE;
        
        vm.prank(creator);
        uint256 bountyId = bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Bug",
            "Desc",
            deadline,
            "cast"
        );

        // Fast forward past deadline
        vm.warp(deadline + 1);

        vm.prank(submitter1);
        vm.expectRevert("Deadline passed");
        bountyManager.submitReport(bountyId, "Report", "proof", "@sub");
    }

    // ============ Admin Tests ============

    function testSetPlatformFee() public {
        vm.prank(owner);
        bountyManager.setPlatformFee(500); // 5%

        assertEq(bountyManager.platformFeePercent(), 500);
    }

    function testCannotSetFeeAbove10Percent() public {
        vm.prank(owner);
        vm.expectRevert("Fee cannot exceed 10%");
        bountyManager.setPlatformFee(1001);
    }

    function testPauseUnpause() public {
        vm.prank(owner);
        bountyManager.pause();

        // Cannot create bounty when paused
        vm.prank(creator);
        vm.expectRevert();
        bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Bug",
            "Desc",
            block.timestamp + DEADLINE,
            "cast"
        );

        vm.prank(owner);
        bountyManager.unpause();

        // Can create after unpause
        vm.prank(creator);
        bountyManager.createBountyETH{value: REWARD_AMOUNT}(
            "Bug",
            "Desc",
            block.timestamp + DEADLINE,
            "cast"
        );
    }
}
