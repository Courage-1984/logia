# Logia Genesis - Project Architecture

## Project Structure

```
logia/
├── components/          # Reusable HTML components
│   ├── navbar.html     # Navigation component
│   └── footer.html     # Footer component
├── css/                # Stylesheets (modular structure)
│   ├── core/           # Core foundation styles
│   │   ├── variables.css    # Design tokens (colors, spacing, etc.)
│   │   ├── reset.css       # CSS reset & base styles
│   │   ├── typography.css  # Typography styles
│   │   └── utilities.css   # Utility classes
│   ├── components/     # Reusable UI components
│   │   ├── buttons.css     # Button styles
│   │   ├── cards.css       # Generic card patterns
│   │   ├── forms.css       # Form elements
│   │   ├── carousel.css    # Carousel component
│   │   ├── floating-buttons.css # Scroll-to-top, WhatsApp buttons
│   │   └── skeleton.css    # Skeleton loaders (animated loading placeholders)
│   ├── layout/         # Layout components
│   │   ├── container.css   # Container utilities
│   │   ├── navbar.css      # Navigation bar
│   │   ├── hero.css        # Hero section
│   │   ├── page-header.css # Page headers (shared)
│   │   └── footer.css      # Footer component
│   ├── sections/       # Homepage sections
│   │   ├── _section-header.css # Shared section headers
│   │   ├── services.css        # Services section
│   │   ├── why-choose.css      # Why Choose section
│   │   ├── portfolio-preview.css # Portfolio preview
│   │   ├── testimonials.css     # Testimonials section
│   │   ├── instagram.css        # Instagram feed
│   │   └── cta.css              # CTA section
│   ├── pages/          # Page-specific styles
│   │   ├── about.css
│   │   ├── contact.css
│   │   ├── services.css
│   │   ├── portfolio.css
│   │   ├── legal.css
│   │   ├── speedtest.css
│   │   └── resources.css
│   ├── responsive/     # Responsive adjustments
│   │   ├── mobile.css      # Mobile breakpoints
│   │   ├── tablet.css      # Tablet breakpoints
│   │   └── desktop.css     # Desktop optimizations
│   ├── fonts/          # Font definitions
│   │   ├── inter-fonts.css
│   │   └── fontawesome-local.css
│   └── style.css       # Main entry point (imports all modules)
├── docs/               # Documentation
│   ├── ARCHITECTURE.md # Architecture documentation (this file)
│   ├── SETUP_GUIDE.md  # Setup instructions
│   ├── STYLE_GUIDE.md  # Design system and CSS conventions
│   ├── PERFORMANCE_OPTIMIZATION.md  # Performance strategies
│   ├── PERFORMANCE_CHECKLIST.md  # Performance quick reference
│   ├── IMAGE_GUIDE.md  # Image implementation guide
│   ├── FONTS.md  # Font self-hosting guide
│   ├── NETWORK_OPTIMIZATION.md  # Server-side optimization
│   └── RESPONSIVE_DESIGN.md  # Responsive design patterns
├── js/                 # JavaScript modules
│   ├── components.js   # Component loader and initialization
│   ├── main.js         # Main application logic
│   ├── alpine-setup.js # Alpine.js configuration and setup
│   ├── testimonials.js # Google Reviews carousel module
│   ├── instagram-feed.js # Instagram feed carousel module
│   ├── particles-net.js # Particles background system (CTA sections)
│   ├── particlesjs-config.json # Particles configuration (particles.js format)
│   ├── page-transitions.js # Smooth page transitions with skeleton loading
│   ├── cache-manager.js # In-memory cache manager for pages and data
│   ├── cache-warming.js # Cache warming for critical pages and data
│   ├── utils/          # JavaScript utilities
│   │   └── theme.js    # Theme manager (loaded early to prevent FOUC)
│   └── lazy/           # Lazy-loaded modules
│       ├── faq.js      # FAQ functionality (lazy)
│       ├── filters.js  # Filter functionality (lazy)
│       └── search.js   # Search functionality (lazy)
├── utils/              # Utility functions
│   ├── theme.js        # Theme management (dark/light mode, system preference)
│   ├── path.js         # Path utilities (GitHub Pages base path detection)
│   ├── dom.js          # DOM manipulation helpers ($, $$, etc.)
│   ├── performance.js  # Performance utilities (debounce, throttle, etc.)
│   ├── validation.js   # Form validation functions
│   ├── scroll-handler.js # Unified scroll handler (navbar, scroll-to-top, active nav)
│   ├── blur-placeholder.js # Blur-up placeholder utilities
│   └── index.js        # Utility exports
├── js/utils/           # JavaScript utilities (duplicate theme.js for early load)
│   └── theme.js        # Theme manager (loaded early to prevent FOUC)
├── data/               # Data files
│   ├── google-reviews.json # Fetched Google Reviews (generated)
│   ├── instagram-posts.json # Fetched Instagram posts (generated)
│   └── manual-reviews.json  # Manual reviews fallback
├── config/             # Configuration files
│   ├── app.config.js   # Application configuration (theme, animation, etc.)
│   ├── build-config.js # Build target configuration (dual build system)
│   ├── image-optimization.js # Image optimization plugin
│   ├── url-transform-plugin.js # URL transformation plugin
│   └── static-files-transform-plugin.js # Static file transformation
├── assets/             # Static assets
│   ├── images/         # Image files
│   └── fonts/          # Font files
├── public/             # Public static files
│   ├── service-worker.js # Enhanced service worker with multi-layer caching
│   └── data/           # Runtime data (copied to build output)
├── .github/workflows/  # GitHub Actions
│   └── static.yml      # GitHub Pages deployment workflow
├── dist/               # Production build output (generated, gitignored)
├── dist-gh-pages/      # GitHub Pages build output (generated, gitignored)
├── vite.config.js      # Vite build configuration
├── package.json        # Dependencies and npm scripts
├── *.html              # Page templates (including 404.html, privacy-policy.html, terms-of-service.html)
├── site.webmanifest    # Web app manifest (PWA)
├── sitemap.xml         # XML sitemap for SEO
├── robots.txt          # Robots exclusion file
└── favicon files       # Favicons (SVG, PNG sizes, Windows tiles)
```

