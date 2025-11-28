# CSS Class Naming Conventions

This document outlines the CSS class naming conventions used in the Logia Genesis project.

## Naming Pattern

We use a **BEM-inspired** (Block Element Modifier) naming convention with some modifications for clarity and maintainability.

### Pattern Structure

```
[block]__[element]--[modifier]
```

## Naming Rules

### 1. Blocks
- **Definition**: A standalone component or section
- **Naming**: Use kebab-case (lowercase with hyphens)
- **Examples**: 
  - `.hero`
  - `.navbar`
  - `.service-card`
  - `.testimonial-card`

### 2. Elements
- **Definition**: Parts of a block that have no standalone meaning
- **Naming**: Use double underscore `__` to separate from block
- **Examples**:
  - `.hero__title`
  - `.navbar__link`
  - `.service-card__icon`
  - `.testimonial-card__author`

### 3. Modifiers
- **Definition**: Variations or states of a block or element
- **Naming**: Use double hyphen `--` to separate from block/element
- **Examples**:
  - `.btn--primary`
  - `.btn--outline`
  - `.navbar--scrolled`
  - `.card--active`

### 4. States
- **Definition**: Dynamic states applied via JavaScript
- **Naming**: Use single hyphen for state classes
- **Examples**:
  - `.active`
  - `.visible`
  - `.scrolled`
  - `.dark-mode`
  - `.menu-open`

## Common Patterns

### Buttons
```css
.btn              /* Base button */
.btn--primary     /* Primary button variant */
.btn--outline     /* Outline button variant */
.btn--lg          /* Large button size */
.btn--sm          /* Small button size */
```

### Cards
```css
.card             /* Base card */
.service-card     /* Service card block */
.service-card__icon
.service-card__title
.service-card__description
```

### Navigation
```css
.navbar           /* Navigation bar */
.navbar--scrolled /* Scrolled state */
.nav-link         /* Navigation link */
.nav-link.active  /* Active navigation link */
```

### Sections
```css
.section          /* Base section */
.section-header   /* Section header container */
.section-title    /* Section title */
.section-description
```

### Layout
```css
.container        /* Main container */
.grid             /* Grid layout */
.flex             /* Flexbox layout */
```

## Utility Classes

### Spacing
- `.mb-1` through `.mb-12` - Margin bottom
- `.mt-1` through `.mt-12` - Margin top
- `.p-1` through `.p-12` - Padding

### Text
- `.text-center` - Center align text
- `.text-left` - Left align text
- `.text-right` - Right align text
- `.gradient-text` - Gradient text effect

### Display
- `.hidden` - Hide element
- `.visible` - Show element
- `.flex` - Display flex
- `.grid` - Display grid

## CSS Variables

All design tokens are defined in `css/style.css` using CSS custom properties:

### Color Variables
```css
--color-primary
--color-primary-light
--color-primary-dark
--color-accent
--color-accent-hover
--color-gray-50 through --color-gray-900
```

### Spacing Variables
```css
--space-1 through --space-12
```

### Typography Variables
```css
--font-primary
```

## Best Practices

1. **Use semantic class names** that describe purpose, not appearance
2. **Keep classes scoped** to their component when possible
3. **Use CSS variables** for values that might change (colors, spacing, etc.)
4. **Avoid inline styles** except for dynamic JavaScript-generated styles
5. **Follow the naming pattern** consistently across the project
6. **Document complex selectors** with comments

## Examples

### Good ✅
```css
.service-card {
  /* Service card block */
}

.service-card__icon {
  /* Icon element within service card */
}

.service-card--featured {
  /* Featured modifier for service card */
}

.nav-link.active {
  /* Active state for navigation link */
}
```

### Bad ❌
```css
.red-box {
  /* Too specific, not semantic */
}

.cardIcon {
  /* Inconsistent naming, should use __ */
}

.card.active-state {
  /* Should use .card.active */
}
```

## Component-Specific Styles

Each page has its own CSS file for page-specific styles:
- `about.css` - About page styles
- `contact.css` - Contact page styles
- `portfolio.css` - Portfolio page styles
- `resources.css` - Resources/FAQ page styles
- `services.css` - Services page styles
- `speedtest.css` - Speed test page styles

These files should follow the same naming conventions as the main stylesheet.

