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
│   ├── CSS_CONVENTIONS.md  # CSS naming conventions
│   └── *.css           # Page-specific styles
├── js/                 # JavaScript modules
│   ├── components.js   # Component loader
│   ├── main.js         # Main application logic
│   └── alpine-setup.js # Alpine.js configuration
├── utils/              # Utility functions
│   ├── dom.js          # DOM manipulation helpers
│   ├── performance.js  # Performance utilities
│   ├── validation.js   # Form validation
│   └── index.js        # Utility exports
├── config/             # Configuration files
│   └── app.config.js   # Application configuration
├── assets/             # Static assets
│   ├── images/         # Image files
│   └── fonts/          # Font files
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
- Font Awesome Icons
- Google Fonts (Inter)

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about the project structure and design decisions.

## License

© 2024 Logia Genesis. All rights reserved.
