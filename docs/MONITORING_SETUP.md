# Monitoring & Error Tracking Setup Guide

This guide explains how to set up error tracking (Sentry), performance monitoring (Core Web Vitals), Lighthouse CI, and bundle size monitoring for the Logia Genesis website.

## Overview

The monitoring system includes:
1. **Error Tracking** - Sentry integration for JavaScript error monitoring
2. **Performance Monitoring** - Core Web Vitals tracking (LCP, FID, INP, CLS, FCP, TTFB)
3. **Lighthouse CI** - Automated performance testing with budgets
4. **Bundle Size Monitoring** - Track bundle sizes over time
5. **Skip Links** - Accessibility navigation links (already implemented)

## Error Tracking (Sentry)

### Setup

1. **Create a Sentry account** at [sentry.io](https://sentry.io)

2. **Create a new project** and select "Browser JavaScript"

3. **Get your DSN** from the project settings

4. **Configure environment variables** in `.env` file:
```bash
# Sentry Configuration
VITE_SENTRY_ENABLED=true
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
```

5. **Enable Sentry in config** - The config will automatically read from environment variables

### Features

- **Error Tracking**: Captures JavaScript errors, unhandled promise rejections
- **Session Replay**: Records user sessions (10% of sessions, 100% of error sessions)
- **Performance Monitoring**: Tracks transaction performance
- **Browser Extension Filtering**: Automatically filters out browser extension errors

### Configuration Options

- `VITE_SENTRY_ENABLED`: Enable/disable Sentry (default: `false`)
- `VITE_SENTRY_DSN`: Your Sentry DSN (required if enabled)
- `VITE_SENTRY_ENVIRONMENT`: Environment name (`production`, `development`, `staging`)
- `VITE_SENTRY_TRACES_SAMPLE_RATE`: Percentage of transactions to trace (0.0-1.0, default: 0.1)
- `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE`: Percentage of sessions to record (0.0-1.0, default: 0.1)
- `VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`: Percentage of error sessions to record (0.0-1.0, default: 1.0)

## Performance Monitoring (Core Web Vitals)

### Setup

Performance monitoring is **enabled by default** and requires no additional setup. It tracks:

- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity (deprecated, but still tracked)
- **INP** (Interaction to Next Paint) - Modern interactivity metric
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Loading performance
- **TTFB** (Time to First Byte) - Server response time

### Configuration

Configure via environment variables in `.env`:

```bash
# Performance Monitoring
VITE_PERFORMANCE_MONITORING_ENABLED=true
VITE_PERFORMANCE_LOG_TO_CONSOLE=true
VITE_PERFORMANCE_SEND_TO_SENTRY=false
VITE_PERFORMANCE_SEND_TO_ANALYTICS=false
```

### Configuration Options

- `VITE_PERFORMANCE_MONITORING_ENABLED`: Enable/disable performance monitoring (default: `true`)
- `VITE_PERFORMANCE_LOG_TO_CONSOLE`: Log metrics to browser console (default: `true`)
- `VITE_PERFORMANCE_SEND_TO_SENTRY`: Send metrics to Sentry (requires Sentry enabled, default: `false`)
- `VITE_PERFORMANCE_SEND_TO_ANALYTICS`: Dispatch custom `webvitals` event for analytics (default: `false`)

### Viewing Metrics

**In Development:**
- Metrics are logged to the browser console
- Open DevTools → Console to see Web Vitals metrics

**In Production:**
- If `VITE_PERFORMANCE_SEND_TO_SENTRY=true`, metrics appear in Sentry dashboard
- If `VITE_PERFORMANCE_SEND_TO_ANALYTICS=true`, metrics are dispatched as custom events (can be captured by analytics tools)

### Metric Ratings

Each metric is rated as:
- **Good**: Meets recommended thresholds
- **Needs Improvement**: Below recommended thresholds
- **Poor**: Significantly below recommended thresholds

## Skip Navigation Links (Accessibility)

Skip links are **already implemented** on all pages. They provide keyboard users with quick navigation to:
- Main content (`#main-content`)
- Services section (`#services`) - on homepage only
- Footer (`#footer`)

**Usage**: Press `Tab` when the page loads, then `Enter` to jump to target section. Styled in `css/style.css` (hidden by default, visible on focus).

## GitHub Actions Setup

For GitHub Pages deployment, add secrets in GitHub repository settings:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `SENTRY_DSN` (if using Sentry)
   - `VITE_SENTRY_ENABLED` (set to `true` to enable)
   - `VITE_SENTRY_ENVIRONMENT` (e.g., `production`)

The build process will automatically use these secrets.

## Testing

### Test Error Tracking

1. Enable Sentry in `.env`
2. Add a test error in browser console:
```javascript
throw new Error('Test error for Sentry');
```
3. Check Sentry dashboard for the error

### Test Performance Monitoring

1. Open browser DevTools → Console
2. Load any page
3. Look for `[Web Vitals]` log messages with metric values

### Test Skip Links

1. Load any page and press `Tab` key
2. Skip links should appear and be focusable
3. Press `Enter` to navigate to target section

## Troubleshooting

### Sentry Not Initializing

- Check that `VITE_SENTRY_ENABLED=true` in `.env`
- Verify `VITE_SENTRY_DSN` is set correctly
- Check browser console for error messages
- Ensure `@sentry/browser` package is installed (`npm install`)

### Performance Metrics Not Showing

- Check that `VITE_PERFORMANCE_MONITORING_ENABLED` is not set to `false`
- Verify `web-vitals` package is installed (`npm install`)
- Check browser console for error messages
- Ensure browser supports Performance API

### Skip Links Not Working

- Verify skip links are present in HTML (check page source)
- Check that target IDs exist (`#main-content`, `#footer`)
- Test with keyboard navigation (Tab key)
- Check CSS is loaded correctly

## Best Practices

1. **Error Tracking**:
   - Enable in production only (set `VITE_SENTRY_ENVIRONMENT=production`)
   - Use appropriate sample rates to avoid excessive data
   - Review and filter errors regularly

2. **Performance Monitoring**:
   - Monitor Core Web Vitals regularly
   - Aim for "Good" ratings on all metrics
   - Use metrics to identify performance bottlenecks

3. **Skip Links**: Already implemented - test with keyboard navigation (Tab key)

## Lighthouse CI (Automated Performance Testing)

Already configured and runs automatically on pull requests and pushes to main.

**Running Locally**: `npm run lighthouse` (full test) or `npm run lighthouse:ci` (quick test)

**Configuration**: `lighthouserc.cjs`

**Performance Budgets**:
- **Scores**: Performance ≥85% (warning), Accessibility ≥95% (error), Best Practices ≥90% (error), SEO ≥90% (error)
- **Core Web Vitals**: LCP <2.5s, FCP <1.8s, CLS <0.1 (error), TBT <300ms, Speed Index <3.4s
- **Resource Sizes**: JS <500KB, CSS <200KB, Images <2MB, Fonts <300KB

**Note**: Performance metrics are warnings (track progress), critical metrics (accessibility, SEO, CLS) are errors.

**GitHub Actions**: Runs automatically (`.github/workflows/lighthouse.yml`), results uploaded as artifacts.

## Bundle Size Monitoring

Tracks JavaScript, CSS, image, and font file sizes over time and compares against budgets.

**Running**: `npm run check-bundles` (production) or `npm run check-bundles:gh-pages` (GitHub Pages)

**Features**:
- Size tracking (total and individual files)
- Budget enforcement (fails if exceeded)
- History tracking (`.bundle-history/bundle-sizes.json`)
- Change detection from previous builds
- Lists top 10 largest files

**Default Budgets** (configurable in `scripts/check-bundle-sizes.js`):
- JavaScript: 500KB total, 200KB per file
- CSS: 200KB total, 100KB per file
- Images: 2MB total, 500KB per image
- Fonts: 300KB total, 150KB per font

**CI/CD**: Runs automatically in GitHub Actions workflow (`.github/workflows/lighthouse.yml`)

## Related Documentation

- [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION.md)
- [Performance Checklist](./PERFORMANCE_CHECKLIST.md)
- [Setup Guide](./SETUP_GUIDE.md)

---

**Last Updated**: January 2025

