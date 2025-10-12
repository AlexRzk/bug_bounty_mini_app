# 🌐 Testing Your App on Base Sepolia Testnet

Complete guide to test your bug bounty platform on Base Sepolia with a real wallet.

---

## 🎯 Overview

You'll need to:
1. ✅ Set up a wallet (Coinbase Wallet or MetaMask)
2. ✅ Add Base Sepolia network
3. ✅ Get testnet ETH
4. ✅ Run your frontend
5. ✅ Connect wallet and test features

---

## 📱 Step 1: Set Up Your Wallet

### Option A: Coinbase Wallet (Recommended for Base)

1. **Install Coinbase Wallet**
   - Download from: https://www.coinbase.com/wallet
   - Or use browser extension: https://chrome.google.com/webstore/detail/coinbase-wallet

2. **Create a new wallet** (or import existing)
   - Follow the setup wizard
   - **Save your recovery phrase securely!**
   - Set a password

### Option B: MetaMask

1. **Install MetaMask**
   - Download from: https://metamask.io/download/
   - Browser extension or mobile app

2. **Create a new wallet**
   - Follow setup wizard
   - **Save your recovery phrase!**

---

## 🌍 Step 2: Add Base Sepolia Network

### Automatic (Easy Way)

Visit **Chainlist**: https://chainlist.org/
1. Search for "Base Sepolia"
2. Click "Add to MetaMask" or "Add to Wallet"
3. Approve in your wallet

### Manual Configuration

Add these network details to your wallet:

```
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

**In MetaMask:**
1. Click network dropdown (top left)
2. Click "Add network"
3. Click "Add network manually"
4. Enter the details above
5. Click "Save"

**In Coinbase Wallet:**
1. Settings → Networks → Add Network
2. Enter the details above
3. Save

---

## 💰 Step 3: Get Base Sepolia Testnet ETH

### Method 1: Coinbase Faucet (Best)

1. Visit: https://www.coinbase.com/faucets
2. Select "Base Sepolia"
3. Enter your wallet address
4. Complete captcha
5. Click "Send me ETH"
6. Wait 1-2 minutes for ETH to arrive

You'll get **~0.05 ETH** (enough for testing)

### Method 2: Alchemy Faucet

1. Visit: https://www.alchemy.com/faucets/base-sepolia
2. Sign in with Google/GitHub
3. Enter your wallet address
4. Request testnet ETH

### Method 3: QuickNode Faucet

1. Visit: https://faucet.quicknode.com/base/sepolia
2. Sign in
3. Request ETH

### Verify You Received ETH

1. Open your wallet
2. Switch to "Base Sepolia" network
3. You should see your ETH balance (e.g., "0.05 ETH")

---

## 🚀 Step 4: Run Your Frontend

### Start the Next.js Dev Server

In PowerShell (in your project root):

```powershell
npm run dev
```

Or if using pnpm:
```powershell
pnpm dev
```

Your app will start at: **http://localhost:3000**

---

## 🔗 Step 5: Connect Your Wallet to the App

1. **Open your browser** to http://localhost:3000

2. **Look for "Connect Wallet" button** (should be in the header)

3. **Click "Connect Wallet"**
   - Your wallet extension will pop up
   - Select the account you want to use
   - Click "Connect"

4. **Switch to Base Sepolia**
   - Your wallet might prompt you to switch networks
   - Or manually switch to "Base Sepolia" in your wallet

5. **Verify Connection**
   - You should see your wallet address in the header
   - And your ETH balance

---

## 🧪 Step 6: Test Your App (Without Deployed Contract)

Since you haven't deployed the contract yet, you can test the **UI/UX**:

### Test These Features:

✅ **Wallet Connection**
   - Connect/disconnect wallet
   - Switch accounts
   - Switch networks (Base Sepolia ↔ other networks)

✅ **UI Navigation**
   - Browse bounty cards
   - Click on bounty details
   - Open create bounty dialog
   - Open submit response dialog

✅ **Form Validation**
   - Fill out create bounty form
   - Fill out submit response form
   - Check if validation works

⚠️ **Contract Interactions Won't Work Yet**
   - Creating bounties won't work (no contract deployed)
   - Submitting responses won't work
   - Accepting submissions won't work

---

## 🚀 Step 7: Deploy Contract to Test Full Features

To test actual blockchain interactions:

### 1. Set Up Deployment Wallet

```bash
# In WSL, in contracts directory
cp .env.example .env
nano .env
```

Add your wallet's **private key**:

```bash
# Get your private key:
# MetaMask: Account → 3 dots → Account details → Export private key
# Coinbase Wallet: Settings → Advanced → Show private key

