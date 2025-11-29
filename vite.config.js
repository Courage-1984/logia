import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { imageOptimization } from './config/image-optimization.js';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { getBuildConfig } from './config/build-config.js';
import { urlTransformPlugin } from './config/url-transform-plugin.js';
import { staticFilesTransformPlugin } from './config/static-files-transform-plugin.js';
import { purgeFontAwesomePlugin } from './config/purge-fontawesome-plugin.js';

/**
 * Recursive copy function for directories
 */
function copyRecursive(src, dest) {
  if (!existsSync(src)) return;
  
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true });
      }
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Vite plugin to copy components folder to dist
 * @param {string} outDir - Output directory
 */
function copyComponents(outDir) {
  return {
    name: 'copy-components',
    writeBundle() {
      const srcDir = resolve(__dirname, 'components');
      const destDir = resolve(__dirname, outDir, 'components');
      
      if (!existsSync(srcDir)) return;
      
      // Create destination directory
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      copyRecursive(srcDir, destDir);
      console.log(`✓ Copied components to ${outDir}`);
    },
  };
}

/**
 * Vite plugin to copy fonts folder to dist
 * Only copies Latin subset fonts for Inter, all Font Awesome fonts
 * @param {string} outDir - Output directory
 */
function copyFonts(outDir) {
  return {
    name: 'copy-fonts',
    writeBundle() {
      const srcDir = resolve(__dirname, 'assets', 'fonts');
      const destDir = resolve(__dirname, outDir, 'assets', 'fonts');
      
      if (!existsSync(srcDir)) return;
      
      // Create destination directory
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      // Files to exclude (full Inter fonts - we only use Latin subsets)
      const excludeFiles = [
        'inter-regular.woff2',
        'inter-semibold.woff2',
        'inter-bold.woff2',
      ];
      
      // Copy fonts selectively
      const entries = readdirSync(srcDir, { withFileTypes: true });
      let copiedCount = 0;
      
      for (const entry of entries) {
        const srcPath = join(srcDir, entry.name);
        const destPath = join(destDir, entry.name);
        
        if (entry.isDirectory()) {
          // For directories (fontawesome, inter), copy selectively
          if (!existsSync(destPath)) {
            mkdirSync(destPath, { recursive: true });
          }
          
          const subEntries = readdirSync(srcPath, { withFileTypes: true });
          for (const subEntry of subEntries) {
            const subSrcPath = join(srcPath, subEntry.name);
            const subDestPath = join(destPath, subEntry.name);
            
            // Skip excluded files (full Inter fonts)
            if (excludeFiles.includes(subEntry.name)) {
              continue;
            }
            
            // Copy file
            copyFileSync(subSrcPath, subDestPath);
            copiedCount++;
          }
        } else {
          // Top-level file - skip if excluded
          if (excludeFiles.includes(entry.name)) {
            continue;
          }
          copyFileSync(srcPath, destPath);
          copiedCount++;
        }
      }
      
      if (copiedCount > 0) {
        console.log(`✓ Copied ${copiedCount} font file(s) (Latin subsets only) to ${outDir}`);
      }
    },
  };
}

/**
 * Vite plugin to copy font CSS files to dist
 * @param {string} outDir - Output directory
 */
function copyFontCSS(outDir) {
  return {
    name: 'copy-font-css',
    writeBundle() {
      const cssFiles = [
        { src: 'css/inter-fonts.css', dest: `${outDir}/css/inter-fonts.css` },
        { src: 'css/fontawesome-local.css', dest: `${outDir}/css/fontawesome-local.css` },
      ];
      
      let copiedCount = 0;
      cssFiles.forEach(({ src, dest }) => {
        const srcPath = resolve(__dirname, src);
        const destPath = resolve(__dirname, dest);
        
        if (existsSync(srcPath)) {
          const destDir = resolve(destPath, '..');
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }
          copyFileSync(srcPath, destPath);
          copiedCount++;
        }
      });
      
      if (copiedCount > 0) {
        console.log(`✓ Copied ${copiedCount} font CSS file(s) to ${outDir}`);
      }
    },
  };
}

/**
 * Vite plugin to copy data directory (Google Reviews JSON)
 * @param {string} outDir - Output directory
 */
function copyDataDirectory(outDir) {
  return {
    name: 'copy-data-directory',
    writeBundle() {
      const dataDir = resolve(__dirname, 'data');
      const destDir = resolve(__dirname, outDir, 'data');
      
      if (existsSync(dataDir)) {
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyRecursive(dataDir, destDir);
        console.log(`✓ Copied data directory to ${outDir}`);
      }
    },
  };
}

