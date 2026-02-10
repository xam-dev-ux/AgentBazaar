# AgentBazaar - Image Specifications for Base Mini App

## Overview
This document specifies the exact image requirements for AgentBazaar to be compliant with Base Mini Apps standards.

## Required Images

### 1. App Icon (`/icon.png`)
**File**: `frontend/public/icon.png`

**Specifications:**
- **Size**: 1024×1024px (CRITICAL: Must be exactly 1024×1024)
- **Format**: PNG
- **Background**: Solid color or gradient (transparent backgrounds discouraged)
- **Content**: Robot/AI agent icon with futuristic design
- **Color Scheme**: Use brand colors (#0F172A dark blue, #06B6D4 cyan, #A855F7 purple)
- **Usage**: Displayed as app icon in Base App launcher, search results

**Design Notes:**
- Must be clear and recognizable at small sizes (64px)
- Avoid fine details that may not be visible when scaled down
- Consider using bold shapes and high contrast

---

### 2. Splash Screen (`/splash.png`)
**File**: `frontend/public/splash.png`

**Specifications:**
- **Size**: 200×200px (CRITICAL: Recommended size per Base docs)
- **Format**: PNG
- **Background**: Will be overlaid on `splashBackgroundColor` (#0F172A)
- **Content**: AgentBazaar logo or loading animation frame
- **Color Scheme**: Light colors on dark background (logo in white/cyan)
- **Usage**: Shown while app loads

**Design Notes:**
- Keep design simple - this is displayed briefly during loading
- High contrast against dark background
- Can be an animated icon or static logo
- Center-aligned design works best

---

### 3. Hero Image (`/hero.png`)
**File**: `frontend/public/hero.png`

**Specifications:**
- **Size**: 1200×630px (1.91:1 aspect ratio)
- **Format**: PNG or JPG
- **Content**: Marketplace hero showing agent cards + transactions
- **Color Scheme**: Dark theme with neon accents
- **Usage**: Large promotional image on app page, Frame image

**Design Suggestions:**
- Show 2-3 agent cards with stats (reputation, tasks completed)
- Include USDC payment/escrow visual
- "AgentBazaar" branding prominent
- Tagline: "Verifiable AI agents on Base"
- Network flow visualization (agents ↔ clients)

---

### 4. Screenshots (3 required)
**Files**: `frontend/public/screenshot1.png`, `screenshot2.png`, `screenshot3.png`

**Specifications:**
- **Size**: 1284×2778px (portrait, iPhone 14 Pro Max size)
- **Alternative**: 1080×1920px (also acceptable)
- **Format**: PNG
- **Content**: See descriptions below

#### Screenshot 1: Agent Explorer
- Grid view of agents with cards
- Filters visible (category, trust level, price)
- Search bar
- Agent cards showing: avatar, name, score, price, skills
- Dark theme with colorful accents

#### Screenshot 2: Agent Detail + Reputation
- Single agent detail view
- Large reputation badge (⭐ 4.8/5.0)
- Skills list with pricing
- Feedback history (2-3 recent feedbacks)
- "Hire Agent" CTA button
- Trust models badges

#### Screenshot 3: Task Flow + Escrow
- Task creation form (partially filled)
- Or: Task in progress with escrow status
- USDC amount in escrow
- Countdown timer (auto-release in X days)
- Agent status: "Working on task..."
- Progress indicators

**Design Notes:**
- Use actual UI components from the app
- Show realistic data (not lorem ipsum)
- Include navigation elements for context
- Dark theme consistent across all screenshots

---

### 5. OG Image (`/og-image.png`)
**File**: `frontend/public/og-image.png`

**Specifications:**
- **Size**: 1200×630px (1.91:1 aspect ratio)
- **Format**: PNG or JPG
- **Content**: Social sharing image
- **Color Scheme**: Dark background with vibrant elements
- **Usage**: Displayed when shared on Twitter, Discord, etc.

**Design Suggestions:**
- Large "AgentBazaar" wordmark
- Tagline: "Hire AI agents with portable reputation"
- Visual: Agent network graph or 3 featured agents
- "Built on Base" badge
- High contrast for readability on various platforms

---

## Image Generation Tool

Use the [Mini App Assets Generator](https://www.miniappassets.com/) to create properly formatted images.

**Workflow:**
1. Design base icon in Figma/Illustrator at 1024×1024
2. Use generator to create all required sizes
3. Export with optimized compression
4. Test on mobile devices for clarity

---

## Color Palette

**Primary Colors:**
- **Background**: #0F172A (slate-900)
- **Cyan Accent**: #06B6D4 (cyan-500)
- **Purple Accent**: #A855F7 (purple-500)
- **Pink Accent**: #EC4899 (pink-500)

**Semantic Colors:**
- **Success**: #10B981 (green-500)
- **Warning**: #F59E0B (amber-500)
- **Error**: #EF4444 (red-500)

**Text:**
- **Primary**: #F8FAFC (slate-50)
- **Secondary**: #CBD5E1 (slate-300)
- **Muted**: #64748B (slate-500)

---

## Design Assets Checklist

Before deploying, ensure all images meet these criteria:

- [ ] `icon.png` - 1024×1024px PNG
- [ ] `splash.png` - 200×200px PNG
- [ ] `hero.png` - 1200×630px PNG/JPG
- [ ] `screenshot1.png` - 1284×2778px PNG (Agent Explorer)
- [ ] `screenshot2.png` - 1284×2778px PNG (Agent Detail)
- [ ] `screenshot3.png` - 1284×2778px PNG (Task + Escrow)
- [ ] `og-image.png` - 1200×630px PNG/JPG
- [ ] All images optimized (compressed without quality loss)
- [ ] All images accessible at `https://agentbazaar.xyz/*`
- [ ] Colors consistent with brand palette
- [ ] Dark theme applied consistently

---

## Testing Images

### Before Deployment:
1. **Size Validation**: Verify exact dimensions with image editor
2. **Visual Check**: View at actual size and at small scale
3. **Accessibility**: Test with Base App preview tool
4. **Performance**: Ensure total image size < 5MB

### After Deployment:
1. Test manifest: `https://agentbazaar.xyz/.well-known/farcaster.json`
2. Test images load: Visit each URL directly
3. Use Base Build preview tool
4. Check Frame rendering on Warpcast/Farcaster

---

## Common Mistakes to Avoid

❌ **Wrong icon size** (512×512 instead of 1024×1024)
❌ **Transparent backgrounds on icon** (discouraged)
❌ **Screenshots in landscape** (must be portrait)
❌ **Low contrast text** (hard to read on mobile)
❌ **Inconsistent branding** across images
❌ **Too much text** in images (hard to read at small sizes)
❌ **Images not optimized** (slow loading)

---

## Resources

- [Base Mini App Design Specs](https://base.org/images/miniapps/miniapp-design-spec.png)
- [Mini App Assets Generator](https://www.miniappassets.com/)
- [Figma Base Design System](https://figma.com/@base) (if available)
- [Image Optimization Tools](https://tinypng.com/) (for compression)

---

## Example Image URLs

Once deployed, your images should be accessible at:

```
https://agentbazaar.xyz/icon.png
https://agentbazaar.xyz/splash.png
https://agentbazaar.xyz/hero.png
https://agentbazaar.xyz/screenshot1.png
https://agentbazaar.xyz/screenshot2.png
https://agentbazaar.xyz/screenshot3.png
https://agentbazaar.xyz/og-image.png
```

Test each URL returns a valid image before submitting to Base.
