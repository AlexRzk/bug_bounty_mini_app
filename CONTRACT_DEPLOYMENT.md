# Smart Contract Deployment Guide 🚀

## Overview

Your app uses **BountyManagerV2** contract deployed on **Base mainnet**. This guide walks you through deploying it.

## Prerequisites

### 1. Install Foundry

Foundry is the tool used to compile and deploy Solidity contracts.

**On Windows (PowerShell):**
```powershell
irm https://foundry.paradigm.xyz | iex
```

**On macOS/Linux:**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Verify installation:
```bash
forge --version
```

### 2. Get Wallet & ETH

You need an Ethereum wallet with ETH on Base mainnet for gas fees.

**Option A: Create new wallet**
```bash
cast wallet new
# Saves private key somewhere safe!
```

**Option B: Use existing wallet**
- Get private key from MetaMask (Settings → Account Details → Export Private Key)

**Get Base mainnet ETH:**
- Buy from exchange (Coinbase, Kraken, etc.)
- Bridge from Ethereum mainnet using https://bridge.base.org
- Need ~0.05 ETH for deployment

### 3. Get Basescan API Key

For verifying your contract on BaseScan:
1. Go to https://basescan.org/apis
2. Sign up / login
3. Create API key
4. Copy the key

## Step-by-Step Deployment

### Step 1: Setup Environment Variables

In `contracts/.env`:

```bash
# Your private key (without 0x prefix!)
PRIVATE_KEY=abc123def456...

# Address that receives platform fees (use your wallet)
FEE_COLLECTOR=0x1234567890123456789012345678901234567890

# Basescan API for verification
BASESCAN_API_KEY=your_basescan_api_key

# RPC URLs (these are defaults, no changes needed)
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

**⚠️ SECURITY:**
- Never commit `.env` to git
- Don't share your `PRIVATE_KEY`
- Add `.env` to `.gitignore` (already done)

### Step 2: Verify Contract Compiles

```bash
cd contracts
forge build
```

Should output:
```
Compiling 8 files with Solc 0.8.20
Solc 0.8.20 finished in 4.23s
Compiler run successful!
```

### Step 3: Deploy to Base Mainnet

```bash
# From contracts/ directory
forge script script/DeployBountyManagerV2.s.sol --rpc-url base --broadcast --verify
```

**What this does:**
- `script/DeployBountyManagerV2.s.sol` - Runs deployment script
- `--rpc-url base` - Use Base mainnet RPC from foundry.toml
- `--broadcast` - Actually submit transactions
- `--verify` - Auto-verify on BaseScan (requires BASESCAN_API_KEY)

**Output example:**
```
Compiling 8 files with Solc 0.8.20
Solc 0.8.20 finished in 4.23s
Compiler run successful!
...
BountyManagerV2 deployed to: 0x1234567890123456789012345678901234567890
Fee Collector: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

### Step 4: Copy Contract Address

From the output above, copy the deployed address:
```
BountyManagerV2 deployed to: 0x1234567890123456789012345678901234567890
```

### Step 5: Configure Your App

In your app's `.env.local` (or Vercel environment variables):

```env
# Contract address from deployment
NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890

# Base mainnet RPC
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

## Advanced: Deploy to Testnet First

**Recommended:** Test on Base Sepolia testnet before mainnet

### Get Sepolia ETH (Free)

1. Go to https://www.alchemy.com/faucets/base-sepolia
2. Enter your wallet address
3. Claim free testnet ETH

### Deploy to Sepolia

```bash
forge script script/DeployBountyManagerV2.s.sol --rpc-url base-sepolia --broadcast --verify
```

Same as mainnet, just different RPC. Use the Sepolia contract address to test your app.

## Complete Deployment Checklist

- [ ] Foundry installed (`forge --version` works)
- [ ] Private key ready in `contracts/.env`
- [ ] Wallet has 0.05+ ETH on Base mainnet
- [ ] Basescan API key in `contracts/.env`
- [ ] Ran `forge build` successfully
- [ ] Deployed with `forge script ... --broadcast`
- [ ] Copied deployed contract address
- [ ] Added address to app `.env.local` or Vercel
- [ ] App connects to contract successfully

## Verify Deployment

Check your contract on BaseScan:

```
https://basescan.org/address/0x1234567890123456789012345678901234567890
```

If verified, you'll see:
- ✅ Source code displayed
- ✅ "Contract Source Code Verified" badge
- ✅ Function list visible

## Troubleshooting

### Error: "Private key invalid"
- Remove `0x` prefix from private key
- Check it's 64 characters (32 bytes)
- Ensure no spaces or typos

### Error: "Insufficient gas"
- Wallet needs more ETH
- Gas price is high right now
- Wait a bit and try again

### Error: "RPC endpoint failed"
- Check internet connection
- RPC might be temporarily down
- Try different RPC: `https://base.meowrpc.com`

### Contract not verifying
- Ensure `BASESCAN_API_KEY` is correct
- Wait a few blocks after deployment
- Solc version must match (0.8.20)
- Try manual verification on BaseScan UI

## Gas Cost Estimate

**On Base Mainnet:**
- BountyManagerV2 deployment: ~$0.10 - $0.50

**Much cheaper than Ethereum mainnet!** 🎉

## Next Steps

1. ✅ Deploy contract to Base
2. ✅ Add contract address to app
3. ✅ Start the app dev server
4. ✅ Test creating bounties
5. ✅ Test submitting responses
6. ✅ Test completing bounties

## Deployment Script Reference

The deployment script is in `script/DeployBountyManagerV2.s.sol`:

```solidity
// Gets private key from environment
uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

// Gets fee collector, defaults to your wallet
address feeCollector = vm.envOr("FEE_COLLECTOR", 
  address(0x2C88F1279dff31ce285c3e270E5d59AF203115e0));

// Deploys the contract
BountyManagerV2 bountyManager = new BountyManagerV2(feeCollector);
```

You can modify the default fee collector address if needed.

---

**Ready to deploy? Run:**
```bash
cd contracts
forge script script/DeployBountyManagerV2.s.sol --rpc-url base --broadcast --verify
```
