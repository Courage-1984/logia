/**
 * Generate optimized Font Awesome CSS with only used icons
 * 
 * This script:
 * 1. Scans all HTML files for Font Awesome icon classes
 * 2. Extracts unique icons being used
 * 3. Generates a minimal CSS file with only those icons + base styles
 * 
 * Usage: node scripts/generate-optimized-fontawesome.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

/**
 * Find all HTML files recursively
 */
function findHTMLFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && 
        !filePath.includes('node_modules') && 
        !filePath.includes('dist') &&
        !filePath.includes('.git')) {
      findHTMLFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract Font Awesome icon classes from HTML
 */
function extractIcons(content) {
  const icons = new Set();
  
  // Match various patterns: fas fa-icon, fa-icon, class="fas fa-icon"
  const patterns = [
    /fa[sr]?\s+fa-([a-z0-9-]+)/gi,
    /class="[^"]*fa-([a-z0-9-]+)/gi,
    /fa-([a-z0-9-]+)/gi,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const icon = match[1];
      // Filter out base classes
      if (icon && !['fa', 'fas', 'far', 'fab'].includes(icon) && icon.length > 1) {
        icons.add(icon);
      }
    }
  });
  
  return icons;
}

/**
 * Extract base CSS (everything before icon definitions)
 */
function getBaseCSS(cssContent) {
  const lines = cssContent.split('\n');
  const iconStartIndex = lines.findIndex(line => line.match(/^\.fa-[a-z0-9]/));
  return lines.slice(0, iconStartIndex).join('\n');
}

/**
 * Extract specific icon CSS rules
 */
function extractIconCSS(cssContent, iconName) {
  const lines = cssContent.split('\n');
  const result = [];
  const patterns = [
    new RegExp(`^\\.fa-${iconName.replace(/-/g, '-')}[,\\s:]`), // Exact match
    new RegExp(`^\\.fa-${iconName.replace(/-/g, '-')}\\s`),     // With space
    new RegExp(`^\\.fa-${iconName.replace(/-/g, '-')}$`),       // Standalone
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts an icon definition
    if (patterns.some(p => p.test(line))) {
      // Add this line and following lines until empty line or next selector
      result.push(line);
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (nextLine.trim() === '' || 
            (nextLine.match(/^[^.\s#@]/) && !nextLine.match(/^\s+/) && !nextLine.trim().startsWith('--'))) {
          break;
        }
        result.push(nextLine);
        j++;
      }
      return result.join('\n') + '\n';
    }
  }
  
  return '';
}

/**
 * Main function
 */
async function generateOptimizedCSS() {
  console.log('\n🎯 Generating Optimized Font Awesome CSS...\n');
  
  // Find all HTML files
  const htmlFiles = findHTMLFiles(projectRoot);
  console.log(`📄 Scanning ${htmlFiles.length} HTML files...\n`);
  
  // Extract used icons
  const usedIcons = new Set();
  htmlFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf8');
      const icons = extractIcons(content);
      icons.forEach(icon => usedIcons.add(icon));
      
      if (icons.size > 0) {
        const relPath = file.replace(projectRoot, '').replace(/\\/g, '/');
        console.log(`   ${relPath}: ${icons.size} icon(s)`);
      }
    } catch (error) {
      console.warn(`   ⚠️  Error reading ${file}:`, error.message);
    }
  });
  
  const iconArray = Array.from(usedIcons).sort();
  console.log(`\n✅ Found ${iconArray.length} unique icons\n`);
  
  // Read full Font Awesome CSS
  const faSourcePath = join(projectRoot, 'css', 'fontawesome-local.css');
  if (!existsSync(faSourcePath)) {
    console.error(`❌ Font Awesome CSS not found at: ${faSourcePath}`);
    console.error('   Run: npm run setup-fonts');
    process.exit(1);
  }
  
  console.log('📖 Reading full Font Awesome CSS...');
  const fullCSS = readFileSync(faSourcePath, 'utf8');
  const originalSize = fullCSS.length;
  
  // Extract base CSS
  console.log('🔧 Extracting base styles...');
  const baseCSS = getBaseCSS(fullCSS);
  
  // Extract icon CSS for each used icon
  console.log('🎨 Extracting used icon styles...');
  let iconCSS = '';
  iconArray.forEach(icon => {
    const css = extractIconCSS(fullCSS, icon);
    if (css) {
      iconCSS += css;
    } else {
      console.warn(`   ⚠️  Icon "fa-${icon}" not found in CSS`);
    }
  });
  
  // Combine
  const optimizedCSS = baseCSS + '\n\n/* Used Icons Only - Generated automatically */\n' + iconCSS;
  const optimizedSize = optimizedCSS.length;
  const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
  const savedKB = ((originalSize - optimizedSize) / 1024).toFixed(1);
  
  // Write optimized CSS
  const outputPath = join(projectRoot, 'css', 'fontawesome-optimized.css');
  writeFileSync(outputPath, optimizedCSS);
  
  console.log('\n✨ Optimization Complete!\n');
  console.log(`   Original:    ${(originalSize / 1024).toFixed(1)} KB (${fullCSS.split('\n').length} lines)`);
  console.log(`   Optimized:   ${(optimizedSize / 1024).toFixed(1)} KB (${optimizedCSS.split('\n').length} lines)`);
  console.log(`   Savings:     ${savings}% (${savedKB} KB removed)`);
  console.log(`\n   Output:      css/fontawesome-optimized.css`);
  console.log(`\n💡 To use optimized version, update HTML files to reference:`);
  console.log(`   css/fontawesome-optimized.css instead of css/fontawesome-local.css\n`);
}

generateOptimizedCSS().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
