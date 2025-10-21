# 🎯 Complete Setup Guide - From Zero to Running App

This guide walks you through everything needed to get the bug bounty app fully working.

## What You'll Have at the End

✅ Smart contract deployed on Base mainnet  
✅ App running locally  
✅ Can create bounties with your wallet  
✅ Bounties stored on-chain  
✅ Ready to deploy to production  

## Timeline

- **5 min** - Prerequisites
- **10 min** - Deploy contract
- **5 min** - Configure app
- **2 min** - Run app
- **Total: ~22 minutes**

---

## Phase 1: Prerequisites (5 min)

### 1.1 Install Node.js

Download & install from https://nodejs.org (LTS version 18+)

Verify:
```bash
node --version  # Should show v18+
npm --version   # Should show 9+
```

### 1.2 Install Foundry (for contract deployment)

**Windows (PowerShell as Admin):**
```powershell
irm https://foundry.paradigm.xyz | iex
```

**macOS/Linux:**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify:
```bash
forge --version  # Should show latest version
```

### 1.3 Get Wallet & ETH

**Create new wallet:**
```bash
cast wallet new
# Saves: Private Key, Address, Mnemonic
```

Or use existing wallet - get private key from MetaMask:
- Settings → Account Details → Export Private Key

**Get Base ETH:**
- Buy from exchange (Coinbase, Kraken, etc.) - cheapest option
- Bridge from Ethereum: https://bridge.base.org
- Need at least **0.05 ETH** for deployment + testing

### 1.4 Get Basescan API Key (optional but recommended)

1. Go to https://basescan.org/apis
2. Sign up / login
3. Create API key
4. Copy the key

---

## Phase 2: Deploy Smart Contract (10 min)

### 2.1 Prepare Environment File

In `contracts/.env`:

```bash
# Your private key without 0x prefix
PRIVATE_KEY=abc123def456xyz789...

# Your wallet address (receives fees)
FEE_COLLECTOR=0x1234567890123456789012345678901234567890

# Basescan for verification
BASESCAN_API_KEY=your_api_key_here

# RPC URLs (don't change these)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

**⚠️ Security:**
- Never commit this file!
- Already in .gitignore ✓
- Don't share private key!

### 2.2 Verify Contract Compiles

```bash
cd contracts
forge build
```

Expected output:
```
Compiling 8 files with Solc 0.8.20
Solc 0.8.20 finished in 4.23s
Compiler run successful!
```

### 2.3 Deploy to Base Mainnet

```bash
forge script script/DeployBountyManagerV2.s.sol --rpc-url base --broadcast --verify
```

**What to expect:**
- Takes 30-60 seconds
- Shows gas estimate
- Asks for confirmation
- Deploys contract
- Auto-verifies on BaseScan

**Output will show:**
```
BountyManagerV2 deployed to: 0x1234567890123456789012345678901234567890
Fee Collector: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

### 2.4 Copy Contract Address

Save the deployed address:
```
0x1234567890123456789012345678901234567890
```

You'll need this in the next step.

### 2.5 Verify on BaseScan

Visit:
```
https://basescan.org/address/0x1234567890123456789012345678901234567890
```

Should show:
- ✅ Contract code
- ✅ Transactions
- ✅ "Contract Source Code Verified" badge

---

## Phase 3: Configure App (5 min)

### 3.1 Create `.env.local` File

In root directory (not in contracts/):

```env
# Contract address from deployment (from step 2.4)
NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890

# Base mainnet RPC
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# App URL (for Farcaster)
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3.2 Install Dependencies

```bash
cd ..  # Go back to root
pnpm install
```

Or if you don't have pnpm:
```bash
npm install
```

Wait for installation (~1-2 minutes).

---

## Phase 4: Run App (2 min)

### 4.1 Start Development Server

```bash
pnpm dev
```

You should see:
```
  ▲ Next.js 15.2.4
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### 4.2 Open in Browser

Go to: http://localhost:3000

You should see:
- 🎨 Bounty board UI
- 💰 Empty bounty list
- ➕ Create Bounty button
- 👤 Connect Wallet button

---

## Phase 5: Test Everything (5 min)

### 5.1 Connect Wallet

1. Click "Connect Wallet" (top right)
2. Choose MetaMask
3. MetaMask opens
4. Click "Connect"
5. App shows your wallet address ✓

### 5.2 Create Test Bounty

1. Click "Create Bounty"
2. Fill in:
   - **Title:** "Fix authentication bug"
   - **Description:** "Users can't log in"
   - **Reward:** "0.01" ETH
   - **Severity:** "High"
3. Click "Create"
4. MetaMask shows transaction
5. Click "Confirm"
6. Wait ~1-2 seconds for confirmation
7. Bounty appears on board! ✨

### 5.3 View Bounty

