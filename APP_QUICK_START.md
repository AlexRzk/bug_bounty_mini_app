# App Quick Start Guide 🚀

## Prerequisites

Before running the app, you need:

1. ✅ **Node.js 18+** installed
2. ✅ **Smart contract deployed** on Base (see `CONTRACT_DEPLOYMENT.md`)
3. ✅ **Contract address** copied from deployment

## Step 1: Configure Environment

Create `.env.local` in the root directory:

```env
# Smart contract deployed on Base mainnet
NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890

# Base mainnet RPC URL (used by app)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# App URL (for Farcaster mini app)
NEXT_PUBLIC_URL=http://localhost:3000

# Optional: Neynar API (for Farcaster bot - currently disabled)
# NEYNAR_API_KEY=your_api_key
# BOT_PRIVATE_KEY=0x_your_key
```

**Get contract address from deployment:**
```bash
cd contracts
forge script script/DeployBountyManagerV2.s.sol --rpc-url base --broadcast 2>&1 | grep "deployed to:"
```

## Step 2: Install Dependencies

```bash
# Install npm packages
pnpm install
# or
npm install
# or
yarn install
```

## Step 3: Run Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Opens at: **http://localhost:3000**

You should see:
- 🎨 The bounty board with UI
- 💰 Bounty cards (initially empty)
- ➕ "Create Bounty" button
- 👤 Wallet connect button

## Step 4: Connect Wallet

1. Click **"Connect Wallet"** button (top right)
2. Choose wallet (MetaMask recommended)
3. Approve connection to app
4. Wallet shows connected

**Wallet must:**
- Have some ETH on Base mainnet
- Be on Base network (auto-switches)

## Step 5: Test Create Bounty

1. Click **"Create Bounty"** button
2. Fill in form:
   - **Title:** "Fix login bug"
   - **Description:** "Users can't log in after update"
   - **Reward:** "0.01" ETH
   - **Severity:** "High"
3. Click **"Create"**
4. Approve transaction in MetaMask
5. Wait for confirmation (~1-2 seconds)
6. Bounty appears on board! ✨

## Step 6: View Bounty

Click on bounty card to see:
- Full description
- Reward amount
- Severity level
- Bounty details
- Submit response button

## Step 7: Submit Response

1. Click on a bounty
2. Click **"Submit Response"**
3. Write your solution/report
4. Click **"Submit"**
5. Approve transaction
6. Response appears in bounty details

## Step 8: Complete Bounty

As bounty creator:
1. View your bounty
2. See responses from hunters
3. Click response to accept
4. Confirm acceptance
5. Winner receives ETH reward
6. Bounty marked complete ✅

## Troubleshooting

### "Contract not found" error
- Check contract address is correct
- Contract must be deployed on Base
- Try contract address on BaseScan

### "Wrong network" error
- Switch MetaMask to Base mainnet
- Go to https://chainlist.org
- Search "Base" 
- Add to MetaMask

### "Insufficient balance" error
- Need ETH on Base for gas
- Bridge ETH from mainnet: https://bridge.base.org
- Need ~0.01 ETH per transaction

### App shows blank
- Clear cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Check console for errors: F12

### Wallet won't connect
- Refresh page
- Try different wallet
- Check MetaMask network is Base

## Available Commands

```bash
# Development
pnpm dev              # Start dev server

# Production
pnpm build            # Build for production
pnpm start            # Run production build

# Code quality
pnpm lint             # Run ESLint
```

## Smart Contract Interaction

### Creating Bounty (On-chain)
```
1. User sends ETH + data to contract
2. Contract creates Bounty struct
3. ETH held in contract escrow
4. BountyCreated event emitted
```

### Submitting Response (On-chain)
```
1. Hunter submits response data
2. Contract stores Response struct
3. Links response to bounty
4. ResponseSubmitted event emitted
```

### Completing Bounty (On-chain)
```
1. Creator accepts response
2. Contract transfers ETH to winner
3. Bounty marked complete
4. BountyCompleted event emitted
```

## Architecture

```
Frontend (Next.js)
     ↓
WalletConnect (MetaMask)
     ↓
Viem (Web3 library)
     ↓
Base Mainnet RPC
     ↓
Smart Contract (BountyManagerV2)
     ↓
On-chain Bounty Storage
```

## File Structure

```
app/
  ├── page.tsx              # Main page
  ├── layout.tsx            # Layout + metadata
  ├── api/                  # API routes
  │   ├── frame/           # Farcaster frame
  │   ├── actions/         # Farcaster actions (disabled)
  │   ├── monitor/         # Bot monitoring (disabled)
  │   └── webhook/         # Webhooks (disabled)
  └── bounty/              # Bounty pages
components/
  ├── bounty-board.tsx     # Main bounty list
  ├── bounty-card.tsx      # Bounty card
  ├── bounty-detail.tsx    # Bounty details
  ├── submit-response-dialog.tsx
  └── wallet-connect-button.tsx
lib/
  ├── wagmi-config.ts      # Web3 config
  ├── contracts.ts         # Contract ABI
  ├── bounty-parser.ts     # Bounty parser (bot)
  └── farcaster-api.ts     # Farcaster API (bot)
```

## Testing Checklist

- [ ] App loads without errors
- [ ] Wallet connects successfully
- [ ] Can view bounty board
- [ ] Can create bounty (requires ETH)
- [ ] Bounty appears after tx confirms
- [ ] Can view bounty details
- [ ] Can submit response
- [ ] Can complete bounty
- [ ] Admin page accessible

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys from main branch
# https://bug-bounty-mini-app.vercel.app
```

### Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS`
   - `NEXT_PUBLIC_BASE_RPC_URL`
   - `NEXT_PUBLIC_URL` (set to production URL)

## Next Steps

- ✅ App running locally
- ✅ Connected to smart contract
- ✅ Test all features work
- ✅ Deploy to Vercel
- ✅ Share with community!

## Support

- **Contract Issues:** See `CONTRACT_DEPLOYMENT.md`
- **Bot Issues:** See `FARCASTER_BOT_STATUS.md`
- **Farcaster Mini App:** See `MINIAPP_CONVERSION.md`

---

**Get started:** 
```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000 in your browser! 🎉