PRIVATE_KEY=your_private_key_without_0x_prefix
FEE_COLLECTOR=0xYourWalletAddress
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=  # Optional for verification
```

⚠️ **Security Warning:**
- Use a **test wallet** with only testnet ETH
- Never commit `.env` to git
- Never share your private key

### 2. Deploy Contract

```bash
# In WSL, contracts directory
forge script script/Deploy.s.sol:DeployBountyManager \
  --rpc-url base-sepolia \
  --broadcast \
  -vvvv
```

Save the contract address from output:
```
BountyManager deployed to: 0x1234...abcd
```

### 3. Update Frontend with Contract Address

Create/update `lib/contracts.ts`:

```typescript
export const BOUNTY_MANAGER_CONTRACT = {
  address: '0x1234...abcd' as const, // Your deployed address
  abi: [
    // Copy from contracts/out/BountyManager.sol/BountyManager.json
    // See next step for how to get ABI
  ] as const,
}
```

### 4. Get Contract ABI

```bash
# In WSL
cat out/BountyManager.sol/BountyManager.json | jq '.abi' > abi.json

# Then copy the contents to lib/contracts.ts
```

### 5. Restart Your App

```powershell
# Stop the dev server (Ctrl+C)
# Start again
npm run dev
```

---

## 🎮 Step 8: Test Full Contract Interactions

Now you can test everything:

### ✅ Create a Bounty

1. Click "Create Bounty"
2. Fill in:
   - **Title**: "Find XSS Bug"
   - **Description**: "Looking for XSS vulnerabilities"
   - **Reward**: 0.01 ETH
   - **Deadline**: 7 days from now
3. Click "Create"
4. **Wallet will pop up** → Confirm transaction
5. Wait for transaction to confirm (~2-5 seconds)
6. Bounty should appear on the board!

### ✅ Submit a Report (Use Different Account)

1. Switch to a different wallet account
   - Or use a different browser/incognito mode
2. Click on a bounty
3. Click "Submit Report"
4. Fill in details
5. Confirm transaction
6. Submission should appear

### ✅ Accept a Submission

1. Switch back to the bounty creator's account
2. View the bounty
3. See submissions
4. Click "Accept" on a submission
5. Confirm transaction
6. Winner gets paid automatically! 💰

### ✅ Check Transactions on Block Explorer

Visit: https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS

You'll see all transactions:
- Contract deployment
- Bounty creation
- Submissions
- Payouts

---

## 🐛 Common Issues & Solutions

### Issue: "Wrong Network"

**Solution**: Switch to Base Sepolia in your wallet

### Issue: "Insufficient Funds"

**Solution**: Get more testnet ETH from faucet

### Issue: "Transaction Failed"

**Solution**: 
- Check you have enough ETH for gas
- Check deadline hasn't passed
- Check you're not submitting to your own bounty

### Issue: "Contract Not Found"

**Solution**: 
- Verify contract is deployed
- Check contract address in `lib/contracts.ts`
- Restart dev server

### Issue: "Wallet Not Connecting"

**Solution**:
- Refresh the page
- Check wallet extension is unlocked
- Try different browser
- Clear browser cache

---

## 📊 Testing Checklist

### Before Deployment
- [ ] Wallet installed and set up
- [ ] Base Sepolia network added
- [ ] Testnet ETH received (check balance)
- [ ] Frontend running on localhost:3000
- [ ] Wallet connected to app

### After Deployment
- [ ] Contract deployed successfully
- [ ] Contract address saved
- [ ] ABI copied to frontend
- [ ] Frontend restarted
- [ ] Create bounty works
- [ ] Submit report works (different account)
- [ ] Accept submission works
- [ ] ETH transfers correctly
- [ ] Block explorer shows transactions

---

## 🎯 Quick Start Commands

### Get Testnet ETH
```
1. Visit: https://www.coinbase.com/faucets
2. Select "Base Sepolia"
3. Enter your address
4. Get 0.05 ETH
```

### Run Frontend
```powershell
npm run dev
# Open http://localhost:3000
```

### Deploy Contract
```bash
# In WSL
cd contracts
forge script script/Deploy.s.sol:DeployBountyManager \
  --rpc-url base-sepolia \
  --broadcast \
  -vvvv
```

### View Contract on Explorer
```
https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS
```

---

## 🎉 Next Steps After Testing

Once you've tested on Base Sepolia:

1. ✅ **Fix any bugs** you found
2. ✅ **Improve UI/UX** based on testing
3. ✅ **Deploy to Base Mainnet**
4. ✅ **Publish on Coinbase Wallet apps**
5. ✅ **Integrate with Farcaster** (post bounties as casts)

---

## 📚 Useful Links

- **Base Sepolia Faucet**: https://www.coinbase.com/faucets
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Chainlist (Add Network)**: https://chainlist.org/chain/84532
- **Base Docs**: https://docs.base.org
- **Coinbase Wallet**: https://www.coinbase.com/wallet
- **MetaMask**: https://metamask.io

---

**Ready to test! 🚀**

Start with getting testnet ETH, then connect your wallet to the app!
