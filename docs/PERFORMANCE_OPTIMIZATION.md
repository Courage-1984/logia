# Performance Optimization Guide

Implementation status and rationale for performance optimizations.

> **Quick Reference**: See **`PERFORMANCE_CHECKLIST.md`** for "what's done / what's left" checklist.

## Status

**Highly optimized** with modern best practices, including runtime caching and mobile-aware animation controls.

**Key Implementations:**
- ✅ Font self-hosting, lazy loading, code splitting
- ✅ Service worker (runtime caching)
- ✅ Chrome-optimized animations (will-change, CSS containment, transform optimizations)
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
- Lazy loading for below-fold images
- Priority loading (`loading="eager"` + `fetchpriority="high"`) for critical above-fold images
- Blur placeholders
- See `docs/IMAGE_GUIDE.md`

### Resource Hints ✅
- Module preload (critical JS)
- Page prefetch (homepage)
- Link prefetch on hover (with connection checks)

### Runtime Caching ✅
- **Service Worker**: `public/service-worker.js` - Enhanced multi-layer caching
  - Static assets: Cache-first with stale-while-revalidate (50MB limit, automatic cleanup)
  - HTML: Network-first with cache fallback (10MB limit, automatic cleanup)
  - Data: Cache-first with 1-hour TTL (5MB limit, automatic cleanup)
  - Cache versioning (`v2`) with automatic old cache cleanup
  - Pre-caches critical pages and assets on install
- **In-Memory Cache**: `js/cache-manager.js` - Fast JavaScript caching
  - Page cache: 10 pages, 30-minute TTL (used by page transitions)
  - Data cache: 50 entries, 5-minute TTL (used by testimonials, Instagram)
  - LRU eviction, automatic expiration every 5 minutes
- **Cache Warming**: `js/cache-warming.js` - Background pre-loading
  - Pre-loads critical pages (about, services) - 3s delay after page load
  - Pre-loads critical data (Google Reviews, Instagram) - 4s delay after page load
  - Connection-aware (disabled on slow connections/data saver)
  - Parallel component loading (navbar + footer load simultaneously)
- Registered from `js/main.js`
- Works in dev, preview, production, and GitHub Pages (with base path handling)

### Animations & Motion ✅
- **GPU-Accelerated Properties**: All animations use GPU-accelerated properties only
  - ✅ `transform` (translate, scale, rotate) instead of `left`, `top`, `width`, `height`
  - ✅ `opacity` for fade effects
  - ✅ Replaced all `transition: all` with specific properties (61 instances fixed)
  - ✅ Fixed `.carousel-dot.active` to use `transform: scaleX()` instead of `width`
- **Chrome Optimization**: Optimized for smooth animations in Chrome
  - `will-change` only set during active animations (hover states), removed when idle
  - CSS containment (`contain: layout style paint`) on all animated elements
  - Avoid unnecessary `translate3d(0,0,0)` - use only needed transforms
  - Separate transition properties for better Chrome performance
- **Hardware Acceleration**: `backface-visibility: hidden` on animated elements
- **Mobile Optimization**: 3D tilt and particles disabled on mobile/coarse pointers
- **Files Optimized**: `css/components/carousel.css`, `css/components/buttons.css`, `css/components/cards.css`, `css/components/floating-buttons.css`, `css/sections/testimonials.css`, `css/sections/instagram.css`, `css/sections/why-choose.css`, `css/layout/navbar.css`, `css/layout/footer.css`

---

## Server-Side Optimization

See `docs/CPANEL_OPTIMIZATION_GUIDE.md` for:
- HTTP/2 configuration
- Server compression (gzip/Brotli)
- Cache headers via `.htaccess`
- LiteSpeed cache management

---

## Page Transitions & Loading States ✅

- **Skeleton Loaders**: `css/components/skeleton.css` - Animated loading placeholders
  - Shimmer animation with dark mode support
  - Used for components (navbar, footer), testimonials, Instagram feed, page transitions
- **Page Transitions**: `js/page-transitions.js` - Smooth navigation
  - Intercepts internal link clicks for instant navigation
  - Shows skeleton overlay during transition
  - Uses in-memory cache for instant subsequent loads
  - Connection-aware (disabled on slow connections)

## Recent PageSpeed Optimizations (January 2025) ✅

### Font Loading
- ✅ Font Awesome `font-display: swap` (400ms FCP improvement)

### Image Optimization
- ✅ Logo responsive images (31.2 KiB reduction)
- ✅ Hero image compression improved (22.6 KiB reduction)

### Render Optimization
- ✅ Google Tag Manager deferred to end of `<body>` (143 KiB, 140ms saved)
- ✅ Hero section layout shifts fixed (CLS reduced from 0.170)

### Network Optimization
- ✅ Parallel component loading (navbar + footer)
- ✅ Reduced cache warming aggressiveness (2 pages instead of 4, longer delays)

### Animation Optimization
- ✅ All animations use GPU-accelerated properties (37 elements optimized)
- ✅ Replaced `transition: all` with specific properties (61 instances)
- ✅ Fixed non-GPU animations (carousel dots use `transform` instead of `width`)

## Remaining Opportunities

- [ ] Extract critical CSS (inline above-fold) - Low priority, minimal impact expected
- [ ] Reduce unused JavaScript (56 KiB) - Medium priority
- [ ] Reduce unused CSS (26 KiB) - Medium priority
- [ ] Fix long main-thread tasks (3 found) - Medium priority

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

## Caching Strategy

### Service Worker Cache
- **Location**: `public/service-worker.js`
- **Works in**: Dev (localhost), preview, production, GitHub Pages
- **Strategies**:
  - Static assets: Cache-first with stale-while-revalidate (50MB limit)
  - HTML: Network-first with cache fallback (10MB limit)
  - Data: Cache-first with 1-hour TTL (5MB limit)
- **Features**: Automatic cleanup, cache versioning, pre-caching

### In-Memory Cache
- **Location**: `js/cache-manager.js`
- **Page Cache**: 10 pages, 30-minute TTL (instant page transitions)
- **Data Cache**: 50 entries, 5-minute TTL (testimonials, Instagram)
- **Features**: LRU eviction, automatic expiration

### Cache Warming
- **Location**: `js/cache-warming.js`
- **Pre-loads**: Critical pages (2s delay) and data (3s delay)
- **Connection-aware**: Disabled on slow connections/data saver

---

**Last Updated**: January 2025  
**PageSpeed Optimizations**: January 2025 - Font display, image optimization, GTM deferral, layout shifts, network optimization, GPU-accelerated animations  
**Chrome Animation Optimization**: January 2025 - Fixed jittery animations, GPU-accelerated properties only, optimized will-change usage  
**About Page Redesign**: January 2025 - Apple-inspired bento grid with glassmorphism, staggered team cards
