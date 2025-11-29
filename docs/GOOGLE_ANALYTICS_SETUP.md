# Google Analytics & Search Console Setup Guide

This guide will walk you through setting up Google Analytics 4 (GA4) and Google Search Console for the Logia Genesis website.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Analytics 4 Setup](#google-analytics-4-setup)
3. [Google Search Console Setup](#google-search-console-setup)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Google account
- Access to your website's source code
- Ability to deploy changes to your website

---

## Google Analytics 4 Setup

### Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **"Start measuring"** or **"Create Account"**
3. Fill in your account details:
   - **Account Name**: `Logia Genesis` (or your preferred name)
   - Configure data sharing settings (optional)
   - Click **"Next"**

### Step 2: Create a Property

1. **Property Name**: `Logia Genesis Website` (or your preferred name)
2. **Reporting Time Zone**: `Africa/Johannesburg` (or your timezone)
3. **Currency**: `ZAR` (South African Rand)
4. Click **"Next"**

### Step 3: Configure Business Information

1. Select your **Industry Category**: `Technology` or `Business Services`
2. Select your **Business Size**: Choose appropriate size
3. Select **How you intend to use Google Analytics**: 
   - ✅ Measure customer engagement with my site/app
   - ✅ Understand how customers find my site/app
   - ✅ Both
4. Click **"Create"**

### Step 4: Accept Terms of Service

1. Review and accept the Google Analytics Terms of Service
2. Accept the Data Processing Terms
3. Click **"I Accept"**

### Step 5: Set Up a Data Stream

1. Select **"Web"** as your platform
2. Enter your website details:
   - **Website URL**: `https://logia.co.za` (or your domain)
   - **Stream Name**: `Logia Genesis Website` (or your preferred name)
3. Click **"Create stream"**

### Step 6: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID**
   - Format: `G-XXXXXXXXXX` (e.g., `G-ABC123XYZ`)
2. **Copy this Measurement ID** - you'll need it in the next steps

### Step 7: Configure Your Website

#### Option A: Using Environment Variables (Recommended)

1. Create or update your `.env` file in the project root:
```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Search Console Verification (optional - get from Search Console)
VITE_GSC_VERIFICATION=XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

2. Replace `G-XXXXXXXXXX` with your actual Measurement ID from Step 6.
3. Replace `XXXXXXXXXXXXXXXXXXXXXXXXXXXXX` with your Google Search Console verification code (if you have it).

**Note**: The `.env` file should be in your project root (same directory as `package.json`). This file is typically gitignored for security.

#### Option B: Direct Configuration

If you prefer not to use environment variables, you can directly edit `config/app.config.js` (not recommended for production).

### Step 8: Verify Installation

1. Build your website:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

3. Open your browser's Developer Tools (F12)
4. Go to the **Network** tab
5. Filter by `google-analytics` or `gtag`
6. Navigate through your website
7. You should see requests to `https://www.google-analytics.com/g/collect` or similar

### Step 9: Test in Real-Time

1. Go to your Google Analytics dashboard
2. Navigate to **Reports** → **Realtime**
3. Visit your website in another browser tab
4. You should see your visit appear in the Real-time report within a few seconds

---

## Google Search Console Setup

### Step 1: Add Your Property

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click **"Add Property"**
3. Select **"URL prefix"** (recommended for most sites)
4. Enter your website URL: `https://logia.co.za` (or your domain)
5. Click **"Continue"**

### Step 2: Verify Ownership

You have several verification options. We'll use the **HTML tag method** (recommended):

#### Method 1: HTML Tag (Recommended)

1. Google will provide you with an HTML meta tag like:
```html
<meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />
```

2. **Note**: This tag will be automatically added to your website during the implementation process.

3. After the tag is added, click **"Verify"** in Google Search Console

#### Method 2: HTML File Upload

1. Download the HTML verification file from Google Search Console
2. Upload it to your website's root directory (where `index.html` is located)
3. Click **"Verify"** in Google Search Console

#### Method 3: DNS Record

1. Add a TXT record to your domain's DNS settings
2. Use the value provided by Google Search Console
3. Click **"Verify"** in Google Search Console

### Step 3: Submit Your Sitemap

1. After verification, go to **Sitemaps** in the left sidebar
2. Enter your sitemap URL: `https://logia.co.za/sitemap.xml`
3. Click **"Submit"**
4. Google will start crawling your sitemap (this may take a few days)

### Step 4: Request Indexing (Optional)

1. Go to **URL Inspection** in the left sidebar
2. Enter your homepage URL: `https://logia.co.za/`
3. Click **"Test Live URL"**
4. If the page is indexable, click **"Request Indexing"**
5. Repeat for other important pages (about, services, contact, etc.)

### Step 5: Configure Settings

1. Go to **Settings** → **Users and permissions**
   - Add team members who need access
2. Go to **Settings** → **Site settings**
   - Verify your preferred domain (www or non-www)
   - Set your target country (South Africa)
3. Go to **Settings** → **Crawl rate**
   - Leave as default unless you have specific needs

---

## Verification

### Google Analytics Verification

1. **Real-time Reports**: Visit your site and check Real-time reports in GA4
2. **DebugView**: Use Google Analytics DebugView (requires debug mode)
3. **Browser Extensions**: Use Google Analytics Debugger extension
4. **Network Tab**: Check browser DevTools Network tab for GA requests

### Google Search Console Verification

1. **Coverage Report**: Check if your pages are being indexed
2. **Performance Report**: Monitor search performance (takes a few days to populate)
3. **URL Inspection**: Test individual URLs for indexing status

---

## Troubleshooting

### Google Analytics Not Tracking

**Issue**: No data appearing in Google Analytics

**Solutions**:
1. Check that your Measurement ID is correct in `.env` file
2. Verify the CSP (Content Security Policy) allows Google Analytics domains
3. Check browser console for errors
4. Ensure ad blockers are disabled during testing
5. Verify the GA script is loading in the HTML source
6. Check that you're using the correct property (GA4, not Universal Analytics)

### Google Search Console Not Verifying

**Issue**: Verification fails

**Solutions**:
1. Ensure the verification tag is in the `<head>` section
2. Check that the tag is present on the homepage
3. Wait a few minutes after adding the tag before verifying
4. Try a different verification method (HTML file, DNS)
5. Clear your browser cache and try again

### Sitemap Not Being Crawled

**Issue**: Sitemap shows errors or isn't being processed

**Solutions**:
1. Verify your sitemap is accessible: `https://logia.co.za/sitemap.xml`
2. Check that all URLs in the sitemap are accessible (no 404 errors)
3. Ensure sitemap follows XML sitemap protocol
4. Wait 24-48 hours for Google to process the sitemap
5. Check for crawl errors in Search Console

### No Search Data Appearing

**Issue**: Performance report shows no data

**Solutions**:
1. Wait 2-3 days after verification (data takes time to populate)
2. Ensure your site is being indexed (check Coverage report)
3. Verify your site appears in Google search results
4. Check that you're looking at the correct date range

---

## Additional Resources

- [Google Analytics Help Center](https://support.google.com/analytics)
- [Google Search Console Help](https://support.google.com/webmasters)
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Search Console Guide](https://developers.google.com/search/docs/beginner/get-started)

---

## Next Steps

After setup is complete:

1. **Set up Goals/Conversions** in Google Analytics
   - Track form submissions
   - Track phone calls
   - Track button clicks

2. **Configure Custom Events** (if needed)
   - Track specific user interactions
   - Monitor engagement metrics

3. **Set up Alerts** in Google Search Console
   - Get notified of indexing issues
   - Monitor search performance changes

4. **Link Google Analytics and Search Console**
   - In Google Analytics, go to Admin → Search Console Links
   - Link your Search Console property
   - This enables Search Console data in Analytics

---

**Last Updated**: January 2025

