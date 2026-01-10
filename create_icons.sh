#!/bin/bash
# Create simple green square icons for PWA
cd "$(dirname "$0")"
mkdir -p public/icons

# Create 192x192 icon using ImageMagick or sips
if command -v convert &> /dev/null; then
  convert -size 192x192 xc:#10b981 public/icons/icon-192x192.png
  convert -size 512x512 xc:#10b981 public/icons/icon-512x512.png
elif command -v sips &> /dev/null; then
  # Create a simple colored square using sips
  python3 << 'PYEOF'
from PIL import Image
img192 = Image.new('RGB', (192, 192), '#10b981')
img192.save('public/icons/icon-192x192.png')
img512 = Image.new('RGB', (512, 512), '#10b981')
img512.save('public/icons/icon-512x512.png')
print("Icons created")
PYEOF
else
  # Fallback: create minimal valid PNGs using base64
  echo "Creating minimal PNG files..."
  # This is a 1x1 green pixel PNG in base64 - we'll scale it
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > public/icons/icon-192x192.png
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > public/icons/icon-512x512.png
fi
