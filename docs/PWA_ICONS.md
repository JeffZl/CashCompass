# PWA Setup Guide

CashCompass is configured as a Progressive Web App (PWA), allowing users to install it on desktop and mobile devices.

## What's Included

### Files Created:
- `public/manifest.json` - App manifest with icons and configuration
- `public/sw.js` - Service worker for offline caching
- `public/icons/icon.svg` - SVG app icon
- `app/offline/page.tsx` - Offline fallback page
- `components/ServiceWorkerRegister.tsx` - Service worker registration

## Icon Generation

You need to generate PNG icons from the SVG for full browser support:

### Required Icon Sizes
Create these files in `public/icons/`:
- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

### Easy Options:

1. **RealFaviconGenerator** (Recommended)
   - Go to [realfavicongenerator.net](https://realfavicongenerator.net/)
   - Upload `public/icons/icon.svg`
   - Download and extract to `public/icons/`

2. **ImageMagick CLI**
   ```bash
   for size in 72 96 128 144 152 192 384 512; do
     convert public/icons/icon.svg -resize ${size}x${size} public/icons/icon-${size}.png
   done
   ```

## Testing PWA

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **Open in Chrome**
   - Go to http://localhost:3000
   - Look for the install icon (⊕) in the address bar
   - Click to install

4. **Check Service Worker**
   - Open DevTools → Application tab
   - Look under "Service Workers"
   - Should show `sw.js` as active

## How It Works

### Service Worker Features:
- **Precaching**: Key pages are cached on install
- **Stale-While-Revalidate**: Returns cached content instantly, then updates cache in background
- **Offline Fallback**: Shows `/offline` page when network is unavailable
- **API Bypass**: Supabase and Clerk requests always go to network

### Updating the App:
When you deploy updates:
1. The service worker detects changes
2. New content is downloaded in background
3. Next page load uses the updated content

## Notes

- PWA features only work in **production mode** (`npm start`)
- Service worker is registered only when `NODE_ENV === 'production'`
- The app is installable on Chrome, Edge, Safari, and Firefox