/**
 * Vite plugin to copy JS assets (JSON config files that are fetched at runtime)
 * @param {string} outDir - Output directory
 */
function copyJSAssets(outDir) {
  return {
    name: 'copy-js-assets',
    writeBundle() {
      const jsFiles = [
        { src: 'js/particlesjs-config.json', dest: `${outDir}/js/particlesjs-config.json` },
      ];
      
      let copiedCount = 0;
      jsFiles.forEach(({ src, dest }) => {
        const srcPath = resolve(__dirname, src);
        const destPath = resolve(__dirname, dest);
        
        if (existsSync(srcPath)) {
          const destDir = resolve(destPath, '..');
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }
          copyFileSync(srcPath, destPath);
          copiedCount++;
        }
      });
      
      if (copiedCount > 0) {
        console.log(`✓ Copied ${copiedCount} JS asset file(s) to ${outDir}`);
      }
    },
  };
}

/**
 * Vite plugin to copy any other static assets
 * @param {string} outDir - Output directory
 */
function copyStaticAssets(outDir) {
  return {
    name: 'copy-static-assets',
    writeBundle() {
      const staticFiles = [
        { src: 'favicon.ico', dest: `${outDir}/favicon.ico` },
        { src: 'favicon.svg', dest: `${outDir}/favicon.svg` },
        { src: 'favicon.png', dest: `${outDir}/favicon.png` },
        { src: 'favicon.jpg', dest: `${outDir}/favicon.jpg` },
        { src: 'favicon.webp', dest: `${outDir}/favicon.webp` },
        { src: 'favicon-16x16.png', dest: `${outDir}/favicon-16x16.png` },
        { src: 'favicon-32x32.png', dest: `${outDir}/favicon-32x32.png` },
        { src: 'favicon-96x96.png', dest: `${outDir}/favicon-96x96.png` },
        { src: 'apple-touch-icon.png', dest: `${outDir}/apple-touch-icon.png` },
        { src: 'android-chrome-192x192.png', dest: `${outDir}/android-chrome-192x192.png` },
        { src: 'android-chrome-512x512.png', dest: `${outDir}/android-chrome-512x512.png` },
        { src: 'mstile-150x150.png', dest: `${outDir}/mstile-150x150.png` },
        { src: 'mstile-310x310.png', dest: `${outDir}/mstile-310x310.png` },
        { src: 'site.webmanifest', dest: `${outDir}/site.webmanifest` },
        { src: 'robots.txt', dest: `${outDir}/robots.txt` },
        { src: 'sitemap.xml', dest: `${outDir}/sitemap.xml` },
        { src: '404.html', dest: `${outDir}/404.html` },
        { src: 'privacy-policy.html', dest: `${outDir}/privacy-policy.html` },
        { src: 'terms-of-service.html', dest: `${outDir}/terms-of-service.html` },
        // Copy theme-init.js as static file (not bundled - runs synchronously before CSS)
        { src: 'js/utils/theme-init.js', dest: `${outDir}/js/utils/theme-init.js` },
      ];
      
      let copiedCount = 0;
      staticFiles.forEach(({ src, dest }) => {
        const srcPath = resolve(__dirname, src);
        const destPath = resolve(__dirname, dest);
        
        if (existsSync(srcPath)) {
          const destDir = resolve(destPath, '..');
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }
          copyFileSync(srcPath, destPath);
          copiedCount++;
        }
      });
      
      if (copiedCount > 0) {
        console.log(`✓ Copied ${copiedCount} static file(s) to ${outDir}`);
      }
    },
  };
}

/**
 * Build summary plugin - shows what was optimized and copied
 * @param {string} outDir - Output directory
 */
function buildSummary(outDir) {
  return {
    name: 'build-summary',
    closeBundle() {
      console.log('\n📦 Build Summary:');
      console.log('  ✓ HTML files minified');
      console.log('  ✓ CSS minified and code-split');
      console.log('  ✓ JavaScript minified and bundled');
      console.log('  ✓ Images optimized (WebP + responsive sizes)');
      console.log('  ✓ Compression enabled (gzip + brotli)');
      console.log(`  ✓ Bundle analyzer: ${outDir}/stats.html`);
      console.log('  ✓ Code splitting optimized (vendor, utils, components)');
      console.log('  ✓ Components copied');
      console.log('  ✓ Fonts copied (if any)');
      console.log('  ✓ Static assets copied (if any)');
      console.log('  ✓ URLs transformed for build target');
      console.log(`\n✨ Build complete! Output: ${outDir}\n`);
      console.log(`💡 Tip: Open ${outDir}/stats.html in browser to analyze bundle composition\n`);
    },
  };
}

