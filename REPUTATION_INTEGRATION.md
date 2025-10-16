# Reputation System Integration Guide

## Overview

The `ReputationSystem` contract adds gamification and trust metrics to the Bug Bounty platform through:
- **On-chain reputation scores** (0-10,000 points)
- **Achievement badges** as ERC721 NFTs
- **Leaderboards** for top reporters and creators
- **Activity streaks** to encourage engagement

## Architecture

```
BountyManager (Main Contract)
    ↓
IReputationSystem (Interface)
    ↓
ReputationSystem (Reputation + NFT Badges)
```

## Features

### 1. Reporter Reputation
- **Submission tracking**: Total submissions vs accepted
- **Earnings tracking**: Total ETH/tokens earned
- **Success rate**: Acceptance percentage
- **Activity streak**: Consecutive days active

### 2. Creator Reputation
- **Bounties created**: Total bounties posted
- **Completion rate**: Bounties completed vs created
- **Response time**: Avg time to accept submissions
- **Total spent**: Total rewards distributed

### 3. Achievement Badges (NFTs)

#### Reporter Badges:
- 🐛 **First Bug** - Submit your first report
- 🔍 **Bug Hunter** - Submit 10 reports
- 💎 **Elite Hunter** - Submit 50 reports
- 🎯 **First Blood** - Get your first acceptance
- 🔥 **Consistent** - Maintain 10-day streak
- 💰 **High Earner** - Earn 1 ETH total

#### Creator Badges:
- 🎨 **First Bounty** - Create your first bounty
- 💵 **Generous** - Create bounties worth 5 ETH
- ⚖️ **Fair Judge** - Complete 10 bounties

#### Special Badges:
- ⭐ **Early Adopter** - Join in first month (admin awarded)

### 4. Reputation Score Formula

```
Score (0-10,000) = 
    (Acceptance Rate × 40%) +    // Quality of submissions
    (Total Earned × 30%) +        // Value provided
    (Streak × 20%) +              // Consistency
    (Activity × 10%)              // Participation
```

## Integration with BountyManager

### Option 1: Full Integration (Recommended for Launch)

Add reputation tracking to BountyManager:

```solidity
// BountyManager.sol additions

import "./IReputationSystem.sol";

contract BountyManager is Ownable, ReentrancyGuard, Pausable {
    // Add state variable
    IReputationSystem public reputationSystem;
    
    // Constructor
    constructor(address _feeCollector, address _reputationSystem) {
        feeCollector = _feeCollector;
        reputationSystem = IReputationSystem(_reputationSystem);
    }
    
    // Modify createBountyETH
    function createBountyETH(...) external payable {
        // ... existing code ...
        
        // Track reputation
        if (address(reputationSystem) != address(0)) {
            reputationSystem.recordBountyCreated(msg.sender, msg.value);
        }
        
        return bountyId;
    }
    
    // Modify submitReport
    function submitReport(...) external {
        // ... existing code ...
        
        // Track submission
        if (address(reputationSystem) != address(0)) {
            reputationSystem.recordSubmission(msg.sender);
        }
        
        return submissionId;
    }
    
    // Modify acceptSubmission
    function acceptSubmission(uint256 _submissionId) external {
        // ... existing code ...
        
        uint256 payoutAmount = bounty.reward - platformFee;
        
        // Track acceptance & completion
        if (address(reputationSystem) != address(0)) {
            reputationSystem.recordAcceptedSubmission(
                submission.submitter, 
                payoutAmount
            );
            
            uint256 responseTime = block.timestamp - bounty.createdAt;
            reputationSystem.recordBountyCompleted(
                bounty.creator,
                responseTime
            );
        }
        
        // ... existing payout code ...
    }
    
    // Admin function to set/update reputation system
    function setReputationSystem(address _reputationSystem) external onlyOwner {
        reputationSystem = IReputationSystem(_reputationSystem);
    }
}
```

### Option 2: Separate Deployment (For MVP)

Deploy ReputationSystem separately and integrate later:
1. Deploy BountyManager first (already done ✅)
2. Deploy ReputationSystem with BountyManager address
3. Update BountyManager to add reputation system address
4. Frontend can query both contracts

## Deployment Steps

### 1. Deploy ReputationSystem

```bash
# In WSL
cd contracts

# Deploy to Base Sepolia
forge create --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args <BOUNTY_MANAGER_ADDRESS> \
  src/ReputationSystem.sol:ReputationSystem

# Example:
forge create --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --constructor-args 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf \
  src/ReputationSystem.sol:ReputationSystem
```

### 2. Update BountyManager (If using Option 1)

