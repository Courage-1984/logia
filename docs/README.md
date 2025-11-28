# Documentation Index

Quick reference guide to all project documentation.

## Getting Started

- **[README.md](../README.md)** - Project overview, quick start, features
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Developer setup and workflow

## Deployment

- **[DUAL_BUILD_GUIDE.md](./DUAL_BUILD_GUIDE.md)** - Complete guide for dual build system (Production + GitHub Pages)

## Architecture & Development

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Project structure, design decisions, modularity
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - CSS conventions, design system, BEM naming

## Performance & Optimization

- **[PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)** - Performance strategies and optimizations
- **[PERFORMANCE_CHECKLIST.md](./PERFORMANCE_CHECKLIST.md)** - Quick performance reference checklist
- **[NETWORK_OPTIMIZATION.md](./NETWORK_OPTIMIZATION.md)** - Server-side and infrastructure optimization
- **[BROWSER_OPTIMIZATION.md](./BROWSER_OPTIMIZATION.md)** - Browser compatibility and optimization

## SEO & Standards

- **[SEO_RECOMMENDATIONS.md](./SEO_RECOMMENDATIONS.md)** - Complete SEO strategy and implementation guide
- **[INDUSTRY_STANDARDS_AUDIT.md](./INDUSTRY_STANDARDS_AUDIT.md)** - Historical audit (many items now implemented)

## Implementation Guides

- **[GOOGLE_REVIEWS_SETUP.md](./GOOGLE_REVIEWS_SETUP.md)** - Google Reviews carousel setup and configuration
- **[IMAGE_GUIDE.md](./IMAGE_GUIDE.md)** - Image optimization and responsive image implementation
- **[FONTS.md](./FONTS.md)** - Font self-hosting guide
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
- ✅ Google Reviews carousel (dynamic testimonials with interactive controls)
- ✅ Floating action buttons (WhatsApp, scroll-to-top)
- ✅ Form backend integration (Formspree)
- ✅ Legal pages (Privacy Policy, Terms of Service, 404)
- ✅ Automatic URL transformation based on build target
- ✅ GitHub Actions automated deployment

### Configuration Files
- `config/build-config.js` - Build target URLs and paths
- `config/app.config.js` - Application settings
- `vite.config.js` - Build system configuration
- `.github/workflows/static.yml` - GitHub Pages deployment

---

**Last Updated**: January 2025

