import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Setup local fonts for self-hosting
 */
async function setupLocalFonts() {
  const projectRoot = resolve(process.cwd());
  const faSource = join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css');
  const faDest = join(projectRoot, 'css', 'fontawesome-local.css');
  const fontsDir = join(projectRoot, 'assets', 'fonts');
  const faFontsSource = join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'webfonts');
  const faFontsDest = join(fontsDir, 'fontawesome');
  
  console.log('🔧 Setting up local fonts...\n');
  
  // Copy Font Awesome CSS
  if (existsSync(faSource)) {
    copyFileSync(faSource, faDest);
    console.log('✓ Copied Font Awesome CSS to css/fontawesome-local.css');
  } else {
    console.log('⚠️  Font Awesome CSS not found. Run: npm install @fortawesome/fontawesome-free');
  }
  
  // Copy Font Awesome webfonts
  if (existsSync(faFontsSource)) {
    if (!existsSync(faFontsDest)) {
      mkdirSync(faFontsDest, { recursive: true });
    }
    
    // Copy all font files
    const { readdirSync, statSync } = await import('fs');
    const files = readdirSync(faFontsSource);
    let copied = 0;
    
    for (const file of files) {
      if (statSync(join(faFontsSource, file)).isFile()) {
        copyFileSync(join(faFontsSource, file), join(faFontsDest, file));
        copied++;
      }
    }
    
    console.log(`✓ Copied ${copied} Font Awesome font files to assets/fonts/fontawesome/`);
  } else {
    console.log('⚠️  Font Awesome webfonts not found.');
  }
  
  // Create Inter fonts CSS template
  const interCssPath = join(projectRoot, 'css', 'inter-fonts.css');
  const interCss = `/* Inter Font - Self-hosted */
/* 
 * Download Inter fonts from: https://gwfh.mranftl.com/fonts/inter
 * Select weights: 400 (Regular), 600 (SemiBold), 700 (Bold)
 * Download woff2 format and place in assets/fonts/inter/
 * Rename files to match the paths below
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
  
  writeFileSync(interCssPath, interCss);
  console.log('✓ Created css/inter-fonts.css template');
  
  console.log('\n📋 Next steps for Inter fonts:');
  console.log('  1. Visit: https://gwfh.mranftl.com/fonts/inter');
  console.log('  2. Select: Regular (400), SemiBold (600), Bold (700)');
  console.log('  3. Choose: woff2 format');
  console.log('  4. Download and extract to: assets/fonts/inter/');
  console.log('  5. Rename files to: inter-regular.woff2, inter-semibold.woff2, inter-bold.woff2');
  console.log('\n✨ Font setup complete!');
}

setupLocalFonts().catch(console.error);

