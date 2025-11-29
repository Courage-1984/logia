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
  
  // Create Inter fonts CSS template (Latin subset only)
  const interCssPath = join(projectRoot, 'css', 'inter-fonts.css');
  const interCss = `/* Inter Font - Self-hosted (Latin subset only) */
/* 
 * Download Inter fonts from: https://gwfh.mranftl.com/fonts/inter
 * Select weights: 400 (Regular), 600 (SemiBold), 700 (Bold)
 * IMPORTANT: Select "Latin" subset only (not Latin Extended)
 * Download woff2 format and place in assets/fonts/inter/
 * Rename files to match the paths below (with -latin suffix)
 */

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../assets/fonts/inter/inter-regular-latin.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('../assets/fonts/inter/inter-semibold-latin.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('../assets/fonts/inter/inter-bold-latin.woff2') format('woff2');
}
`;
  
  writeFileSync(interCssPath, interCss);
  console.log('✓ Created css/inter-fonts.css template (Latin subset)');
  
  console.log('\n📋 Next steps for Inter fonts:');
  console.log('  1. Visit: https://gwfh.mranftl.com/fonts/inter');
  console.log('  2. Select: Regular (400), SemiBold (600), Bold (700)');
  console.log('  3. IMPORTANT: Select "Latin" subset only (not Latin Extended)');
  console.log('  4. Choose: woff2 format');
  console.log('  5. Download and extract to: assets/fonts/inter/');
  console.log('  6. Rename files to: inter-regular-latin.woff2, inter-semibold-latin.woff2, inter-bold-latin.woff2');
  console.log('\n💡 Note: Full font files (without -latin suffix) will be excluded from builds');
  console.log('\n✨ Font setup complete!');
}

setupLocalFonts().catch(console.error);

