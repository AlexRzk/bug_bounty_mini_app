# Farcaster Bot - Currently Disabled

## Status: Not Active

The Farcaster bot feature is **currently disabled** but all implementation files are preserved for future activation.

## What's Included (Ready for Future Use)

All bot functionality has been implemented and is ready to activate when needed:

### Core Files
- ✅ `lib/bounty-parser.ts` - Parse bounty details from casts
- ✅ `lib/farcaster-api.ts` - Neynar API client
- ✅ `app/api/monitor/mentions/route.ts` - Poll for bounty casts
- ✅ `app/api/actions/create-bounty/route.ts` - Farcaster Action endpoint
- ✅ `app/api/webhook/farcaster/route.ts` - Webhook handler (for paid plans)

### Documentation
- ✅ `FARCASTER_BOT_SETUP.md` - Complete setup guide
- ✅ `FARCASTER_BOT_README.md` - Quick start guide
- ✅ `FARCASTER_BOT_COMPLETE.md` - Implementation overview
- ✅ `.env.farcaster-bot` - Environment variables template

### Test Scripts
- ✅ `scripts/test-parser.mjs` - Test bounty parser

## Why Disabled?

The bot requires:
1. **Neynar API Key** (free tier available)
2. **Bot Wallet with ~0.1 ETH on Base** for gas fees
3. **Vercel Cron Job** (included in free plan)

Currently not activated to avoid gas costs.

## How to Activate Later

When ready to enable the bot:

### 1. Get Neynar API Key
```bash
# Sign up at https://dev.neynar.com/
# Copy your API key
```

### 2. Create & Fund Bot Wallet
```bash
# Create wallet
cast wallet new

# Fund with 0.1 ETH on Base mainnet
```

### 3. Add Environment Variables
```env
NEYNAR_API_KEY=your_api_key_here
BOT_PRIVATE_KEY=0x_your_private_key_here
CRON_SECRET=optional_random_string
```

### 4. Enable Cron Job

In `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/monitor/mentions",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 5. Deploy
```bash
git push origin main
```

## Features When Activated

✅ Users create bounties by posting casts with keywords  
✅ Bot automatically detects and creates bounties on-chain  
✅ Farcaster Actions for one-click bounty creation  
✅ Smart parsing of natural language and hashtags  
✅ Works on Neynar free tier!  

## Cost When Active

- **Gas per bounty**: ~$0.10 - $0.50 on Base
- **Neynar API**: Free tier (10k requests/month)
- **Total for 100 bounties/month**: ~$10-50

## Current Status

🔴 **Disabled** - No cron jobs running, no gas costs  
📁 **Code Preserved** - Ready to activate anytime  
📚 **Documentation Complete** - Full setup guides available  

---

When you're ready to activate, follow the steps in `FARCASTER_BOT_SETUP.md`
