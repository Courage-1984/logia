# Setup Guide - Logia Genesis

This guide will help you set up and work with the enhanced Logia Genesis project.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Vite (build tool)
- Alpine.js (reactive components)

### 2. Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:3000` with hot module replacement enabled.

### 3. Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 4. Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure Overview

### New Folders

- **`utils/`** - Utility functions organized by purpose:
  - `dom.js` - DOM manipulation helpers
  - `performance.js` - Performance utilities (debounce, throttle)
  - `validation.js` - Form validation functions
  - `index.js` - Centralized exports

- **`config/`** - Configuration files:
  - `app.config.js` - Application-wide settings

- **`assets/`** - Static assets:
  - `images/` - Image files
  - `fonts/` - Font files

- **`public/`** - Public assets served by Vite

- **`dist/`** - Build output (generated, not committed)

## Key Changes

### 1. ES6 Modules

All JavaScript files now use ES6 module syntax:

```javascript
import { $, $$ } from '../utils/dom.js';
import { debounce, throttle } from '../utils/performance.js';
```

### 2. Alpine.js Integration

Alpine.js is available for reactive components. See `js/alpine-setup.js` for examples.

Usage in HTML:
```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

### 3. Configuration

Application settings are centralized in `config/app.config.js`:

```javascript
import { appConfig } from '../config/app.config.js';
```

### 4. Utility Functions

Use utility functions from the `utils/` folder:

```javascript
import { $, $$, waitForElement } from '../utils/dom.js';
import { debounce, throttle } from '../utils/performance.js';
import { validateEmail, validatePhone } from '../utils/validation.js';
```

## Development Workflow

### Making Changes

1. **HTML Files**: Edit directly in the root directory
2. **CSS Files**: Edit in `css/` directory
3. **JavaScript Files**: 
   - Main logic: `js/main.js`
   - Components: `js/components.js`
   - Alpine setup: `js/alpine-setup.js`
   - Utilities: `utils/` folder

### Hot Reload

Vite automatically reloads the page when you make changes to:
- HTML files
- CSS files
- JavaScript files

### Adding New Features

1. **New Utility Function**: Add to appropriate file in `utils/`
2. **New Configuration**: Add to `config/app.config.js`
3. **New Component**: Add HTML to `components/` and load via `components.js`
4. **Alpine Component**: Add data/function to `js/alpine-setup.js`

## CSS Conventions

See `CSS_CONVENTIONS.md` (in this folder) for detailed naming conventions.

Quick reference:
- Blocks: `.hero`, `.navbar`, `.service-card`
- Elements: `.hero__title`, `.navbar__link`
- Modifiers: `.btn--primary`, `.card--active`
- States: `.active`, `.visible`, `.scrolled`

## Documentation

All documentation is in the `docs/` folder:

- **README.md** (root) - Project overview and quick start
- **ARCHITECTURE.md** - Detailed architecture documentation
- **CSS_CONVENTIONS.md** - CSS naming conventions
- **SETUP_GUIDE.md** - This file
- **IMAGE_GUIDE.md** - Complete image guide (optimization, implementation, best practices)
- **STYLE_GUIDE.md** - Style guide
- **RESPONSIVE_DESIGN.md** - Responsive design documentation

## Troubleshooting

### Module Import Errors

If you see import errors, ensure:
1. All imports use relative paths with `.js` extension
2. Files are using ES6 module syntax (`import`/`export`)
3. HTML files use `type="module"` on script tags

### Build Errors

If the build fails:
1. Check that all dependencies are installed: `npm install`
2. Verify Node.js version is 16 or higher
3. Check `vite.config.js` for configuration issues

### Alpine.js Not Working

Ensure:
1. Alpine.js is imported in `js/alpine-setup.js`
2. `alpine-setup.js` is loaded in HTML files
3. Alpine directives use correct syntax (`x-data`, `x-show`, etc.)

## Next Steps

1. Review the architecture documentation
2. Familiarize yourself with the utility functions
3. Check out the CSS conventions
4. Start developing!

For questions or issues, refer to the documentation files or the code comments.

