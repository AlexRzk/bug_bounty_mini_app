# Environment Variables for Farcaster Mini App

## Required for Mini App Support

Add these to your `.env.local` file (for local development) or Vercel/deployment environment:

```env
# Public URL for frame callbacks and redirects
NEXT_PUBLIC_URL=http://localhost:3000
# On Vercel: NEXT_PUBLIC_URL=https://your-domain.vercel.app

# Farcaster Hub API (optional, for frame validation)
FARCASTER_HUB_URL=https://hub.farcaster.xyz
FARCASTER_HUB_API_KEY=your_api_key_here

# Base RPC endpoint
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org

# Bounty contract address
NEXT_PUBLIC_BOUNTY_CONTRACT=0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf

# Wallet Connect (optional for WalletConnect connector)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Vercel Deployment

1. Go to your Vercel project settings → Environment Variables
2. Add all the variables above
3. Make sure `NEXT_PUBLIC_URL` matches your Vercel deployment URL
4. Redeploy to apply changes

## Testing Frame Locally

### Option 1: Using Farcaster Devtools
1. Install Farcaster devtools browser extension
2. Visit http://localhost:3000
3. Open devtools and test the frame

### Option 2: Using Frame Validator
1. Go to https://warpcast.com/~/developers/frames
2. Paste your frame URL: `http://localhost:3000`
3. Test interactions

### Option 3: Deploy to Vercel and test via Warpcast
1. Push to GitHub
2. Deploy to Vercel
3. Share frame URL in Warpcast test account

## Frame URLs

**Home Frame:** `https://your-domain.com/`
**Bounties Frame:** `https://your-domain.com/api/frame/image?page=bounties`
**Create Frame:** `https://your-domain.com/api/frame/image?page=create`
**Frame Handler:** `https://your-domain.com/api/frame` (POST endpoint)

## Troubleshooting

### Frame not showing in Warpcast
- Check that `NEXT_PUBLIC_URL` is set correctly (must be public URL, not localhost)
- Verify frame metadata is in HTML head: `fc:frame`, `fc:frame:image`, `fc:frame:post_url`
- Test frame validation at https://warpcast.com/~/developers/frames

### Image not loading
- Ensure `NEXT_PUBLIC_URL` is accessible from the internet
- Check `/api/frame/image` endpoint returns valid SVG with correct headers

### Frame buttons not working
- Verify `fc:frame:post_url` points to correct POST endpoint
- Check button actions and targets in metadata

## References

- [Farcaster Frames Spec](https://docs.farcaster.xyz/reference/frames/spec)
- [Base Mini Apps Docs](https://docs.base.org/guides/mini-apps)
- [Frames.js Library](https://docs.framesjs.org/)
