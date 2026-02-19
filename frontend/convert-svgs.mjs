import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Check if we can use headless Chrome for conversion
async function convertWithChrome(svgPath, pngPath, width, height) {
  const svgContent = readFileSync(svgPath, 'utf-8');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; width: ${width}px; height: ${height}px; }
          svg { width: ${width}px; height: ${height}px; }
        </style>
      </head>
      <body>${svgContent}</body>
    </html>
  `;
  
  writeFileSync('/tmp/temp.html', htmlContent);
  
  try {
    await execAsync(`chromium-browser --headless --screenshot=${pngPath} --window-size=${width},${height} --hide-scrollbars /tmp/temp.html`);
    return true;
  } catch (e) {
    try {
      await execAsync(`google-chrome --headless --screenshot=${pngPath} --window-size=${width},${height} --hide-scrollbars /tmp/temp.html`);
      return true;
    } catch (e2) {
      return false;
    }
  }
}

console.log('Trying to convert SVGs to PNGs...');
console.log('If this fails, please use https://www.miniappassets.com/ to generate the assets');

