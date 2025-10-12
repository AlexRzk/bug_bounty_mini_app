# 🎯 BountyManager Smart Contracts

Production-ready smart contracts for a decentralized bug bounty platform on **Base blockchain**, designed for **Farcaster integration**.

## 🚀 Features

✅ **Multi-Token Support**: ETH and ERC20 tokens (USDC, DAI, etc.)  
✅ **Complete Lifecycle**: Create, fund, submit, accept, cancel bounties  
✅ **Farcaster Integration**: Link bounties to Farcaster posts  
✅ **Security First**: OpenZeppelin contracts, ReentrancyGuard, Pausable  
✅ **Platform Fees**: Configurable fee system (default 2.5%)  
✅ **Base Optimized**: Designed for Base Sepolia testnet → Base mainnet  
✅ **Coinbase Wallet Ready**: Deploy and use via Coinbase Wallet Smart Wallet  

---

## 📁 Project Structure

```
contracts/
├── src/
│   ├── BountyManager.sol         # Main contract (MVP)
│   └── BugBounty.old.sol        # Previous version (backup)
├── test/
│   └── BountyManager.t.sol      # Comprehensive tests
├── script/
│   └── Deploy.s.sol             # Deployment scripts (testnet + mainnet)
├── lib/                         # Dependencies (OpenZeppelin, forge-std)
├── foundry.toml                 # Foundry configuration
└── .env.example                 # Environment template
```

---

## ⚙️ Setup (WSL on Windows)

### 1. Install Foundry

```bash
# Open WSL terminal
wsl

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
```

### 2. Navigate to Contracts Directory

```bash
cd /mnt/c/Users/YOUR_USERNAME/path/to/farcaster-bug-bounty/contracts
```

### 3. Install Dependencies

```bash
# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit

# Build contracts
forge build
```

### 4. Set Up Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

Required variables:
```bash
PRIVATE_KEY=your_private_key_without_0x
FEE_COLLECTOR=0xYourWalletAddress
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

⚠️ **Never commit `.env` file!**

---

## 🧪 Testing

### Run All Tests

```bash
forge test
```

### Verbose Output

```bash
forge test -vvv
```

### Test Specific Function

```bash
forge test --match-test testCreateBountyETH -vvv
```

### Gas Report

```bash
forge test --gas-report
```

### Coverage

```bash
forge coverage
```

---

## 🚀 Deployment

### Step 1: Get Testnet ETH

Get Base Sepolia ETH from faucets:
- [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets)

### Step 2: Deploy to Base Sepolia (Testnet)

```bash
# Load environment variables
source .env

# Deploy with verification
forge script script/Deploy.s.sol:DeployBountyManager \
  --rpc-url base-sepolia \
  --broadcast \
  --verify \
  -vvvv
```

### Step 3: Save Deployment Info

The script will output:
```
BountyManager deployed to: 0x...
```

**Save this address!** You'll need it for frontend integration.

### Step 4: Verify on Basescan (if auto-verify fails)

```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  src/BountyManager.sol:BountyManager \
  --chain base-sepolia \
  --constructor-args $(cast abi-encode "constructor(address)" <FEE_COLLECTOR_ADDRESS>)
```

---

## 🌐 Deploy to Base Mainnet

⚠️ **Only after thorough testing on testnet!**

```bash
forge script script/Deploy.s.sol:DeployBountyManagerMainnet \
  --rpc-url base \
  --broadcast \
  --verify \
  -vvvv
