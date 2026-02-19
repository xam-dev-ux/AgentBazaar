const sharp = require('sharp');
const { readFileSync } = require('fs');

const conversions = [
  { input: 'public/icon.svg', output: 'public/icon.png', width: 1024, height: 1024 },
  { input: 'public/splash.svg', output: 'public/splash.png', width: 200, height: 200 },
  { input: 'public/hero.svg', output: 'public/hero.png', width: 1200, height: 630 },
  { input: 'public/og-image.svg', output: 'public/og-image.png', width: 1200, height: 630 },
  { input: 'public/screenshot1.svg', output: 'public/screenshot1.png', width: 1284, height: 2778 },
  { input: 'public/screenshot2.svg', output: 'public/screenshot2.png', width: 1284, height: 2778 },
  { input: 'public/screenshot3.svg', output: 'public/screenshot3.png', width: 1284, height: 2778 }
];

async function convertSVGtoPNG() {
  console.log('Converting SVG files to PNG...\n');
  
  for (const { input, output, width, height } of conversions) {
    try {
      const svgBuffer = readFileSync(input);
      await sharp(svgBuffer)
        .resize(width, height, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
        .png()
        .toFile(output);
      console.log(`✓ ${input} -> ${output} (${width}x${height})`);
    } catch (error) {
      console.error(`✗ Failed to convert ${input}:`, error.message);
    }
  }
  
  console.log('\nConversion complete!');
}

convertSVGtoPNG();
