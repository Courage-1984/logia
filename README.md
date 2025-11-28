# Logia Genesis

**Switching Evolved | Thoughtful Innovations**

Comprehensive business technology solutions provider in Gauteng, South Africa.

## Project Overview

A modern, responsive website built with vanilla HTML, CSS, and JavaScript. The project follows industry best practices for modularity, maintainability, and performance. Now enhanced with Vite for build optimization and Alpine.js for reactive components.

## Features

- 🎨 Modern, responsive design
- 🌓 Dark/Light mode toggle
- 📱 Mobile-first approach
- ♿ Accessibility compliant
- ⚡ Fast loading times with Vite optimization
- 🖼️ Automatic image optimization (WebP, responsive sizes)
- 🔧 Modular component architecture
- ⚛️ Reactive components with Alpine.js
- 📦 ES6 modules and modern JavaScript

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
│   ├── IMAGE_GUIDE.md  # Image placement guide
│   ├── IMAGE_OPTIMIZATION.md  # Image optimization guide
│   └── *.md            # Other documentation files
├── public/             # Public assets (for Vite)
├── dist/               # Build output (generated)
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
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

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Building for Production

Build optimized production files:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

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
- Font Awesome Icons
- Google Fonts (Inter)

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

- ✅ **Font optimization**: Reduced weights (400, 600, 700 only), async loading
- ✅ **Resource hints**: DNS prefetch and preconnect for external domains
- ✅ **Async loading**: Google Fonts and Font Awesome loaded asynchronously
- ✅ **Link prefetching**: Pages prefetched on hover for instant navigation
- ✅ **Image optimization**: WebP format, responsive sizes, lazy loading
- ✅ **Module preloading**: Critical JavaScript modules preloaded

See [docs/PERFORMANCE_OPTIMIZATION.md](./docs/PERFORMANCE_OPTIMIZATION.md) for detailed strategies and [docs/PERFORMANCE_CHECKLIST.md](./docs/PERFORMANCE_CHECKLIST.md) for a quick reference checklist.

## Architecture

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed information about the project structure and design decisions.

## License

© 2024 Logia Genesis. All rights reserved.
