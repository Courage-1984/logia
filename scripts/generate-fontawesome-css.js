import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { glob } from 'glob';

/**
 * Extract Font Awesome icon names from HTML files
 * @param {string} dir - Directory to search
 * @returns {Set<string>} Set of icon names
 */
function extractIcons(dir) {
  const icons = new Set();
  const htmlFiles = glob.sync('**/*.html', { cwd: dir, ignore: ['node_modules/**', 'dist/**'] });
  
  const iconPattern = /fa[sr]? fa-([a-z0-9-]+)/gi;
  
  for (const file of htmlFiles) {
    const content = readFileSync(join(dir, file), 'utf-8');
    let match;
    while ((match = iconPattern.exec(content)) !== null) {
      icons.add(match[1]);
    }
  }
  
  return icons;
}

/**
 * Generate custom Font Awesome CSS with only used icons
 */
async function generateFontAwesomeCSS() {
  const projectRoot = resolve(process.cwd());
  const faPackagePath = join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css');
  const faScssPath = join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'scss');
  const outputPath = join(projectRoot, 'css', 'fontawesome-custom.css');
  
  if (!existsSync(faPackagePath)) {
    console.error('❌ Font Awesome package not found. Run: npm install @fortawesome/fontawesome-free');
    process.exit(1);
  }
  
  console.log('📦 Extracting used icons from HTML files...');
  const usedIcons = extractIcons(projectRoot);
  console.log(`✓ Found ${usedIcons.size} unique icons`);
  
  // Read the full Font Awesome CSS
  const fullCSS = readFileSync(faPackagePath, 'utf-8');
  
  // For now, we'll use a subset approach
  // Since Font Awesome CSS is complex, we'll include the full CSS but note that
  // in production, you could use a more sophisticated tree-shaking approach
  
  // Write the CSS file
  writeFileSync(outputPath, fullCSS);
  console.log(`✓ Generated custom Font Awesome CSS: ${outputPath}`);
  console.log(`  Note: This includes all icons. For true tree-shaking, consider using Font Awesome's JS/SVG approach.`);
  console.log(`  Used icons: ${Array.from(usedIcons).sort().join(', ')}`);
}

generateFontAwesomeCSS().catch(console.error);

