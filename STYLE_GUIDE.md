# Logia Genesis - Style Guide

**Comprehensive design system documentation for Logia Genesis website**

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Components](#components)
5. [Design Conventions](#design-conventions)
6. [Accessibility](#accessibility)
7. [Dark Mode](#dark-mode)
8. [Light Mode](#light-mode)

---

## Color Palette

### Primary Colors

The primary color palette establishes the brand identity and is used for key UI elements.

#### Primary Blue
- **Primary**: `#0A2463` (Deep Navy Blue)
  - Usage: Main brand color, buttons, links, headings
  - RGB: `rgb(10, 36, 99)`
  - HSL: `hsl(225, 81%, 21%)`
  
- **Primary Light**: `#1E3A8A` (Medium Blue)
  - Usage: Hover states, gradients, secondary elements
  - RGB: `rgb(30, 58, 138)`
  - HSL: `hsl(225, 64%, 33%)`
  
- **Primary Dark**: `#061741` (Very Dark Blue)
  - Usage: Darker variants, depth effects
  - RGB: `rgb(6, 23, 65)`
  - HSL: `hsl(225, 83%, 14%)`

#### Accent Colors

- **Accent Cyan**: `#00D9FF` (Bright Cyan)
  - Usage: CTAs, highlights, interactive elements, links
  - RGB: `rgb(0, 217, 255)`
  - HSL: `hsl(189, 100%, 50%)`
  - Contrast: Excellent on dark backgrounds
  
- **Accent Hover**: `#00B8DB` (Darker Cyan)
  - Usage: Hover states for accent elements
  - RGB: `rgb(0, 184, 219)`
  - HSL: `hsl(189, 100%, 43%)`
  
- **Accent Glow**: `rgba(0, 217, 255, 0.4)` (Semi-transparent Cyan)
  - Usage: Glow effects, shadows, highlights
  - RGB: `rgba(0, 217, 255, 0.4)`

### Neutral Colors

A comprehensive gray scale for text, backgrounds, and UI elements.

#### Light Mode Neutrals
- **White**: `#FFFFFF` - Primary background
- **Gray-50**: `#F8FAFC` - Surface backgrounds
- **Gray-100**: `#F1F5F9` - Subtle backgrounds
- **Gray-200**: `#E2E8F0` - Borders, dividers
- **Gray-300**: `#CBD5E1` - Disabled states
- **Gray-400**: `#94A3B8` - Placeholder text
- **Gray-500**: `#64748B` - Secondary text
- **Gray-600**: `#475569` - Muted text
- **Gray-700**: `#334155` - Body text (dark mode)
- **Gray-800**: `#1E293B` - Headings (dark mode)
- **Gray-900**: `#0F172A` - Primary text (light mode)

#### Dark Mode Neutrals
- **Dark Background**: `#000000` - Pure black background
- **Dark Surface**: `#0F172A` - Card/surface backgrounds
- **Dark Border**: `rgba(255, 255, 255, 0.1)` - Subtle borders

### Color Usage Guidelines

#### Light Mode
- **Background**: White (`#FFFFFF`)
- **Surface**: Gray-50 (`#F8FAFC`)
- **Primary Text**: Gray-900 (`#0F172A`)
- **Muted Text**: Gray-600 (`#475569`)
- **Borders**: Gray-200 (`#E2E8F0`)

#### Dark Mode
- **Background**: Black (`#000000`)
- **Surface**: Dark Surface (`#0F172A`)
- **Primary Text**: Gray-100 (`#F1F5F9`)
- **Muted Text**: Gray-400 (`#94A3B8`)
- **Borders**: Dark Border (`rgba(255, 255, 255, 0.1)`)

---

## Typography

### Font Family

**Primary Font**: Inter
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Usage: All text content
- Characteristics: Modern, clean, highly legible

### Type Scale

The typography system uses a fluid scale with clamp() for responsive sizing.

#### Headings
- **H1**: `clamp(2.5rem, 5vw, 4rem)` - 40px to 64px
  - Usage: Hero titles, page headers
  - Weight: 700-900
  - Line height: 1.1-1.2
  
- **H2**: `clamp(2rem, 4vw, 3rem)` - 32px to 48px
  - Usage: Section titles
  - Weight: 700
  - Line height: 1.2
  
- **H3**: `clamp(1.5rem, 3vw, 2rem)` - 24px to 32px
  - Usage: Subsection titles, card titles
  - Weight: 700
  - Line height: 1.2
  
- **H4**: `clamp(1.25rem, 2.5vw, 1.5rem)` - 20px to 24px
  - Usage: Component titles
  - Weight: 600-700
  - Line height: 1.3

#### Body Text
- **Base**: `1rem` (16px)
  - Line height: 1.6
  - Weight: 400
  
- **Large**: `1.125rem` (18px)
  - Usage: Emphasized body text
  
- **Small**: `0.875rem` (14px)
  - Usage: Captions, metadata

### Typography Conventions

- **Letter Spacing**: `-0.02em` for headings (tighter)
- **Font Smoothing**: Antialiased for better rendering
- **Text Shadows**: Used sparingly for contrast on gradient backgrounds

---

## Spacing System

### 8px Grid System

All spacing follows an 8px base grid for visual consistency.

| Variable | Value | Pixels | Usage |
|----------|-------|--------|-------|
| `--space-1` | 0.25rem | 4px | Minimal spacing |
| `--space-2` | 0.5rem | 8px | Tight spacing |
| `--space-3` | 0.75rem | 12px | Compact spacing |
| `--space-4` | 1rem | 16px | Base spacing |
| `--space-5` | 1.25rem | 20px | Medium spacing |
| `--space-6` | 1.5rem | 24px | Standard spacing |
| `--space-8` | 2rem | 32px | Large spacing |
| `--space-10` | 2.5rem | 40px | Extra large spacing |
| `--space-12` | 3rem | 48px | Section spacing |
| `--space-16` | 4rem | 64px | Major spacing |
| `--space-20` | 5rem | 80px | Hero spacing |
| `--space-24` | 6rem | 96px | Maximum spacing |

### Spacing Guidelines

- Use spacing variables consistently
- Maintain 8px grid alignment
- Section padding: `var(--space-20)` (80px)
- Container padding: `var(--space-6)` (24px)

---

## Components

### Buttons

#### Primary Button
- **Background**: Gradient (Primary → Primary Light)
- **Color**: White
- **Padding**: `0.875rem 2rem`
- **Border Radius**: `var(--radius-md)`
- **Hover**: Lift effect with glow shadow

#### Outline Button
- **Background**: Transparent
- **Color**: Primary
- **Border**: 2px solid Primary
- **Hover**: Fill with Primary, text becomes White

#### Button Sizes
- **Default**: `0.875rem 2rem`
- **Large (btn-lg)**: `1.125rem 2.5rem`

### Cards

#### Service Card
- **Background**: White (light) / Dark Surface (dark)
- **Border**: 1px solid Border color
- **Border Radius**: `var(--radius-lg)`
- **Padding**: `var(--space-6)`
- **Hover**: 3D tilt effect, shadow elevation

#### Testimonial Card
- Similar structure to service cards
- Special styling for quote content

### Navigation

#### Navbar
- **Background**: `rgba(255, 255, 255, 0.95)` (light) / `rgba(15, 23, 42, 0.95)` (dark)
- **Backdrop Filter**: Blur(12px)
- **Border**: Bottom border with Border color
- **Scrolled State**: Adds shadow

#### Nav Links
- **Default**: Muted text color
- **Active**: Primary color (light) / Accent (dark)
- **Hover**: Accent color

---

## Design Conventions

### Border Radius

| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-sm` | 0.375rem (6px) | Small elements |
| `--radius-md` | 0.5rem (8px) | Buttons, inputs |
| `--radius-lg` | 0.75rem (12px) | Cards |
| `--radius-xl` | 1rem (16px) | Large cards |
| `--radius-full` | 9999px | Pills, circles |

### Shadows

| Variable | Usage |
|----------|-------|
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Standard cards |
| `--shadow-lg` | Elevated cards |
| `--shadow-xl` | Modal, overlays |
| `--shadow-glow` | Accent highlights |

### Transitions

| Variable | Duration | Usage |
|----------|----------|-------|
| `--transition-fast` | 150ms | Hover states |
| `--transition-base` | 300ms | Standard transitions |
| `--transition-slow` | 500ms | Theme changes |

---

## Accessibility

### Contrast Ratios (WCAG AA Compliance)

#### Light Mode
- **Primary Text (Gray-900) on White**: 15.8:1 ✅ (AAA)
- **Muted Text (Gray-600) on White**: 7.0:1 ✅ (AAA)
- **Primary Button on Gradient**: 4.5:1+ ✅ (AA)
- **Accent (Cyan) on White**: 2.8:1 ⚠️ (Needs improvement)
- **Primary on White**: 8.6:1 ✅ (AAA)

#### Dark Mode
- **Primary Text (Gray-100) on Black**: 15.8:1 ✅ (AAA)
- **Muted Text (Gray-400) on Dark Surface**: 7.5:1 ✅ (AAA)
- **Accent (Cyan) on Dark Surface**: 3.2:1 ⚠️ (Needs improvement)
- **White on Primary**: 4.5:1+ ✅ (AA)

### Accessibility Guidelines

1. **Minimum Contrast**: 4.5:1 for normal text, 3:1 for large text
2. **Focus States**: Visible focus indicators on all interactive elements
3. **Keyboard Navigation**: All interactive elements accessible via keyboard
4. **ARIA Labels**: Used on icon-only buttons and complex components
5. **Semantic HTML**: Proper heading hierarchy and landmark elements

---

## Dark Mode

### Color Mapping

Dark mode uses inverted color relationships while maintaining brand identity.

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | White (#FFFFFF) | Black (#000000) |
| Surface | Gray-50 (#F8FAFC) | Dark Surface (#0F172A) |
| Primary Text | Gray-900 (#0F172A) | Gray-100 (#F1F5F9) |
| Muted Text | Gray-600 (#475569) | Gray-400 (#94A3B8) |
| Border | Gray-200 (#E2E8F0) | rgba(255,255,255,0.1) |
| Cards | White | Dark Surface |
| Navbar | White (95% opacity) | Dark Surface (95% opacity) |

### Dark Mode Specific Adjustments

- **Gradient Mesh**: Increased opacity (1.0 vs 0.95)
- **Nav Links**: Use Accent color for active/hover states
- **Service Links**: Accent color instead of Primary
- **Borders**: Subtle white borders with low opacity

### Implementation

Dark mode is toggled via:
- JavaScript: `document.body.classList.toggle('dark-mode')`
- Persisted in localStorage
- Smooth transitions between modes

---

## Light Mode

### Color Mapping

Light mode is the default theme with high contrast and clarity.

| Element | Color | Usage |
|---------|-------|-------|
| Background | White | Main page background |
| Surface | Gray-50 | Card backgrounds, sections |
| Primary Text | Gray-900 | Headings, body text |
| Muted Text | Gray-600 | Secondary text, descriptions |
| Border | Gray-200 | Card borders, dividers |
| Cards | White | All card components |
| Navbar | White (95% opacity) | Navigation bar |

### Light Mode Specific Features

- High contrast for readability
- Clean, minimal aesthetic
- Primary blue for brand elements
- Accent cyan for highlights and CTAs

---

## Usage Examples

### Applying Colors

```css
/* Use CSS variables */
.my-element {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* Dark mode specific */
body.dark-mode .my-element {
  background: var(--color-dark-surface);
}
```

### Typography

```css
.heading {
  font-family: var(--font-primary);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text);
}
```

### Spacing

```css
.card {
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  gap: var(--space-4);
}
```

---

## Best Practices

1. **Always use CSS variables** - Never hardcode colors or spacing
2. **Test both modes** - Ensure all components work in light and dark mode
3. **Check contrast** - Verify text is readable on all backgrounds
4. **Maintain consistency** - Use the spacing system and design tokens
5. **Smooth transitions** - Add transitions for theme changes
6. **Accessibility first** - Ensure WCAG AA compliance minimum

---

## Version History

- **v1.0** - Initial style guide documentation
- Created: 2024
- Last Updated: 2024

---

**Note**: This style guide should be referenced when creating new components or modifying existing ones to maintain design consistency across the Logia Genesis website.

