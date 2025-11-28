import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

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
      
      // Copy all files from components to dist/components
      function copyRecursive(src, dest) {
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
      
      copyRecursive(srcDir, destDir);
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
  publicDir: 'public',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // esbuild is faster and comes built-in with Vite
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
    cssMinify: true,
    target: 'es2015',
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
  ],
});

