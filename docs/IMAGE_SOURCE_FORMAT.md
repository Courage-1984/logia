# Image Source Format Guide

## Source Assets Folder Format

**Use JPG or PNG in source assets folder** - NOT WebP.

### Why?

The build process automatically:
- Generates WebP versions (85% quality)
- Generates AVIF versions (80% quality) 
- Creates 6 responsive sizes (320w, 640w, 768w, 1024w, 1280w, 1920w)
- Optimizes original formats
- Generates blur-up placeholders

### Current Issue

You currently have both JPG and WebP files in `assets/images/`:
- `hero-background.jpg` ✅ (keep)
- `hero-background.webp` ❌ (remove - will be generated)
- `logo.jpg` ✅ (keep)
- `logo.webp` ❌ (remove - will be generated)

### Action Required

1. **Remove all `.webp` files from `assets/images/`** - they're redundant
2. **Keep only `.jpg` or `.png` files** - these are the source files
3. **The build process will generate all optimized versions automatically**

### What Gets Generated

For each source image (e.g., `hero-background.jpg`), the build creates:

**Responsive sizes:**
- `hero-background-320w.avif`, `hero-background-320w.webp`, `hero-background-320w.jpg`
- `hero-background-640w.avif`, `hero-background-640w.webp`, `hero-background-640w.jpg`
- `hero-background-768w.avif`, `hero-background-768w.webp`, `hero-background-768w.jpg`
- `hero-background-1024w.avif`, `hero-background-1024w.webp`, `hero-background-1024w.jpg`
- `hero-background-1280w.avif`, `hero-background-1280w.webp`, `hero-background-1280w.jpg`
- `hero-background-1920w.avif`, `hero-background-1920w.webp`, `hero-background-1920w.jpg`

**Full-size optimized:**
- `hero-background.avif`
- `hero-background.webp`
- `hero-background.jpg` (optimized)

**Placeholder:**
- Stored in `assets/images/placeholders/placeholders.json`

### Best Practices

1. **Source files**: Use highest quality JPG/PNG you have
2. **File size**: Keep source files reasonable (< 5MB recommended)
3. **Format choice**:
   - Use **JPG** for photos, complex images
   - Use **PNG** for logos, graphics with transparency, simple images
4. **Naming**: Use descriptive kebab-case names (e.g., `hero-background.jpg`)

### Build Process

Both build targets (`dist/` and `dist-gh-pages/`) run the same image optimization:
- ✅ Image optimization plugin runs
- ✅ Responsive sizes generated
- ✅ WebP/AVIF versions created
- ✅ Blur placeholders generated
- ✅ All optimizations applied

---

**Last Updated**: January 2025