## Modularity Assessment

### ✅ Strengths

1. **Component-Based Architecture**
   - Reusable navbar and footer components
   - Single source of truth for shared UI elements
   - Easy to maintain and update

2. **Separation of Concerns**
   - CSS organized by page/feature
   - JavaScript modules with clear responsibilities
   - HTML templates are clean and semantic

3. **Industry Standards Compliance**
   - Uses modern ES6+ JavaScript
   - CSS custom properties (CSS variables)
   - Semantic HTML5
   - Responsive design patterns
   - Accessibility considerations (ARIA labels)

### ✅ Recent Improvements (Implemented)

1. **Build Process** ✅
   - Vite build tool configured for:
     - CSS minification
     - JavaScript bundling and tree-shaking
     - Asset optimization
     - Development server with hot module replacement (HMR)
     - Production builds with code splitting

2. **Component System Enhancement** ✅
   - Alpine.js integrated for:
     - Reactive components
     - Better state management
     - Template directives
     - Lightweight and performant

3. **Code Organization** ✅
   - `utils/` folder created for utility functions
   - `assets/` folder structure for images and fonts
   - `config/` folder for centralized configuration
   - Modular utility exports

4. **Documentation** ✅
   - JSDoc comments added to all JavaScript functions
   - CSS class naming conventions documented
   - Inline comments for complex logic
   - Comprehensive architecture documentation

## Component Loading System

The project uses a custom component loader (`js/components.js`) that:
- Loads HTML components asynchronously
- Replaces placeholder divs with actual content
- Initializes dependent features after component load
- Handles active navigation state automatically

### Usage

```html
<!-- In any HTML file -->
<div id="navbar-placeholder"></div>
<div id="footer-placeholder"></div>

<!-- ES6 modules with Vite -->
<script type="module" src="js/components.js"></script>
<script type="module" src="js/alpine-setup.js"></script>
<script type="module" src="js/main.js"></script>
```

## CSS Architecture

### CSS Variables
All design tokens are defined in `css/style.css` using CSS custom properties:
- Colors (primary, accent, neutrals)
- Spacing scale (8px grid system)
- Typography scale
- Shadows, borders, transitions

### Page-Specific Styles
Each page has its own CSS file for:
- Page-specific layouts
- Unique component styles
- Page-specific animations

### Best Practices
- ✅ Uses CSS custom properties for theming
- ✅ Mobile-first responsive design
- ✅ Dark mode support
- ✅ Consistent spacing system
- ✅ Semantic class names
- ✅ Documented naming conventions (see `docs/STYLE_GUIDE.md`)

## JavaScript Architecture

### Module Pattern (ES6)
- `components.js`: Handles component loading and initialization
- `main.js`: Contains all application logic and feature initialization
- `alpine-setup.js`: Alpine.js configuration and reactive components