Click the bounty card to see:
- Full description
- Reward amount
- Status (Active, Completed, etc.)
- Submit Response button

### 5.4 Submit Response

1. Click bounty
2. Click "Submit Response"
3. Write your solution
4. Click "Submit"
5. Approve transaction
6. Response shows in bounty ✓

---

## Complete Checklist

- [ ] Node.js 18+ installed
- [ ] Foundry installed (`forge --version` works)
- [ ] Wallet created with private key
- [ ] Wallet has 0.05+ ETH on Base
- [ ] Basescan API key obtained (optional)
- [ ] `contracts/.env` configured with PRIVATE_KEY
- [ ] Contract deployed (`forge script ...`)
- [ ] Contract address copied
- [ ] `app/.env.local` created with contract address
- [ ] Dependencies installed (`pnpm install`)
- [ ] Dev server running (`pnpm dev`)
- [ ] Can connect wallet
- [ ] Can create bounty
- [ ] Bounty appears on-chain ✓

---

## Troubleshooting

### "Cannot find Forge"
```bash
# Add to PATH
export PATH="$HOME/.foundry/bin:$PATH"
# Or reinstall
foundryup
```

### "Private key invalid"
- Remove `0x` prefix
- Check it's 64 hex characters
- No spaces or extra characters

### "Insufficient balance"
- Need more ETH on Base
- Check with: `cast balance 0xyouraddress --rpc-url base`
- Bridge more ETH: https://bridge.base.org

### "Contract not found"
- Verify address is correct
- Check BaseScan: https://basescan.org/address/0x...
- Might be wrong network

### App shows "Error connecting to contract"
- Check contract address in `.env.local`
- Ensure RPC URL is working
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server

### "Wrong network" from MetaMask
- MetaMask should auto-switch to Base
- Manual: Add Base network to MetaMask
- Go to https://chainlist.org
- Search "Base"
- Click "Connect Wallet"
- Approve

---

## Next Steps

### 1. Deploy to Production

```bash
# Make sure everything works locally first
git push origin main
# Vercel auto-deploys
# Visit: https://bug-bounty-mini-app.vercel.app
```

Add environment variables to Vercel:
- Go to https://vercel.com/dashboard
- Select project
- Settings → Environment Variables
- Add `NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS`
- Add `NEXT_PUBLIC_BASE_RPC_URL`

### 2. Share with Community

Post on Farcaster:
```
🚀 Just launched my bug bounty platform on @base!

Create bounties → Get responses → Pay winners

No middleman. Direct on-chain. No fees.

Try it: [your-vercel-url.com]

#base #bounty #defi
```

### 3. Enable Farcaster Bot (Optional - requires ETH)

See `FARCASTER_BOT_STATUS.md` to activate the bot feature when ready.

---

## Architecture Summary

```
You Create Bounty
     ↓
MetaMask signs transaction
     ↓
Sent to Base network
     ↓
Smart contract receives & stores bounty
     ↓
ETH locked in contract escrow
     ↓
Other users see bounty
     ↓
They submit responses
     ↓
You approve winner
     ↓
Smart contract sends ETH to winner
     ↓
Bounty complete! ✓
```

---

## Quick Reference

**Frequently Used Commands:**

```bash
# Contract deployment
cd contracts
forge build                              # Compile
forge script script/DeployBountyManagerV2.s.sol \
  --rpc-url base --broadcast --verify   # Deploy

# App development
pnpm dev                 # Dev server
pnpm build              # Build for production
pnpm lint               # Check code

# Check contract balance
cast balance 0xaddress --rpc-url base

# View contract details
cast call 0xaddress "totalBounties()" --rpc-url base
```

---

## File Locations

| Purpose | File |
|---------|------|
| Smart Contract Code | `contracts/src/BountyManagerV2.sol` |
| Contract Deployment Script | `contracts/script/DeployBountyManagerV2.s.sol` |
| Contract Config | `contracts/.env` |
| App Environment | `.env.local` |
| Main App Page | `app/page.tsx` |
| Bounty Components | `components/bounty-*.tsx` |
| Web3 Config | `lib/wagmi-config.ts` |
| Contract ABI | `lib/contracts.ts` |

---

## Support Resources

- **Base Docs:** https://docs.base.org
- **Foundry Book:** https://book.getfoundry.sh
- **Solidity Docs:** https://docs.soliditylang.org
- **Next.js Docs:** https://nextjs.org/docs
- **Viem (Web3):** https://viem.sh

---

**Ready? Start with Phase 1! Questions? Check the troubleshooting section or review relevant guide:**

- 📜 `CONTRACT_DEPLOYMENT.md` - Detailed contract info
- 🚀 `APP_QUICK_START.md` - Running the app
- 🤖 `FARCASTER_BOT_STATUS.md` - Bot features (optional)

**Let's build! 🚀**
