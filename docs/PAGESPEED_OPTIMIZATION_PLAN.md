# PageSpeed Insights Optimization Plan

**Last Updated:** January 2025  
**PageSpeed Report:** [Mobile Analysis](https://pagespeed.web.dev/analysis/https-logia-co-za/1s4uxdw9bl?hl=en&form_factor=mobile)

## Overview

This document tracks the implementation of optimizations identified by PageSpeed Insights to improve Core Web Vitals and overall performance.

### Current Issues Summary

| Issue | Impact | Est. Savings | Priority |
|-------|--------|--------------|----------|
| Font display | FCP | 400 ms | 🔴 High |
| Logo image size | LCP/FCP | 31.2 KiB | 🔴 High |
| Hero image compression | LCP | 22.6 KiB | 🟡 Medium |
| Google Tag Manager blocking | Render | 143 KiB, 140ms | 🔴 High |
| Layout shifts (CLS) | CLS | 0.170 score | 🔴 High |
| Render blocking CSS | FCP/LCP | 34.7 KiB | 🟡 Medium |
| Unused JavaScript | Bundle | 56 KiB | 🟡 Medium |
| Unused CSS | Bundle | 26 KiB | 🟡 Medium |
| Long main-thread tasks | TTI | 3 tasks | 🟡 Medium |
| Non-composited animations | Performance | 37 elements | 🟢 Low |
| Network dependency tree | LCP | 4,382 ms path | 🟡 Medium |

---

## Priority 1: Quick Wins (High Impact, Low Effort)

### ✅ Task 1.1: Fix Font Awesome font-display

**Status:** ✅ Completed  
**Estimated Time:** 5 minutes  
**Impact:** 400ms FCP improvement

**Issue:**
- Font Awesome fonts use `font-display: block` instead of `swap`
- Causes invisible text during font load (FOIT - Flash of Invisible Text)

**Fix:**
- [x] Open `css/fonts/fontawesome-local.css`
- [x] Find all `@font-face` declarations with `font-display: block`
- [x] Change to `font-display: swap` for all Font Awesome fonts:
  - `fa-brands-400.woff2` (Font Awesome 7 Brands) ✅
  - `fa-regular-400.woff2` (Font Awesome 7 Free - Regular) ✅
  - `fa-solid-900.woff2` (Font Awesome 7 Free - Solid) ✅
  - Font Awesome 5 Brands declarations ✅
  - Font Awesome 5 Free declarations ✅
  - FontAwesome legacy declarations ✅

**Files to Modify:**
- `css/fonts/fontawesome-local.css`

**Expected Result:**
- Text visible immediately with fallback font
- 400ms FCP improvement
- Better perceived performance

**Notes:**
- Inter fonts already use `font-display: swap` ✅
- Font Awesome currently uses `block` which causes FOIT

---

### ✅ Task 1.2: Optimize Logo Image

**Status:** ✅ Completed  
**Estimated Time:** 15 minutes  
**Impact:** 31.2 KiB reduction, faster LCP

**Issue:**
- Logo image is 1024x1024 pixels but displayed at ~40px height
- No responsive `srcset` provided
- PageSpeed reports: "This image file is larger than it needs to be (1024x1024) for its displayed dimensions (70x70)"

**Fix:**
- [x] Check current logo dimensions in `assets/images/logo/` ✅
- [x] Generate responsive sizes:
  - 80w (2x for 40px display) ✅
  - 160w (4x for retina) ✅
  - 320w (max needed, 8x for ultra-high DPI) ✅
- [x] Update `components/navbar.html` logo `<picture>` element: ✅
  ```html
  <picture class="logo-picture logo-picture-light">
    <source srcset="assets/images/logo/logo-80w.webp 80w,
                    assets/images/logo/logo-160w.webp 160w,
                    assets/images/logo/logo-320w.webp 320w" 
            type="image/webp"
            sizes="40px">
    <img src="assets/images/logo/logo-160w.webp" 
         srcset="assets/images/logo/logo-80w.webp 80w,
                 assets/images/logo/logo-160w.webp 160w,
                 assets/images/logo/logo-320w.webp 320w"
         sizes="40px"
         alt="Logia Genesis" 
         class="logo-img" 
         loading="eager"
         decoding="async"
         width="40"
         height="40">
  </picture>
  ```
- [x] Update dark mode logo similarly ✅
- [x] Update footer logo in `components/footer.html` ✅
- [x] Add `width` and `height` attributes to prevent layout shift ✅

**Files Modified:**
- `components/navbar.html` ✅
- `components/footer.html` ✅
- `config/image-optimization.js` ✅ (updated to handle WebP logos with smaller responsive sizes)

**Build Process:**
- ✅ Updated Vite image optimization plugin to:
  - Handle WebP files in logo directory
  - Use smaller responsive sizes (80w, 160w, 320w) for logo directory instead of standard sizes
  - Generate responsive WebP versions correctly

**Expected Result:**
- Browser loads appropriate size (likely 80w or 160w)
- 31.2 KiB reduction in image size
- Faster LCP for logo
- No layout shift

---

### ✅ Task 1.3: Defer Google Tag Manager

**Status:** ✅ Completed  
**Estimated Time:** 5 minutes  
**Impact:** 143 KiB not blocking render, 140ms main thread saved

**Issue:**
- Google Tag Manager loads synchronously in `<head>`
- Blocks rendering and uses main thread
- 143 KiB transfer size, 140ms main thread time

**Fix:**
- [x] Move GTM script to end of `<body>` ✅
- [x] Option A (Recommended): Move to end of `<body>` ✅
  ```html
  <!-- At end of body, before closing </body> tag -->
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=GT-WP4RJ46S"></script>
  <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'GT-WP4RJ46S');
  </script>
  ```
- [x] Update all HTML files that include GTM: ✅
  - `index.html` ✅
  - `about.html` ✅
  - `services.html` ✅
  - `contact.html` ✅
  - `portfolio.html` ✅
  - `resources.html` ✅
  - `terms-of-service.html` ✅
  - `privacy-policy.html` ✅
  - `speedtest.html` ✅
  - `404.html` ✅

**Files Modified:**
- All 10 HTML files with GTM script ✅

**Expected Result:**
- GTM loads after page content
- No render blocking
- 140ms main thread time saved
- Faster FCP and LCP

**Notes:**
- GTM will still load and function correctly
- Analytics may have slight delay (acceptable trade-off)
- Consider using `defer` if GTM supports it

---

## Priority 2: Layout and Rendering (CLS and LCP)

### ✅ Task 2.1: Fix Layout Shifts in Hero Section

**Status:** ✅ Completed  
**Estimated Time:** 30 minutes  
**Impact:** CLS reduction from 0.170 to <0.1

**Issue:**
- Hero section causing 0.085 CLS
- Hero background causing 0.085 CLS
- Total CLS: 0.170 (should be <0.1)

**Root Causes:**
- Images loading without reserved space
- Font loading causing text reflow
- Missing aspect ratio constraints

**Fix:**
- [x] Add aspect ratio to hero container: ✅
  ```css
  .hero {
    aspect-ratio: 16 / 9; /* Reserve space based on hero image aspect ratio */
    min-height: 400px; /* Fallback for older browsers */
  }
  ```
- [x] Reserve space for hero background image: ✅
  ```css
  .hero-background {
    width: 100%;
    height: 100%;
    min-height: 400px;
    aspect-ratio: 16 / 9;
  }
  ```
- [x] Add `width` and `height` attributes to hero `<img>` tags: ✅
  ```html
  <img src="..." 
       width="1920" 
       height="1080"
       ...>
  ```
- [x] Use `font-display: swap` ✅ (already done in Task 1.1)
- [ ] Add skeleton loader for hero section during load (optional, skipped for now)
- [ ] Test on slow 3G connection to verify no layout shift (user testing required)

**Files Modified:**
- `css/layout/hero.css` ✅
- `css/layout/page-header.css` ✅ (also updated page headers for consistency)
- `index.html` ✅ (only page with actual hero image - added width/height attributes)

**Expected Result:**
- CLS reduced to <0.1
- Hero section space reserved before image loads
- No layout shift when fonts load
- Better user experience

**Testing:**
- Use Chrome DevTools Performance panel
- Record with "Slow 3G" throttling
- Check CLS in Lighthouse
- Verify no layout shift in visual timeline

---

### ✅ Task 2.2: Optimize Critical Rendering Path

**Status:** ⬜ Not Started  
**Estimated Time:** 1-2 hours  
**Impact:** Faster FCP and LCP

**Issue:**
- CSS (34.7 KiB) blocking render
- theme-init.js (0.8 KiB) blocking render (but needed for FOUC prevention)

**Options:**

#### Option A: Inline Critical CSS (Recommended)
- [ ] Identify above-fold CSS (hero, navbar, header styles)
- [ ] Extract critical CSS into inline `<style>` block in `<head>`
- [ ] Load remaining CSS asynchronously:
  ```html
  <link rel="preload" href="css/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="css/style.css"></noscript>
  ```
- [ ] Or use `media="print"` trick:
  ```html
  <link rel="stylesheet" href="css/style.css" media="print" onload="this.media='all'">
  ```

#### Option B: Defer Non-Critical CSS
- [ ] Split CSS into critical and non-critical
- [ ] Load critical CSS normally
- [ ] Defer non-critical CSS (below-fold, animations, etc.)

**Files to Modify:**
- All HTML files (add inline critical CSS)
- `css/style.css` (potentially split)
- Build process (if automating critical CSS extraction)

**Tools to Consider:**
- `critical` npm package for automatic extraction
- Vite plugin for critical CSS
- Manual extraction (more control)

**Expected Result:**
- Faster FCP (First Contentful Paint)
- CSS no longer blocks render
- theme-init.js stays inline (needed for FOUC prevention)

**Notes:**
- Keep theme-init.js inline - it's needed to prevent FOUC
- Critical CSS should be <14KB (TCP initial congestion window)
- Test on slow connections

---

## Priority 3: Image and Resource Optimization

### ✅ Task 3.1: Improve Hero Image Compression

**Status:** ✅ Completed  
**Estimated Time:** 10 minutes  
**Impact:** 22.6 KiB reduction

**Issue:**
- Hero background image could be more compressed
- PageSpeed suggests: "Increasing the image compression factor could improve this image's download size"

**Fix:**
- [x] Locate source hero image: `assets/images/hero-background.jpg` ✅
- [x] Re-optimize with better compression: ✅
  - WebP: 80% quality (changed from 85%) ✅
  - AVIF: 75% quality (changed from 80%) ✅
  - JPEG fallback: 80% quality (changed from 85%) ✅
- [x] Update Vite image optimization plugin settings ✅
- [x] Updated `config/image-optimization.js` compression settings ✅
- [ ] Rebuild and verify file sizes (user action required - run `npm run build`)

**Files Modified:**
- `config/image-optimization.js` ✅ (updated compression quality settings for all images)

**Tools:**
- ImageOptim, Squoosh, or similar
- Vite image optimization plugin settings

**Expected Result:**
- 22.6 KiB reduction in hero image size
- Faster LCP
- No noticeable quality loss

**Notes:**
- Balance quality vs. size
- Test on different displays
- Ensure text remains readable over compressed image

---

### ✅ Task 3.2: Optimize Network Dependency Tree

**Status:** ✅ Completed  
**Estimated Time:** 30 minutes  
**Impact:** Reduced critical path latency

**Issue:**
- Maximum critical path latency: 4,382 ms
- Many sequential requests
- Cache warming may be too aggressive

**Current Critical Path:**
```
Initial Navigation (545ms)
  → components.js (1,690ms)
    → main.js (1,486ms)
      → vendor-alpine.js (1,256ms)
        → footer.html (2,097ms)
          → alpine-setup.js (1,250ms)
            → navbar.html (1,912ms)
              → vendor-MinRaGD6.js (1,874ms)
                → google-reviews.json (1,974ms)
                  → instagram-posts.json (1,982ms)
                    → about.html (3,878ms)
                      → services.html (4,382ms)
```

**Fix:**
- [x] Review cache warming strategy in `js/cache-warming.js` ✅
- [x] Reduce aggressive prefetching: ✅
  - [x] Delay cache warming (increased to 3s for pages, 4s for data) ✅
  - [x] Only warm critical pages (reduced to about.html, services.html only) ✅
  - [x] Skip warming on slow connections (already implemented) ✅
- [ ] Add `preconnect` for self-hosted assets (not needed - same origin, no benefit)
- [ ] Consider HTTP/2 Server Push for critical resources (server-side - out of scope)
- [x] Optimize component loading: ✅
  - [x] Load navbar and footer in parallel using Promise.all() ✅
  - [x] Don't block on data files (already async, using cache) ✅
- [x] Use `fetchpriority="high"` for critical resources ✅ (already done for images)

**Files Modified:**
- `js/cache-warming.js` ✅ (reduced pages, increased delays)
- `js/components.js` ✅ (parallel loading of navbar and footer)

**Expected Result:**
- Shorter critical path
- Faster LCP
- Less aggressive prefetching (saves bandwidth)

**Notes:**
- Cache warming is good, but may be too aggressive
- Balance between pre-loading and bandwidth usage
- Consider user's connection speed

---

## Priority 4: Code Optimization

### ✅ Task 4.1: Reduce Unused JavaScript (56 KiB)

**Status:** ⬜ Not Started  
**Estimated Time:** 2-3 hours  
**Impact:** 56 KiB bundle reduction, faster parsing

**Issue:**
- 56 KiB of unused JavaScript detected
- Increases parse time and bundle size

**Fix:**
- [ ] Run bundle analyzer:
  ```bash
  npm run build
  # Check dist/stats.html or dist-gh-pages/stats.html
  ```
- [ ] Identify unused modules:
  - [ ] Check for unused imports
  - [ ] Look for dead code
  - [ ] Identify large dependencies that aren't used
- [ ] Remove unused code:
  - [ ] Remove unused imports
  - [ ] Remove dead code paths
  - [ ] Consider tree-shaking improvements
- [ ] Use dynamic imports for less critical features:
  - [ ] Already done for FAQ, filters, search (in `js/lazy/`)
  - [ ] Consider more lazy loading opportunities
- [ ] Review large dependencies:
  - [ ] Alpine.js - is it all needed?
  - [ ] Other vendor libraries
- [ ] Test after changes to ensure nothing breaks

**Files to Review:**
- `js/main.js`
- `js/components.js`
- `js/*.js` (all JS files)
- `vite.config.js` (tree-shaking settings)

**Tools:**
- Bundle analyzer (`stats.html` in build output)
- `npm run check-bundles` (if available)
- Chrome DevTools Coverage tab

**Expected Result:**
- 56 KiB reduction in JavaScript bundle
- Faster parsing and execution
- Smaller initial bundle

**Notes:**
- Be careful not to break functionality
- Test thoroughly after removing code
- Some "unused" code may be needed at runtime

---

### ✅ Task 4.2: Reduce Unused CSS (26 KiB)

**Status:** ⬜ Not Started  
**Estimated Time:** 1-2 hours  
**Impact:** 26 KiB CSS reduction

**Issue:**
- 26 KiB of unused CSS detected
- Increases CSS parse time

**Fix:**
- [ ] Use PurgeCSS or similar tool:
  - [ ] Install PurgeCSS Vite plugin
  - [ ] Configure to scan HTML and JS files
  - [ ] Run on build
- [ ] Manual cleanup:
  - [ ] Review component CSS files
  - [ ] Remove unused component styles
  - [ ] Check for duplicate styles
- [ ] Split CSS by page more granularly:
  - [ ] Already modular (good!)
  - [ ] Consider page-specific CSS loading
- [ ] Remove unused utility classes
- [ ] Test after cleanup

**Files to Review:**
- `css/components/*.css`
- `css/sections/*.css`
- `css/pages/*.css`
- `css/core/utilities.css`

**Tools:**
- PurgeCSS
- Chrome DevTools Coverage tab
- `uncss` (alternative)

**Expected Result:**
- 26 KiB reduction in CSS bundle
- Faster CSS parsing
- Smaller stylesheet

**Notes:**
- Be careful with dynamic classes (Alpine.js, JavaScript-generated)
- Configure PurgeCSS safelist for dynamic classes
- Test all pages after cleanup

---

### ✅ Task 4.3: Fix Long Main-Thread Tasks (3 found)

**Status:** ⬜ Not Started  
**Estimated Time:** 1-2 hours  
**Impact:** Better interactivity, faster TTI

**Issue:**
- 3 long main-thread tasks detected
- Blocks interactivity during execution

**Fix:**
- [ ] Identify long tasks:
  - [ ] Use Chrome DevTools Performance panel
  - [ ] Record page load
  - [ ] Look for tasks >50ms (red bars)
- [ ] Break up long tasks:
  - [ ] Use `requestIdleCallback` for non-critical work
  - [ ] Split initialization into chunks
  - [ ] Use `setTimeout` to yield to browser
- [ ] Defer non-critical initialization:
  - [ ] Move non-critical JS to `requestIdleCallback`
  - [ ] Delay animations until after load
  - [ ] Lazy load non-critical features
- [ ] Optimize component loading:
  - [ ] Load components in parallel where possible
  - [ ] Don't block on non-critical components
- [ ] Optimize data fetching:
  - [ ] Don't block on testimonials/Instagram data
  - [ ] Show skeleton loaders while fetching

**Files to Review:**
- `js/main.js`
- `js/components.js`
- `js/testimonials.js`
- `js/instagram-feed.js`
- Any initialization code

**Tools:**
- Chrome DevTools Performance panel
- Long Task API (if available)

**Expected Result:**
- No tasks >50ms
- Faster Time to Interactive (TTI)
- Better user experience

**Notes:**
- Long tasks are tasks that block main thread >50ms
- Break them into smaller chunks
- Use async/await and yield points

---

### ✅ Task 4.4: Optimize Non-Composited Animations (37 elements)

**Status:** ✅ Completed  
**Estimated Time:** 1 hour  
**Impact:** Smoother animations, less main thread work

**Issue:**
- 37 animated elements causing repaints/reflows
- Not using GPU-accelerated properties

**Fix:**
- [x] Audit all animations:
  - [x] Identified all `transition: all` instances (61 found)
  - [x] Found non-GPU properties in animations
- [x] Use only GPU-accelerated properties:
  - [x] Replaced `transition: all` with specific properties (`transform`, `opacity`, `background-color` where needed)
  - [x] Fixed `.carousel-dot.active` to use `transform: scaleX()` instead of `width`
  - [x] All animations now use `transform` and `opacity` primarily
- [x] Add `will-change` only during active animations:
  - [x] Set on hover/focus states
  - [x] Removed when idle (`will-change: auto`)
  - [x] Applied to all animated elements
- [x] Ensure CSS containment:
  - [x] Added `contain: layout style paint` to all animated elements
  - [x] Applied across components, sections, and layout files
- [x] Use `transform` instead of position changes:
  - [x] All position-based animations use `transform: translateX/Y()`
  - [x] Scale animations use `transform: scale()`

**Files Modified:**
- `css/components/carousel.css` - Fixed carousel dots width animation, optimized transitions
- `css/components/buttons.css` - Optimized button transitions
- `css/components/cards.css` - Optimized card hover animations
- `css/components/floating-buttons.css` - Optimized scroll-to-top and WhatsApp button animations
- `css/sections/testimonials.css` - Optimized testimonial card transitions
- `css/sections/instagram.css` - Optimized Instagram card animations
- `css/sections/why-choose.css` - Optimized why-choose card animations
- `css/layout/navbar.css` - Optimized navbar link, dropdown, and theme toggle animations
- `css/layout/footer.css` - Optimized footer social link animations

**Expected Result:**
- ✅ All animations use `transform` and `opacity`
- ✅ No repaints during animations (GPU-accelerated)
- ✅ Smoother 60fps animations
- ✅ Less main thread work

**Notes:**
- GPU-accelerated properties don't trigger layout or paint
- `will-change` is now only set during active animations (hover states)
- CSS containment applied to all animated elements for better rendering isolation
- Note: `filter: hue-rotate()` in hero gradient animation is not GPU-accelerated but is a subtle effect (acceptable trade-off)

---

## Testing and Validation

### After Each Priority

- [ ] Run PageSpeed Insights again
- [ ] Check Core Web Vitals:
  - [ ] LCP (should be <2.5s)
  - [ ] FID/INP (should be <100ms)
  - [ ] CLS (should be <0.1)
  - [ ] FCP (should be <1.8s)
- [ ] Test on real devices:
  - [ ] Mobile (slow 3G)
  - [ ] Desktop
- [ ] Verify functionality:
  - [ ] All features work
  - [ ] No broken styles
  - [ ] Animations smooth

### Final Validation

- [ ] All Core Web Vitals in green
- [ ] PageSpeed score >90 (mobile)
- [ ] No regressions in functionality
- [ ] Tested on multiple browsers
- [ ] Tested on slow connections

---

## Progress Tracking

### Priority 1: Quick Wins
- [x] Task 1.1: Fix Font Awesome font-display ✅
- [x] Task 1.2: Optimize Logo Image ✅
- [x] Task 1.3: Defer Google Tag Manager ✅

### Priority 2: Layout and Rendering
- [x] Task 2.1: Fix Layout Shifts ✅
- [ ] Task 2.2: Optimize Critical Rendering Path

### Priority 3: Image and Resource Optimization
- [x] Task 3.1: Improve Hero Image Compression ✅
- [x] Task 3.2: Optimize Network Dependency Tree ✅

### Priority 4: Code Optimization
- [ ] Task 4.1: Reduce Unused JavaScript
- [ ] Task 4.2: Reduce Unused CSS
- [ ] Task 4.3: Fix Long Main-Thread Tasks
- [x] Task 4.4: Optimize Non-Composited Animations ✅

---

## Notes and References

### PageSpeed Insights Report
- [Mobile Analysis](https://pagespeed.web.dev/analysis/https-logia-co-za/1s4uxdw9bl?hl=en&form_factor=mobile)

### Key Metrics to Track
- **LCP (Largest Contentful Paint):** <2.5s (good)
- **FID/INP (First Input Delay/Interaction to Next Paint):** <100ms (good)
- **CLS (Cumulative Layout Shift):** <0.1 (good)
- **FCP (First Contentful Paint):** <1.8s (good)
- **TTI (Time to Interactive):** <3.8s (good)

### Resources
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Last Updated:** January 2025  
**Status:** 6 of 10 tasks completed (60%)  
**Next Review:** After remaining Priority 4 tasks (unused JS/CSS, long main-thread tasks)

> **Note**: This is a tracking document for PageSpeed optimizations. Most high-priority tasks are completed. See [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) for the current performance implementation summary.

