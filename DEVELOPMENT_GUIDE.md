# 🚀 Farcaster Bug Bounty - Development Guide

## 📁 Project Structure Overview

```
farcaster-bug-bounty/
├── app/                    # Next.js app directory (frontend)
├── components/             # React components
├── lib/                    # Frontend utilities & configs
├── contracts/              # Foundry smart contracts (Solidity)
│   ├── src/               # Solidity contracts
│   ├── test/              # Foundry tests
│   ├── script/            # Deployment scripts
│   └── lib/               # Contract dependencies
└── public/                # Static assets
```

## 🔧 Development Workflow

### Frontend Development (Next.js)
- **Location**: `app/`, `components/`, `lib/`
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Wagmi, Viem
- **Run**: `npm run dev`

### Smart Contract Development (Foundry)
- **Location**: `contracts/`
- **Tech Stack**: Solidity, Foundry, OpenZeppelin
- **Run**: `cd contracts && forge test`

---

## 📝 Smart Contract Setup with Foundry

### Step 1: Install Foundry (Windows)

```powershell
# Open WSL (Windows Subsystem for Linux)
wsl

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
```

### Step 2: Initialize Foundry Project

```bash
cd contracts
forge init --no-commit --force
```

This creates:
- `src/` - Your Solidity contracts
- `test/` - Contract tests
- `script/` - Deployment scripts
- `foundry.toml` - Configuration

### Step 3: Install OpenZeppelin

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

### Step 4: Configure Foundry

Create/edit `contracts/foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
base-sepolia = "https://sepolia.base.org"

[etherscan]
base-sepolia = { key = "${BASESCAN_API_KEY}", url = "https://api-sepolia.basescan.org/api" }
```

### Step 5: Set Up Environment Variables

Create `contracts/.env`:

```bash
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

⚠️ **Never commit your `.env` file!**

---

## 🔨 Common Foundry Commands

### Build Contracts
```bash
cd contracts
forge build
```

### Run Tests
```bash
forge test
forge test -vvv  # Verbose output
forge test --match-test testFunctionName  # Run specific test
```

### Deploy to Base Sepolia
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base-sepolia \
  --broadcast \
  --verify
```

### Local Development (Anvil)
```bash
# Start local blockchain
anvil

# Deploy to local
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast
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

## 🔗 Connecting Contracts to Frontend

### Step 1: Deploy Your Contract

```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base-sepolia \
  --broadcast \
  --verify
```

Save the deployed contract address!

### Step 2: Export ABI

After building, the ABI is in:
```
contracts/out/BugBounty.sol/BugBounty.json
```

### Step 3: Create Contract Config

Create `lib/contracts/bug-bounty.ts`:

```typescript
export const BUG_BOUNTY_CONTRACT = {
  address: '0x...' as const, // Your deployed address
  abi: [
    // Copy from contracts/out/BugBounty.sol/BugBounty.json
  ] as const,
}
```

### Step 4: Use in Components

```typescript
import { useReadContract, useWriteContract } from 'wagmi'
import { BUG_BOUNTY_CONTRACT } from '@/lib/contracts/bug-bounty'

function MyComponent() {
  // Read from contract
  const { data: bountyCount } = useReadContract({
    ...BUG_BOUNTY_CONTRACT,
    functionName: 'nextBountyId',
  })

  // Write to contract
  const { writeContract } = useWriteContract()

  const createBounty = async () => {
    writeContract({
      ...BUG_BOUNTY_CONTRACT,
      functionName: 'createBounty',
      args: ['Title', 'Description', BigInt(deadline)],
      value: parseEther('0.1'), // 0.1 ETH reward
    })
  }

  return <button onClick={createBounty}>Create Bounty</button>
}
```

---

## 🧪 Testing Strategy

### Smart Contract Tests (Foundry)

```solidity
// contracts/test/BugBounty.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BugBounty.sol";

contract BugBountyTest is Test {
    BugBounty public bounty;
    address public user1;
    address public user2;

    function setUp() public {
        bounty = new BugBounty();
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    function testCreateBounty() public {
        vm.prank(user1);
        uint256 bountyId = bounty.createBounty{value: 1 ether}(
            "Test Bug",
            "Find the bug",
            block.timestamp + 7 days
        );
        
        assertEq(bountyId, 1);
    }
}
```

Run: `forge test`

### Frontend Tests (Jest/Vitest)

Create tests in `__tests__/` or `*.test.tsx` files.

---

## 🌐 Deployment Workflow

### 1. Test Contracts Locally
```bash
cd contracts
forge test
```

### 2. Deploy to Base Sepolia Testnet
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base-sepolia \
  --broadcast \
  --verify
```

### 3. Update Frontend Config
- Copy contract address
- Update `lib/contracts/bug-bounty.ts`

### 4. Test Frontend Locally
```bash
npm run dev
```

### 5. Deploy Frontend (Vercel)
```bash
npm run build
# Then deploy to Vercel
```

---

## 📚 Resources

### Foundry
- [Foundry Book](https://book.getfoundry.sh/)
- [Foundry GitHub](https://github.com/foundry-rs/foundry)

### Base
- [Base Docs](https://docs.base.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

### Wagmi/Viem
- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)

### OpenZeppelin
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

## 🐛 Common Issues

### Issue: "forge: command not found"
**Solution**: Install Foundry or add to PATH
```bash
wsl
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Issue: "failed to resolve dependency"
**Solution**: Install dependencies
```bash
forge install
```

### Issue: Hydration errors in Next.js
**Solution**: Use `suppressHydrationWarning` on `<html>` tag

### Issue: Wallet connection fails
**Solution**: Ensure you have a valid WalletConnect project ID in `.env.local`

---

## 🎯 Next Steps

1. ✅ Set up Foundry
2. ✅ Write smart contracts
3. ✅ Write tests
4. ✅ Deploy to testnet
5. ✅ Connect frontend to contracts
6. ✅ Test end-to-end
7. ✅ Deploy to mainnet

Good luck! 🚀