Need to:
1. Add IReputationSystem interface import
2. Add state variable
3. Add tracking calls in key functions
4. Redeploy OR create new version

### 3. Update Frontend

Add reputation contract to `lib/contracts.ts`:

```typescript
export const REPUTATION_CONTRACT = {
  address: '0x...' as const, // Deployed address
  abi: [...] as const, // ABI from compilation
} as const
```

## Frontend Integration

### Display User Reputation

```tsx
// components/user-profile.tsx
import { useReadContract, useAccount } from 'wagmi'
import { REPUTATION_CONTRACT } from '@/lib/contracts'

function UserProfile() {
  const { address } = useAccount()
  
  const { data: stats } = useReadContract({
    ...REPUTATION_CONTRACT,
    functionName: 'getUserStats',
    args: [address!],
  })
  
  const { data: badges } = useReadContract({
    ...REPUTATION_CONTRACT,
    functionName: 'getUserBadges',
    args: [address!],
  })
  
  return (
    <div>
      <h2>Reputation: {stats?.reputationScore / 100}%</h2>
      <p>Accepted: {stats?.acceptedSubmissions.toString()}</p>
      <p>Earned: {formatEther(stats?.totalEarned || 0n)} ETH</p>
      <p>Streak: {stats?.consecutiveDays.toString()} days</p>
      
      <h3>Badges</h3>
      {badges?.map(badgeId => (
        <Badge key={badgeId} badgeId={badgeId} />
      ))}
    </div>
  )
}
```

### Leaderboard Component

```tsx
function Leaderboard() {
  const { data: topReporters } = useReadContract({
    ...REPUTATION_CONTRACT,
    functionName: 'getTopReporters',
    args: [10n],
  })
  
  return (
    <div>
      <h2>Top Bug Hunters</h2>
      <ol>
        {topReporters?.map((address, index) => (
          <li key={address}>
            {index + 1}. {address}
          </li>
        ))}
      </ol>
    </div>
  )
}
```

## Testing

```solidity
// test/ReputationSystem.t.sol
contract ReputationSystemTest is Test {
    ReputationSystem reputation;
    address bountyManager = makeAddr("bountyManager");
    address reporter = makeAddr("reporter");
    
    function setUp() public {
        reputation = new ReputationSystem(bountyManager);
    }
    
    function testRecordAcceptedSubmission() public {
        vm.prank(bountyManager);
        reputation.recordAcceptedSubmission(reporter, 1 ether);
        
        (,, uint256 acceptedSubs, uint256 totalEarned,,,,,,) = 
            reputation.userStats(reporter);
        
        assertEq(acceptedSubs, 1);
        assertEq(totalEarned, 1 ether);
    }
    
    function testBadgeAwarding() public {
        vm.prank(bountyManager);
        reputation.recordAcceptedSubmission(reporter, 1 ether);
        
        uint256[] memory badges = reputation.getUserBadges(reporter);
        assertEq(badges.length, 2); // First Blood + High Earner
    }
}
```

## Gas Optimization Notes

- Reputation updates happen automatically during bounty lifecycle
- Minimal additional gas (~50-100k per transaction)
- Badge minting only occurs once per achievement
- Leaderboard updates are limited to top 100 users

## Future Enhancements

1. **Weighted reputation** - Different bug types worth different points
2. **Decay mechanism** - Reputation decreases over inactivity
3. **Dispute system** - Challenge unfair rejections
4. **Social features** - Follow top hunters, team badges
5. **Token rewards** - ERC20 governance tokens for high reputation
6. **Cross-chain reputation** - Port reputation to other chains

## Security Considerations

✅ Only BountyManager can update reputation  
✅ Badges are non-transferable (soul-bound option)  
✅ Leaderboard size limited to prevent DOS  
✅ Owner can adjust badges for special events  

## Recommendation

**For MVP Launch:**
- Option 2 (Separate deployment) - Keep current BountyManager, deploy reputation separately
- Query both contracts from frontend
- Less risk, easier to update reputation logic

**Post-MVP:**
- Option 1 (Full integration) - Upgrade BountyManager to include automatic reputation tracking
- More seamless UX
- Atomic updates

## Next Steps

1. ✅ Review ReputationSystem.sol code
2. 📝 Write tests for reputation contract
3. 🚀 Deploy to Base Sepolia
4. 🎨 Create frontend components for reputation display
5. 🏆 Design badge artwork/metadata

Would you like me to:
1. Deploy the reputation system now?
2. Write comprehensive tests?
3. Create the frontend components?
4. Modify BountyManager for full integration?
