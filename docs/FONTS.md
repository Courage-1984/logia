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
- **CSS size**: `css/fontawesome-local.css` is ~95KB (8,844 lines)
- **Icons used**: ~60–70 unique icons across the site
- **Current approach**: Full free icon set self-hosted for maximum flexibility

### Optimization Options

**Option 1: Custom Subset Font (Recommended once icon set is stable)**
- Use IcoMoon / Fontello / Font Awesome tooling to generate a tiny font containing **only** the icons used in the HTML (`<i class="fas fa-...">`).
- Replace `css/fontawesome-local.css` + 4 font files with:
  - `assets/fonts/icons/logia-icons.woff2`
  - A small `css/icons.css` that maps existing `.fas.fa-...` classes to the new font’s glyphs.
- Keeps existing markup but dramatically reduces font + CSS footprint.

**Option 2: Inline SVG Icons (For very small icon sets)**
- Remove Font Awesome entirely and replace icons with inline `<svg>` or an SVG sprite.
- Best if you only use a handful of icons and want maximum control.

**Interim Status**: The full Font Awesome set remains in place today for compatibility. When you’re ready, migrate to Option 1 (custom subset) to reclaim font + CSS bytes without changing page markup.

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

