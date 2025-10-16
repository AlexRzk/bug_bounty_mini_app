# Complete Bounty Testing Guide

## Overview
Test the full bounty lifecycle: create → submit → accept → payout

---

## Prerequisites
- ✅ Contract deployed: `0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf`
- ✅ Two funded accounts (creator & hunter)
- ✅ Dev server running: `pnpm dev`

---

## Option A: Test via UI (Recommended)

### Step 1: Create Bounty (Already done! ✅)
Your bounty ID 1 is live on-chain.

### Step 2: Submit Report (Hunter account)

**Using second browser profile:**
1. Open Chrome Incognito or new profile
2. Install MetaMask or use Coinbase Wallet
3. Create/import a second account
4. Fund it with Base Sepolia ETH from faucet
5. Navigate to http://localhost:3000
6. Connect wallet with hunter account
7. Click on your bounty
8. Click "Submit Response"
9. Fill in:
   - **Report**: "Found XSS vulnerability in input validation. PoC: <script>alert(document.cookie)</script>"
   - **Evidence**: "https://github.com/your-username/poc-xss-report" (or any URL)
10. Click Submit
11. Approve transaction in wallet

### Step 3: Accept Submission (Creator account)

1. Switch back to your creator account (browser profile 1)
2. Refresh the bounty page
3. You should see the submission with an **"Accept Submission"** button
4. Click "Accept Submission"
5. Approve transaction
6. **Result**: Hunter receives 0.00975 ETH (0.01 - 2.5% fee), bounty closes

---

## Option B: Test via CLI (Faster for testing)

### Step 1: Submit Report (from hunter account)

```bash
# WSL
CONTRACT=0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf
RPC=https://sepolia.base.org
HUNTER_PK=0xyour_hunter_private_key_here  # Different from creator!
BOUNTY_ID=1

# Submit report
cast send $CONTRACT \
  "submitReport(uint256,string,string)" \
  $BOUNTY_ID \
  "Found XSS vulnerability in input validation. PoC: <script>alert(document.cookie)</script>" \
  "https://github.com/your-username/poc-xss-report" \
  --private-key $HUNTER_PK \
  --rpc-url $RPC
```

**PowerShell:**
```powershell
$contract = "0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf"
$rpc = "https://sepolia.base.org"
$hunterPk = "0xyour_hunter_private_key_here"
$bountyId = 1

cast send $contract `
  "submitReport(uint256,string,string)" `
  $bountyId `
  "Found XSS vulnerability in input validation" `
  "https://github.com/your-username/poc" `
  --private-key $hunterPk `
  --rpc-url $rpc
```

### Step 2: Verify Submission

```bash
# Check submission count
cast call $CONTRACT "getBounty(uint256)" 1 --rpc-url $RPC

# Get submission details (submission index 0 = first submission)
cast call $CONTRACT "getSubmission(uint256,uint256)" 1 0 --rpc-url $RPC
```

### Step 3: Accept Submission (from creator account)

```bash
# Use creator's private key
CREATOR_PK=0xfe527e5d551c126f1bcab73249d63f7df582d29ca30aa660db89acf4e07573a8

cast send $CONTRACT \
  "acceptSubmission(uint256,uint256)" \
  $BOUNTY_ID \
  0 \
  --private-key $CREATOR_PK \
  --rpc-url $RPC
```

### Step 4: Verify Payout

```bash
# Check hunter's balance increased
HUNTER_ADDRESS=$(cast wallet address --private-key $HUNTER_PK)
cast balance $HUNTER_ADDRESS --rpc-url $RPC

# Check bounty is now closed
cast call $CONTRACT "getBounty(uint256)" 1 --rpc-url $RPC
# isActive should be false

# Check submission is accepted
cast call $CONTRACT "getSubmission(uint256,uint256)" 1 0 --rpc-url $RPC
# isAccepted should be true
```

---

## Expected Results

### After Submission:
- Transaction confirmed on Base Sepolia
- Submission count = 1
- UI shows "1 response"
- Creator sees "Accept Submission" button

### After Acceptance:
- Hunter receives: **0.00975 ETH** (0.01 - 2.5% platform fee)
- Platform fee collector receives: **0.00025 ETH**
- Bounty status: **closed** (isActive = false)
- Submission status: **accepted** (isAccepted = true)
- UI shows "✓ Accepted & Paid" badge
- "Accept Submission" button disappears

---

## Troubleshooting

### "Only creator can accept"
- Ensure you're using the creator's account/private key
- Check: `cast call $CONTRACT "getBounty(uint256)" 1 --rpc-url $RPC`
- First field in output is creator address

### "Bounty not active"
- Bounty already closed (submission already accepted)
- Create a new bounty to test again

### "Submission index out of bounds"
- Verify submission was created: `cast call $CONTRACT "getBounty(uint256)" 1 --rpc-url $RPC`
- Check 6th field (submissionCount)

### Hunter didn't receive payout
- Check transaction receipt for errors
- Verify hunter address: `cast wallet address --private-key $HUNTER_PK`
- Check balance: `cast balance <HUNTER_ADDRESS> --rpc-url $RPC`

---

## View on Basescan

All transactions visible at:
https://sepolia.basescan.org/address/0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf

---

## Next Steps

1. ✅ Test submit + accept flow (follow steps above)
2. Test cancel bounty (creator can cancel if no accepted submissions)
3. Test multiple submissions (create new bounty, have 2+ hunters submit)
4. Deploy to Base mainnet (after thorough testnet testing!)
5. Verify contract on Basescan

**Ready to test! 🚀**
