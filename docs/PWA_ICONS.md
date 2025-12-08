# PWA Icon Generation Guide

Since the app icon is provided as an SVG (`public/icons/icon.svg`), you'll need to convert it to PNG files of various sizes.

## Required Icon Sizes

The following PNG files need to be created in `public/icons/`:

- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

## Easy Options to Generate Icons

### Option 1: Online Tool (Recommended)
1. Go to [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload the `icon.svg` file
3. Download the generated icon package
4. Extract to `public/icons/`

### Option 2: Use Figma/Canva
1. Import the SVG
2. Export at each required size

### Option 3: ImageMagick (CLI)
```bash
# Install ImageMagick first
convert public/icons/icon.svg -resize 72x72 public/icons/icon-72.png
convert public/icons/icon.svg -resize 96x96 public/icons/icon-96.png
convert public/icons/icon.svg -resize 128x128 public/icons/icon-128.png
convert public/icons/icon.svg -resize 144x144 public/icons/icon-144.png
convert public/icons/icon.svg -resize 152x152 public/icons/icon-152.png
convert public/icons/icon.svg -resize 192x192 public/icons/icon-192.png
convert public/icons/icon.svg -resize 384x384 public/icons/icon-384.png
convert public/icons/icon.svg -resize 512x512 public/icons/icon-512.png
```

### Option 4: Sharp (Node.js)
```javascript
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('public/icons/icon.svg')
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
});
```

## Testing PWA

1. Build for production: `npm run build`
2. Start production server: `npm start`
3. Open in Chrome and look for the install icon in the address bar
4. PWA features only work in production mode (disabled in development)