```

---

## 🔗 Frontend Integration

### Step 1: Extract ABI

After building, the ABI is in:
```
out/BountyManager.sol/BountyManager.json
```

### Step 2: Update Frontend Config

Edit `../lib/contracts.ts`:

```typescript
export const BOUNTY_MANAGER_CONTRACT = {
  address: '0xYourDeployedAddress' as const,
  abi: [
    // Paste ABI from out/BountyManager.sol/BountyManager.json
    {
      "inputs": [/* ... */],
      "name": "createBountyETH",
      "outputs": [/* ... */],
      "stateMutability": "payable",
      "type": "function"
    },
    // ... rest of ABI
  ] as const,
}
```

### Step 3: Use in React Components

```typescript
import { useWriteContract, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { BOUNTY_MANAGER_CONTRACT } from '@/lib/contracts'

function CreateBounty() {
  const { writeContract } = useWriteContract()

  const createBounty = async () => {
    writeContract({
      ...BOUNTY_MANAGER_CONTRACT,
      functionName: 'createBountyETH',
      args: [
        'Find XSS Bug',
        'Detailed description...',
        BigInt(Math.floor(Date.now() / 1000) + 86400 * 7), // 7 days
        '0xFarcasterCastHash'
      ],
      value: parseEther('0.1'), // 0.1 ETH reward
    })
  }

  return <button onClick={createBounty}>Create Bounty</button>
}
```

---

## 🎯 Contract Functions

### Core Functions

| Function | Description | Payment |
|----------|-------------|---------|
| `createBountyETH` | Create bounty with ETH reward | Payable |
| `createBountyERC20` | Create bounty with ERC20 tokens | Requires approval |
| `submitReport` | Submit bug report to bounty | Free |
| `acceptSubmission` | Accept winning submission & pay out | Free |
| `cancelBounty` | Cancel and refund creator | Free |

### Admin Functions

| Function | Description | Access |
|----------|-------------|--------|
| `setPlatformFee` | Update platform fee (max 10%) | Owner |
| `setFeeCollector` | Change fee collector address | Owner |
| `setTokenWhitelisted` | Add/remove ERC20 token | Owner |
| `pause` / `unpause` | Emergency pause | Owner |

---

## 📊 Gas Estimates

| Function | Gas Cost (approx) |
|----------|-------------------|
| Create Bounty (ETH) | ~150k |
| Create Bounty (ERC20) | ~180k |
| Submit Report | ~120k |
| Accept Submission | ~100k |
| Cancel Bounty | ~60k |

---

## 🔐 Security Features

- ✅ **ReentrancyGuard**: Prevents reentrancy attacks
- ✅ **Pausable**: Emergency stop mechanism
- ✅ **Ownable**: Access control for admin functions
- ✅ **SafeERC20**: Safe token transfers
- ✅ **Input Validation**: Strict parameter checks
- ✅ **Time Locks**: Deadline enforcement

---

## 🐛 Common Issues & Solutions

### Issue: "Source not found" errors in VS Code

**Solution**: Dependencies need to be installed via Foundry
```bash
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit
forge build
```

### Issue: Deployment fails with "insufficient funds"

**Solution**: Get testnet ETH from Base Sepolia faucet

### Issue: Contract verification fails

**Solution**: Use manual verification
```bash
forge verify-contract <ADDRESS> src/BountyManager.sol:BountyManager --chain base-sepolia
```

### Issue: WSL can't find directory

**Solution**: Check your Windows path
```bash
# Find your Windows drives
ls /mnt/c/Users/

# Navigate correctly
cd /mnt/c/Users/YOUR_USERNAME/...
```

---

## 📚 Resources

- [Base Documentation](https://docs.base.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)
- [Coinbase Wallet Developer Docs](https://docs.cloud.coinbase.com/)

---

## 🎉 Next Steps

1. ✅ Install Foundry in WSL
2. ✅ Install OpenZeppelin dependencies
3. ✅ Run tests: `forge test`
4. ✅ Set up `.env` file
5. ✅ Deploy to Base Sepolia
6. ✅ Verify contract on Basescan
7. ✅ Update frontend with contract address
8. ✅ Test end-to-end on testnet
9. ✅ Deploy to Base mainnet
10. ✅ Publish in Coinbase Wallet Smart Wallet apps

**Ready to build! 🚀**
