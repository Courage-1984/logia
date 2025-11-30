# Accessibility Testing Guide

**Comprehensive guide for running accessibility tests on the Logia Genesis website**

---

## Overview

The project includes three accessibility testing tools to ensure WCAG compliance:

1. **axe-core** - Automated accessibility testing library
2. **pa11y** - Command-line accessibility testing tool
3. **HTML Contrast Checker** - Custom tool for checking text contrast ratios

---

## Quick Start

### Run All Accessibility Tests

```bash
npm run accessibility:all
```

This runs all three tools in sequence:
1. Contrast checker
2. Axe-core audit
3. Pa11y audit

### Run Individual Tests

```bash
# Contrast ratio checker
npm run accessibility:contrast

# Axe-core audit
npm run accessibility:axe

# Pa11y audit
npm run accessibility:pa11y
```

---

## Tools

### 1. Axe-Core

**What it does**: Automated accessibility testing using the axe-core library. Tests against WCAG 2.0 Level A, Level AA, and best practices.

**Usage**:
```bash
# Test built files
npm run accessibility:axe dist/index.html
# Note: Pages use clean URLs (/about, /contact) but built files still have .html extensions

# Test local development server
npm run accessibility:axe http://localhost:3000

# Test specific page
npm run accessibility:axe dist/about.html
```

**What it checks**:
- ARIA attributes
- Color contrast (basic)
- Form labels
- Heading hierarchy
- Image alt text
- Keyboard navigation
- Landmark regions
- Link purpose
- And 50+ other accessibility rules

**Output**: Lists violations, passes, incomplete checks, and inapplicable rules.

**Exit code**: 
- `0` if no violations found
- `1` if violations found

---

### 2. Pa11y

**What it does**: Command-line tool that uses headless Chrome to test actual rendered pages. More comprehensive than static HTML analysis.

**Usage**:
```bash
# Test local development server
npm run accessibility:pa11y http://localhost:3000

# Test specific page
npm run accessibility:pa11y http://localhost:3000/about.html

# Test production URL
npm run accessibility:pa11y https://www.logia.co.za
```

**Configuration**: See `.pa11yrc.json` for default settings.

**What it checks**:
- WCAG 2.0 Level AA compliance
- Color contrast ratios
- Form labels and validation
- Heading structure
- Image alt attributes
- Link accessibility
- Keyboard navigation
- Screen reader compatibility
- And more

**Output**: Categorizes issues as:
- **Errors** (must fix)
- **Warnings** (should fix)
- **Notices** (informational)

**Exit code**:
- `0` if no errors found
- `1` if errors found

---

### 3. HTML Contrast Checker

**What it does**: Custom tool that checks text contrast ratios in HTML files. Uses the same contrast calculation logic as our design system audit.

**Usage**:
```bash
# Test built files
npm run accessibility:contrast dist/index.html

# Test local development server
npm run accessibility:contrast http://localhost:3000

# Test specific page
npm run accessibility:contrast dist/about.html
```

**What it checks**:
- Text color vs background color contrast
- WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Large text detection (18px+ or 14px+ bold)
- All text elements in the document

**Output**: Lists all text elements with insufficient contrast, including:
- Element type and selector
- Text content preview
- Foreground and background colors
- Current vs required contrast ratio
- Font size and weight

**Exit code**:
- `0` if no issues found
- `1` if issues found

---

## Integration with Development Workflow

### Pre-Commit Testing

Add to your pre-commit hook or run manually before committing:

```bash
npm run accessibility:all
```

### CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run Accessibility Tests
  run: |
    npm run build
    npm run accessibility:all
```

### Local Development

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **In another terminal, run tests**:
   ```bash
   npm run accessibility:pa11y http://localhost:3000
   ```

---

## Testing Strategy

### Recommended Workflow

1. **During Development**:
   - Run contrast checker after CSS changes
   - Run axe-core on individual pages as you build them

2. **Before Committing**:
   - Run all three tools on built files
   - Fix any violations before committing

3. **Before Deployment**:
   - Run full accessibility suite
   - Test on both production and GitHub Pages builds
   - Test all pages

### Testing All Pages

Create a script to test all pages:

```bash
# Test all built pages
for page in dist/*.html; do
  echo "Testing $page..."
  npm run accessibility:axe "$page"
done
```

---

## Understanding Results

### Axe-Core Results

- **Violations**: Must be fixed (WCAG failures)
- **Passes**: No issues found
- **Incomplete**: Needs manual review
- **Inapplicable**: Rule doesn't apply to this page

### Pa11y Results

- **Errors**: Must fix (WCAG violations)
- **Warnings**: Should fix (potential issues)
- **Notices**: Informational (best practices)

### Contrast Checker Results

- Lists all text elements with insufficient contrast
- Shows exact colors and ratios
- Indicates if text is "large" (different threshold)

---

## Common Issues and Fixes

### Low Contrast Text

**Issue**: Text doesn't meet 4.5:1 contrast ratio

**Fix**: 
- Use darker text color on light backgrounds
- Use lighter text color on dark backgrounds
- Check `css/core/variables.css` for proper color variables

### Missing Alt Text

**Issue**: Images without alt attributes

**Fix**: Add descriptive alt text to all images:
```html
<img src="..." alt="Description of image">
```

### Missing Form Labels

**Issue**: Form inputs without associated labels

**Fix**: Use `<label>` elements or `aria-label`:
```html
<label for="email">Email</label>
<input type="email" id="email">
```

### Heading Hierarchy

**Issue**: Skipped heading levels (e.g., h1 → h3)

**Fix**: Use sequential heading levels (h1 → h2 → h3)

---

## Configuration

### Pa11y Configuration

Edit `.pa11yrc.json` to customize pa11y settings:

```json
{
  "standard": "WCAG2AA",
  "includeWarnings": true,
  "includeNotices": true,
  "timeout": 30000,
  "wait": 1000
}
```

### Axe-Core Configuration

Edit `scripts/axe-audit.js` to customize axe rules:

```javascript
axe.run(document, {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
  },
  // Customize rules here
});
```

---

## Best Practices

1. **Test Early and Often**: Run tests during development, not just before deployment
2. **Fix Violations Immediately**: Don't let accessibility debt accumulate
3. **Test All Pages**: Different pages may have different issues
4. **Test Both Themes**: Run tests in both light and dark mode
5. **Manual Testing**: Automated tools catch many issues, but manual testing is still important
6. **Screen Reader Testing**: Test with actual screen readers (NVDA, JAWS, VoiceOver)

---

## Related Documentation

- **Contrast Audit Report**: `docs/CONTRAST_AUDIT_REPORT.md`
- **Style Guide**: `docs/STYLE_GUIDE.md` (includes accessibility guidelines)
- **Performance Checklist**: `docs/PERFORMANCE_CHECKLIST.md`

---

## Troubleshooting

### Pa11y Fails to Connect

**Issue**: Cannot connect to localhost

**Solution**: Make sure dev server is running:
```bash
npm run dev
```

### Axe-Core Script Errors

**Issue**: axe-core not loading properly

**Solution**: Ensure axe-core is installed:
```bash
npm install --save-dev axe-core
```

### Contrast Checker Shows False Positives

**Issue**: Elements with transparent backgrounds showing incorrect contrast

**Solution**: The tool traverses up the DOM tree to find background colors. Some edge cases may need manual review.

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe-Core Documentation](https://github.com/dequelabs/axe-core)
- [Pa11y Documentation](https://pa11y.org/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Last Updated**: January 2025

