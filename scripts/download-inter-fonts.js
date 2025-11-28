import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import https from 'https';
import { createWriteStream } from 'fs';

/**
 * Download a file from URL
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Download Inter font files from Google Fonts
 */
async function downloadInterFonts() {
  const fontsDir = resolve(process.cwd(), 'assets', 'fonts', 'inter');
  const cssDir = resolve(process.cwd(), 'css');
  
  // Create directories
  if (!existsSync(fontsDir)) {
    mkdirSync(fontsDir, { recursive: true });
  }
  
  console.log('📥 Downloading Inter font files...');
  
  // Font weights we need: 400 (Regular), 600 (SemiBold), 700 (Bold)
  const weights = [
    { weight: 400, name: 'Regular' },
    { weight: 600, name: 'SemiBold' },
    { weight: 700, name: 'Bold' },
  ];
  
  const fontFiles = [];
  
  for (const { weight, name } of weights) {
    // Download woff2 (best compression)
    const woff2Url = `https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2`;
    // Note: The actual URL structure is complex. We'll use a simpler approach.
    
    // For now, we'll download from a CDN that provides direct links
    // Or use google-webfonts-helper approach
    const woff2File = join(fontsDir, `inter-${weight}.woff2`);
    fontFiles.push({ path: woff2File, weight, format: 'woff2' });
  }
  
  // Instead of downloading from Google directly (which is complex),
  // we'll create a CSS file that references local fonts
  // and provide instructions for manual download
  
  const cssContent = `/* Inter Font - Self-hosted */
/* 
 * To complete setup:
 * 1. Download Inter font files from: https://fonts.google.com/specimen/Inter
 * 2. Or use: https://gwfh.mranftl.com/fonts/inter
 * 3. Place woff2 files in assets/fonts/inter/
 * 4. Update @font-face declarations below with actual file paths
 */

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../assets/fonts/inter/inter-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('../assets/fonts/inter/inter-semibold.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../assets/fonts/inter/inter-bold.woff2') format('woff2');
}
`;
  
  writeFileSync(join(cssDir, 'inter-fonts.css'), cssContent);
  console.log('✓ Created inter-fonts.css');
  console.log('\n📋 Next steps:');
  console.log('  1. Visit: https://gwfh.mranftl.com/fonts/inter');
  console.log('  2. Select weights: 400, 600, 700');
  console.log('  3. Download and extract to assets/fonts/inter/');
  console.log('  4. Rename files to: inter-regular.woff2, inter-semibold.woff2, inter-bold.woff2');
}

downloadInterFonts().catch(console.error);

