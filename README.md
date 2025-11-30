# Logia Genesis

**Switching Evolved | Thoughtful Innovations**

Comprehensive business technology solutions provider in Gauteng, South Africa.

## Project Overview

A modern, responsive website built with vanilla HTML, CSS, and JavaScript. The project follows industry best practices for modularity, maintainability, and performance. Now enhanced with Vite for build optimization and Alpine.js for reactive components.

## Features

- 🎨 Modern, responsive design
- 🌓 Dark/Light mode toggle
- 📱 Mobile-first approach
- ♿ Accessibility compliant (WCAG AA) with automated testing
- ⚡ Fast loading times with Vite optimization
- 🖼️ Automatic image optimization (WebP, AVIF, responsive sizes)
- 🔧 Modular component architecture
- ⚛️ Reactive components with Alpine.js
- 📦 ES6 modules and modern JavaScript
- 🚀 Dual build system (Production + GitHub Pages)
- 🔍 Complete SEO implementation (Open Graph, Twitter Cards, Structured Data)
- 📝 Form backend integration (Formspree)
- 📄 Legal pages (Privacy Policy, Terms of Service, 404)
- ⭐ Google Reviews carousel (dynamic testimonials with interactive controls)
- ✨ Particles background (animated network in CTA sections with mouse interaction)
- 💬 WhatsApp floating button (always accessible)
- ⬆️ Scroll to top button (appears on scroll)

## Project Structure

```
logia/
├── components/          # Reusable HTML components
│   ├── navbar.html     # Navigation component
│   └── footer.html     # Footer component
├── css/                # Stylesheets
│   ├── style.css       # Main stylesheet
│   └── *.css           # Page-specific styles
├── js/                 # JavaScript modules
│   ├── components.js   # Component loader
│   ├── main.js         # Main application logic
│   └── alpine-setup.js # Alpine.js configuration
├── utils/              # Utility functions
│   ├── dom.js          # DOM manipulation helpers
│   ├── performance.js  # Performance utilities
│   ├── validation.js   # Form validation
│   ├── responsive-image.js  # Responsive image utilities
│   └── index.js        # Utility exports
├── config/             # Configuration files
│   ├── app.config.js   # Application configuration
│   └── image-optimization.js  # Image optimization plugin
├── assets/             # Static assets
│   ├── images/         # Image files
│   └── fonts/          # Font files
├── docs/               # Documentation
│   ├── ARCHITECTURE.md # Architecture documentation
│   ├── SETUP_GUIDE.md  # Setup instructions
│   ├── STYLE_GUIDE.md  # Design system and CSS conventions
│   ├── PERFORMANCE_OPTIMIZATION.md  # Performance strategies
│   ├── PERFORMANCE_CHECKLIST.md  # Performance quick reference
│   ├── IMAGE_GUIDE.md  # Image implementation guide
│   ├── FONTS.md  # Font self-hosting guide
│   ├── CPANEL_OPTIMIZATION_GUIDE.md  # Server-side optimization via cPanel
│   └── RESPONSIVE_DESIGN.md  # Responsive design patterns
├── public/             # Public assets (for Vite)
├── config/             # Configuration files
│   ├── app.config.js   # Application configuration
│   ├── build-config.js # Build target configuration (dual build)
│   ├── image-optimization.js  # Image optimization plugin
│   ├── url-transform-plugin.js  # URL transformation for builds
│   └── static-files-transform-plugin.js  # Static file URL transformation
├── dist/               # Production build output (generated, gitignored)
├── dist-gh-pages/       # GitHub Pages build output (generated, gitignored)
├── .github/workflows/  # GitHub Actions workflows
│   └── static.yml      # GitHub Pages deployment workflow
├── vite.config.js      # Vite configuration
├── package.json         # Dependencies and scripts
├── robots.txt          # SEO robots file
├── sitemap.xml         # SEO sitemap
├── 404.html            # Custom error page
├── privacy-policy.html  # Privacy policy
├── terms-of-service.html # Terms of service
└── *.html              # Page templates
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

For Google Reviews integration, create a `.env` file in the project root:

```env
GOOGLE_PLACES_API_KEY=your-api-key-here
GOOGLE_PLACE_ID=your-place-id-here
```

**Note**: The `.env` file is automatically loaded by npm scripts. You don't need to manually set environment variables - just create the file and run the scripts normally.

To find your Place ID:
```bash
npm run find-place-id "Your Business Name" "Location"
```

See [docs/GOOGLE_REVIEWS_SETUP.md](./docs/GOOGLE_REVIEWS_SETUP.md) for detailed setup instructions.

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Building for Production

The project supports **dual build targets** for different deployment scenarios:

#### Production Build (Normal Server/FTP)
```bash
npm run build
```
Builds to `dist/` folder for FTP upload to your production server.
- Base URL: `https://www.logia.co.za`
- Output: `dist/`

