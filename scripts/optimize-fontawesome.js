import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { extractIcons } from './extract-fontawesome-icons.js';

/**
 * Optimize Font Awesome CSS by keeping only used icons
 */
async function optimizeFontAwesome() {
  const projectRoot = process.cwd();
  const faSourcePath = join(projectRoot, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.css');
  const faOutputPath = join(projectRoot, 'css', 'fontawesome-local.css');
  
  // Get used icons
  const { icons: usedIcons } = await import('./extract-fontawesome-icons.js');
  
  console.log(`\n🎯 Optimizing Font Awesome CSS...`);
  console.log(`   Used icons: ${usedIcons.length}`);
  
  try {
    const fullCSS = readFileSync(faSourcePath, 'utf8');
    
    // Split CSS into parts
    const lines = fullCSS.split('\n');
    let optimizedCSS = [];
    let inIconDefinition = false;
    let currentIcon = null;
    let iconBuffer = [];
    
    // Find base styles (everything before icon definitions)
    const iconStartIndex = lines.findIndex(line => line.match(/^\.fa-[a-z]/));
    
    // Add base styles (everything before icons)
    optimizedCSS.push(...lines.slice(0, iconStartIndex));
    
    // Process icon definitions
    for (let i = iconStartIndex; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is the start of an icon definition
      const iconMatch = line.match(/^\.fa-([a-z0-9-]+)/);
      
      if (iconMatch) {
        // Save previous icon if it was used
        if (currentIcon && usedIcons.includes(currentIcon)) {
          optimizedCSS.push(...iconBuffer);
        }
        
        // Start new icon
        currentIcon = iconMatch[1];
        iconBuffer = [line];
        inIconDefinition = true;
      } else if (inIconDefinition) {
        iconBuffer.push(line);
        
        // Check if this is the end of the icon definition (empty line or new selector)
        if (line.trim() === '' || (line.match(/^[^.\s#@]/) && !line.match(/^\s+/))) {
          // Save if used
          if (currentIcon && usedIcons.includes(currentIcon)) {
            optimizedCSS.push(...iconBuffer);
          }
          optimizedCSS.push(line);
          iconBuffer = [];
          inIconDefinition = false;
          currentIcon = null;
        }
      } else {
        // Non-icon line, keep it (font-face, animations, etc.)
        optimizedCSS.push(line);
      }
    }
    
    // Save final icon if needed
    if (currentIcon && usedIcons.includes(currentIcon)) {
      optimizedCSS.push(...iconBuffer);
    }
    
    const optimized = optimizedCSS.join('\n');
    const originalSize = fullCSS.length;
    const optimizedSize = optimized.length;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
    
    writeFileSync(faOutputPath, optimized);
    
    console.log(`\n✅ Optimized Font Awesome CSS:`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`   Optimized: ${(optimizedSize / 1024).toFixed(1)} KB`);
    console.log(`   Savings: ${savings}% (${((originalSize - optimizedSize) / 1024).toFixed(1)} KB removed)\n`);
    
  } catch (error) {
    console.error('❌ Error optimizing Font Awesome:', error.message);
    console.error('\n💡 Alternative: Use PurgeCSS to automatically remove unused CSS during build');
  }
}

optimizeFontAwesome().catch(console.error);
