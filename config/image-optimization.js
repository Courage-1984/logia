import { resolve } from 'path';
import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { getBuildConfig } from './build-config.js';

/**
 * Extract all image references from HTML and JS files
 * @param {string} projectRoot - Project root directory
 * @returns {Set<string>} Set of image file names (without extension)
 */
function extractImageReferences(projectRoot) {
  const usedImages = new Set();
  
  // Patterns to match image references
  const patterns = [
    // src="assets/images/..." or src='assets/images/...'
    /src=["']assets\/images\/([^"']+?)(?:-\d+w)?\.(jpg|jpeg|png|webp|avif)["']/gi,
    // srcset="assets/images/..." (matches base name before -320w, etc.)
    /srcset=["'][^"']*assets\/images\/([^"']+?)(?:-\d+w)?\.(jpg|jpeg|png|webp|avif)/gi,
    // background-image: url(assets/images/...)
    /background-image:\s*url\(["']?assets\/images\/([^"')]+?)(?:-\d+w)?\.(jpg|jpeg|png|webp|avif)["']?\)/gi,
    // href="assets/images/..." (for preload, etc.)
    /href=["']assets\/images\/([^"']+?)(?:-\d+w)?\.(jpg|jpeg|png|webp|avif)["']/gi,
    // content="...assets/images/..." (for meta tags)
    /content=["'][^"']*assets\/images\/([^"']+?)(?:-\d+w)?\.(jpg|jpeg|png|webp|avif)/gi,
  ];
  
  // Recursively find HTML, JS, and JSON files (for data files that might reference images)
  function findSourceFiles(dir, fileList = []) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const filePath = join(dir, entry.name);
        
        if (entry.isDirectory() && 
            !entry.name.includes('node_modules') && 
            !entry.name.includes('dist') &&
            !entry.name.includes('dist-gh-pages') &&
            !entry.name.includes('.git') &&
            !entry.name.includes('.bundle-history')) {
          findSourceFiles(filePath, fileList);
        } else if (entry.isFile() && 
                   (entry.name.endsWith('.html') || 
                    entry.name.endsWith('.js') || 
                    (entry.name.endsWith('.json') && dir.includes('data')))) {
          fileList.push(filePath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return fileList;
  }
  
  // Scan all source files
  const sourceFiles = findSourceFiles(projectRoot);
  
  for (const file of sourceFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      
      // Apply all patterns
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const imagePath = match[1];
          // Extract base name (remove directory path, remove size suffix)
          const baseName = imagePath
            .replace(/^.*\//, '') // Remove directory path
            .replace(/-\d+w$/, '') // Remove size suffix like -320w
            .replace(/\.(jpg|jpeg|png|webp|avif)$/i, ''); // Remove extension
          
          if (baseName) {
            usedImages.add(baseName);
            // Also add with directory structure for subdirectories
            const dirPath = imagePath.replace(/\/[^/]+$/, '');
            if (dirPath && dirPath !== imagePath) {
              usedImages.add(`${dirPath}/${baseName}`);
            }
          }
        }
      }
      
      // Also check for JSON data files that might reference images (Instagram, Google Reviews)
      if (file.endsWith('.json')) {
        try {
          const jsonData = JSON.parse(content);
          // Check for image URLs in JSON (Instagram posts, Google Reviews, etc.)
          function extractFromObject(obj) {
            if (typeof obj === 'string' && obj.includes('assets/images/')) {
              const match = obj.match(/assets\/images\/([^"'\s]+?)(?:-\d+w)?\.(jpg|jpeg|png|webp|avif)/i);
              if (match) {
                const imagePath = match[1];
                const baseName = imagePath
                  .replace(/-\d+w$/, '')
                  .replace(/\.(jpg|jpeg|png|webp|avif)$/i, '');
                if (baseName) {
                  usedImages.add(baseName);
                  const dirPath = imagePath.replace(/\/[^/]+$/, '');
                  if (dirPath && dirPath !== imagePath) {
                    usedImages.add(`${dirPath}/${baseName}`);
                  }
                }
              }
            } else if (Array.isArray(obj)) {
              obj.forEach(extractFromObject);
            } else if (typeof obj === 'object' && obj !== null) {
              Object.values(obj).forEach(extractFromObject);
            }
          }
          extractFromObject(jsonData);
        } catch (error) {
          // Not valid JSON or can't parse - ignore
        }
      }
    } catch (error) {
      // Ignore errors reading files
    }
  }
  
  return usedImages;
}

/**
 * Generate blur-up placeholder (base64 encoded low-quality image)
 * @param {sharp.Sharp} image - Sharp image instance
 * @returns {Promise<string>} Base64 data URL
 */
async function generateBlurPlaceholder(image) {
  const placeholder = await image
    .clone()
    .resize(20, null, {
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality: 20 })
    .toBuffer();
  
  return `data:image/webp;base64,${placeholder.toString('base64')}`;
}

/**
 * Vite plugin for image optimization and responsive image generation
 * Generates multiple sizes, WebP, AVIF versions, and blur-up placeholders
 * @param {string} mode - Build mode ('production' or 'gh-pages')
 */
export function imageOptimization(mode = 'production') {
  return {
    name: 'image-optimization',
    async writeBundle(options) {
      // Get the output directory from build config or options
      const buildConfig = getBuildConfig(mode);
      const outDir = options.dir || buildConfig.outDir || 'dist';
      const projectRoot = resolve(process.cwd());
      
      const imagesDir = resolve(projectRoot, 'assets/images');
      const distImagesDir = resolve(projectRoot, outDir, 'assets/images');
      const placeholdersDir = resolve(projectRoot, outDir, 'assets/images/placeholders');
      
      if (!existsSync(imagesDir)) return;
      
      // Extract all image references from source files
      console.log('\n🔍 Scanning source files for image references...');
      const usedImages = extractImageReferences(projectRoot);
      console.log(`   Found ${usedImages.size} unique image reference(s)`);
      
      // Create dist images directory structure
      if (!existsSync(distImagesDir)) {
        mkdirSync(distImagesDir, { recursive: true });
      }
      if (!existsSync(placeholdersDir)) {
        mkdirSync(placeholdersDir, { recursive: true });
      }
      
      // Responsive image sizes (widths in pixels)
      const responsiveSizes = [320, 640, 768, 1024, 1280, 1920];
      
      // Store placeholders for JSON export
      const placeholders = {};
      
      // Check if an image is used
      function isImageUsed(imagePath, baseName) {
        // Check exact match
        if (usedImages.has(baseName)) return true;
        
        // Check with relative path from assets/images
        const relativePath = imagePath.replace(imagesDir + '/', '').replace(/\.(jpg|jpeg|png)$/i, '');
        if (usedImages.has(relativePath)) return true;
        
        // Check just the filename
        const fileName = baseName.split('/').pop();
        if (usedImages.has(fileName)) return true;
        
        return false;
      }
      
      // Process all images recursively
      async function processDirectory(srcDir, destDir, relativePath = '') {
        if (!existsSync(srcDir)) return;
        
        const entries = readdirSync(srcDir, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = join(srcDir, entry.name);
          const destPath = join(destDir, entry.name);
          
          if (entry.isDirectory()) {
            // Create subdirectory in dist
            if (!existsSync(destPath)) {
              mkdirSync(destPath, { recursive: true });
            }
            const newRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            await processDirectory(srcPath, destPath, newRelativePath);
          } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
            // Process image file (JPG/PNG only - WebP/AVIF are generated during build)
            // Skip if WebP version already exists (user should remove WebP from source)
            const imageName = entry.name.replace(/\.(jpg|jpeg|png)$/i, '');
            const ext = entry.name.match(/\.(jpg|jpeg|png)$/i)?.[1] || 'jpg';
            
            // Skip if this is a generated file (has size suffix like -320w)
            if (/-(\d+)w\.(jpg|jpeg|png)$/i.test(entry.name)) {
              continue;
            }
            
            // Check if this image is actually used in the codebase
            const currentRelativePath = relativePath ? `${relativePath}/${imageName}` : imageName;
            const fileNameOnly = imageName.split('/').pop();
            
            // Always include certain directories (logos, instagram fallbacks)
            const alwaysIncludeDirs = ['logo', 'instagram'];
            const shouldAlwaysInclude = alwaysIncludeDirs.some(dir => 
              relativePath.includes(dir) || srcPath.includes(`/${dir}/`)
            );
            
            if (!shouldAlwaysInclude && !isImageUsed(srcPath, currentRelativePath)) {
              // Image not used - skip it
              console.log(`   ⏭️  Skipping unused image: ${relativePath ? relativePath + '/' : ''}${entry.name}`);
              continue;
            }
            
            try {
              const image = sharp(srcPath);
              const metadata = await image.metadata();
              
              // Generate blur-up placeholder
              const placeholder = await generateBlurPlaceholder(image);
              placeholders[imageName] = placeholder;
              
              // Generate responsive sizes
              for (const width of responsiveSizes) {
                // Only generate if original is larger than target width
                if (metadata.width && metadata.width >= width) {
                  // Generate AVIF version (best compression)
                  await image
                    .clone()
                    .resize(width, null, {
                      withoutEnlargement: true,
                      fit: 'inside',
                    })
                    .avif({ quality: 80, effort: 4 })
                    .toFile(join(destDir, `${imageName}-${width}w.avif`));
                  
                  // Generate WebP version
                  await image
                    .clone()
                    .resize(width, null, {
                      withoutEnlargement: true,
                      fit: 'inside',
                    })
                    .webp({ quality: 85, effort: 6 })
                    .toFile(join(destDir, `${imageName}-${width}w.webp`));
                  
                  // Generate original format version
                  await image
                    .clone()
                    .resize(width, null, {
                      withoutEnlargement: true,
                      fit: 'inside',
                    })
                    .jpeg({ quality: 85, mozjpeg: true })
                    .toFile(join(destDir, `${imageName}-${width}w.${ext === 'png' ? 'jpg' : ext}`));
                }
              }
              
              // Generate full-size optimized versions
              // AVIF
              await image
                .clone()
                .avif({ quality: 80, effort: 4 })
                .toFile(join(destDir, `${imageName}.avif`));
              
              // WebP
              await image
                .clone()
                .webp({ quality: 85, effort: 6 })
                .toFile(join(destDir, `${imageName}.webp`));
              
              // Optimized original format
              if (ext === 'png') {
                await image
                  .clone()
                  .png({ quality: 85, compressionLevel: 9 })
                  .toFile(join(destDir, entry.name));
              } else {
                await image
                  .clone()
                  .jpeg({ quality: 85, mozjpeg: true })
                  .toFile(join(destDir, entry.name));
              }
              
              console.log(`✓ Optimized: ${entry.name} (AVIF, WebP, responsive sizes, placeholder)`);
            } catch (error) {
              console.error(`Error processing ${entry.name}:`, error);
              // Fallback: just copy the file
              copyFileSync(srcPath, destPath);
            }
          } else {
            // Copy other files as-is
            copyFileSync(srcPath, destPath);
          }
        }
      }
      
      await processDirectory(imagesDir, distImagesDir);
      
      // Write placeholders JSON file
      if (Object.keys(placeholders).length > 0) {
        writeFileSync(
          join(placeholdersDir, 'placeholders.json'),
          JSON.stringify(placeholders, null, 2)
        );
        console.log(`✓ Generated ${Object.keys(placeholders).length} blur-up placeholders`);
      }
    },
  };
}

