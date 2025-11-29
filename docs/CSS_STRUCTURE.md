# CSS Structure Reference Guide

**Last Updated**: January 2025  
**Status**: ✅ Fully Modularized

---

## Overview

The CSS architecture has been reorganized into a modular, maintainable structure. All styles are organized by purpose and scope, making it easy to find, update, and maintain styles.

---

## Directory Structure

```
css/
├── core/               # Foundation styles (loads first)
│   ├── variables.css   # Design tokens - colors, spacing, typography, shadows, etc.
│   ├── reset.css       # CSS reset, base element styles, skip links
│   ├── typography.css  # Heading styles, paragraph styles, text utilities
│   └── utilities.css   # Layout utilities, AOS animations, print styles
│
├── components/         # Reusable UI components
│   ├── buttons.css     # Button styles and variants
│   ├── cards.css       # Generic card patterns
│   ├── forms.css       # Form elements and validation states
│   ├── carousel.css    # Shared carousel component (testimonials, instagram)
│   └── floating-buttons.css # Scroll-to-top and WhatsApp floating buttons
│
├── layout/            # Structural layout components
│   ├── container.css  # Container and section utilities
│   ├── navbar.css     # Navigation bar, logo, menu, dropdowns, theme toggle
│   ├── hero.css       # Hero section with background and animations
│   ├── page-header.css # Shared page header styles
│   └── footer.css     # Footer component
│
├── sections/          # Homepage sections
│   ├── _section-header.css # Shared section header styles
│   ├── services.css   # Services section
│   ├── why-choose.css # Why Choose Us section
│   ├── portfolio-preview.css # Portfolio preview section
│   ├── testimonials.css # Testimonials section (uses carousel component)
│   ├── instagram.css  # Instagram feed section (uses carousel component)
│   └── cta.css        # Call-to-action section
│
├── pages/             # Page-specific styles
│   ├── about.css      # About page
│   ├── contact.css    # Contact page
│   ├── services.css   # Services page
│   ├── portfolio.css  # Portfolio page
│   ├── legal.css      # Legal pages (Privacy Policy, Terms of Service)
│   ├── speedtest.css  # Speed test page
│   └── resources.css  # Resources/FAQ page
│
├── responsive/        # Responsive adjustments (loads last)
│   ├── mobile.css     # Mobile breakpoints (≤768px, ≤480px)
│   ├── tablet.css     # Tablet breakpoints (769px-1024px)
│   └── desktop.css    # Desktop optimizations
│
├── fonts/            # Font definitions
│   ├── inter-fonts.css # Inter font @font-face declarations
│   └── fontawesome-local.css # Font Awesome styles (auto-generated)
│
└── style.css         # Main entry point - imports all modules
```

---

## Import Order

The `style.css` file imports modules in this specific order:

1. **Core Foundation** - Variables, reset, typography, utilities
2. **Layout** - Container, navbar, hero, page-header, footer
3. **Components** - Buttons, cards, forms, carousel, floating buttons
4. **Sections** - Homepage sections
5. **Responsive** - Mobile, tablet, desktop adjustments

This order ensures proper cascade and dependency resolution.

---

## Finding Styles

### Quick Reference

| What you're looking for | Where to find it |
|------------------------|------------------|
| Colors, spacing, design tokens | `core/variables.css` |
| CSS reset, base element styles | `core/reset.css` |
| Heading styles, text utilities | `core/typography.css` |
| Utility classes, print styles | `core/utilities.css` |
| Button styles | `components/buttons.css` |
| Card patterns | `components/cards.css` |
| Form styles | `components/forms.css` |
| Carousel component | `components/carousel.css` |
| Scroll-to-top, WhatsApp buttons | `components/floating-buttons.css` |
| Navigation bar | `layout/navbar.css` |
| Footer | `layout/footer.css` |
| Hero section | `layout/hero.css` |
| Page headers | `layout/page-header.css` |
| Services section | `sections/services.css` |
| Testimonials | `sections/testimonials.css` |
| Instagram feed | `sections/instagram.css` |
| About page styles | `pages/about.css` |
| Contact page styles | `pages/contact.css` |
| Mobile responsive | `responsive/mobile.css` |
| Tablet responsive | `responsive/tablet.css` |

