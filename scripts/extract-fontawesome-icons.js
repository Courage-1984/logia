import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Recursively find all HTML files in a directory
 */
function findHTMLFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('dist')) {
      findHTMLFiles(filePath, fileList);
    } else if (extname(file) === '.html') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract Font Awesome icon classes from HTML content
 */
function extractIcons(content) {
  const iconRegex = /fa[sr]?\s+(?:fa-)?([a-z0-9-]+)/gi;
  const icons = new Set();
  const matches = content.matchAll(iconRegex);
  
  for (const match of matches) {
    const icon = match[1];
    // Filter out base classes and invalid names
    if (icon && !['fa', 'fas', 'far', 'fab', 'fa-'].includes(icon) && icon.length > 2) {
      icons.add(icon);
    }
  }
  
  // Also check for brand icons (fab)
  const brandRegex = /class="[^"]*fab[^"]*fa-([a-z0-9-]+)/gi;
  const brandMatches = content.matchAll(brandRegex);
  for (const match of brandMatches) {
    icons.add(match[1]);
  }
  
  return icons;
}

// Main execution
const projectRoot = process.cwd();
const htmlFiles = findHTMLFiles(projectRoot);
const allIcons = new Set();

console.log(`\n📄 Scanning ${htmlFiles.length} HTML files...\n`);

htmlFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf8');
    const icons = extractIcons(content);
    icons.forEach(icon => allIcons.add(icon));
    
    if (icons.size > 0) {
      console.log(`  ${file.replace(projectRoot, '')}: ${icons.size} icon(s)`);
    }
  } catch (error) {
    console.error(`  ⚠️  Error reading ${file}:`, error.message);
  }
});

const sortedIcons = Array.from(allIcons).sort();
console.log(`\n✅ Found ${sortedIcons.size} unique icons:\n`);
console.log(sortedIcons.join(', '));

// Export for use in other scripts
export { sortedIcons as icons };

// If run directly, output JSON
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n\nJSON output:');
  console.log(JSON.stringify(sortedIcons, null, 2));
}
