# 🧪 Bounty Testing Guide

## Problem Fixed ✅

**Issue**: Bounties weren't appearing on the page after creation.

**Root Cause**: The `bounty-board.tsx` component was displaying hardcoded mock data instead of reading from the deployed smart contract on Base Sepolia.

**Solution**: Updated the component to use `useReadContract` from wagmi to fetch real bounty data from contract `0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf`.

---

## Quick Contract Verification

### Check if contract exists and has bounties:

```bash
# In WSL (where cast is installed)
cd /mnt/c/Users/olo/Programmes/Bug_bounty_mini_app_base/farcaster-bug-bounty/contracts

# 1. Verify contract is deployed (should return long hex)
cast code 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf --rpc-url https://sepolia.base.org | head -c 100

# 2. Check how many bounties exist (returns number like 1, 2, 3...)
cast call 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf "nextBountyId()(uint256)" --rpc-url https://sepolia.base.org

# 3. Read bounty #1 (if it exists)
cast call 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf \
  "getBounty(uint256)(address,string,string,uint256,uint8,address,uint8,address,uint256,string)" \
  1 --rpc-url https://sepolia.base.org
```

### Expected results:

- **nextBountyId returns 1**: No bounties created yet (counter starts at 1, but no bounties)
- **nextBountyId returns 2**: 1 bounty exists (ID 1)
- **nextBountyId returns 3**: 2 bounties exist (IDs 1 and 2)

---

## Frontend Testing Steps

### 1. Start the dev server

```bash
# From project root
npm install   # or pnpm install
npm run dev   # or pnpm dev
```

Open: http://localhost:3000

### 2. What you should see:

**If no bounties exist:**
- Message: "No bounties found on-chain yet."
- "Total bounties: 0"

**If bounties exist:**
- Cards showing real bounty data from blockchain
- Title, description, reward (in ETH), deadline, creator address

### 3. Create a test bounty

**Prerequisites:**
- Wallet connected (MetaMask or Coinbase Wallet)
- On Base Sepolia network (Chain ID 84532)
- Have some Base Sepolia ETH (get from https://www.coinbase.com/faucets)

**Steps:**
1. Click "Submit Bounty" button
2. Fill in:
   - Title: "Test Bounty"
   - Description: "Testing E2E flow"
   - Reward: 0.01 ETH (or any amount)
   - Deadline: 7 days from now
   - Farcaster hash: (optional) "test123"
3. Click submit and confirm transaction in wallet
4. Wait for transaction to be mined (~2-5 seconds on Base)
5. **Refresh the page** or wait for wagmi to refetch (auto-refresh every ~12s)

**Result:**
- Your bounty should appear in the grid
- Shows your wallet address as creator
- Displays the reward amount you set

### 4. Verify on Basescan

Open transaction or contract page:
- **Your transaction**: Copy tx hash from wallet → paste in https://sepolia.basescan.org
- **Contract page**: https://sepolia.basescan.org/address/0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf

You should see:
- `BountyCreated` event in the logs
- Your transaction in the list
- Contract balance increased if you sent ETH

---

## Troubleshooting

### Bounty still not appearing after creation

**Check 1: Transaction succeeded?**
```bash
# Get tx receipt (replace TX_HASH)
cast receipt TX_HASH --rpc-url https://sepolia.base.org
```
- Status should be `1` (success)
- If status `0`, transaction reverted — check revert reason

**Check 2: Wallet on correct network?**
- Must be Base Sepolia (Chain ID 84532)
- Check wallet network dropdown

**Check 3: Frontend connected to Base Sepolia?**
- Open browser console (F12)
- Check for wagmi/viem errors
- Verify `lib/wagmi-config.ts` includes `baseSepolia` chain

**Check 4: Contract address correct in frontend?**
```bash
# Check lib/contracts.ts
grep "address:" lib/contracts.ts
```
Should show: `address: '0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf'`

**Check 5: Manually query contract**
```bash
# Check nextBountyId
cast call 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf "nextBountyId()(uint256)" --rpc-url https://sepolia.base.org
```
- If returns `1` (0x1 in hex), no bounties created yet
- If returns `2` or higher, bounties exist

**Check 6: Hard refresh frontend**
- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache and reload

### Transaction reverts when creating bounty

**Common causes:**

1. **Insufficient gas**: Increase gas limit in wallet
2. **Deadline in past**: Ensure deadline is a future Unix timestamp
3. **Insufficient ETH sent**: Check reward amount matches `value` sent
4. **Contract paused**: Check if owner called `pause()` (unlikely)

**Debug with verbose logs:**
```bash
# Simulate the transaction first (dry run)
cast send 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf \
  "createBountyETH(string,string,uint256,string)" \
  "Test" "Description" 1234567890 "hash" \
  --value 0.01ether \
  --rpc-url https://sepolia.base.org \
  --private-key YOUR_TEST_KEY
```

---

## Manual E2E Test Script

### Full flow (2 accounts needed):

**Account A (Creator):**
1. Connect wallet to app
2. Create bounty with 0.01 ETH reward
3. Note bounty ID from transaction or UI
4. Wait for Account B to submit
5. Accept submission via UI
6. Verify payout: winner gets ~0.00975 ETH (97.5%), fee collector gets ~0.00025 ETH (2.5%)

**Account B (Submitter):**
1. Connect different wallet in different browser/profile
2. View bounty created by Account A
3. Submit response with description + proof URL
4. Wait for Account A to accept
5. Verify balance increased after acceptance

**Verification:**
- Check Basescan for events: `BountyCreated`, `SubmissionCreated`, `BountyCompleted`
- Verify ETH balances before/after each step
- Check fee collector (0x3cBCF01012E4Dc6e96Af7898Db7574B110eFFeCE) received platform fee

---

## Quick CLI Test (Without UI)

Create a bounty directly via cast:

```bash
# Set your private key (test key only!)
export PRIVATE_KEY="your_testnet_private_key_without_0x"

# Create bounty with 0.01 ETH
cast send 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf \
  "createBountyETH(string,string,uint256,string)" \
  "CLI Test Bounty" \
  "Testing from command line" \
  $(($(date +%s) + 604800)) \
  "0xtest123" \
  --value 0.01ether \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY

# Check nextBountyId increased
cast call 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf "nextBountyId()(uint256)" --rpc-url https://sepolia.base.org

# Read your bounty
cast call 0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf \
  "getBounty(uint256)(address,string,string,uint256,uint8,address,uint8,address,uint256,string)" \
  1 --rpc-url https://sepolia.base.org
```

---

## Next Steps

1. ✅ Contract is deployed and verified working
2. ✅ Frontend now reads real bounty data
3. 🔄 Create test bounty via UI
4. 🔄 Test submit → accept flow with 2 accounts
5. 🔄 Verify events and balances on Basescan
6. 🔄 (Optional) Deploy test ERC20 token and test ERC20 bounties
7. 🔄 (Optional) Verify contract source on Basescan with API key

**Need help?** If bounties still don't appear, paste:
- Transaction hash of your `createBountyETH` call
- Output of `cast call ... nextBountyId`
- Any errors from browser console (F12)