---

## HTML Import Pattern

### Fonts (All Pages)
```html
<!-- Self-hosted Fonts -->
<link rel="stylesheet" href="css/fonts/inter-fonts.css">
<link rel="stylesheet" href="css/fonts/fontawesome-local.css">
```

### Main Stylesheet (All Pages)
```html
<link rel="stylesheet" href="css/style.css">
```

### Page-Specific Styles (Individual Pages)
```html
<!-- Example: About page -->
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/pages/about.css">
```

---

## Component Dependencies

```
style.css
├── core/
│   ├── variables.css (no dependencies)
│   ├── reset.css (depends on variables)
│   ├── typography.css (depends on variables)
│   └── utilities.css (depends on variables)
│
├── components/
│   ├── buttons.css (depends on core)
│   ├── cards.css (depends on core)
│   ├── forms.css (depends on core)
│   ├── carousel.css (depends on core, buttons)
│   └── floating-buttons.css (depends on core, buttons)
│
├── layout/
│   ├── container.css (depends on core)
│   ├── navbar.css (depends on core, buttons)
│   ├── hero.css (depends on core, buttons)
│   ├── page-header.css (depends on core)
│   └── footer.css (depends on core)
│
├── sections/
│   ├── services.css (depends on core, components/cards)
│   ├── why-choose.css (depends on core, components/cards)
│   ├── portfolio-preview.css (depends on core, components/cards)
│   ├── testimonials.css (depends on core, components/carousel, components/cards)
│   ├── instagram.css (depends on core, components/carousel, components/cards)
│   └── cta.css (depends on core, buttons)
│
└── responsive/
    ├── mobile.css (depends on all above)
    ├── tablet.css (depends on all above)
    └── desktop.css (depends on all above)
```

---

## File Size Comparison

### Before Migration
- Largest file: `sections.css` (1,441 lines)
- Average file: ~300 lines
- Total files: 17

### After Migration
- Largest file: ~400 lines (estimated)
- Average file: ~150 lines
- Total files: ~35 (better organized)

**Benefits:**
- ✅ Easier to navigate
- ✅ Clearer component boundaries
- ✅ Better maintainability
- ✅ Reduced cognitive load

---

## Adding New Styles

### Adding a New Component
1. Create file in `components/` directory
2. Add import to `style.css` in Components section
3. Use CSS variables from `core/variables.css`
4. Follow BEM-inspired naming conventions

### Adding a New Page
1. Create file in `pages/` directory
2. Import in HTML: `<link rel="stylesheet" href="css/pages/[page-name].css">`
3. Use shared components and layout styles
4. Keep page-specific styles minimal

### Adding a New Section
1. Create file in `sections/` directory
2. Add import to `style.css` in Sections section
3. Use shared section header from `sections/_section-header.css`
4. Reuse components where possible

---

## Best Practices

1. **Always use CSS variables** - Never hardcode colors, spacing, or other design tokens
2. **Follow import order** - Don't change the import order in `style.css` without understanding dependencies
3. **Keep files focused** - Each file should have a single, clear purpose
4. **Reuse components** - Use existing components before creating new ones
5. **Mobile-first** - Write mobile styles first, then use media queries for larger screens
6. **Dark mode support** - Always include dark mode variants using `body.dark-mode` selector

## Font Paths

**Important**: Font CSS files are in `css/fonts/`, so `@font-face` URLs must use `../../assets/fonts/...` to correctly resolve to the font files:
- From `css/fonts/inter-fonts.css` → `../../assets/fonts/inter/...`
- From `css/fonts/fontawesome-local.css` → `../../assets/fonts/fontawesome/...`

---

**Last Updated**: January 2025  
**Status**: ✅ Fully Modularized

