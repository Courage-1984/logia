import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extract all Font Awesome icon classes from HTML content
 */
function extractIconClasses(content) {
  const classes = new Set();
  
  // Match fa-* classes
  const iconRegex = /fa-([a-z0-9-]+)/gi;
  let match;
  while ((match = iconRegex.exec(content)) !== null) {
    const iconClass = match[1];
    // Filter out base classes
    if (iconClass && !['fa', 'fas', 'far', 'fab'].includes(iconClass)) {
      classes.add(`fa-${iconClass}`);
    }
  }
  
  // Also match class="fas fa-icon-name" pattern
  const classRegex = /class="[^"]*fa[sr]?\s+fa-([a-z0-9-]+)/gi;
  while ((match = classRegex.exec(content)) !== null) {
    classes.add(`fa-${match[1]}`);
  }
  
  return classes;
}

/**
 * Recursively find all HTML files
 */
function findHTMLFiles(dir, fileList = []) {
  const { readdirSync, statSync } = require('fs');
  const { join } = require('path');
  
  try {
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
  } catch (error) {
    // Ignore errors
  }
  
  return fileList;
}

/**
 * Purge unused Font Awesome CSS
 * Keeps: base styles, font-face, animations, utilities, and used icons
 */
function purgeFontAwesomeCSS(cssContent, usedIcons) {
  const lines = cssContent.split('\n');
  const result = [];
  
  let i = 0;
  let inUnusedIcon = false;
  let iconBuffer = [];
  let currentIconClass = null;
  
  // Patterns for CSS we always want to keep
  const keepPatterns = [
    /^@font-face/,
    /^@keyframes/,
    /^@media/,
    /^@supports/,
    /^:root/,
    /^:host/,
    /^\.fa[,:]/,  // Base .fa class and variations
    /^\.fa-[0-9x]/, // Size classes (fa-1x, fa-2x, etc.)
    /^\.fa-(xs|sm|lg|xl|2xl|2xs)/, // Size modifiers
    /^\.fa-(ul|li|border|pull|beat|bounce|fade|flip|shake|spin|pulse|stack|inverse|width|rotate|flip)/, // Utilities
    /^\.fa-(fw|width|ul|li|border|pull|rotate|flip|stack)/, // More utilities
    /animation-name:/,
    /font-family:/,
    /font-weight:/,
    /src:/,
    /format\(/,
  ];
  
  function shouldKeep(line) {
    // Keep empty lines and comments
    if (!line.trim() || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return true;
    }
    
    // Check if line matches any keep pattern
    for (const pattern of keepPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }
    
    // Check if this is a used icon definition
    const iconMatch = line.match(/^\.fa-([a-z0-9-]+)/);
    if (iconMatch) {
      const iconClass = `fa-${iconMatch[1]}`;
      // Check if this icon or any variant is used
      const isUsed = usedIcons.has(iconClass) || 
                     usedIcons.has(iconMatch[1]) ||
                     usedIcons.some(used => iconClass.includes(used) || used.includes(iconMatch[1]));
      return isUsed;
    }
    
    return false;
  }
  
  // Simple approach: keep base styles, remove unused icon definitions
  let inComment = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track multi-line comments
    if (line.includes('/*')) inComment = true;
    if (line.includes('*/')) inComment = false;
    
    // Always keep comments and base styles
    if (inComment || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      result.push(line);
      continue;
    }
    
    // Check if this line starts an icon definition
    const iconMatch = line.match(/^\.fa-([a-z0-9-]+)/);
    
    if (iconMatch) {
      const iconClass = `fa-${iconMatch[1]}`;
      const isUsed = usedIcons.has(iconClass) || usedIcons.has(iconMatch[1]);
      
      if (isUsed || shouldKeep(line)) {
        // This icon is used, keep it
        result.push(line);
        
        // Keep following lines until empty line or next selector
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          if (nextLine.trim() === '' || (nextLine.match(/^[^.\s#@]/) && !nextLine.match(/^\s+/) && !nextLine.trim().startsWith('--'))) {
            break;
          }
          result.push(nextLine);
          j++;
        }
        i = j - 1; // -1 because loop will increment
      } else {
        // Skip this unused icon definition
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          if (nextLine.trim() === '' || (nextLine.match(/^[^.\s#@]/) && !nextLine.match(/^\s+/) && !nextLine.trim().startsWith('--'))) {
            break;
          }
          j++;
        }
        i = j - 1;
      }
    } else if (shouldKeep(line)) {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

/**
 * Vite plugin to purge unused Font Awesome CSS
 */
export function purgeFontAwesomePlugin() {
  return {
    name: 'purge-fontawesome',
    buildStart() {
      // This runs early in the build process
      const projectRoot = resolve(__dirname, '..');
      const faSourcePath = resolve(projectRoot, 'css', 'fontawesome-local.css');
      const htmlFiles = findHTMLFiles(projectRoot);
      
      console.log(`\n🔍 Scanning ${htmlFiles.length} HTML files for Font Awesome icons...`);
      
      // Collect all used icon classes
      const usedIcons = new Set();
      htmlFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf8');
          const icons = extractIconClasses(content);
          icons.forEach(icon => usedIcons.add(icon));
        } catch (error) {
          // Ignore errors
        }
      });
      
      console.log(`   Found ${usedIcons.size} unique icon classes`);
      
      // Read Font Awesome CSS
      try {
        const faCSS = readFileSync(faSourcePath, 'utf8');
        const originalSize = faCSS.length;
        
        // Purge unused CSS
        const purgedCSS = purgeFontAwesomeCSS(faCSS, Array.from(usedIcons));
        const purgedSize = purgedCSS.length;
        const savings = ((1 - purgedSize / originalSize) * 100).toFixed(1);
        
        // Write optimized CSS back (it will be copied by copyFontCSS plugin)
        writeFileSync(faSourcePath, purgedCSS);
        
        console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
        console.log(`   Optimized: ${(purgedSize / 1024).toFixed(1)} KB`);
        console.log(`   Savings: ${savings}% (${((originalSize - purgedSize) / 1024).toFixed(1)} KB removed)\n`);
      } catch (error) {
        console.warn(`   ⚠️  Could not optimize Font Awesome CSS: ${error.message}`);
      }
    },
  };
}
