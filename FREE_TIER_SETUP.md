# Free Tier Setup (No Webhooks Required) 🆓

## Overview

This bot works on Neynar's **FREE tier** using polling instead of webhooks!

### How It Works

Instead of webhooks (which require paid plan), we use:

1. **Vercel Cron Jobs** - Check for mentions every 5 minutes
2. **Neynar Free API** - Fetch mentions using notifications endpoint
3. **In-memory tracking** - Remember last processed cast

### Trade-offs

| Feature | Webhooks (Paid) | Polling (Free) |
|---------|----------------|----------------|
| Response time | Instant | ~5 min delay |
| Cost | $20+/month | $0 |
| Setup complexity | Medium | Low |
| API calls | 0 (push) | ~288/day (every 5 min) |
| Free tier limit | ❌ Requires paid plan | ✅ Works! (10k calls/month) |

**Verdict:** Polling is perfect for most use cases! Users won't mind waiting 5 minutes.

## Setup Steps

### 1. Create Neynar Account (Free)

1. Go to https://dev.neynar.com/
2. Sign up (no credit card required!)
3. Get your API key

### 2. Create Bot Signer

1. In dashboard → Signers → Create New Signer
2. Copy the UUID and FID
3. Fund with warps (for posting replies)

### 3. Configure Environment

Add to Vercel:

```env
NEYNAR_API_KEY=your_key_here
NEYNAR_SIGNER_UUID=your_uuid_here
FARCASTER_BOT_FID=123456  # Your bot's FID
BOT_PRIVATE_KEY=0x...
CRON_SECRET=random_secret
```

### 4. Enable Vercel Cron

The `vercel.json` file already includes:

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

This runs every 5 minutes automatically!

### 5. Deploy

```bash
git push origin main
```

Vercel automatically detects the cron configuration and enables it.

## Monitoring

### View Cron Logs

1. Visit Vercel Dashboard
2. Go to your project → Cron Jobs
3. See execution history and logs

### Test Manually

```bash
curl https://your-app.vercel.app/api/monitor/mentions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## How Polling Works

```typescript
// Runs every 5 minutes
GET /api/monitor/mentions

1. Fetch recent mentions from Neynar API
2. Filter for unprocessed casts
3. Parse each cast for bounty details
4. Create bounty on-chain
5. Reply to cast with confirmation
6. Track last processed cast hash
```

## API Usage Estimates

**Free Tier Limit:** 10,000 requests/month

**Our Usage:**
- Cron runs: 288 times/day (every 5 min) = ~8,640/month
- Each run: 1 API call to fetch mentions
- Replies: 1 API call per bounty created

**Total:** ~8,640 calls/month (well under 10k limit!)

## Upgrading to Webhooks (Optional)

If you want instant responses (<1 second), upgrade to webhooks:

1. Subscribe to Neynar paid plan ($20+/month)
2. Remove `vercel.json` cron config
3. Use `/api/webhook/farcaster` endpoint
4. Configure webhook in Neynar dashboard

**Most users won't need this!** 5-minute delay is fine for bounty creation.

## Troubleshooting

### Cron not running

1. Check Vercel dashboard → Cron Jobs tab
2. Ensure `vercel.json` is in repository root
3. Redeploy: `git push origin main`

### "No mentions found" every time

1. Verify `FARCASTER_BOT_FID` is correct
2. Test by posting a cast mentioning your bot
3. Wait 5 minutes for next cron run
4. Check function logs in Vercel

### API rate limit errors

Free tier = 10k calls/month. To reduce usage:

1. Increase cron interval (e.g., every 10 min instead of 5)
2. Edit `vercel.json`: `"schedule": "*/10 * * * *"`

## Cost Comparison

| Setup | Monthly Cost | Response Time |
|-------|-------------|---------------|
| **Polling (This!)** | $0 | ~5 minutes |
| Webhooks (Paid) | $20-50 | Instant |
| Manual (No automation) | $0 | Manual |

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Wait ~5 minutes
3. 📝 Post test cast mentioning your bot
4. ⏱️ Wait another 5 minutes
5. ✅ Check for bot reply!

---

**Perfect for side projects, hackathons, and MVPs!** 🚀

Upgrade to webhooks later if you need instant responses.
