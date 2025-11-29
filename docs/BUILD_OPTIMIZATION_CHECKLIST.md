# Build Optimization Checklist

This document verifies that all optimizations and utilities run correctly for both build targets.

## Build Targets

- **Production Build** (`npm run build`): Outputs to `dist/`
- **GitHub Pages Build** (`npm run build:gh-pages`): Outputs to `dist-gh-pages/`

## ✅ Optimizations Applied to Both Builds

### 1. Image Optimization ✅
- **Plugin**: `imageOptimization(mode)` in `vite.config.js`
- **Runs for**: Both builds (uses `mode` parameter)
- **What it does**:
  - Generates responsive sizes (320w, 640w, 768w, 1024w, 1280w, 1920w)
  - Creates WebP versions (85% quality)
  - Creates AVIF versions (80% quality)
  - Optimizes original JPG/PNG formats
  - Generates blur-up placeholders
  - Outputs to: `{outDir}/assets/images/`

### 2. Component Copying ✅
- **Plugin**: `copyComponents(outDir)`
- **Runs for**: Both builds
- **What it does**: Copies `components/` folder to build output

### 3. Font Copying ✅
- **Plugin**: `copyFonts(outDir)`
- **Runs for**: Both builds
- **What it does**: Copies `assets/fonts/` to build output

### 4. Font CSS Copying ✅
- **Plugin**: `copyFontCSS(outDir)`
- **Runs for**: Both builds
- **What it does**: Copies font CSS files (`inter-fonts.css`, `fontawesome-local.css`)

### 5. Data Directory Copying ✅
- **Plugin**: `copyDataDirectory(outDir)`
- **Runs for**: Both builds
- **What it does**: Copies `data/` folder (Google Reviews, Instagram posts JSON)

### 6. JS Assets Copying ✅
- **Plugin**: `copyJSAssets(outDir)`
- **Runs for**: Both builds
- **What it does**: Copies runtime JSON configs (e.g., `particlesjs-config.json`)

### 7. Static Assets Copying ✅
- **Plugin**: `copyStaticAssets(outDir)`
- **Runs for**: Both builds
- **What it does**: Copies favicons, robots.txt, sitemap.xml, legal pages

### 8. URL Transformation ✅
- **Plugin**: `urlTransformPlugin(mode)`
- **Runs for**: Both builds
- **What it does**: Transforms URLs based on build target (canonical, OG, Twitter, structured data)

### 9. Static Files Transformation ✅
- **Plugin**: `staticFilesTransformPlugin(mode)`
- **Runs for**: Both builds
- **What it does**: Transforms sitemap.xml and robots.txt URLs

### 10. Compression (Gzip) ✅
- **Plugin**: `viteCompression({ algorithm: 'gzip' })`
- **Runs for**: Both builds
- **What it does**: Creates `.gz` compressed versions of assets

### 11. Compression (Brotli) ✅
- **Plugin**: `viteCompression({ algorithm: 'brotliCompress' })`
- **Runs for**: Both builds
- **What it does**: Creates `.br` compressed versions of assets

### 12. Bundle Analyzer ✅
- **Plugin**: `visualizer()`
- **Runs for**: Both builds
- **What it does**: Generates `stats.html` in each output directory

### 13. Code Splitting ✅
- **Configuration**: `rollupOptions.output.manualChunks`
- **Runs for**: Both builds
- **What it does**: Splits code into vendor, utils, components chunks

### 14. Minification ✅
- **Configuration**: `minify: 'esbuild'`, `cssMinify: true`
- **Runs for**: Both builds
- **What it does**: Minifies JavaScript and CSS

## Pre-Build Scripts

Both builds run these scripts before building:

1. **Fetch Google Reviews** (`npm run fetch-reviews`)
   - Fetches reviews from Google Places API
   - Syncs to `public/data/` for dev server

2. **Fetch Instagram Posts** (`npm run fetch-instagram`)
   - Fetches Instagram posts
   - Syncs to `public/data/` for dev server

## Verification

To verify all optimizations are working:

```bash
# Build both targets
npm run build:all

# Check production build
ls dist/assets/images/placeholders/placeholders.json
ls dist/stats.html
ls dist/data/

# Check GitHub Pages build
ls dist-gh-pages/assets/images/placeholders/placeholders.json
ls dist-gh-pages/stats.html
ls dist-gh-pages/data/
```

## Image Source Format

**Important**: Source images should be **JPG or PNG**, NOT WebP.

- ✅ **Keep**: `.jpg`, `.jpeg`, `.png` files in `assets/images/`
- ❌ **Remove**: `.webp` files from source (they're generated during build)

The build process automatically generates:
- WebP versions
- AVIF versions
- Responsive sizes
- Optimized originals

See `docs/IMAGE_SOURCE_FORMAT.md` for details.

## Build Summary

After each build, you'll see a summary showing:
- ✓ HTML files minified
- ✓ CSS minified and code-split
- ✓ JavaScript minified and bundled
- ✓ Images optimized (WebP + responsive sizes)
- ✓ Compression enabled (gzip + brotli)
- ✓ Bundle analyzer: `{outDir}/stats.html`
- ✓ Code splitting optimized
- ✓ Components copied
- ✓ Fonts copied
- ✓ Static assets copied
- ✓ URLs transformed for build target

---

**Last Updated**: January 2025

