# Setup Guide - Logia Genesis

Quick setup guide for developers working on the Logia Genesis project.

## Quick Start

```bash
npm install    # Install dependencies
npm run dev    # Start development server (http://localhost:3000)
```

## Build Commands

- `npm run build` - Production build (`dist/` → `https://www.logia.co.za`)
- `npm run build:gh-pages` - GitHub Pages build (`dist-gh-pages/` → `https://courage-1984.github.io/logia`)
- `npm run build:all` - Build both targets
- `npm run preview` - Preview production build
- `npm run preview:gh-pages` - Preview GitHub Pages build

See [DUAL_BUILD_GUIDE.md](./DUAL_BUILD_GUIDE.md) for deployment details.

## Project Structure

```
logia/
├── components/     # Reusable HTML components
├── css/           # Stylesheets
├── js/            # JavaScript modules
│   └── lazy/      # Lazy-loaded modules
├── utils/         # Utility functions
├── config/        # Configuration (app, build, plugins)
├── assets/        # Static assets (images, fonts)
├── docs/          # Documentation
├── dist/          # Production build output
└── dist-gh-pages/ # GitHub Pages build output
```

## Key Technologies

- **Vite** - Build tool and dev server
- **Alpine.js** - Reactive components
- **ES6 Modules** - Modern JavaScript
- **Formspree** - Form backend

## Development Workflow

### Making Changes

1. **HTML**: Edit files in root directory
2. **CSS**: Edit in `css/` directory (use CSS variables from `style.css`)
3. **JavaScript**: 
   - Main logic: `js/main.js`
   - Components: `js/components.js`
   - Utilities: `utils/` folder
   - Config: `config/app.config.js`

### Hot Reload

Vite automatically reloads when you change HTML, CSS, or JavaScript files.

### Adding Features

- **Utility Function**: Add to `utils/` folder
- **Component**: Add HTML to `components/`, load via `components.js`
- **Alpine Component**: Add to `js/alpine-setup.js`
- **Configuration**: Add to `config/app.config.js`

## Code Patterns

### ES6 Modules
```javascript
import { $, $$ } from '../utils/dom.js';
import { debounce } from '../utils/performance.js';
```

### Alpine.js
```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

### Initialization Pattern
```javascript
if (element.dataset.initialized === 'true') return;
element.dataset.initialized = 'true';
// Initialize...
```

## Configuration

- **App Config**: `config/app.config.js` - Application settings
- **Build Config**: `config/build-config.js` - Build target URLs and paths
- **Vite Config**: `vite.config.js` - Build system configuration

## Troubleshooting

### Build Errors
- Check Node.js version (v16+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Verify all HTML files exist in root

### Module Import Errors
- Use relative paths with `.js` extension
- Ensure `type="module"` on script tags
- Check file paths are correct

### GitHub Pages Issues
- Verify `basePath` in `config/build-config.js` matches repo structure
- Check GitHub Actions workflow (`.github/workflows/static.yml`)

## Documentation

See [docs/README.md](./README.md) for complete documentation index.

---

**Last Updated**: January 2025
