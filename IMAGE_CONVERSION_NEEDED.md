# Image Conversion Required for Farcaster

## Problem
**Farcaster does NOT support SVG images** for embeds and mini app icons. You must use PNG or JPG format.

## Required Files

### 1. og-image.png
- **Size**: 1200 x 630 pixels
- **Format**: PNG
- **Purpose**: Social media embed preview (Open Graph image)
- **Source file**: `public/og-image.svg`

### 2. app-icon.png
- **Size**: 512 x 512 pixels  
- **Format**: PNG
- **Purpose**: Farcaster Mini App icon and splash screen
- **Source file**: `public/app-icon.svg`

## How to Convert (2 Options)

### Option 1: Online Converter (Easiest)
1. Go to **https://svgtopng.com/**
2. Upload `public/og-image.svg`
   - Set width: 1200px
   - Set height: 630px
   - Download as `og-image.png`
3. Upload `public/app-icon.svg`
   - Set width: 512px
   - Set height: 512px
   - Download as `app-icon.png`
4. Save both PNG files to the `public/` folder

### Option 2: Use Inkscape (If installed)
```powershell
# Install Inkscape first from: https://inkscape.org/release/
inkscape public/og-image.svg --export-filename=public/og-image.png --export-width=1200 --export-height=630
inkscape public/app-icon.svg --export-filename=public/app-icon.png --export-width=512 --export-height=512
```

## After Converting

1. Place the PNG files in the `public/` folder:
   ```
   public/
   ├── og-image.png    (1200x630)
   ├── app-icon.png    (512x512)
   ├── favicon.svg     (keep for browser)
   ```

2. Commit and push:
   ```powershell
   git add public/og-image.png public/app-icon.png app/layout.tsx public/.well-known/farcaster.json
   git commit -m "fix: convert images to PNG for Farcaster compatibility"
   git push origin main
   ```

3. Wait 1-2 minutes for Vercel to deploy

4. Test at: https://warpcast.com/~/developers/embeds
   - Enter: `https://bug-bounty-mini-app.vercel.app/`
   - Click **Refetch**

## Code Changes Already Made ✅
- ✅ `app/layout.tsx` - Updated to use `.png` instead of `.svg`
- ✅ `public/.well-known/farcaster.json` - Updated to use `.png` icon
- ✅ All metadata now references PNG files

## Files You Need to Create 📸
- ❌ `public/og-image.png` - **NOT CREATED YET**
- ❌ `public/app-icon.png` - **NOT CREATED YET**

**Action Required**: Convert the SVG files to PNG using one of the methods above!
