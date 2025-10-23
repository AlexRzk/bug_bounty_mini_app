# 🚀 Deploy Contract to Base Mainnet

## Problem Found
The contract address `0x5Eb412b6FcB13225C3d5C2aE39570D86a894C11a` has **NO CODE** on Base mainnet!

Your transaction sent ETH to an empty address (probably a wallet, not a contract).

## Solution: Deploy the Contract

### Step 1: Configure `.env` file

Edit `contracts/.env` with:

```bash
# Your wallet private key (the one with ETH on Base mainnet)
PRIVATE_KEY=your_private_key_without_0x_prefix

# Your wallet address to receive platform fees
FEE_COLLECTOR=0xYourWalletAddress

# Base mainnet RPC
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Basescan API key (for verification)
BASESCAN_API_KEY=your_api_key_from_basescan
```

⚠️ **IMPORTANT**: Never commit your private key!

### Step 2: Get Base Mainnet ETH

You need ~0.01 ETH on Base mainnet for deployment gas fees.

- Bridge ETH to Base: https://bridge.base.org/
- Or buy on an exchange that supports Base

### Step 3: Deploy the Contract

From the `contracts` directory:

```powershell
# Deploy to Base Mainnet (chain ID 8453)
forge script script/DeployBountyManagerV2.s.sol:DeployBountyManagerV2 --rpc-url $env:BASE_MAINNET_RPC_URL --broadcast --verify -vvvv
```

Or use the environment variable:

```powershell
forge script script/DeployBountyManagerV2.s.sol:DeployBountyManagerV2 --rpc-url base --broadcast --verify -vvvv
```

### Step 4: Update Contract Address

After deployment, you'll see:

```
BountyManagerV2 deployed to: 0xNEW_ADDRESS_HERE
```

Copy that address and update these files:

1. `components/bounty-board-magic.tsx` line 32
2. `lib/contract-config.ts` line 9

Change:
```typescript
address: '0x5Eb412b6FcB13225C3d5C2aE39570D86a894C11a'
```

To:
```typescript
address: '0xNEW_ADDRESS_HERE'
```

### Step 5: Commit and Deploy

```powershell
git add .
git commit -m "fix: update to deployed contract address on Base mainnet"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

## Alternative: Use Base Sepolia Testnet (Recommended for Testing)

If you don't want to spend real money yet, deploy to testnet first:

```powershell
# Get free testnet ETH from: https://www.alchemy.com/faucets/base-sepolia

# Deploy to Base Sepolia
forge script script/DeployBountyManagerV2.s.sol:DeployBountyManagerV2 --rpc-url base-sepolia --broadcast --verify -vvvv
```

Then update wagmi config to use `baseSepolia` instead of `base`.

## Quick Check Commands

```powershell
# Check your wallet balance on Base mainnet
cast balance YOUR_ADDRESS --rpc-url https://mainnet.base.org

# Verify contract address has code after deployment
cast code 0xNEW_ADDRESS --rpc-url https://mainnet.base.org
```

## What Happened?

You tried to create a bounty on address `0x5Eb412b6FcB13225C3d5C2aE39570D86a894C11a`, but:
- ❌ No contract is deployed there on Base mainnet
- ✅ Your transaction succeeded (sent ETH to that address)
- ❌ But the bounty wasn't created (no contract to execute)

The $5 is now in that address, but there's no contract to manage bounties!
