# Dual Build System Guide

This project supports building for two different deployment targets:

1. **Production Build** (`dist/`) - For normal server/FTP deployment
2. **GitHub Pages Build** (`dist-gh-pages/`) - For GitHub Pages deployment

## Build Commands

### Production Build (Normal Server/FTP)
```bash
npm run build
```
This builds to the `dist/` folder, which you can FTP to your normal web server.

**Output:** `dist/`

### GitHub Pages Build
```bash
npm run build:gh-pages
```
This builds to the `dist-gh-pages/` folder, optimized for GitHub Pages.

**Output:** `dist-gh-pages/`

### Build Both
```bash
npm run build:all
```
This builds both targets sequentially.

## Configuration

Build configuration is located in `config/build-config.js`. You can customize URLs for each build target:

```javascript
export const buildConfigs = {
  // Production build (normal server/FTP)
  production: {
    baseUrl: 'https://www.logia.co.za',
    basePath: '/',
    outDir: 'dist',
    sitemapUrl: 'https://www.logia.co.za/sitemap.xml',
  },
  
  // GitHub Pages build
  'gh-pages': {
    baseUrl: 'https://courage-1984.github.io/logia',
    basePath: '/logia/',
    outDir: 'dist-gh-pages',
    sitemapUrl: 'https://courage-1984.github.io/logia/sitemap.xml',
  },
};
```

### Current Configuration

The build system is configured for:
- **Production**: `https://www.logia.co.za` (normal server deployment)
- **GitHub Pages**: `https://courage-1984.github.io/logia` (GitHub Pages deployment)

If you need to change these URLs, edit `config/build-config.js`.

## What Gets Transformed

The build system automatically transforms the following URLs based on your build target:

- **Canonical URLs** (`<link rel="canonical">`)
- **Open Graph URLs** (`og:url`, `og:image`)
- **Twitter Card URLs** (`twitter:image`)
- **Structured Data URLs** (JSON-LD schemas):
  - `url` properties
  - `@id` properties
  - `item` properties (in BreadcrumbList)
  - `target` properties (in SearchAction)
  - `logo` and `image` properties

## Deployment

### Production Deployment (FTP)
1. Run `npm run build`
2. Upload the entire `dist/` folder to your web server via FTP
3. Ensure your server is configured to serve the files correctly

### GitHub Pages Deployment
1. Run `npm run build:gh-pages`
2. Commit and push the `dist-gh-pages/` folder to your `gh-pages` branch
3. Or use GitHub Actions to automate the deployment

**GitHub Actions Example:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:gh-pages
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist-gh-pages
```

## Preview Builds

You can preview either build locally:

```bash
# Preview production build
npm run preview

# Preview GitHub Pages build
npm run preview:gh-pages
```

## Differences Between Builds

Both builds are functionally identical - they contain the same optimized code, assets, and features. The only differences are:

1. **Output Directory**: `dist/` vs `dist-gh-pages/`
2. **URLs in HTML**: Canonical, OG, Twitter, and structured data URLs are transformed to match the deployment target
3. **Sitemap URLs**: Updated to match the base URL

## Troubleshooting

### URLs Not Updating
If URLs aren't being transformed correctly:
1. Check `config/build-config.js` has the correct `baseUrl` for your build mode
2. Ensure you're using the correct build command (`build` vs `build:gh-pages`)
3. Clear the output directory and rebuild

### GitHub Pages Not Loading Assets
If assets aren't loading on GitHub Pages:
1. Check that `basePath` in `build-config.js` matches your repository structure
2. Ensure all asset paths are relative (they should be by default)
3. Verify the `base` setting in `vite.config.js` is `'./'` (relative paths)

### Build Fails
If the build fails:
1. Check that all required files exist (HTML files, components, etc.)
2. Verify Node.js version is compatible (v16+)
3. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Notes

- Both build outputs are gitignored by default (see `.gitignore`)
- The build system automatically handles URL transformation - you don't need to manually edit HTML files
- All optimizations (minification, compression, image optimization) are applied to both builds
- Bundle analyzer reports are generated in each output directory (`dist/stats.html` and `dist-gh-pages/stats.html`)

---

**Last Updated**: January 2025

