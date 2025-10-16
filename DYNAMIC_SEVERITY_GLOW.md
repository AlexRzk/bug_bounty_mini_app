# Dynamic Severity-Based Glow System 🎨

## Overview
Updated the bounty board to use **dynamic glow colors** based on security severity levels and changed the background to pure black (`#030303`).

## Color System by Severity

### 🔴 CRITICAL (Reward >= 0.1 ETH)
- **Glow Color**: `rgb(220, 38, 38)` - Deep Red
- **Message**: Highest priority security issue
- **Use Case**: Major vulnerabilities requiring immediate attention

### 🟠 HIGH (Reward >= 0.01 ETH)  
- **Glow Color**: `rgb(245, 158, 11)` - Orange
- **Message**: Significant security concern
- **Use Case**: Important bugs that need quick resolution

### 🟡 MEDIUM (Between High and Low)
- **Glow Color**: `rgb(234, 179, 8)` - Yellow
- **Message**: Moderate security issue
- **Use Case**: Standard vulnerabilities

### 🟢 LOW (Reward < 0.01 ETH)
- **Glow Color**: `rgb(34, 197, 94)` - Green
- **Message**: Minor issue or enhancement
- **Use Case**: Small bugs or improvements

## Background Update

### New Background
```css
background: #030303;
```
- **Color**: Pure black (`#030303`)
- **Effect**: Maximum contrast with glowing cards
- **Result**: Cards "float" in space with colored halos

### Old Background
- Was: Gradient from `#0a0a0a` to `#151515`
- Now: Solid `#030303` for cleaner look

## Dynamic Features

### 1. Card Glow Effect
Each card gets a unique glow color based on its severity:
```typescript
const getSeverityGlowColor = (severity: string) => {
  switch (severity) {
    case 'critical': return '220, 38, 38'    // Red
    case 'high': return '245, 158, 11'       // Orange
    case 'medium': return '234, 179, 8'      // Yellow
    case 'low': return '34, 197, 94'         // Green
  }
}
```

### 2. Dynamic Border on Hover
- Border color matches severity glow
- Animates from white to severity color
- Example: Critical bounty → Red border

### 3. Dynamic Particles
- Particles inherit card's severity color
- Red particles for critical
- Orange for high
- Green for low

### 4. Adaptive Spotlight
- **Smart Color Matching**: Spotlight changes color to match the nearest card
- **Smooth Transitions**: As you move between cards, spotlight color transitions
- **Examples**:
  - Mouse near critical bounty → Red spotlight
  - Mouse near low bounty → Green spotlight
  - Mouse between cards → Blends colors

### 5. Dynamic Shadows
Card shadows use the severity color:
```css
box-shadow: 
  0 12px 40px rgba(var(--glow-color), 0.4),
  0 0 20px rgba(var(--glow-color), 0.3);
```

## Technical Implementation

### CSS Variables
Each card receives a `--glow-color` CSS variable:
```tsx
style={{
  backgroundColor: '#1a1a1a',
  '--glow-color': getSeverityGlowColor(bounty.severity)
}}
```

### Radial Gradient Glow
```css
background: radial-gradient(
  circle at var(--glow-x, 50%) var(--glow-y, 50%),
  rgba(var(--glow-color), calc(var(--glow-intensity, 0) * 0.8)) 0%,
  rgba(var(--glow-color), calc(var(--glow-intensity, 0) * 0.5)) 15%,
  rgba(var(--glow-color), calc(var(--glow-intensity, 0) * 0.2)) 30%,
  transparent 50%
);
```

### Intensity Calculation
- **0**: No glow (mouse far away)
- **0.5**: Moderate glow (mouse approaching)
- **1.0**: Full glow (mouse over card)

## Visual Hierarchy

```
Pure Black Background (#030303)
  └─> Dark Gray Cards (#1a1a1a)
      └─> Severity-colored Glow (dynamic)
          └─> Severity-colored Border (on hover)
          └─> Severity-colored Particles (on hover)
          └─> Severity-colored Shadows (on hover)
```

## User Experience

### Before Hover
- Card: Dark gray with subtle white border
- No glow visible
- Clean, minimalist appearance

### Mouse Approaching
- Glow begins to appear in severity color
- Intensity increases with proximity
- Spotlight follows mouse, adapting to nearest card color

### On Hover
- Full severity-colored glow active
- Border transforms to severity color
- Particles spawn in severity color
- Shadows cast in severity color
- Card lifts up 5px

### Visual Feedback
Users can instantly recognize bounty severity by color:
- 🔴 Red = Critical → Attack immediately
- 🟠 Orange = High → Important
- 🟢 Green = Low → Nice to have

## Examples

### Critical Bounty (0.1 ETH)
```
Background: #030303 (black)
Card: #1a1a1a (dark gray)
Glow: Red (220, 38, 38)
Border: Red on hover
Particles: Red
Spotlight: Red when near
```

### High Bounty (0.05 ETH)
```
Background: #030303 (black)
Card: #1a1a1a (dark gray)
Glow: Orange (245, 158, 11)
Border: Orange on hover
Particles: Orange
Spotlight: Orange when near
```

### Low Bounty (0.005 ETH)
```
Background: #030303 (black)
Card: #1a1a1a (dark gray)
Glow: Green (34, 197, 94)
Border: Green on hover
Particles: Green
Spotlight: Green when near
```

## Performance Optimizations

- ✅ **CSS Variables**: O(1) color updates
- ✅ **GPU Acceleration**: Using `transform` and `opacity`
- ✅ **Memoized Particles**: Generated once, cloned on hover
- ✅ **GSAP**: Hardware-accelerated animations
- ✅ **Will-change**: Optimized for transform/opacity

## Accessibility

- ✅ **High Contrast**: White text on dark background
- ✅ **Color + Text**: Severity shown in both color AND text badge
- ✅ **Reduced Motion**: All animations disabled with `prefers-reduced-motion`
- ✅ **Keyboard Navigation**: Focus states maintained

## Files Modified

1. ✅ **bounty-board-magic.css**
   - Background changed to `#030303`
   - Glow uses `var(--glow-color)` for dynamic colors
   - Borders use `rgba(var(--glow-color), 0.8)`
   - Shadows use `rgba(var(--glow-color), 0.4)`

2. ✅ **bounty-board-magic.tsx**
   - Added `getSeverityGlowColor()` function
   - Cards receive dynamic `--glow-color` CSS variable
   - Particles use card's glow color
   - Spotlight adapts to nearest card color
   - All effects now severity-aware

## Result

A visually intuitive system where:
- **Color = Priority**
- **Glow = Interactivity**
- **Darkness = Focus**

Users can instantly assess bounty severity by color, with smooth animations providing engaging feedback as they explore the board.

🎯 Visit **http://localhost:3001** to see the dynamic severity-based glow system in action!
