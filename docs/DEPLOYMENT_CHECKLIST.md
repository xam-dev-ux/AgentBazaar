# AgentBazaar - Base Mini App Deployment Checklist

## ✅ What We've Fixed

Based on Base Mini App requirements, we've corrected:

- ✅ **farcaster.json version**: Changed from "1.0.0" to "1" (string)
- ✅ **Removed webhookUrl**: Not needed unless using notifications
- ✅ **Fixed Frame action type**: Changed to "launch_frame" (not "launch_miniapp")
- ✅ **Added base:app_id meta tag**: In index.html
- ✅ **Corrected image specifications**: All images now have correct sizes
- ✅ **Created all 7 required images**: As SVG placeholders ready for conversion

---

## 📋 Pre-Deployment Checklist

### 1. Convert SVG Placeholders to PNG

We've created SVG placeholders with the correct dimensions. Convert them to PNG:

```bash
cd /home/xabier/basedev/AgentBazaar
./scripts/convert-images.sh
```

**Requirements**: Install Inkscape or ImageMagick first:
```bash
# Ubuntu/Debian
sudo apt install inkscape

# macOS
brew install inkscape

# Or use ImageMagick
sudo apt install imagemagick
```

**Verify conversions:**
```bash
cd frontend/public
ls -lh *.png
file *.png  # Should show exact dimensions
```

Expected output:
```
icon.png: 1024x1024
splash.png: 200x200
hero.png: 1200x630
og-image.png: 1200x630
screenshot1.png: 1284x2778
screenshot2.png: 1284x2778
screenshot3.png: 1284x2778
```

---

### 2. Optimize Images (Optional but Recommended)

Reduce file sizes without quality loss:

```bash
cd frontend/public

# Using optipng (lossless)
optipng -o7 *.png

# Or using pngquant (lossy but better compression)
pngquant --quality=80-95 *.png --ext .png --force

# Or online tool
# Upload to tinypng.com for compression
```

**Target sizes:**
- icon.png: < 200KB
- splash.png: < 50KB
- hero.png: < 300KB
- og-image.png: < 300KB
- screenshot*.png: < 500KB each

---

### 3. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Build locally first to test
npm install
npm run build

# Deploy to Vercel
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set root directory: ./frontend
# - Build command: npm run build
# - Output directory: dist
```

**Vercel Configuration:**

Make sure your `vercel.json` includes:

```json
{
  "rewrites": [
    {
      "source": "/.well-known/farcaster.json",
      "destination": "/.well-known/farcaster.json"
    }
  ],
  "headers": [
    {
      "source": "/.well-known/farcaster.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ]
    }
  ]
}
```

---

### 4. Verify Deployment

After deploying to Vercel, verify all URLs are accessible:

```bash
# Replace with your actual domain
DOMAIN="your-app.vercel.app"

