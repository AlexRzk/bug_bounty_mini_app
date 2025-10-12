# 🎯 Complete Setup Guide: Farcaster Bug Bounty on Base

## 📋 What You've Built

A **full-stack decentralized bug bounty platform** with:

### Smart Contracts (Solidity + Foundry)
- ✅ **BountyManager.sol** - Production MVP contract
  - Create bounties with ETH or ERC20 tokens
  - Submit bug reports
  - Accept submissions and pay out winners
  - Cancel bounties and refund creators
  - Platform fee system (2.5%)
  - Farcaster post integration
  - Emergency pause functionality

### Frontend (Next.js + React + Wagmi)
- ✅ Next.js 15 with App Router
- ✅ Wallet connection (wagmi + viem)
- ✅ Base Sepolia testnet support
- ✅ Theme provider (dark mode)
- ✅ UI components ready for contract integration

---

## 🚀 Quick Start (Copy-Paste Commands)

### Option 1: Open WSL in the correct directory

```powershell
# Run in PowerShell to open WSL in the right place
wsl --cd "C:\Users\olo\Programmes\Bug_bounty_mini_app_base\farcaster-bug-bounty\contracts"
```

Then in WSL:
```bash
# Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit

# Build contracts
forge build

# Run tests
forge test -vvv

# If you see passing tests, you're ready to deploy!
```

### Option 2: Full manual setup in WSL

```bash
# Start WSL
wsl

# Check if Foundry is installed
forge --version

# If not installed, install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Navigate to your project (adjust path for your username)
cd /mnt/c/Users/olo/Programmes/Bug_bounty_mini_app_base/farcaster-bug-bounty/contracts

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit

# Build
forge build

# Test
forge test
```

---

## 📁 Your Complete File Structure

```
farcaster-bug-bounty/
├── 🌐 FRONTEND (Next.js)
│   ├── app/
│   │   ├── layout.tsx              # ✅ Fixed hydration error
│   │   └── page.tsx                # Home page
│   ├── components/
│   │   ├── providers.tsx           # ✅ Wagmi + React Query
│   │   ├── bounty-*.tsx            # Bounty components
│   │   └── ui/                     # Shadcn components
│   ├── lib/
│   │   ├── wagmi-config.ts         # ✅ Base Sepolia config
│   │   └── contracts.ts            # 🔜 Add contract ABI here
│   ├── next.config.mjs             # ✅ Fixed webpack config
│   └── package.json
│
├── ⛓️ SMART CONTRACTS (Foundry)
│   └── contracts/
│       ├── src/
│       │   ├── BountyManager.sol   # ✅ Main MVP contract
│       │   └── BugBounty.old.sol   # Backup
│       ├── test/
│       │   └── BountyManager.t.sol # ✅ Comprehensive tests
│       ├── script/
│       │   └── Deploy.s.sol        # ✅ Deployment scripts
│       ├── lib/
│       │   ├── forge-std/          # ✅ Foundry standard lib
│       │   └── openzeppelin-contracts/ # 🔜 Install this
│       ├── foundry.toml            # ✅ Configured for Base
│       ├── .env.example            # ✅ Template for secrets
│       └── SETUP.md                # ✅ Detailed guide
│
└── 📚 DOCUMENTATION
    └── DEVELOPMENT_GUIDE.md        # Complete workflow
```

---

## 🔧 Next Steps (In Order)

### Step 1: Install Dependencies in WSL ⏳

```bash
# In WSL, in the contracts directory:
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit
```

This will:
- Download OpenZeppelin security contracts
- Fix all "Source not found" errors
- Allow `forge build` to compile

### Step 2: Build & Test 🧪

```bash
# Build contracts
forge build

# Run tests (should see 15+ passing tests)
forge test -vvv
```

### Step 3: Setup Environment Variables 🔐

```bash
# Copy template
cp .env.example .env

# Edit with nano or vim
nano .env
```

Add your values:
```bash
PRIVATE_KEY=your_wallet_private_key_no_0x
FEE_COLLECTOR=0xYourWalletAddress
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_api_key_from_basescan
```

### Step 4: Get Testnet ETH 💰

