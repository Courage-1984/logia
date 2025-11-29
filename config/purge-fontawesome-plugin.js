import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
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
      classes.add(iconClass); // Also add just the icon name for matching
    }
  }
  
  // Also match class="fas fa-icon-name" pattern (HTML)
  const classRegex = /class="[^"]*fa[srb]?\s+fa-([a-z0-9-]+)/gi;
  while ((match = classRegex.exec(content)) !== null) {
    classes.add(`fa-${match[1]}`);
    classes.add(match[1]); // Also add just the icon name
  }
  
  // Match JS string patterns: 'fas fa-icon' or "fas fa-icon" or `fas fa-icon`
  const jsStringRegex = /['"`]fa[srb]?\s+fa-([a-z0-9-]+)['"`]/gi;
  while ((match = jsStringRegex.exec(content)) !== null) {
    classes.add(`fa-${match[1]}`);
    classes.add(match[1]); // Also add just the icon name
  }
  
  // Match innerHTML patterns: <i class="fas fa-icon"></i>
  const innerHTMLRegex = /<i\s+class=["']fa[srb]?\s+fa-([a-z0-9-]+)["']/gi;
  while ((match = innerHTMLRegex.exec(content)) !== null) {
    classes.add(`fa-${match[1]}`);
    classes.add(match[1]); // Also add just the icon name
  }
  
  return classes;
}

/**
 * Recursively find all HTML and JS files
 */
function findSourceFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    files.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory() && 
          !filePath.includes('node_modules') && 
          !filePath.includes('dist') &&
          !filePath.includes('dist-gh-pages') &&
          !filePath.includes('.git')) {
        findSourceFiles(filePath, fileList);
      } else if (file.endsWith('.html') || file.endsWith('.js')) {
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
  // Ensure usedIcons is a Set
  const usedIconsSet = usedIcons instanceof Set ? usedIcons : new Set(usedIcons);
  
  const lines = cssContent.split('\n');
  const result = [];
  
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
    /^\.fa-(xs|sm|lg|xl|2xl|2xs|7x|8x|9x|10x)/, // Size modifiers
    /^\.fa-(ul|li|border|pull|beat|bounce|fade|flip|shake|spin|pulse|stack|inverse|width|rotate|flip|fw)/, // Utilities
    /animation-name:/,
    /font-family:/,
    /font-weight:/,
    /src:/,
    /format\(/,
  ];
  
  function shouldKeepRule(selectorLine) {
    // Check if line matches any keep pattern
    for (const pattern of keepPatterns) {
      if (pattern.test(selectorLine)) {
        return true;
      }
    }
    
    // Check if this is a used icon definition
    const iconMatch = selectorLine.match(/\.fa-([a-z0-9-]+)/);
    if (iconMatch) {
      const iconClass = `fa-${iconMatch[1]}`;
      const iconName = iconMatch[1];
      // Check if this icon is used
      return usedIconsSet.has(iconClass) || usedIconsSet.has(iconName);
    }
    
    return false;
  }
  
  let i = 0;
  let inComment = false;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Track multi-line comments
    if (line.includes('/*')) inComment = true;
    if (line.includes('*/')) inComment = false;
    
    // Always keep comments
    if (inComment || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      result.push(line);
      i++;
      continue;
    }
    
    // Keep empty lines
    if (!line.trim()) {
      result.push(line);
      i++;
      continue;
    }
    
    // Check if this line starts a CSS rule (selector)
    if (line.trim().match(/^[.#@:]/) || line.trim().match(/^@/)) {
      // This is a selector line - collect the full selector (may span multiple lines)
      let selectorLines = [line];
      let selectorEnd = i;
      let braceCount = 0;
      let foundOpeningBrace = false;
      
      // Find where the selector ends (opening brace)
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        for (const char of currentLine) {
          if (char === '{') {
            braceCount++;
            foundOpeningBrace = true;
          }
          if (char === '}') {
            braceCount--;
          }
        }
        
        if (j > i) {
          selectorLines.push(currentLine);
        }
        
        if (foundOpeningBrace && braceCount === 0) {
          selectorEnd = j;
          break;
        }
      }
      
      // Combine selector lines to check if we should keep this rule
      const fullSelector = selectorLines.join('\n');
      const shouldKeep = shouldKeepRule(fullSelector);
      
      if (shouldKeep) {
        // Keep the entire rule (selector + body)
        for (let j = i; j <= selectorEnd; j++) {
          result.push(lines[j]);
        }
      }
      // Otherwise skip the entire rule
      
      i = selectorEnd + 1;
    } else {
      // Not a selector line - should have been handled above, but keep it to be safe
      result.push(line);
      i++;
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
      const sourceFiles = findSourceFiles(projectRoot);
      
      console.log(`\n🔍 Scanning ${sourceFiles.length} source files (HTML + JS) for Font Awesome icons...`);
      
      // Collect all used icon classes
      const usedIcons = new Set();
      sourceFiles.forEach(file => {
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
        
        // Purge unused CSS (pass Set directly)
        const purgedCSS = purgeFontAwesomeCSS(faCSS, usedIcons);
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
