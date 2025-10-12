# 🚀 Quick Testnet Setup

## 1️⃣ Get Wallet & Testnet ETH (5 minutes)

### Install Coinbase Wallet or MetaMask
- Coinbase Wallet: https://www.coinbase.com/wallet
- MetaMask: https://metamask.io

### Add Base Sepolia Network
Visit: https://chainlist.org/chain/84532
- Click "Add to Wallet"
- Approve in wallet

Or add manually:
```
Network: Base Sepolia
RPC: https://sepolia.base.org
Chain ID: 84532
Symbol: ETH
Explorer: https://sepolia.basescan.org
```

### Get Free Testnet ETH
Visit: https://www.coinbase.com/faucets
- Select "Base Sepolia"
- Enter your wallet address
- Get 0.05 ETH (free!)

---

## 2️⃣ Test Frontend Only (No Contract Yet)

```powershell
# In project root
npm run dev
```

Open: http://localhost:3000

**What You Can Test:**
✅ Connect wallet
✅ Switch networks
✅ Browse UI
✅ Fill forms

**What Won't Work Yet:**
❌ Creating bounties (no contract)
❌ Submitting reports
❌ Accepting submissions

---

## 3️⃣ Deploy Contract & Test Everything

### Deploy to Base Sepolia

```bash
# In WSL, contracts directory
cd /mnt/host/c/Users/olo/Programmes/Bug_bounty_mini_app_base/farcaster-bug-bounty/contracts

# Set up .env
cp .env.example .env
nano .env
# Add: PRIVATE_KEY=your_key_without_0x
#      FEE_COLLECTOR=your_wallet_address

# Deploy
forge script script/Deploy.s.sol:DeployBountyManager \
  --rpc-url base-sepolia \
  --broadcast \
  -vvvv
```

**Save the contract address!**

### Update Frontend

Extract ABI:
```bash
cat out/BountyManager.sol/BountyManager.json | jq '.abi' > abi.json
```

Edit `lib/contracts.ts`:
```typescript
export const BOUNTY_MANAGER_CONTRACT = {
  address: '0xYourContractAddress',
  abi: [/* paste ABI */],
}
```

Restart app:
```powershell
npm run dev
```

---

## 4️⃣ Test Full Features

### Create Bounty
1. Connect wallet (Base Sepolia network)
2. Click "Create Bounty"
3. Fill: Title, Description, 0.01 ETH reward
4. Confirm transaction in wallet
5. Wait ~5 seconds
6. See bounty on board! ✅

### Submit Report (Different Account)
1. Switch wallet account or use different browser
2. Click on bounty
3. "Submit Report"
4. Fill details
5. Confirm transaction

### Accept Submission
1. Switch back to creator account
2. View submissions
3. Click "Accept"
4. Winner gets paid! 💰

### Verify on Explorer
https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Wrong network | Switch to Base Sepolia in wallet |
| No ETH | Get from faucet: https://www.coinbase.com/faucets |
| Wallet won't connect | Refresh page, check extension unlocked |
| Transaction fails | Check ETH balance, check deadline |
| Contract not found | Verify address in `lib/contracts.ts` |

---

## 📋 Testing Checklist

**Before Deploying Contract:**
- [ ] Wallet installed
- [ ] Base Sepolia added
- [ ] 0.05 ETH received
- [ ] App running: `npm run dev`
- [ ] Wallet connects to app

**After Deploying Contract:**
- [ ] Contract deployed (save address!)
- [ ] ABI copied to `lib/contracts.ts`
- [ ] App restarted
- [ ] Create bounty works ✅
- [ ] Submit report works ✅
- [ ] Accept submission works ✅
- [ ] ETH transfers correctly ✅

---

## 🎯 Key Links

- **Faucet**: https://www.coinbase.com/faucets
- **Explorer**: https://sepolia.basescan.org
- **Add Network**: https://chainlist.org/chain/84532
- **Coinbase Wallet**: https://www.coinbase.com/wallet

---

**Need more details? See `TESTNET_GUIDE.md`**
