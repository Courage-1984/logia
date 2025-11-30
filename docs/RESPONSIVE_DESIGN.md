# Responsive Design Guide - Logia Genesis

**Mobile-first responsive design documentation**

---

## Overview

The website uses a **mobile-first responsive design** approach, ensuring optimal viewing experiences across all device sizes.

### Design Philosophy

- **Mobile-First**: Base styles target mobile devices, then enhanced for larger screens
- **Fluid Typography**: Text scales smoothly using `clamp()` for readability
- **Flexible Grids**: CSS Grid and Flexbox adapt to available space
- **Touch-Friendly**: Interactive elements sized appropriately for touch interfaces
- **Performance**: Optimized images and assets for different screen sizes

---

## Breakpoint System

| Breakpoint | Width | Device Type | Usage |
|------------|-------|-------------|-------|
| **Small Mobile** | `≤ 480px` | Small phones | Compact layouts, single column |
| **Mobile** | `≤ 768px` | Phones, small tablets | Mobile navigation, stacked layouts |
| **Tablet** | `≤ 1024px` | Tablets, small laptops | Adjusted grid columns |
| **Desktop** | `> 1024px` | Desktop, large screens | Full multi-column layouts |

### Implementation Pattern

```css
/* Mobile First - Base styles (no media query) */
.component {
  /* Mobile styles */
}

/* Tablet and up */
@media (min-width: 769px) {
  .component {
    /* Tablet styles */
  }
}

/* Desktop and up */
@media (min-width: 1025px) {
  .component {
    /* Desktop styles */
  }
}
```

---

## Mobile-First Approach

### Principles

1. **Start Small**: Design for mobile screens first
2. **Progressive Enhancement**: Add features and complexity for larger screens
3. **Performance**: Optimize for mobile data constraints
4. **Touch Targets**: Minimum 44x44px for interactive elements

### Base Styles (Mobile)

```css
.container {
  width: 100%;
  padding: 0 var(--space-4);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}
```

### Enhanced Styles (Larger Screens)

```css
@media (min-width: 769px) {
  .container {
    padding: 0 var(--space-6);
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
}
```

---

## Component Responsiveness

### Navigation

- **Desktop**: Horizontal menu bar, dropdown menus on hover
- **Mobile**: Hamburger menu toggle, full-screen overlay menu, stacked navigation links

### Hero Section

- **Mobile**: Full viewport height, centered content, stacked CTAs
- **Tablet**: Adjusted padding, side-by-side CTAs
- **Desktop**: Maximum content width, optimal spacing

### Service Cards Grid

- **Mobile**: Single column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

### Footer

- **Mobile**: Single column, stacked sections
- **Tablet**: 2 columns
- **Desktop**: 4 columns

---

## Typography Scaling

### Fluid Typography

Use `clamp()` for responsive text that scales smoothly:

```css
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  /* Minimum: 2rem (32px)
     Preferred: 5vw (5% of viewport width)
     Maximum: 4rem (64px) */
}

h2 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}

p {
  font-size: clamp(0.875rem, 2vw, 1rem);
}
```

### Typography Scale by Breakpoint

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1 | 2rem | 3rem | 4rem |
| H2 | 1.5rem | 2rem | 3rem |
| H3 | 1.25rem | 1.5rem | 2rem |
| Body | 0.875rem | 0.9375rem | 1rem |

---

## Layout Patterns

### Container

```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4); /* Mobile */
}

@media (min-width: 769px) {
  .container {
    padding: 0 var(--space-6); /* Tablet */
  }
}

@media (min-width: 1025px) {
  .container {
    padding: 0 var(--space-8); /* Desktop */
  }
}
```

### Auto-Fit Grid

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}
```

### Flexbox Patterns

```css
.flex-row {
  display: flex;
  flex-direction: column; /* Mobile: stack */
  gap: var(--space-4);
}

@media (min-width: 769px) {
  .flex-row {
    flex-direction: row; /* Tablet+: side by side */
  }
}
```

---

## Images & Media

### Responsive Images

```html
<picture>
  <source srcset="image-small.webp 480w, image-medium.webp 768w, image-large.webp 1024w" type="image/webp">
  <img 
    src="image.jpg" 
    srcset="image-small.jpg 480w, image-medium.jpg 768w, image-large.jpg 1024w"
    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
    alt="Description"
    loading="lazy"
  >
</picture>
```

### Aspect Ratios

```css
.aspect-16-9 {
  aspect-ratio: 16 / 9;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}
```

---

## Forms

### Responsive Form Layout

```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: single column */
  gap: var(--space-4);
}

@media (min-width: 769px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet+: two columns */
  }
}
```

### Form Inputs

- Full width on mobile
- Appropriate sizing for touch (minimum 44px height)
- Proper spacing between fields

---

## Testing Guidelines

### Device Testing

Test on actual devices when possible:
- **Mobile**: iPhone, Android phones, small tablets
- **Tablet**: iPad, Android tablets, small laptops
- **Desktop**: 1366x768, 1920x1080, 2560x1440, 3840x2160

### Browser Testing

Test in:
- Chrome (mobile & desktop)
- Firefox (mobile & desktop)
- Safari (iOS & macOS)
- Edge

### Testing Checklist

- [ ] Navigation works on all screen sizes
- [ ] Text is readable (no horizontal scrolling)
- [ ] Images scale properly
- [ ] Forms are usable on mobile
- [ ] Buttons are touch-friendly (min 44x44px)
- [ ] No content overflow
- [ ] Dark mode works on all breakpoints
- [ ] Animations are smooth

### Tools

- **Chrome DevTools**: Device emulation
- **BrowserStack**: Cross-browser testing
- **Responsive Design Mode**: Firefox DevTools
- **Lighthouse**: Performance and accessibility

---

## Best Practices

1. **Use Relative Units**: Prefer `rem`, `em`, `%`, and `vw/vh` over fixed pixels
2. **Flexible Grids**: Use CSS Grid with `auto-fit` and `minmax()`
3. **Touch Targets**: Ensure interactive elements are at least 44x44px
4. **Avoid Horizontal Scroll**: Never allow horizontal scrolling
5. **Test in Multiple Orientations**: Portrait (mobile) and Landscape (tablet/desktop)
6. **Performance**: Optimize images for different screen sizes, use `srcset` and `sizes`, lazy load below-the-fold content

---

## Common Issues & Solutions

### Text Too Small on Mobile

```css
p {
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.6;
}
```

### Images Overflowing Container

```css
img {
  max-width: 100%;
  height: auto;
}
```

### Buttons Too Small for Touch

```css
button {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-3) var(--space-6);
}
```

### Grid Items Too Narrow

```css
.grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

---

**Last Updated**: January 2025
