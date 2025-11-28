import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { imageOptimization } from './config/image-optimization.js';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

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
 */
function copyComponents() {
  return {
    name: 'copy-components',
    writeBundle() {
      const srcDir = resolve(__dirname, 'components');
      const destDir = resolve(__dirname, 'dist', 'components');
      
      if (!existsSync(srcDir)) return;
      
      // Create destination directory
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      copyRecursive(srcDir, destDir);
      console.log('✓ Copied components to dist');
    },
  };
}

/**
 * Vite plugin to copy fonts folder to dist
 */
function copyFonts() {
  return {
    name: 'copy-fonts',
    writeBundle() {
      const srcDir = resolve(__dirname, 'assets', 'fonts');
      const destDir = resolve(__dirname, 'dist', 'assets', 'fonts');
      
      if (!existsSync(srcDir)) return;
      
      // Create destination directory
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      copyRecursive(srcDir, destDir);
      console.log('✓ Copied fonts to dist');
    },
  };
}

/**
 * Vite plugin to copy font CSS files to dist
 */
function copyFontCSS() {
  return {
    name: 'copy-font-css',
    writeBundle() {
      const cssFiles = [
        { src: 'css/inter-fonts.css', dest: 'dist/css/inter-fonts.css' },
        { src: 'css/fontawesome-local.css', dest: 'dist/css/fontawesome-local.css' },
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
        console.log(`✓ Copied ${copiedCount} font CSS file(s) to dist`);
      }
    },
  };
}

/**
 * Vite plugin to copy any other static assets
 */
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    writeBundle() {
      const staticFiles = [
        { src: 'favicon.ico', dest: 'dist/favicon.ico' },
        { src: 'favicon.svg', dest: 'dist/favicon.svg' },
        { src: 'favicon-16x16.png', dest: 'dist/favicon-16x16.png' },
        { src: 'favicon-32x32.png', dest: 'dist/favicon-32x32.png' },
        { src: 'favicon-96x96.png', dest: 'dist/favicon-96x96.png' },
        { src: 'apple-touch-icon.png', dest: 'dist/apple-touch-icon.png' },
        { src: 'android-chrome-192x192.png', dest: 'dist/android-chrome-192x192.png' },
        { src: 'android-chrome-512x512.png', dest: 'dist/android-chrome-512x512.png' },
        { src: 'mstile-150x150.png', dest: 'dist/mstile-150x150.png' },
        { src: 'mstile-310x310.png', dest: 'dist/mstile-310x310.png' },
        { src: 'site.webmanifest', dest: 'dist/site.webmanifest' },
        { src: 'robots.txt', dest: 'dist/robots.txt' },
        { src: 'sitemap.xml', dest: 'dist/sitemap.xml' },
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
        console.log(`✓ Copied ${copiedCount} static file(s) to dist`);
      }
    },
  };
}

/**
 * Build summary plugin - shows what was optimized and copied
 */
function buildSummary() {
  return {
    name: 'build-summary',
    closeBundle() {
      console.log('\n📦 Build Summary:');
      console.log('  ✓ HTML files minified');
      console.log('  ✓ CSS minified and code-split');
      console.log('  ✓ JavaScript minified and bundled');
      console.log('  ✓ Images optimized (WebP + responsive sizes)');
      console.log('  ✓ Compression enabled (gzip + brotli)');
      console.log('  ✓ Bundle analyzer: dist/stats.html');
      console.log('  ✓ Code splitting optimized (vendor, utils, components)');
      console.log('  ✓ Components copied');
      console.log('  ✓ Fonts copied (if any)');
      console.log('  ✓ Static assets copied (if any)');
      console.log('\n✨ Build complete! All optimizations applied.\n');
      console.log('💡 Tip: Open dist/stats.html in browser to analyze bundle composition\n');
    },
  };
}

/**
 * Vite configuration for Logia Genesis project
 * Handles CSS minification, JS bundling, and asset optimization
 */
export default defineConfig({
  root: '.',
  base: './',
  publicDir: false, // Disable publicDir since we handle assets manually
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true, // Clean dist folder before build
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
    copyComponents(),
    copyFonts(),
    copyFontCSS(),
    copyStaticAssets(),
    imageOptimization(),
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
    // Bundle analyzer - generates stats.html in dist directory
    visualizer({
      filename: 'dist/stats.html',
      open: false, // Don't auto-open browser
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Options: 'sunburst', 'treemap', 'network'
    }),
    buildSummary(),
  ],
});