#### GitHub Pages Build
```bash
npm run build:gh-pages
```
Builds to `dist-gh-pages/` folder for GitHub Pages deployment.
- Base URL: `https://courage-1984.github.io/logia`
- Automatically deployed via GitHub Actions

#### Build Both
```bash
npm run build:all
```
Builds both targets sequentially.

### Preview Builds

Preview either build locally:
```bash
npm run preview          # Preview production build
npm run preview:gh-pages # Preview GitHub Pages build
```

**Note**: The build system automatically transforms URLs (canonical, Open Graph, Twitter Cards, structured data) based on the build target. See `docs/DUAL_BUILD_GUIDE.md` for details.

### Bundle Analysis

After building, analyze your bundle composition:
```bash
npm run build
```

The bundle analyzer generates an interactive visualization at `dist/stats.html`. Open this file in your browser to:
- Visualize bundle composition (treemap view)
- See chunk sizes (original, gzipped, and brotli)
- Identify large dependencies
- Optimize code splitting

### Accessibility Testing

The project includes comprehensive accessibility testing tools:

```bash
# Run all accessibility tests
npm run accessibility:all

# Run individual tests
npm run accessibility:contrast  # Check text contrast ratios
npm run accessibility:axe       # Run axe-core audit
npm run accessibility:pa11y     # Run pa11y audit
```

**Tools included**:
- **axe-core**: Automated WCAG compliance testing
- **pa11y**: Command-line accessibility testing with headless Chrome
- **HTML Contrast Checker**: Custom tool for checking text contrast ratios

See [docs/ACCESSIBILITY_TESTING.md](./docs/ACCESSIBILITY_TESTING.md) for detailed usage instructions.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Vite (Build tool and dev server)
- Alpine.js (Reactive components)
- Sharp (Image optimization)
- Font Awesome Icons (self-hosted)
- Inter Font (self-hosted)

## Image Optimization

The project includes comprehensive image optimization:

- **Automatic WebP conversion** with JPEG/PNG fallback
- **Responsive image sizes** (320w, 640w, 768w, 1024w, 1280w, 1920w)
- **Build-time optimization** using Sharp
- **Lazy loading** for below-the-fold images
- **Preloading** for critical images

See [docs/IMAGE_GUIDE.md](./docs/IMAGE_GUIDE.md) for detailed documentation.

## Performance Optimization

Comprehensive performance optimizations implemented:

- ✅ **Font self-hosting**: All fonts served locally (zero external requests)
- ✅ **Lazy loading**: Non-critical JavaScript (FAQ, filters, search) loads on demand
- ✅ **Unified scroll handler**: Single throttled handler for all scroll events
- ✅ **Event delegation**: Replaced individual listeners throughout
- ✅ **Code splitting**: Vendor, utils, components, and lazy modules separated
- ✅ **Compression**: Gzip/Brotli build-time compression
- ✅ **Bundle analyzer**: Visual bundle composition analysis
- ✅ **Image optimization**: WebP/AVIF format, responsive sizes, lazy loading
- ✅ **Tree-shaking**: Automatic dead code elimination enabled
- ✅ **SEO**: XML sitemap and web app manifest for PWA support
- ✅ **Favicons**: Complete favicon implementation (SVG, PNG, Windows tiles)

See [docs/PERFORMANCE_OPTIMIZATION.md](./docs/PERFORMANCE_OPTIMIZATION.md) for detailed strategies, [docs/PERFORMANCE_CHECKLIST.md](./docs/PERFORMANCE_CHECKLIST.md) for a quick reference checklist, and [docs/CPANEL_OPTIMIZATION_GUIDE.md](./docs/CPANEL_OPTIMIZATION_GUIDE.md) for server-side optimization guidance.

## Documentation

See [docs/README.md](./docs/README.md) for complete documentation index.

**Quick Links**:
- **[Setup Guide](./docs/SETUP_GUIDE.md)** - Developer setup and workflow
- **[Google Reviews Setup](./docs/GOOGLE_REVIEWS_SETUP.md)** - Testimonials carousel setup
- **[Instagram Feed Setup](./docs/INSTAGRAM_FEED_SETUP.md)** - Instagram feed setup with local image fallback
- **[GitHub Actions Setup](./docs/GITHUB_ACTIONS_SETUP.md)** - Secrets configuration
- **[Dual Build Guide](./docs/DUAL_BUILD_GUIDE.md)** - Deployment guide
- **[Architecture](./docs/ARCHITECTURE.md)** - Project structure
- **[Performance Optimization](./docs/PERFORMANCE_OPTIMIZATION.md)** - Performance strategies
- **[Style Guide](./docs/STYLE_GUIDE.md)** - CSS conventions

## License

© 2025 Logia Genesis. All rights reserved.
