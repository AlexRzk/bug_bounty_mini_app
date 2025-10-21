# Farcaster Bot Feature - Quick Start 🚀

## ✅ FREE TIER COMPATIBLE!

**No paid Neynar plan required!** Uses polling instead of webhooks.

## What This Does

Users can now create bounties by:
1. **Tagging the bot** in a Farcaster cast
2. **Using a Farcaster Action** on any cast

## Files Added

```
lib/
  ├── bounty-parser.ts          # Parses bounty details from cast text
  └── farcaster-api.ts           # Neynar API client for Farcaster interactions

app/api/
  ├── webhook/farcaster/         # Webhook for bot mentions
  │   └── route.ts
  └── actions/create-bounty/     # Farcaster Action endpoint
      └── route.ts

scripts/
  └── test-parser.mjs            # Test the bounty parser

.env.farcaster-bot               # Environment variables template
FARCASTER_BOT_SETUP.md           # Full setup guide
```

## Quick Test (Without Deployment)

Test the bounty parser locally:

```bash
# Run parser test
node scripts/test-parser.mjs
```

This will show you how different cast formats are parsed into bounties.

## Example Usage

### Method 1: Tag the Bot

User posts on Farcaster:
```
@BountyBot Create bounty: Fix authentication bug #reward:0.1 #severity:high

Users can't log in after the latest update
```

Bot automatically:
- ✅ Parses the bounty details
- ✅ Creates bounty on Base blockchain
- ✅ Replies with confirmation + transaction link

### Method 2: Farcaster Action

User writes a cast:
```
Need help fixing memory leak in API server. Willing to pay 0.2 ETH. Critical!
```

Then clicks the "Create Bounty" action → Instant bounty creation

## Supported Formats

### Hashtag Format (Recommended)
```
Create bounty: [Title] #reward:0.1 #severity:high #category:frontend

[Optional description]
```

### Natural Language
```
Fix the login bug, willing to pay 0.15 ETH. This is urgent!
```

Parser automatically extracts:
- **Reward**: From `#reward:X` or "X ETH"
- **Severity**: From `#severity:X` or keywords (critical, high, medium, low)
- **Title**: From first sentence or after "Create bounty:"
- **Description**: Remaining text

## Setup Required

See `FARCASTER_BOT_SETUP.md` for full instructions. Quick checklist:

- [ ] Create Neynar account and get API key
- [ ] Create managed signer (bot's Farcaster account)
- [ ] Setup webhook for mentions
- [ ] Create bot wallet and fund with ETH
- [ ] Add environment variables to Vercel
- [ ] Deploy and test

## Environment Variables

Add to `.env.local` or Vercel:

```env
NEYNAR_API_KEY=your_api_key
NEYNAR_SIGNER_UUID=your_signer_uuid  
NEYNAR_WEBHOOK_SECRET=your_webhook_secret
BOT_PRIVATE_KEY=0x_your_bot_wallet_private_key
```

## Security Notes

⚠️ **Bot wallet** submits transactions on behalf of users
⚠️ Keep `BOT_PRIVATE_KEY` secret - never commit to git
⚠️ Fund bot wallet with minimal ETH (~0.1 for gas fees)
⚠️ Webhook secret prevents unauthorized bounty creation

## Cost Estimate

- Gas per bounty: ~$0.10 - $0.50 (Base L2)
- Neynar API: Free tier (10k requests/month)
- Warps for replies: ~100 warps per reply

**For 100 bounties/month: ~$10-50 total**

## Next Steps

1. Read `FARCASTER_BOT_SETUP.md` for detailed setup
2. Test parser locally: `node scripts/test-parser.mjs`
3. Deploy to Vercel with environment variables
4. Test with real Farcaster casts
5. Announce feature to your community!

## Troubleshooting

**Parser not working?**
- Check cast includes `#reward:X` or "X ETH"
- Test with `scripts/test-parser.mjs`

**Bot not responding?**
- Verify webhook is configured in Neynar
- Check Vercel logs: `vercel logs`
- Ensure environment variables are set

**Transaction failing?**
- Check bot wallet has ETH on Base
- Verify contract address is correct
- Review transaction on BaseScan

---

Need help? Check `FARCASTER_BOT_SETUP.md` for full documentation.
