#!/bin/bash

# AgentBazaar - Convert SVG placeholders to PNG with exact dimensions
# Requirements: inkscape or imagemagick

echo "🎨 Converting AgentBazaar SVG images to PNG..."

# Check if we have inkscape or imagemagick
if command -v inkscape &> /dev/null; then
    CONVERTER="inkscape"
    echo "✓ Using Inkscape for conversion"
elif command -v convert &> /dev/null; then
    CONVERTER="imagemagick"
    echo "✓ Using ImageMagick for conversion"
else
    echo "❌ Error: Neither Inkscape nor ImageMagick found"
    echo "Please install one of them:"
    echo "  - Ubuntu/Debian: sudo apt install inkscape"
    echo "  - macOS: brew install inkscape"
    echo "  - Or: sudo apt install imagemagick"
    exit 1
fi

# Navigate to public directory
cd "$(dirname "$0")/../frontend/public" || exit

# Function to convert with Inkscape
convert_inkscape() {
    local input=$1
    local output=$2
    local width=$3
    local height=$4

    inkscape "$input" \
        --export-filename="$output" \
        --export-width="$width" \
        --export-height="$height" \
        --export-background="#0F172A" \
        --export-background-opacity=1.0
}

# Function to convert with ImageMagick
convert_imagemagick() {
    local input=$1
    local output=$2
    local width=$3
    local height=$4

    convert -background "#0F172A" \
        -density 300 \
        "$input" \
        -resize "${width}x${height}" \
        "$output"
}

# Choose conversion function
if [ "$CONVERTER" = "inkscape" ]; then
    convert_func=convert_inkscape
else
    convert_func=convert_imagemagick
fi

# Convert each image
echo ""
echo "📦 Converting icon.svg → icon.png (1024x1024)"
$convert_func "icon.svg" "icon.png" 1024 1024

echo "📦 Converting splash.svg → splash.png (200x200)"
$convert_func "splash.svg" "splash.png" 200 200

echo "📦 Converting hero.svg → hero.png (1200x630)"
$convert_func "hero.svg" "hero.png" 1200 630

echo "📦 Converting og-image.svg → og-image.png (1200x630)"
$convert_func "og-image.svg" "og-image.png" 1200 630

echo "📦 Converting screenshot1.svg → screenshot1.png (1284x2778)"
$convert_func "screenshot1.svg" "screenshot1.png" 1284 2778

echo "📦 Converting screenshot2.svg → screenshot2.png (1284x2778)"
$convert_func "screenshot2.svg" "screenshot2.png" 1284 2778

echo "📦 Converting screenshot3.svg → screenshot3.png (1284x2778)"
$convert_func "screenshot3.svg" "screenshot3.png" 1284 2778

echo ""
echo "✅ All images converted successfully!"
echo ""
echo "📊 Verifying image sizes:"
file icon.png splash.png hero.png og-image.png screenshot1.png screenshot2.png screenshot3.png

echo ""
echo "✨ Images ready for deployment!"
echo "📁 Location: frontend/public/"
echo ""
echo "Next steps:"
echo "1. Review the generated PNG files"
echo "2. Optimize with: optipng *.png  (optional)"
echo "3. Deploy to Vercel"
echo "4. Update manifest with your domain"
