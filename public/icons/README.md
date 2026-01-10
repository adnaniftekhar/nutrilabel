# PWA Icons

This directory should contain PWA icons for the app:

- `icon-192x192.png` - 192x192 pixel icon
- `icon-512x512.png` - 512x512 pixel icon

## Generating Icons

For MVP, you can use placeholder icons. For production, generate proper branded icons.

### Quick Placeholder (using ImageMagick)

```bash
# Create a simple green square icon
convert -size 192x192 xc:#10b981 icon-192x192.png
convert -size 512x512 xc:#10b981 icon-512x512.png
```

### Using Online Tools

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

### Using Node.js Script

```bash
npm install -D sharp
node scripts/generate-icons.js
```

For MVP, the app will work without icons, but they're required for proper PWA installation experience.