1. Go to [Coinbase Faucet](https://www.coinbase.com/faucets)
2. Select "Base Sepolia"
3. Enter your wallet address
4. Wait for testnet ETH

### Step 5: Deploy to Base Sepolia 🚀

```bash
# Deploy
forge script script/Deploy.s.sol:DeployBountyManager \
  --rpc-url base-sepolia \
  --broadcast \
  --verify \
  -vvvv

# Save the deployed contract address!
```

### Step 6: Extract ABI & Update Frontend 📝

```bash
# The ABI is in:
cat out/BountyManager.sol/BountyManager.json
```

Copy the ABI array and update `../lib/contracts.ts`:

```typescript
export const BOUNTY_MANAGER_CONTRACT = {
  address: '0xYourDeployedAddress' as const,
  abi: [/* paste ABI here */] as const,
}
```

### Step 7: Test End-to-End 🎯

```bash
# Back to project root
cd ..

# Start dev server
npm run dev
```

Open http://localhost:3000 and:
1. Connect your wallet (Coinbase Wallet or MetaMask)
2. Switch to Base Sepolia network
3. Create a test bounty
4. Submit a test report
5. Accept the submission

### Step 8: Deploy to Base Mainnet 🌐

⚠️ Only after thorough testnet testing!

```bash
# In contracts directory
forge script script/Deploy.s.sol:DeployBountyManagerMainnet \
  --rpc-url base \
  --broadcast \
  --verify \
  -vvvv
```

---

## 🎯 BountyManager Contract Features

### Creating Bounties

**ETH Bounty:**
```solidity
createBountyETH(
    "Find XSS Vulnerability",
    "Detailed description of what to find",
    block.timestamp + 7 days,  // Deadline
    "0xFarcasterCastHash"      // Link to Farcaster post
) payable
```

**ERC20 Bounty (USDC, etc.):**
```solidity
// First approve tokens
IERC20(usdcAddress).approve(bountyManager, amount);

// Then create bounty
createBountyERC20(
    "Find Authentication Bug",
    "Description",
    100 * 10**6,  // 100 USDC (6 decimals)
    usdcAddress,
    block.timestamp + 7 days,
    "0xCastHash"
)
```

### Submitting Reports

```solidity
submitReport(
    bountyId,
    "Found critical bug in authentication...",
    "https://github.com/myreport",
    "@myFarcasterUsername"
)
```

### Accepting Submissions

```solidity
// Only bounty creator can call this
acceptSubmission(submissionId)
```

This will:
- Pay 97.5% to winner
- Pay 2.5% platform fee
- Mark bounty as completed
- Emit events for frontend

---

## 🔗 Integration with Farcaster

The contract stores `farcasterCastHash` for each bounty, allowing you to:

1. **Post bounty announcement on Farcaster**
2. **Store cast hash in contract** when creating bounty
3. **Link back to Farcaster post** from your frontend
4. **Show Farcaster usernames** of submitters

Example flow:
```typescript
// 1. Create Farcaster cast
const cast = await farcasterClient.publishCast({
  text: "🐛 New Bug Bounty: Find XSS - 0.1 ETH reward!"
})

// 2. Create bounty with cast hash
await createBounty({
  title: "Find XSS",
  // ...
  farcasterCastHash: cast.hash
})
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  FARCASTER NETWORK                       │
│  (Social layer - announce bounties, share results)      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Post announcements
                     │ Share submissions
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                     │
│  - Browse bounties                                       │
│  - Connect wallet (wagmi)                                │
│  - Submit reports                                        │
│  - View submissions                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Read/Write via wagmi
                     ▼
┌─────────────────────────────────────────────────────────┐
│            SMART CONTRACT (BountyManager.sol)            │
│  - Store bounty data                                     │
│  - Escrow funds (ETH/ERC20)                             │
│  - Distribute rewards                                    │
│  - Enforce rules                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Deployed on
                     ▼
┌─────────────────────────────────────────────────────────┐
│            BASE BLOCKCHAIN (Sepolia → Mainnet)           │
│  - Low fees                                              │
│  - Fast finality                                         │
│  - EVM compatible                                        │
│  - Coinbase ecosystem                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Deployment Costs (Estimates)

### Base Sepolia (Testnet)
- **Deployment**: ~0.003 ETH (FREE with faucet)
- **Create Bounty**: ~0.0001 ETH
- **Submit Report**: ~0.0001 ETH

### Base Mainnet
- **Deployment**: ~$5-10 USD
- **Create Bounty**: ~$0.10-0.20 USD
- **Submit Report**: ~$0.05-0.10 USD

Much cheaper than Ethereum mainnet! 🎉

---

## 🐛 Troubleshooting

### "forge: command not found"
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### "Source not found" errors
```bash
# Install OpenZeppelin
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit
forge build
```

### WSL can't find directory
```bash
# Check your path
pwd
ls /mnt/c/Users/

# Navigate to correct location
cd /mnt/c/Users/olo/Programmes/Bug_bounty_mini_app_base/farcaster-bug-bounty/contracts
```

### Contract deployment fails
```bash
# Check you have testnet ETH
# Check .env file is configured
# Check RPC URL is correct
source .env
echo $BASE_SEPOLIA_RPC_URL
```

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `contracts/src/BountyManager.sol` | Main smart contract |
| `contracts/test/BountyManager.t.sol` | Tests |
| `contracts/script/Deploy.s.sol` | Deployment |
| `contracts/foundry.toml` | Foundry config |
| `lib/wagmi-config.ts` | Wallet connection |
| `lib/contracts.ts` | Contract integration |
| `app/layout.tsx` | App layout |
| `next.config.mjs` | Next.js config |

---

## 🎉 You're Ready!

Your project is set up for:

✅ **Local Development** - Run tests, iterate on contracts  
✅ **Testnet Deployment** - Test on Base Sepolia  
✅ **Mainnet Deployment** - Deploy to Base mainnet  
✅ **Farcaster Integration** - Link bounties to social posts  
✅ **Coinbase Wallet** - Use Smart Wallet features  

**Next command to run:**
```bash
wsl --cd "C:\Users\olo\Programmes\Bug_bounty_mini_app_base\farcaster-bug-bounty\contracts"
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit && forge build && forge test
```

If tests pass, you're ready to deploy! 🚀
