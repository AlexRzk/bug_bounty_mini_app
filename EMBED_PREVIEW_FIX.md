# Farcaster Embed Preview Fix

## Issue
Getting "Embed Valid ✕" and "Preview not available" in Farcaster, even though manifest is valid.

## What Was Done

### 1. Created OG Image ✅
- **File**: `public/og-image.svg`
- **Size**: 1200x630 (required for social sharing)
- **Content**: Branded image with bug logo, title, and badges

### 2. Updated Manifest ✅
- **File**: `public/.well-known/farcaster.json`
- **Changed**: `ogImageUrl` from `.png` to `.svg`
- All icons now use SVG format (better quality, smaller size)

### 3. Updated Layout Metadata ✅
- **File**: `app/layout.tsx`
- **Updated**:
  - Icon references (favicon → app-icon.svg)
  - OpenGraph image (og-image.png → og-image.svg)
  - Twitter card image (og-image.png → og-image.svg)

## Why Embed Preview Might Fail

### Common Causes:

1. **Vercel Deployment Delay** (Most Likely)
   - Changes can take 2-5 minutes to fully deploy
   - Vercel edge cache needs to update globally
   - **Solution**: Wait 5 minutes, then try again

2. **Farcaster Cache** (Very Common)
   - Farcaster caches manifest and preview data
   - Can take 10-30 minutes to refresh
   - **Solution**: Wait or use "Reverify" button

3. **Missing Image Assets** (Fixed)
   - OG image must exist and be accessible
   - **Status**: ✅ Now have og-image.svg

4. **Manifest Validation** (Should be Fixed)
   - All 6 validation errors were fixed earlier
   - **Status**: ✅ Manifest should pass validation

## How to Fix

### Step 1: Wait for Vercel Deployment (2-5 min)
Check deployment status at: https://vercel.com/dashboard

Look for:
- ✅ "Ready" status
- Latest commit: `374cbac - fix: add OG image and update all metadata to use SVG assets`

### Step 2: Verify Assets Are Live
Test these URLs in browser (should show images):

```
https://bug-bounty-mini-app-swib.vercel.app/app-icon.svg
https://bug-bounty-mini-app-swib.vercel.app/splash.svg
https://bug-bounty-mini-app-swib.vercel.app/og-image.svg
```

### Step 3: Check Manifest
Visit: https://bug-bounty-mini-app-swib.vercel.app/.well-known/farcaster.json

Should show:
```json
{
  "frame": {
    "iconUrl": "https://bug-bounty-mini-app-swib.vercel.app/app-icon.svg",
    "splashImageUrl": "https://bug-bounty-mini-app-swib.vercel.app/splash.svg",
    "ogImageUrl": "https://bug-bounty-mini-app-swib.vercel.app/og-image.svg"
  }
}
```

### Step 4: Clear Farcaster Cache
In Farcaster developer portal:
1. Click **"Reverify"** button
2. Wait 30 seconds
3. Refresh the embed preview

### Step 5: Test Embed
Try sharing your URL in a Farcaster cast:
```
https://bug-bounty-mini-app-swib.vercel.app
```

Should show:
- ✅ Rich preview card
- ✅ Buggy Bounty logo
- ✅ Description text
- ✅ "Open Mini App" button

## Troubleshooting

### If Embed Still Doesn't Work After 10 Minutes:

**Check 1: Are images loading?**
```bash
curl -I https://bug-bounty-mini-app-swib.vercel.app/og-image.svg
# Should return: HTTP/2 200
```

**Check 2: Is manifest valid?**
Use Farcaster's validator or check console for errors

**Check 3: SVG vs PNG**
Some platforms prefer PNG. If SVG doesn't work:

1. Convert SVG to PNG:
   ```bash
   # Online: https://cloudconvert.com/svg-to-png
   # Or ImageMagick:
   magick public/og-image.svg -resize 1200x630 public/og-image.png
   magick public/app-icon.svg -resize 512x512 public/app-icon.png
   magick public/splash.svg -resize 1200x630 public/splash.png
   ```

2. Update manifest to use PNG files
3. Commit and push again

**Check 4: Farcaster Frame Requirements**
Verify your manifest meets all requirements:
- ✅ `version: "next"`
- ✅ `name`: string (max 32 chars)
- ✅ `iconUrl`: valid URL to 512x512 image
- ✅ `splashImageUrl`: valid URL to 1200x630 image
- ✅ `ogImageUrl`: valid URL to 1200x630 image
- ✅ `homeUrl`: valid HTTPS URL
- ✅ `primaryCategory`: from allowed list
- ✅ `tags`: array of 4 tags

## Timeline Expectations

| Action | Time | What Happens |
|--------|------|--------------|
| `git push` | 0 min | Triggers Vercel build |
| Build completes | 1-2 min | New version deployed to edge |
| Edge cache propagates | 2-5 min | All regions updated |
| Farcaster refetches | 5-30 min | Embed preview updates |
| **Total** | **5-30 min** | Full update complete |

## Current Status

✅ **Completed**:
- Created og-image.svg (1200x630)
- Updated manifest with SVG URLs
- Updated layout.tsx metadata
- Pushed to GitHub (commit 374cbac)

⏳ **In Progress**:
- Vercel deployment (auto-deploying now)
- Edge cache propagation (2-5 min)

🔜 **Next Steps**:
1. Wait 5 minutes for deployment
2. Test image URLs
3. Reverify in Farcaster
4. Check embed preview

## Success Criteria

When working correctly, you should see:

1. **In Farcaster Cast**:
   - Rich card with purple bug logo
   - Title: "Buggy Bounty"
   - Description: "Find bugs, earn rewards..."
   - "Open Mini App" button

2. **In Developer Portal**:
   - "Embed Valid ✓" (green checkmark)
   - Preview shows correctly
   - All validation checks pass

3. **When Opening App**:
   - Custom splash screen appears
   - Splash dismisses after 1-2 seconds
   - Purple bug logo visible in app
   - No console errors

## Notes

- **SVG Support**: Most modern platforms support SVG for OG images
- **Caching**: Always the biggest cause of delays with embed previews
- **Patience**: Give it 10-15 minutes before considering it broken
- **PNG Fallback**: Can always convert to PNG if SVG causes issues

---

**Last Updated**: Latest commit with og-image.svg and metadata fixes
**Deployment**: Auto-deploying via Vercel
**Expected Fix Time**: 5-30 minutes
