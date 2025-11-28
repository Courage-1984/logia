import { resolve } from 'path';
import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

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
 */
export function imageOptimization() {
  return {
    name: 'image-optimization',
    async writeBundle() {
      const imagesDir = resolve(process.cwd(), 'assets/images');
      const distImagesDir = resolve(process.cwd(), 'dist/assets/images');
      const placeholdersDir = resolve(process.cwd(), 'dist/assets/images/placeholders');
      
      if (!existsSync(imagesDir)) return;
      
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
      
      // Process all images recursively
      async function processDirectory(srcDir, destDir) {
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
            await processDirectory(srcPath, destPath);
          } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
            // Process image file
            const imageName = entry.name.replace(/\.(jpg|jpeg|png)$/i, '');
            const ext = entry.name.match(/\.(jpg|jpeg|png)$/i)?.[1] || 'jpg';
            
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

