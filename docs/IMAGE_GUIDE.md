# Image Guide - Logia Genesis

Complete guide for image implementation, optimization, and best practices.  
If you just need a **status + TODO list**, use the image section in `PERFORMANCE_CHECKLIST.md`.

## Quick Reference

| Image Type | Dimensions | Aspect Ratio | Target Size | Format |
|------------|-----------|--------------|-------------|--------|
| Hero/Background | 1920x1080px | 16:9 | < 500KB | JPEG/WebP |
| Service Cards | 800x600px | 4:3 | < 200KB | JPEG/WebP |
| Portfolio | 1200x675px | 16:9 | < 300KB | JPEG/WebP |
| Team Photos | 400x400px | 1:1 | < 100KB | JPEG/WebP |
| Avatars | 200x200px | 1:1 | < 50KB | JPEG/WebP |
| Logos | 200px width | Varies | < 50KB | PNG |

## Implementation Status

**Total Images Needed:** 38  
**Images Implemented:** 2 ✅  
**Images Remaining:** 36

### ✅ Implemented
- Hero background (`assets/images/hero-background.jpg`)
- Network infrastructure (`assets/images/speedtest/network-infrastructure.jpg`)

## Image Optimization System

### Source Format (Important!)

**Use JPG or PNG in source assets folder** - NOT WebP.

