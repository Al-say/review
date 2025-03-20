#!/bin/bash

# Create icon directory if it doesn't exist
mkdir -p images

# Convert logo to different sizes for PWA icons
convert logo.png -resize 192x192 icon-192.png
convert logo.png -resize 512x512 icon-512.png

# Create WebP versions
convert icon-192.png -quality 90 icon-192.webp
convert icon-512.png -quality 90 icon-512.webp

# Create maskable icons with padding (ensure icon has safe area within circle)
convert logo.png -resize 180x180 -gravity center -background white -extent 192x192 icon-192-maskable.png
convert logo.png -resize 480x480 -gravity center -background white -extent 512x512 icon-512-maskable.png

# Create WebP versions of maskable icons
convert icon-192-maskable.png -quality 90 icon-192-maskable.webp
convert icon-512-maskable.png -quality 90 icon-512-maskable.webp

# Create screenshots
convert -size 1280x720 xc:white \
    -draw "image over 0,0 1280,720 'screenshot1.png'" \
    screenshot1.webp

convert -size 1280x720 xc:white \
    -draw "image over 0,0 1280,720 'screenshot2.png'" \
    screenshot2.webp

echo "PWA icons and images created successfully"
