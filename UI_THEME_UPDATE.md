# UI Theme Update - Dark Gray & Red 🎨

## Changes Applied

### Color Scheme Updated ✅

**Before**: Purple/violet theme with light backgrounds
**After**: Dark gray theme with red glow effects

### Specific Changes

#### 1. Card Background
- **Color**: `#1a1a1a` (dark gray, almost black)
- **Border**: Subtle white border (`rgba(255, 255, 255, 0.08)`)
- **Effect**: Clean, minimalist dark theme

#### 2. Red Glow on Mouse Approach
- **Primary**: `rgb(220, 38, 38)` - Deep red
- **Secondary**: `rgb(239, 68, 68)` - Medium red
- **Tertiary**: `rgb(248, 113, 113)` - Light red
- **Intensity**: Increases from 0 → 0.8 as mouse approaches
- **Radius**: Fades out over 50% of card size

#### 3. Hover Effects
- **Border**: Changes to red (`rgba(220, 38, 38, 0.8)`)
- **Shadow**: Dual red shadows for depth
  - Inner: `0 12px 40px rgba(220, 38, 38, 0.4)`
  - Outer: `0 0 20px rgba(220, 38, 38, 0.3)`
- **Transform**: Cards lift up by 5px

#### 4. Particle Effects
- **Color**: Red (`rgb(220, 38, 38)`)
- **Size**: 5px (increased from 4px)
- **Glow**: Enhanced double shadow
  - Inner: `0 0 10px rgba(220, 38, 38, 0.8)`
  - Outer: `0 0 20px rgba(220, 38, 38, 0.4)`

#### 5. Spotlight Effect
- **Color**: Red gradient instead of purple
- **Follows**: Mouse cursor across entire page
- **Intensity**: 0.15 at center → fades to transparent

#### 6. Background
- **New**: Dark gradient background
- **Colors**: `#0a0a0a` → `#151515`
- **Style**: Subtle 135deg diagonal gradient

## Visual Hierarchy

```
Dark Background (#0a0a0a - #151515)
  └─> Dark Gray Cards (#1a1a1a)
      └─> White Text
      └─> Red Glow (on hover)
      └─> Red Particles (on hover)
      └─> Red Border (on hover)
```

## Color Palette

```css
/* Backgrounds */
--bg-primary: #0a0a0a
--bg-secondary: #151515
--card-bg: #1a1a1a

/* Red Accents */
--red-deep: rgb(220, 38, 38)    /* Main glow */
--red-medium: rgb(239, 68, 68)  /* Secondary glow */
--red-light: rgb(248, 113, 113) /* Fade glow */

/* Borders */
--border-default: rgba(255, 255, 255, 0.08)
--border-hover: rgba(220, 38, 38, 0.8)

/* Text */
--text-primary: #ffffff
--text-secondary: rgba(255, 255, 255, 0.75)
--text-muted: rgba(255, 255, 255, 0.6)
```

## Animation Timeline

**On Mouse Enter Card:**
1. Red glow fades in (0.3s)
2. Particles spawn sequentially (100ms intervals)
3. Border turns red
4. Card lifts up
5. Red shadows appear

**On Mouse Move Near Card:**
- Glow intensity calculated based on distance
- Spotlight follows cursor position
- Particles drift randomly
- Glow position updates to cursor location

**On Mouse Leave Card:**
1. Particles fade out (0.3s)
2. Border returns to white
3. Card drops back down
4. Shadows disappear
5. Glow fades out

## Accessibility

✅ **Reduced Motion**: All animations disabled with `prefers-reduced-motion`
✅ **Contrast**: High contrast white text on dark backgrounds
✅ **Focus States**: Maintained for keyboard navigation
✅ **Hover States**: Clear visual feedback with red glow

## Browser Compatibility

✅ **Chrome/Edge**: Full support
✅ **Firefox**: Full support  
✅ **Safari**: Full support (includes -webkit prefixes)
✅ **Mobile**: Animations auto-disabled for performance

## Performance

- **GPU Acceleration**: Using `transform` and `opacity`
- **Will-change**: Applied to animated elements
- **Debouncing**: Mouse move events optimized with GSAP
- **Particle Limit**: Max 12 particles per card

## Files Modified

1. ✅ `components/bounty-board-magic.css`
   - Updated card backgrounds to `#1a1a1a`
   - Changed glow from purple to red
   - Enhanced hover effects with red shadows

2. ✅ `components/bounty-board-magic.tsx`
   - Changed `DEFAULT_GLOW_COLOR` from `132, 0, 255` (purple) to `220, 38, 38` (red)
   - Increased particle size and glow intensity
   - Updated spotlight gradient to red

## Result

Your bug bounty board now features:
- 🎨 **Dark, professional aesthetic** with dark gray cards
- 🔴 **Red danger theme** appropriate for security/bugs
- ✨ **Smooth animations** with red particles and glow
- 🎯 **Clear hover feedback** with red outlines
- 💎 **Premium look** with shadows and depth

Visit **http://localhost:3001** to see the new dark theme with red effects!
