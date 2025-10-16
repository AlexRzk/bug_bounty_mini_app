# Fee Collection Troubleshooting Guide

## Quick Diagnostics

### Step 1: Check Contract Configuration
```powershell
$env:CONTRACT_ADDRESS="0xYourDeployedContractAddress"
$env:RPC_URL="https://sepolia.base.org"
node scripts/check-fees.js
```

### Step 2: Check Specific Transaction
```powershell
$env:CONTRACT_ADDRESS="0xYourContractAddress"
$env:TX_HASH="0xYourAcceptSubmissionTransactionHash"
node scripts/check-fees.js
```

## Common Issues & Solutions

### Issue 1: Fee Percent is 0
**Symptom:** No fees collected
**Check:**
```powershell
cast call $CONTRACT_ADDRESS "platformFeePercent()" --rpc-url https://sepolia.base.org
```
**Expected:** `250` (for 2.5%) or higher
**Fix:** Call `setPlatformFee` as owner:
```powershell
cast send $CONTRACT_ADDRESS "setPlatformFee(uint256)" 250 --private-key $env:PRIVATE_KEY --rpc-url https://sepolia.base.org
```

### Issue 2: Wrong Fee Collector Address
**Symptom:** Fees sent to wrong address or zero address
**Check:**
```powershell
cast call $CONTRACT_ADDRESS "feeCollector()" --rpc-url https://sepolia.base.org
```
**Expected:** Your actual wallet address
**Fix:** Update fee collector:
```powershell
cast send $CONTRACT_ADDRESS "setFeeCollector(address)" 0xYourActualAddress --private-key $env:PRIVATE_KEY --rpc-url https://sepolia.base.org
```

### Issue 3: Transaction Failed
**Symptom:** Transaction reverted
**Check:** Look for error in BaseScan
**Possible Reasons:**
- Not enough gas
- Contract paused
- Not the bounty creator
- Submission already accepted

### Issue 4: Transaction Succeeded but No Fee
**Check the event logs:**
1. Go to BaseScan: https://sepolia.basescan.org/tx/YOUR_TX_HASH
2. Click "Logs" tab
3. Look for `BountyCompleted` event
4. Check the `platformFee` parameter in the event

**If platformFee = 0 in the event:**
- The contract's `platformFeePercent` was 0 when the transaction executed
- Fee percent must be set BEFORE accepting submissions

**If platformFee > 0 in the event:**
- Look at "Internal Transactions" tab on BaseScan
- You should see 2 transfers:
  - One to the winner (larger amount)
  - One to feeCollector (the fee)

## Fee Calculation Formula

```
platformFee = (bounty.reward × platformFeePercent) / 10000
payoutAmount = bounty.reward - platformFee
```

**Examples:**
- Bounty: 1 ETH, Fee: 250 bps (2.5%)
  - Platform Fee: 0.025 ETH
  - Winner Gets: 0.975 ETH

- Bounty: 0.1 ETH, Fee: 500 bps (5%)
  - Platform Fee: 0.005 ETH  
  - Winner Gets: 0.095 ETH

## Verify on BaseScan

1. Go to: https://sepolia.basescan.org/address/YOUR_FEE_COLLECTOR_ADDRESS
2. Check "Transactions" tab for incoming transfers
3. Filter by "Internal Txns" to see contract-initiated transfers

## Check Current Settings

```powershell
# Get all current settings
$CONTRACT = "0xYourContractAddress"
$RPC = "https://sepolia.base.org"

Write-Host "Owner:" 
cast call $CONTRACT "owner()" --rpc-url $RPC

Write-Host "`nPlatform Fee (bps):"
cast call $CONTRACT "platformFeePercent()" --rpc-url $RPC

Write-Host "`nFee Collector:"
cast call $CONTRACT "feeCollector()" --rpc-url $RPC

Write-Host "`nNext Bounty ID:"
cast call $CONTRACT "nextBountyId()" --rpc-url $RPC
```

## Important Notes

1. **Fees are NOT retroactive** - If you set the fee after accepting a bounty, that bounty won't have paid fees
2. **Internal transactions** - Fees are sent via internal ETH transfers, not regular transactions
3. **Gas fees** - The transaction sender pays gas; this is separate from platform fees
4. **Check block explorer** - Always verify on BaseScan's "Internal Txns" tab

## Need Help?

Run the diagnostic script:
```powershell
node scripts/check-fees.js
```

Or check your transaction manually:
```
https://sepolia.basescan.org/tx/YOUR_TX_HASH
```
