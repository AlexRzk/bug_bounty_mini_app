# 📸 Logo Upload Instructions

## Required Files

Place these logo files in the `public/` folder:

### 1. logo.png ✅
- **Dimensions**: 512x512px
- **Format**: PNG with transparency
- **Purpose**: App icon displayed in Farcaster
- **Background**: Transparent or solid color
- **Path**: `public/logo.png`

### 2. splash.png 🎨
- **Dimensions**: 1080x1920px (9:16 portrait ratio)
- **Format**: PNG or JPG
- **Purpose**: Loading screen when app launches
- **Background**: #0a0a0a (dark) or your brand color
- **Path**: `public/splash.png`

### 3. og-image.png 🖼️
- **Dimensions**: 1200x630px (1.91:1 ratio)
- **Format**: PNG or JPG
- **Purpose**: Social media preview (Twitter, Discord, etc.)
- **Content**: App name, tagline, visual branding
- **Path**: `public/og-image.png`

## Design Guidelines

### Color Scheme
- Primary: Your brand color (consider dark theme compatibility)
- Background: #0a0a0a (dark) or #ffffff (light)
- Accent: Neon/glow effects for futuristic look

### Typography
- Clean, modern sans-serif fonts
- High contrast for readability
- Avoid small text in logo.png (512px)

### Branding Elements
- Include "Buggy Bounty" name or logo
- Bug/bounty visual metaphors (shield, bug icon, reward symbol)
- Base blockchain branding (optional)
- Farcaster integration hints (optional)

## Quick Export from Design Tools

### Figma
1. Select your frame
2. Export settings → PNG or JPG
3. Scale to exact dimensions
4. Export

### Photoshop
1. File → Export → Export As
2. Select PNG or JPG
3. Set dimensions
4. Export

### Canva
1. Use templates: 512x512, 1080x1920, 1200x630
2. Download as PNG
3. Rename files accordingly

## After Uploading

1. Place files in `public/` folder
2. Verify URLs work:
   - https://bug-bounty-mini-app-swib.vercel.app/logo.png
   - https://bug-bounty-mini-app-swib.vercel.app/splash.png
   - https://bug-bounty-mini-app-swib.vercel.app/og-image.png

3. Test in browser (should load without 404)

4. Commit and push to GitHub:
   ```bash
   git add public/logo.png public/splash.png public/og-image.png
   git commit -m "chore: add logo and branding assets"
   git push origin main
   ```

5. Vercel will auto-deploy with new images

## Current Status

- [ ] logo.png uploaded
- [ ] splash.png uploaded
- [ ] og-image.png uploaded
- [ ] URLs verified
- [ ] Committed to GitHub
- [ ] Deployed to Vercel

## Need Help?

If you don't have logo files ready, you can:
1. Use placeholder images temporarily
2. Hire a designer on Fiverr/Upwork
3. Use AI tools like Midjourney/DALL-E
4. Use Canva templates

The Farcaster manifest has been updated to reference these files!
