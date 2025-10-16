# Most Likely Issue: Fee Percent Not Set

## Your Contract Address
`0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf`

## Your Fee Collector Address  
`0x38D28723190191042c06F4bc3A306dcbd38F2CDC`

## Most Common Reasons for Not Receiving Fees

### 1. **Platform Fee is 0** (MOST LIKELY)

The contract's default fee is 250 bps (2.5%), BUT if you redeployed or reset it, the fee might be 0.

**How to check:**
1. Go to BaseScan: https://sepolia.basescan.org/address/0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf#readContract
2. Click "Contract" → "Read Contract"
3. Find `platformFeePercent` and click "Query"
4. **If it shows 0**, that's your problem!

**How to fix:**
```powershell
# Set fee to 2.5% (250 basis points)
cd contracts
forge script script/Deploy.s.sol:DeployBountyManager --sig "setPlatformFee(uint256)" 250 --rpc-url base-sepolia --private-key $env:PRIVATE_KEY --broadcast
```

Or use the contract's write function on BaseScan:
1. Go to: https://sepolia.basescan.org/address/0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf#writeContract
2. Connect your wallet (must be the owner)
3. Find `setPlatformFee`
4. Enter: `250` (for 2.5%)
5. Click "Write"

### 2. **Wrong Fee Collector Address**

**How to check:**
1. Go to BaseScan read contract (link above)
2. Find `feeCollector` and click "Query"
3. Verify it matches: `0x38D28723190191042c06F4bc3A306dcbd38F2CDC`

**If it's different or zero address**, update it:
1. Go to write contract on BaseScan
2. Find `setFeeCollector`
3. Enter your correct address: `0x38D28723190191042c06F4bc3A306dcbd38F2CDC`
4. Click "Write"

### 3. **Fee WAS Sent But You're Looking in Wrong Place**

Fees are sent as **internal transactions**, not regular transactions.

**How to check:**
1. Go to your fee collector address on BaseScan:
   https://sepolia.basescan.org/address/0x38D28723190191042c06F4bc3A306dcbd38F2CDC

2. Click the **"Internal Txns"** tab (not "Transactions")

3. Look for incoming transfers from contract: `0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf`

### 4. **Check Your Specific Transaction**

1. Find your "Accept Submission" transaction hash
2. Go to: https://sepolia.basescan.org/tx/YOUR_TX_HASH
3. Click "Logs" tab
4. Look for `BountyCompleted` event
5. Check the `platformFee` value in the event data

**If platformFee = 0 in the event:**
- The fee percent was 0 when you accepted the bounty
- You need to set it now for FUTURE bounties
- Past bounties cannot be changed

**If platformFee > 0 in the event:**
- Click "Internal Txns" tab
- You should see 2 ETH transfers:
  - One to the winner
  - One to your fee collector

## Quick Diagnosis Steps

1. **Check if fee percent is set:**
   - Visit: https://sepolia.basescan.org/address/0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf#readContract
   - Query `platformFeePercent()`
   - Should be: `250` or higher (not 0)

2. **Check if fee collector is correct:**
   - Same page, query `feeCollector()`
   - Should be: `0x38D28723190191042c06F4bc3A306dcbd38F2CDC`

3. **Check your fee collector balance:**
   - Visit: https://sepolia.basescan.org/address/0x38D28723190191042c06F4bc3A306dcbd38F2CDC
   - Look at ETH balance
   - Click "Internal Txns" to see incoming fees

4. **If everything is set correctly but no fees:**
   - The fee settings only apply to NEW acceptances
   - Bounties accepted when fee=0 don't retroactively pay fees
   - Test by creating and accepting a NEW bounty

## Important Notes

- **Fees are NOT retroactive**: If the fee was 0 when you accepted a bounty, you won't get fees for that bounty
- **Gas ≠ Platform Fee**: The gas you paid is separate from platform fees
- **Internal transactions**: Fees show up in "Internal Txns" tab, not regular transactions
- **Owner only**: Only the contract owner can change fee settings

## Need the Transaction Hash?

If you used the app, check:
1. Your wallet's transaction history
2. The app's transaction confirmation
3. MetaMask activity tab

Then check it on BaseScan to see what actually happened.
