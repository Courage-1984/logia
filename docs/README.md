# Documentation Index

Quick reference guide to all project documentation.

## Getting Started

- **[README.md](../README.md)** - Project overview, quick start, features
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Developer setup and workflow

## Deployment

- **[DUAL_BUILD_GUIDE.md](./DUAL_BUILD_GUIDE.md)** - Complete guide for dual build system (Production + GitHub Pages)

## Architecture & Development

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Project structure, design decisions, modularity
- **[CSS_STRUCTURE.md](./CSS_STRUCTURE.md)** - Modular CSS architecture reference guide
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - CSS conventions, design system, BEM naming

## Performance & Optimization

- **[PERFORMANCE_CHECKLIST.md](./PERFORMANCE_CHECKLIST.md)** - Primary quick-reference checklist (what's done / what's left)
- **[PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)** - Implementation summary, caching strategy, and rationale
- **[NETWORK_OPTIMIZATION.md](./NETWORK_OPTIMIZATION.md)** - Server-side playbook (HTTP/2, CDN, compression, cache headers)

## SEO & Standards

- **[SEO_RECOMMENDATIONS.md](./SEO_RECOMMENDATIONS.md)** - Complete SEO strategy and implementation guide

## Implementation Guides

- **[GOOGLE_REVIEWS_SETUP.md](./GOOGLE_REVIEWS_SETUP.md)** - Google Reviews carousel setup and configuration
- **[INSTAGRAM_FEED_SETUP.md](./INSTAGRAM_FEED_SETUP.md)** - Instagram feed setup with local image fallback
- **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)** - GitHub Actions secrets configuration
- **[MONITORING_SETUP.md](./MONITORING_SETUP.md)** - Error tracking (Sentry), performance monitoring (Core Web Vitals), Lighthouse CI, bundle size monitoring
- **[IMAGE_GUIDE.md](./IMAGE_GUIDE.md)** - Image optimization, responsive images, source format guidelines
- **[FONTS.md](./FONTS.md)** - Font self-hosting guide and Font Awesome optimization
- **[RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md)** - Responsive design patterns and breakpoints

## Quick Reference

### Build Commands
- `npm run dev` - Development server
- `npm run build` - Production build (`dist/` → `https://www.logia.co.za`)
- `npm run build:gh-pages` - GitHub Pages build (`dist-gh-pages/` → `https://courage-1984.github.io/logia`)
- `npm run build:all` - Build both targets
- `npm run preview` - Preview production build
- `npm run preview:gh-pages` - Preview GitHub Pages build

### Key Features
- ✅ Dual build system (Production + GitHub Pages)
- ✅ Complete SEO implementation (Open Graph, Twitter Cards, Structured Data)
- ✅ Theme system (dark/light mode with FOUC prevention)
- ✅ Page transitions (smooth navigation with skeleton loading)
- ✅ Skeleton loaders (animated loading placeholders)
- ✅ Enhanced caching (service worker + in-memory cache + cache warming)
- ✅ Particles background (animated network in CTA sections with mouse interaction)
- ✅ Google Reviews carousel (dynamic testimonials with interactive controls)
- ✅ Instagram feed (with local image fallback)
- ✅ Floating action buttons (WhatsApp, scroll-to-top)
- ✅ Timeline component (vertical process/journey flow with curved connectors)
- ✅ Bento grid layout component
- ✅ Form backend integration (Formspree)
- ✅ Legal pages (Privacy Policy, Terms of Service, 404)
- ✅ Automatic URL transformation based on build target
- ✅ GitHub Actions automated deployment with secrets support
- ✅ CSS modularization (complete modular structure)
- ✅ Path utilities for GitHub Pages compatibility

### Configuration Files
- `config/build-config.js` - Build target URLs and paths
- `config/app.config.js` - Application settings
- `vite.config.js` - Build system configuration
- `.github/workflows/static.yml` - GitHub Pages deployment

### Recent Updates (January 2025)
- **Page Transitions & Loading**: Skeleton loaders with shimmer animation, smooth page transitions with instant navigation
- **Enhanced Caching**: Multi-layer caching (service worker + in-memory cache + cache warming) with automatic cleanup
- **UI Components**: Timeline component (vertical process flow with curved connectors), bento grid layout
- **Performance**: Connection-aware optimizations, cache warming for critical pages/data
- **Build & Development**: Preload optimization, dynamic import fixes, preview server improvements
- **UI Improvements**: Footer logo links, Featured Projects styling updates, timeline component alignment fixes
- **Monitoring & Error Tracking**: Sentry integration, Core Web Vitals, Lighthouse CI, bundle monitoring
- **Accessibility**: Skip navigation links on all pages
- Particles background system (particles.js-compatible, disabled on mobile/reduced motion)
- Font Awesome cross-browser fixes (Firefox compatibility)
- Theme system optimization (FOUC prevention, system preference detection)
- Path utilities for GitHub Pages compatibility
- CSS modularization (complete modular structure)
- Instagram feed local image fallback
- GitHub Actions secrets support

---

**Last Updated**: January 2025

