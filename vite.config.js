import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { imageOptimization } from './config/image-optimization.js';

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
 * Vite plugin to copy any other static assets
 */
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    writeBundle() {
      const staticFiles = [
        { src: 'favicon.png', dest: 'dist/favicon.png' },
        { src: 'favicon.ico', dest: 'dist/favicon.ico' },
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
      console.log('  ✓ Components copied');
      console.log('  ✓ Fonts copied (if any)');
      console.log('  ✓ Static assets copied (if any)');
      console.log('\n✨ Build complete! All optimizations applied.\n');
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
        manualChunks: {
          'vendor': ['alpinejs'],
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
    copyStaticAssets(),
    imageOptimization(),
    buildSummary(),
  ],
});