/**
 * Vite configuration for Logia Genesis project
 * Handles CSS minification, JS bundling, and asset optimization
 * Supports dual build: production (normal server) and gh-pages (GitHub Pages)
 */
export default defineConfig(({ mode = 'production' }) => {
  // Get build configuration based on mode
  const buildConfig = getBuildConfig(mode);
  const outDir = buildConfig.outDir;
  const basePath = buildConfig.basePath;
  
  return {
    root: '.',
    base: basePath, // Use basePath from config (important for GitHub Pages)
    publicDir: 'public', // Use public directory for static files in dev mode
    
    build: {
      outDir: outDir,
      assetsDir: 'assets',
      emptyOutDir: true, // Clean output folder before build
      sourcemap: false,
      minify: 'esbuild', // esbuild is faster and comes built-in with Vite
      cssMinify: true,
      target: 'es2015',
      reportCompressedSize: true, // Report compressed sizes
      chunkSizeWarningLimit: 1000, // Warn if chunk exceeds 1000kb
      // Tree-shaking is enabled by default in Vite for ES modules
      // Dead code elimination happens automatically during build
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          about: resolve(__dirname, 'about.html'),
          services: resolve(__dirname, 'services.html'),
          portfolio: resolve(__dirname, 'portfolio.html'),
          resources: resolve(__dirname, 'resources.html'),
          speedtest: resolve(__dirname, 'speedtest.html'),
          contact: resolve(__dirname, 'contact.html'),
          '404': resolve(__dirname, '404.html'),
          'privacy-policy': resolve(__dirname, 'privacy-policy.html'),
          'terms-of-service': resolve(__dirname, 'terms-of-service.html'),
        },
        output: {
          manualChunks: (id) => {
            // Vendor chunk for third-party libraries
            if (id.includes('node_modules')) {
              if (id.includes('alpinejs')) {
                return 'vendor-alpine';
              }
              // Other vendor dependencies can go here
              return 'vendor';
            }
            
            // Utils chunk - shared utility functions
            if (id.includes('utils/')) {
              return 'utils';
            }
            
            // Components chunk
            if (id.includes('js/components.js')) {
              return 'components';
            }
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      cssCodeSplit: true,
    },
    
    server: {
      port: 3000,
      open: true,
      hot: true,
      cors: true,
      // Serve data directory in development
      fs: {
        allow: ['..'],
      },
    },
    
    preview: {
      port: 4173,
      open: true,
    },
    
    css: {
      devSourcemap: true,
    },
    
    optimizeDeps: {
      include: ['alpinejs'],
    },
    
    plugins: [
      // NOTE: Font Awesome purge is disabled for now to ensure all icons render correctly.
      // If you re-enable this, verify all required icons still appear across all pages.
      // purgeFontAwesomePlugin(),
      // Exclude theme-init.js from bundling (it's copied as static file, runs synchronously before CSS)
      {
        name: 'exclude-theme-init',
        enforce: 'pre',
        transformIndexHtml(html, ctx) {
          // Use absolute path with base to prevent Vite from processing it
          const base = ctx.server?.config?.base || ctx.bundle?.base || '/';
          const basePath = base === '/' ? '' : base;
          return html.replace(
            /<script src="js\/utils\/theme-init\.js"><\/script>/g,
            `<script src="${basePath}js/utils/theme-init.js"></script>`
          );
        },
        resolveId(id) {
          // Mark theme-init.js as external to prevent bundling
          if (id && (id.includes('theme-init.js') || id.endsWith('theme-init.js'))) {
            return { id, external: true };
          }
          return null;
        },
      },
      copyComponents(outDir),
      copyFonts(outDir),
      copyFontCSS(outDir),
      copyDataDirectory(outDir),
      copyJSAssets(outDir),
      copyStaticAssets(outDir),
      imageOptimization(mode),
      // URL transform plugin - transforms URLs based on build target
      urlTransformPlugin(mode),
      // Static files transform plugin - transforms sitemap.xml and robots.txt
      staticFilesTransformPlugin(mode),
      // Compression plugins (gzip and brotli)
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024, // Only compress files larger than 1KB
        deleteOriginFile: false,
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
      }),
      // Bundle analyzer - generates stats.html in output directory
      visualizer({
        filename: `${outDir}/stats.html`,
        open: false, // Don't auto-open browser
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // Options: 'sunburst', 'treemap', 'network'
      }),
      buildSummary(outDir),
    ],
  };
});