curl https://$DOMAIN/.well-known/farcaster.json
curl -I https://$DOMAIN/icon.png
curl -I https://$DOMAIN/splash.png
curl -I https://$DOMAIN/hero.png
curl -I https://$DOMAIN/og-image.png
curl -I https://$DOMAIN/screenshot1.png
curl -I https://$DOMAIN/screenshot2.png
curl -I https://$DOMAIN/screenshot3.png
```

All should return `200 OK`.

---

### 5. Generate Account Association

**Critical Step**: This proves you own the domain.

1. Go to https://www.base.dev/preview
2. Click on "Account association" tab
3. Paste your Vercel URL (e.g., `agentbazaar.vercel.app`)
4. Click "Submit"
5. Click "Verify" button that appears
6. **Sign the message with your wallet**
7. Copy the generated values:
   - `header`
   - `payload`
   - `signature`

---

### 6. Update Manifest with Account Association

Edit `frontend/public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "PASTE_GENERATED_HEADER_HERE",
    "payload": "PASTE_GENERATED_PAYLOAD_HERE",
    "signature": "PASTE_GENERATED_SIGNATURE_HERE"
  },
  "miniapp": {
    ...
  }
}
```

**Important**: Update ALL occurrences of `agentbazaar.xyz` with your actual domain throughout the manifest.

---

### 7. Update index.html with Base App ID

After submission (step 9), you'll receive a Base App ID. Update `frontend/index.html`:

```html
<meta name="base:app_id" content="YOUR_APP_ID_HERE" />
```

---

### 8. Re-deploy with Updated Manifest

```bash
cd frontend
vercel --prod
```

---

### 9. Submit to Base App

1. Go to https://www.base.dev/preview
2. Paste your domain in the "App URL" field
3. Click "Submit"
4. Base will index your manifest
5. Wait for approval (can take 24-48 hours)

---

### 10. Test in Farcaster/Warpcast

Once approved:

1. Share your domain in a Warpcast cast
2. The Frame should render with your hero image
3. Click "Browse AI Agents" button
4. App should open in Farcaster Mini Apps viewer

---

## 🎨 Custom Images (Post-Launch)

The SVG placeholders are functional but generic. For production:

### Option 1: Hire a Designer
- Budget: $200-500 for full set
- Platforms: Fiverr, Upwork, Dribbble
- Brief: Show designer `/docs/IMAGE_SPECS.md`

### Option 2: Use AI Image Generation
- **Midjourney** (best quality): $10/month
- **DALL-E 3**: $20 for 115 credits
- **Stable Diffusion**: Free (local)

**Prompts for AI generation:**

**Icon (1024x1024):**
```
futuristic AI robot head icon, minimalist design, cyan and purple neon colors,
dark blue background, clean geometric shapes, modern tech aesthetic,
centered composition, 3D render style
```

**Hero/OG Image (1200x630):**
```
futuristic marketplace interface showing 3 AI agent cards with stats and prices,
dark theme with neon cyan and purple accents, USDC payments visible,
"AgentBazaar" branding, professional tech aesthetic, wide banner format
```

**Screenshots**: Take actual app screenshots once frontend is built.

### Option 3: Use Template Tools
- [Figma Community](https://figma.com/community): Free templates
- [Canva Pro](https://canva.com): Easy design tool
- [Mini App Assets Generator](https://miniappassets.com/): Specialized tool

---

## 🔍 Validation Tools

### Manifest Validator
```bash
# Validate JSON syntax
cat frontend/public/.well-known/farcaster.json | jq .

# Check all required fields
jq '.miniapp | keys' frontend/public/.well-known/farcaster.json
```

### Image Size Validator
```bash
identify -format "%f: %wx%h\n" frontend/public/*.png
```

### Accessibility Test
```bash
# Test manifest is accessible
curl https://your-domain.vercel.app/.well-known/farcaster.json | jq .
```

---

## 🐛 Common Issues & Fixes

### Issue: "Account association failed"
**Fix**: Make sure you're signing with the wallet that deployed the app.

### Issue: "Manifest not found"
**Fix**: Check Vercel deployment logs. Ensure `.well-known/` folder is in `public/`.

### Issue: "Images not loading"
**Fix**: Verify images are in `public/` not `public/images/`. They should be at root.

### Issue: "Invalid image dimensions"
**Fix**: Re-convert SVGs with exact dimensions. Use `identify` to verify.

### Issue: "Frame not rendering"
**Fix**: Check `fc:frame` meta tag is valid JSON (no line breaks in actual HTML).

---

## 📊 Success Metrics

After launch, track:

- ✅ Manifest accessible at `/.well-known/farcaster.json`
- ✅ All 7 images loading correctly
- ✅ Frame renders in Warpcast
- ✅ App opens in Base App
- ✅ Listed in Base App directory
- ✅ Searchable by tags

---

## 🚀 Next Steps After Approval

1. **Marketing**:
   - Post launch thread on Twitter
   - Share in Base community Discord
   - Post in Farcaster channels

2. **Monitor**:
   - Track user engagement
   - Monitor error logs in Vercel
   - Gather user feedback

3. **Iterate**:
   - Update images based on feedback
   - Add new features
   - Improve UX

---

## 📞 Support

**Base Mini Apps:**
- Discord: https://discord.gg/buildonbase
- Docs: https://docs.base.org/mini-apps

**AgentBazaar:**
- Issues: https://github.com/yourusername/agentbazaar/issues
- Email: support@agentbazaar.xyz

---

## ✅ Final Checklist

Before submitting to Base:

- [ ] All 7 PNG images generated and optimized
- [ ] Deployed to Vercel successfully
- [ ] All image URLs accessible (test with curl)
- [ ] Manifest at `/.well-known/farcaster.json` accessible
- [ ] Account association generated and added to manifest
- [ ] All instances of `agentbazaar.xyz` replaced with actual domain
- [ ] index.html has all required meta tags
- [ ] Frame metadata is valid JSON (test with jq)
- [ ] App loads correctly in browser
- [ ] Mobile responsive (test on phone)
- [ ] Ready to submit to Base!

---

**You're ready to launch! 🎉**
