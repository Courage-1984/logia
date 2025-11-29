# Font Implementation Guide

Complete guide for self-hosted fonts in Logia Genesis.

## Status: ✅ Complete

All fonts are self-hosted and working throughout the project with cross-browser compatibility fixes.

## Font Files

### Inter Fonts
Located in `assets/fonts/inter/`:
- `inter-regular.woff2` (400 weight)
- `inter-semibold.woff2` (600 weight)
- `inter-bold.woff2` (700 weight)

### Font Awesome
Located in `assets/fonts/fontawesome/`:
- `fa-brands-400.woff2`
- `fa-regular-400.woff2`
- `fa-solid-900.woff2`
- `fa-v4compatibility.woff2`

## CSS Files

- **Inter Fonts CSS**: `css/inter-fonts.css` - Contains @font-face declarations
- **Font Awesome CSS**: `css/fontawesome-local.css` - Contains all Font Awesome styles with cross-browser fixes

## Cross-Browser Compatibility

### Font Awesome Firefox Fixes
To ensure consistent rendering across Chrome and Firefox:

1. **@font-face URLs**: All font URLs are quoted in `@font-face` declarations (Firefox requirement)
2. **Semicolons**: All `src` properties have semicolons (Firefox strict parsing)
3. **Root font-size**: `html { font-size: 16px; }` with `text-size-adjust: 100%` to prevent browser font size preferences from affecting rem/em calculations
4. **Icon normalization**: Base `.fa` classes have explicit `font-size: 1em`, `line-height: 1`, and `text-rendering: auto` for consistent rendering

### Implementation Details
- **Root normalization**: `css/style.css` includes `text-size-adjust: 100%` on `html` element
- **Icon base styles**: `css/fontawesome-local.css` includes explicit sizing and rendering properties
- **Quoted URLs**: All `@font-face` `src` URLs use quotes: `url("../assets/fonts/...")`
- **Semicolons**: All `@font-face` declarations properly terminated

## Build Process

The build process automatically:
1. Processes font CSS (imported in `style.css`)
2. Copies font files to build output (`dist/assets/fonts/` or `dist-gh-pages/assets/fonts/`) with hashing
3. Resolves font paths in CSS to hashed filenames
4. Compresses assets (gzip + brotli)

## Usage in HTML

All HTML files include:
```html
<!-- Self-hosted Fonts -->
<link rel="stylesheet" href="css/inter-fonts.css">
<link rel="stylesheet" href="css/fontawesome-local.css">
```

## Setup Script

Run to update Font Awesome:
```bash
npm run setup-fonts
```

## Font Awesome Optimization

### Current Status
- **File size**: `css/fontawesome-local.css` is ~95KB (8,844 lines)
- **Icons used**: ~67 unique icons
- **Optimization**: Full icon set included for flexibility

### Optimization Options

**Option 1: PurgeCSS (Recommended for production)**
- Automatically removes unused CSS during build
- Requires PostCSS configuration
- No manual maintenance needed

**Option 2: Manual Subsetting**
- Full control over included icons
- Time-consuming to maintain
- Must update when adding new icons

**Note**: Current approach includes full icon set for development flexibility. Consider PurgeCSS for production builds if file size becomes a concern.

## Benefits

✅ Zero external requests  
✅ Faster loading  
✅ Better privacy  
✅ Offline support  
✅ Cache busting via hashed filenames  
✅ Compression enabled  
✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

---

**Last Updated**: January 2025

