# Farcaster Bot Setup Guide 🤖

This guide shows you how to set up the Farcaster bot that lets users create bounties by tagging your bot or using Farcaster Actions.

## Features

✅ **Bot Mentions** - Users tag the bot in a cast to create bounties  
✅ **Farcaster Actions** - One-click bounty creation from any cast  
✅ **Auto-parsing** - Extracts title, reward, severity from natural language  
✅ **On-chain Creation** - Automatically submits transactions to Base  
✅ **Reply System** - Bot confirms bounty creation or reports errors

## Setup Steps

### 1. Create Neynar Account

1. Go to [https://dev.neynar.com/](https://dev.neynar.com/)
2. Sign up and create a new app
3. Copy your **API Key** from the dashboard

### 2. Create Managed Signer (Bot Account)

1. In Neynar dashboard, go to **Signers**
2. Click **Create New Signer**
3. This creates a Farcaster account for your bot
4. Copy the **Signer UUID**
5. Fund the bot account with warps (for posting casts)

### 3. Setup Webhook

1. In Neynar dashboard, go to **Webhooks**
2. Click **Create Webhook**
3. Set URL to: `https://bug-bounty-mini-app.vercel.app/api/webhook/farcaster`
4. Subscribe to event: `cast.created`
5. Add filter: `mentioned_fids` = [your bot's FID]
6. Copy the **Webhook Secret**

### 4. Create Bot Wallet

Create a new Ethereum wallet for the bot to submit transactions:

```bash
# Using cast (Foundry)
cast wallet new

# Or use MetaMask to create a new account
```

**IMPORTANT:** 
- Fund this wallet with ~0.1 ETH on Base mainnet for gas fees
- Keep the private key secure - add to `.env.local`, never commit to git
- This wallet acts as a proxy to submit bounties on behalf of users

### 5. Configure Environment Variables

Add to your `.env.local`:

```env
# Neynar API Configuration
NEYNAR_API_KEY=your_neynar_api_key
NEYNAR_SIGNER_UUID=your_signer_uuid
NEYNAR_WEBHOOK_SECRET=your_webhook_secret

# Bot Wallet (for submitting transactions)
BOT_PRIVATE_KEY=0xyour_private_key_here
```

### 6. Deploy to Vercel

```bash
# Add environment variables to Vercel
vercel env add NEYNAR_API_KEY
vercel env add NEYNAR_SIGNER_UUID
vercel env add NEYNAR_WEBHOOK_SECRET
vercel env add BOT_PRIVATE_KEY

# Deploy
git push origin main
```

### 7. Test the Bot

#### Method 1: Tag the Bot

Post a cast on Farcaster:

```
@YourBot Create bounty: Fix login redirect bug #reward:0.1 #severity:high

Need someone to fix the authentication redirect issue on our app
```

The bot will:
1. Detect the mention
2. Parse bounty details
3. Create bounty on Base
4. Reply with confirmation + transaction hash

#### Method 2: Use Farcaster Action

1. Users install the action: `https://bug-bounty-mini-app.vercel.app/api/actions/create-bounty`
2. Write a cast describing the bounty
3. Click the "Create Bounty" action button
4. Bot creates the bounty instantly

## Bounty Format

### Hashtag-based (Recommended)

```
Create bounty: [Title] #reward:0.1 #severity:high #category:frontend

[Optional longer description]
```

**Supported hashtags:**
- `#reward:0.1` - Reward amount in ETH (required)
- `#severity:low|medium|high|critical` - Bug severity (optional, defaults to medium)
- `#category:frontend|backend|smart-contract` - Bounty category (optional)

### Natural Language

```
Need someone to fix authentication bug, willing to pay 0.1 ETH. This is a critical issue.
```

The parser extracts:
- Reward from "0.1 ETH" or similar patterns
- Severity from keywords: "critical", "urgent", "high priority", etc.
- Title from first sentence
- Description from remaining text

## How It Works

```
User posts cast
    ↓
Neynar webhook notifies your API
    ↓
Parse bounty details from cast text
    ↓
Bot wallet submits transaction to BountyManager contract
    ↓
Reply to cast with confirmation or error
```

## Security Notes

⚠️ **Bot Private Key**
- Never commit to git
- Use Vercel environment variables
- Fund with minimal ETH (~0.1 ETH for gas)
- Rotate periodically

⚠️ **Webhook Secret**
- Used to verify requests from Neynar
- Prevents unauthorized bounty creation
- Keep secret, don't expose publicly

⚠️ **Rate Limiting**
- Consider adding rate limits to prevent spam
- Track bounties per user per day
- Implement minimum reward thresholds

## Troubleshooting

### Bot doesn't respond to mentions

1. Check webhook is active in Neynar dashboard
2. Verify `mentioned_fids` filter includes your bot's FID
3. Check Vercel logs for errors: `vercel logs`
4. Ensure `NEYNAR_SIGNER_UUID` is correct

### Transaction fails

1. Check bot wallet has sufficient ETH on Base
2. Verify `BOUNTY_MANAGER_ADDRESS` is correct
3. Check Base RPC is responding
4. Review transaction in BaseScan

### Parser doesn't extract details

1. Ensure cast includes `#reward:X` or "X ETH"
2. Use "Create bounty:" prefix for clarity
3. Check console logs for parser output
4. Test with example formats above

## Cost Estimation

- **Neynar API**: Free tier (10k requests/month)
- **Gas per bounty**: ~$0.10 - $0.50 (Base L2)
- **Warps (for replies)**: ~100 warps per reply

For 100 bounties/month: ~$10-50 in gas fees

## Next Steps

1. ✅ Configure environment variables
2. ✅ Deploy to Vercel
3. ✅ Test with sample cast
4. 📢 Announce the feature to your community
5. 📊 Monitor usage and gas costs
6. 🔧 Adjust rate limits and parsers as needed

## Support

- Neynar Docs: https://docs.neynar.com/
- Farcaster Actions: https://docs.farcaster.xyz/reference/actions/spec
- Base Docs: https://docs.base.org/

---

Made with ❤️ for the Farcaster community