- ✅ **Keep**: `.jpg`, `.jpeg`, `.png` files in `assets/images/`
- ❌ **Remove**: `.webp` files from source (they're generated during build)

The build process automatically generates all optimized versions from source JPG/PNG files.

### Build Process
The project uses a custom Vite plugin that automatically:
- Generates 6 responsive sizes: 320w, 640w, 768w, 1024w, 1280w, 1920w
- Creates WebP versions (85% quality)
- Creates AVIF versions (80% quality)
- Optimizes original formats (JPEG/PNG)
- Generates blur-up placeholders
- Copies optimized images to build output (`dist/assets/images/` or `dist-gh-pages/assets/images/`)

**For each source image** (e.g., `hero-background.jpg`), the build creates:
- Responsive sizes: `-320w`, `-640w`, `-768w`, `-1024w`, `-1280w`, `-1920w` (in AVIF, WebP, and original format)
- Full-size optimized: `.avif`, `.webp`, and optimized original
- Placeholder: Stored in `assets/images/placeholders/placeholders.json`

### HTML Pattern
All images use this responsive pattern:

```html
<picture>
  <source 
    srcset="assets/images/image-320w.webp 320w,
            assets/images/image-640w.webp 640w,
            assets/images/image-768w.webp 768w,
            assets/images/image-1024w.webp 1024w,
            assets/images/image-1280w.webp 1280w,
            assets/images/image-1920w.webp 1920w,
            assets/images/image.webp"
    sizes="100vw"
    type="image/webp">
  <source 
    srcset="assets/images/image-320w.jpg 320w,
            assets/images/image-640w.jpg 640w,
            assets/images/image-768w.jpg 768w,
            assets/images/image-1024w.jpg 1024w,
            assets/images/image-1280w.jpg 1280w,
            assets/images/image-1920w.jpg 1920w,
            assets/images/image.jpg"
    sizes="100vw"
    type="image/jpeg">
  <img 
    src="assets/images/image.jpg" 
    srcset="assets/images/image-320w.jpg 320w,
            assets/images/image-640w.jpg 640w,
            assets/images/image-768w.jpg 768w,
            assets/images/image-1024w.jpg 1024w,
            assets/images/image-1280w.jpg 1280w,
            assets/images/image-1920w.jpg 1920w"
    sizes="100vw"
    alt="Descriptive alt text" 
    loading="lazy"
    decoding="async">
</picture>
```

### Loading Attributes
- **`loading="eager"`**: Above-the-fold images (hero, critical content)
- **`loading="lazy"`**: Below-the-fold images (default)
- **`decoding="async"`**: Always use for better performance
- **`fetchpriority="high"`**: Only for the most critical image

### Image Loading Priority
For critical above-the-fold images, use `loading="eager"` and `fetchpriority="high"` on the `<img>` element:

```html
<img src="..." alt="..." loading="eager" fetchpriority="high" decoding="async">
```

**Note**: Preload links for responsive images are not recommended as they can cause browser warnings when the browser selects a different size than what was preloaded. The `loading="eager"` and `fetchpriority="high"` attributes on the image element are sufficient for priority loading.

## Image Requirements by Page

### Homepage
- ✅ Hero background (1920x1080px, 16:9)
- [ ] 6 Service card images (800x600px, 4:3)
- [ ] 3 Portfolio preview images (1200x675px, 16:9)
- [ ] 3 Testimonial avatars (200x200px, 1:1)

### About Page
- Uses bento grid layout with glassmorphism cards
- Team member cards with gradient photo sections
- Animated gradient orbs background (CSS-only, no images)
- [ ] Company story image (800x600px, 4:3)
- [ ] 4 Team member photos (400x400px, 1:1)
- [ ] 4+ Partner logos (200px width, PNG with transparency)

### Services Page
- [ ] 6 Service detail images (1200x675px, 16:9)

### Portfolio Page
- [ ] 6 Portfolio project images (1200x675px, 16:9)

### Contact Page
- [ ] Office/team image (1200x675px, 16:9)

### Speed Test Page
- ✅ Network infrastructure image (1200x675px, 16:9)

## Directory Structure

```
assets/images/
├── hero-background.jpg ✅ (source - WebP/AVIF generated during build)
├── services/
│   ├── wireless-networking.jpg
│   ├── surveillance-systems.jpg
│   ├── access-control.jpg
│   ├── structured-cabling.jpg
│   ├── web-development.jpg
│   ├── cloud-it-solutions.jpg
│   └── detail/
│       └── [service-name]-detail.jpg
├── portfolio/
│   └── [project-name].jpg
├── testimonials/
│   └── [author-name].jpg
├── about/
│   └── company-story.jpg
├── team/
│   └── [team-role].jpg
├── partners/
│   └── [partner-name].png
├── contact/
│   └── office-team.jpg
└── speedtest/
    ├── network-infrastructure.jpg ✅
    └── network-infrastructure.webp ✅
```

## Best Practices

### File Naming
- Use lowercase with hyphens: `service-name.jpg`
- Be descriptive: `wireless-networking-detail.jpg`
- Include context when needed

### Alt Text
- Be descriptive and specific
- Include context naturally
- Keep under 125 characters
- Don't start with "Image of..."

### Optimization
- Optimize source images before adding (use TinyPNG, ImageOptim, or Squoosh)
- Run `npm run build` or `npm run build:gh-pages` to generate responsive sizes
- Test in both light and dark mode
- Verify on all device sizes

### Performance
- Lazy load below-the-fold images
- Use `loading="eager"` and `fetchpriority="high"` for critical above-the-fold images
- Use appropriate `sizes` attribute
- Test Core Web Vitals impact

## Adding New Images

1. Place image in `assets/images/` (or appropriate subdirectory)
2. Use the responsive image pattern in HTML
3. Run `npm run build` or `npm run build:gh-pages` to generate optimized versions
4. Test that images load correctly in production build

## Troubleshooting

**Images not generating during build:**
- Check images are in `assets/images/` directory
- Verify format is JPG, JPEG, or PNG (NOT WebP - remove WebP files from source)
- Check build console for errors

**WebP not loading:**
- Verify WebP/AVIF files generated in build output (`dist/assets/images/` or `dist-gh-pages/assets/images/`)
- Fallback to JPEG/PNG should work automatically

**Images too large:**
- Re-optimize source images before adding
- Check build process is running correctly

---

**Last Updated:** 2025  
**Version:** 2.0
