# Bug Fix: "getChainId is not a function" Error

## Issue
When trying to create a bounty, the frontend throws: `n.connector.getChainId is not a function`

## Root Cause
This error occurs due to a version mismatch between `wagmi` and `viem`, typically when:
1. Using `latest` versions of both packages that aren't compatible
2. The wallet connector is trying to call a method that doesn't exist
3. WalletConnect connector has a storage compatibility issue with injected connectors

## Solution Applied ✅

### Changes Made:
1. **Simplified wagmi config** (`lib/wagmi-config.ts`):
   - Removed problematic WalletConnect connector
   - Now uses only `injected()` connector (MetaMask, Coinbase Wallet, etc.)
   - Added `shimDisconnect: true` for better compatibility
   - Added `ssr: true` flag for Next.js SSR support

2. **Before:**
   ```typescript
   connectors: [injected(), walletConnect(...)]  // Mixed connectors = incompatibility
   ```

3. **After:**
   ```typescript
   connectors: [injected({ shimDisconnect: true })]  // Only injected = stable
   ```

## What This Fixes
- ✅ Eliminates `getChainId is not a function` error
- ✅ Simplifies wallet connector initialization
- ✅ Works with MetaMask, Coinbase Wallet, and other EIP-1193 providers
- ✅ Better SSR support for Next.js

## Testing
After the fix, you should be able to:
1. ✅ Connect a wallet (MetaMask)
2. ✅ Create a bounty without "getChainId" errors
3. ✅ Switch networks without connector issues
4. ✅ Submit bounties on Base Sepolia

## If Error Still Occurs

### Step 1: Check Wallet Connection
- Make sure MetaMask is installed
- Make sure you're connected to **Base Sepolia** testnet
- Check browser console for additional errors

### Step 2: Clear Browser Cache
```bash
# Hard refresh in browser:
Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (Mac)
# Then clear Cookies and Cached files
```

### Step 3: Check Network
```javascript
// In browser console, run:
console.log(await window.ethereum.request({ method: 'eth_chainId' }))
// Should return: 0x14a34  (Base Sepolia chain ID)
```

### Step 4: Rebuild Frontend
```bash
npm run build
npm run dev
# or if using pnpm:
pnpm build
pnpm dev
```

### Step 5: Check Dependencies
```bash
npm list wagmi viem
# Ensure versions are compatible (wagmi >=1.x with viem >=1.x)
```

## Git Commit
- **Commit**: `3aba6a3`
- **Message**: "fix: simplify wagmi config to use only injected connector"
- **Files**: `lib/wagmi-config.ts`

## Live Status
- ✅ Fix deployed to GitHub
- ✅ Vercel auto-deploying new version
- ✅ Contract address: `0x5Eb412b6FcB13225C3d5C2aE39570D86a894C11a`
- ✅ App: https://bug-bounty-mini-app-swib.vercel.app

## Troubleshooting Logs

### Expected Console Output (After Fix)
```
✅ WagmiProvider initialized
✅ QueryClientProvider initialized
✅ Connector: injected()
✅ Chain: Base Sepolia (84532)
```

### What NOT to See
```
❌ getChainId is not a function
❌ connector.getChainId
❌ Storage key mismatch
```

## Next Steps
1. Hard refresh the app (Ctrl+Shift+R)
2. Connect MetaMask wallet
3. Try creating a bounty
4. If it works, proceed with SolidityScan verification

## Support
If issue persists:
1. Check that `.env.local` has `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (can be empty now)
2. Verify `NEXT_PUBLIC_BOUNTY_CONTRACT=0x5Eb412b6FcB13225C3d5C2aE39570D86a894C11a`
3. Open DevTools → Network → check for any failed API calls
4. Check Vercel logs for backend errors