### Utility Modules
- `utils/dom.js`: DOM manipulation helpers ($, $$, waitForElement, etc.)
- `utils/performance.js`: Performance utilities (debounce, throttle, etc.)
- `utils/validation.js`: Form validation functions
- `utils/scroll-handler.js`: Unified scroll handler (consolidates all scroll events)
- `utils/index.js`: Centralized utility exports

### Configuration
- `config/app.config.js`: Centralized application configuration
  - Theme settings
  - Animation parameters
  - Performance settings
  - Feature flags

### Initialization Flow
1. `components.js` loads first
2. Navbar and footer components are loaded
3. `alpine-setup.js` initializes Alpine.js
4. Dark mode is initialized after navbar loads
5. `main.js` initializes all other features

### Feature Modules
- Smooth scrolling (event delegation)
- Unified scroll handler (navbar, scroll-to-top, active nav link)
- Mobile menu (event delegation)
- Dark mode toggle
- Animated counters
- Form validation
- FAQ accordion (lazy-loaded, event delegation)
- Filter functionality (lazy-loaded, event delegation)
- Search functionality (lazy-loaded)
- Lazy loading images
- 3D card tilt effects (optimized)
- Link prefetching

### Alpine.js Integration
Alpine.js provides reactive components for:
- Theme state management
- Mobile menu state
- Search functionality
- FAQ accordion
- Custom component states

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features (async/await, arrow functions, const/let)
- CSS Grid and Flexbox
- CSS Custom Properties

## Performance Optimizations

### Implemented ✅
- **Font self-hosting**: All fonts served locally (zero external requests)
- **Lazy loading**: Non-critical JS (FAQ, filters, search) load on demand
- **Unified scroll handler**: Single throttled handler for all scroll events
- **Event delegation**: Replaced individual listeners throughout
- **Code splitting**: Vendor, utils, and components separated
- **Compression**: Gzip and brotli build-time compression
- **Bundle analyzer**: Visual bundle composition analysis
- **Image optimization**: WebP, AVIF, responsive sizes, lazy loading
- **Resource hints**: Module preload for JS, page prefetch, link prefetch on hover (images use `loading="eager"` and `fetchpriority="high"` instead of preload links)
- **Tree-shaking**: Automatic dead code elimination
- **Performance monitoring utilities**

### Future Enhancements
- Critical CSS extraction
- Service worker implementation
- Performance monitoring (Core Web Vitals tracking)

## Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliance (WCAG AA)

## Build System (Vite)

### Development
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps for debugging
- Development server on port 3000

### Dual Build System
The project supports two build targets with automatic URL transformation:

**Production Build** (`npm run build`):
- Output: `dist/` directory
- Base URL: `https://www.logia.co.za`
- For normal server/FTP deployment

**GitHub Pages Build** (`npm run build:gh-pages`):
- Output: `dist-gh-pages/` directory
- Base URL: `https://courage-1984.github.io/logia`
- Base Path: `/logia/`
- Automatically deployed via GitHub Actions

**Build Features** (applied to both):
- CSS minification and code splitting
- JavaScript bundling, minification, and tree-shaking
- Code splitting (vendor, utils, components, lazy modules)
- Asset optimization (images: WebP, AVIF, responsive sizes)
- Compression (gzip + brotli)
- Bundle analysis (generates stats.html in each output)
- Static assets copied (favicons, sitemap, web manifest, robots.txt, legal pages)
- Automatic URL transformation (canonical, OG, Twitter, structured data)

### Configuration
- `vite.config.js` - Build system configuration
- `config/build-config.js` - Build target URLs and paths
- `.github/workflows/static.yml` - GitHub Pages deployment workflow

## Future Enhancements

1. **TypeScript** (Optional)
   - Add type safety to JavaScript
   - Better IDE support

2. **CSS Preprocessor** (Optional)
   - SASS/SCSS for better CSS organization
   - Mixins and functions

3. **Testing** (Recommended)
   - Unit tests for JavaScript functions
   - E2E tests for critical user flows

4. **CI/CD** (Recommended)
   - Automated testing
   - Deployment pipeline

5. **PWA Features** ✅ (Partially Implemented)
   - ✅ Web app manifest (`site.webmanifest`)
   - ✅ Favicon implementation (SVG, PNG, Windows tiles)
   - ✅ Sitemap for SEO (`sitemap.xml`)
   - ⏳ Service worker (future)
   - ⏳ Offline support (future)

