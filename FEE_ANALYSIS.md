# Fee Collection Analysis

## Your Addresses

1. **Contract Address:** `0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf`
2. **Fee Collector (from .env):** `0x38D28723190191042c06F4bc3A306dcbd38F2CDC`
3. **Submitter Address:** `0x3cBCF01012E4Dc6e96Af7898Db7574B110eFFeCE`

## What I See

The address `0x3cBCF01012E4Dc6e96Af7898Db7574B110eFFeCE` shows 4 **"Submit Report"** transactions.

These are SUBMISSIONS, not ACCEPTANCES. Fees are NOT collected on submissions.

## When Are Fees Collected?

Fees are ONLY collected when:
- A bounty creator calls **"Accept Submission"** (acceptSubmission function)
- At that moment, the platform fee is deducted from the bounty reward
- The fee goes to `feeCollector` address

## Check These Links

### 1. Check Fee Collector Balance (where fees SHOULD go):
https://sepolia.basescan.org/address/0x38D28723190191042c06F4bc3A306dcbd38F2CDC

Look at:
- ETH Balance
- **Internal Txns** tab for incoming fees

### 2. Check Contract Transactions (to find Accept Submission txns):
https://sepolia.basescan.org/address/0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf

Filter by method: Look for **"Accept Submission"** transactions (not "Submit Report")

### 3. Check Contract Settings:
https://sepolia.basescan.org/address/0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf#readContract

Read:
- `platformFeePercent()` - should be 250 (2.5%)
- `feeCollector()` - should be 0x38D28723190191042c06F4bc3A306dcbd38F2CDC

## Transaction Flow

```
1. CREATE BOUNTY
   Creator deposits ETH → Contract holds it
   [No fee collected]

2. SUBMIT REPORT (what you showed)
   Submitter → Contract
   [No fee collected]

3. ACCEPT SUBMISSION ⭐ (THIS IS WHERE FEES ARE COLLECTED)
   Creator calls acceptSubmission()
   Contract calculates: platformFee = reward × platformFeePercent / 10000
   Contract sends: 
     - (reward - platformFee) → Winner
     - platformFee → Fee Collector ✅
```

## Questions to Answer

1. **Have any submissions been ACCEPTED yet?**
   - Check the contract's transactions for "Accept Submission" method calls
   
2. **What is the current platformFeePercent?**
   - If it's 0, no fees will be collected

3. **Was the fee set BEFORE or AFTER accepting submissions?**
   - Fees only apply to acceptances that happen AFTER the fee is set

## Next Steps

Please check:
1. Go to your fee collector address and click "Internal Txns" tab
2. Go to the contract and filter for "Accept Submission" transactions
3. Tell me if you see any "Accept Submission" transactions and their hashes

The submissions you showed are just reports being submitted - no one has accepted them yet, so no fees have been collected!
