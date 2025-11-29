# Performance Optimization Guide

Implementation status and rationale for performance optimizations.

> **Quick Reference**: See **`PERFORMANCE_CHECKLIST.md`** for "what's done / what's left" checklist.

## Status

**Highly optimized** with modern best practices, including runtime caching and mobile-aware animation controls.

**Key Implementations:**
- ✅ Font self-hosting, lazy loading, code splitting
- ✅ Service worker (runtime caching)
- ✅ Mobile-aware animations (reduced motion, pointer checks)
- ✅ Build-time compression, image optimization, resource hints

---

## Implemented Optimizations

### Font Loading ✅
- Self-hosted fonts (400, 600, 700 only)
- Zero external requests
- See `docs/FONTS.md`

### JavaScript ✅
- **Code splitting**: vendor, utils, components, lazy modules
- **Lazy loading**: FAQ, filters, search (`js/lazy/`)
- **Unified scroll handler**: `utils/scroll-handler.js` (single throttled handler)
- **Event delegation**: smooth scroll, FAQ, filters, mobile menu, 3D tilt

### Build ✅
- Gzip/Brotli compression (>1KB files)
- Bundle analyzer (`stats.html` in build output)
- Tree-shaking (Vite default)

### Images ✅
- WebP/AVIF with JPEG fallback
- Responsive sizes (320w-1920w)
- Lazy loading + preloading
- Blur placeholders
- See `docs/IMAGE_GUIDE.md`

### Resource Hints ✅
- Module preload (critical JS)
- Page prefetch (homepage)
- Link prefetch on hover (with connection checks)

### Runtime Caching ✅
- **Service worker**: `public/service-worker.js`
  - Static assets: cache-first
  - HTML: network-first with cache fallback
- Registered from `js/main.js`
- Works for both production and GitHub Pages builds

### Animations & Motion ✅
- `will-change` hints on continuous animations (hero, grid, scroll indicator, particles)
- Respects `prefers-reduced-motion` (global CSS + JS checks)
- 3D tilt and particles disabled on mobile/coarse pointers
- See `css/base.css` and `js/main.js`

---

## Server-Side (Remaining)

See `docs/NETWORK_OPTIMIZATION.md` for:
- HTTP/2, CDN, server compression, cache headers

---

## Remaining Opportunities

- [ ] Extract critical CSS (inline above-fold)
- [ ] Further animation fine-tuning (low priority)

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Total page weight | < 2MB | ✅ |
| JavaScript (gzipped) | < 200KB | ✅ |
| CSS (gzipped) | < 100KB | ✅ |
| Images | < 1MB total | ✅ |
| LCP | < 2.5s | ✅ |
| FID | < 100ms | ✅ |
| CLS | < 0.1 | ✅ |

## Testing

- **Lighthouse**: Chrome DevTools or `npm run lighthouse:ci`
- **Bundle Analyzer**: `stats.html` in build output
- **Bundle Monitoring**: `npm run check-bundles`
- **Core Web Vitals**: Browser console (see `docs/MONITORING_SETUP.md`)

## SEO & PWA ✅

- XML Sitemap, Web App Manifest, complete favicon set
- All automatically copied to build output

---

**Last Updated**: January 2025
