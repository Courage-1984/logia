# Google Analytics & Search Console - Quick Start

## Quick Setup Checklist

### 1. Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create account/property if needed
3. Get your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Get Your Google Search Console Verification Code (Optional)

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Add your property: `https://logia.co.za`
3. Choose **HTML tag** verification method
4. Copy the `content` value from the meta tag

### 3. Configure Environment Variables

Create or update `.env` file in project root:

```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Search Console (optional)
VITE_GSC_VERIFICATION=XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Build and Deploy

```bash
# Build for production
npm run build

# Or build for GitHub Pages
npm run build:gh-pages
```

### 5. Verify Installation

**Google Analytics:**
1. Visit your website
2. Open browser DevTools → Network tab
3. Filter by `google-analytics` or `gtag`
4. You should see requests to Google Analytics
5. Check Google Analytics Real-time reports

**Google Search Console:**
1. Go to Search Console
2. Click "Verify" (if not already verified)
3. Submit your sitemap: `https://logia.co.za/sitemap.xml`

## What Was Implemented

✅ Google Analytics 4 (GA4) integration
- Automatic page view tracking
- Page transition tracking (for SPA-like navigation)
- Event tracking functions available
- Privacy-compliant (IP anonymization enabled)

✅ Google Search Console support
- Verification tag injection via build plugin
- Sitemap already configured

✅ Content Security Policy updated
- Allows Google Analytics domains
- Allows Google Tag Manager

✅ DNS prefetch/preconnect
- Optimized loading for Google Analytics

## Available Analytics Functions

```javascript
// Track custom events
import { trackEvent } from './js/analytics.js';
trackEvent('button_click', { button_name: 'Get Quote' });

// Track form submissions
import { trackFormSubmission } from './js/analytics.js';
trackFormSubmission('contact_form', 'contact_page');

// Track phone calls
import { trackPhoneCall } from './js/analytics.js';
trackPhoneCall();

// Track external links
import { trackExternalLink } from './js/analytics.js';
trackExternalLink('https://example.com', 'Partner Link');
```

## Troubleshooting

**No data in Google Analytics?**
- Check that `VITE_GA_MEASUREMENT_ID` is set correctly
- Verify the Measurement ID format: `G-XXXXXXXXXX`
- Check browser console for errors
- Disable ad blockers during testing
- Verify CSP allows Google Analytics domains

**Search Console not verifying?**
- Ensure `VITE_GSC_VERIFICATION` is set
- Rebuild your website after setting the variable
- Check that the verification tag appears in HTML source
- Try a different verification method if needed

## Next Steps

1. **Set up Goals/Conversions** in Google Analytics
2. **Link Analytics and Search Console** (in GA4 Admin)
3. **Configure Custom Events** for important interactions
4. **Set up Alerts** in Search Console for indexing issues

For detailed instructions, see [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md)

