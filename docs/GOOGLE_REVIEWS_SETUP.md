# Google Reviews Integration Setup

This guide explains how to set up Google Reviews integration for the Client Testimonials carousel.

## Overview

The testimonials section displays real Google Reviews in an interactive carousel with:
- **Centered active card** with infinite loop
- **Multiple navigation methods**: drag, shift+scroll, arrow buttons, dots
- **Auto-scroll** with pause on hover
- **Uniform card heights** with responsive design

The system supports two modes:
1. **Automatic (API)**: Fetches reviews from Google Places API during build
2. **Manual**: Uses manually curated reviews from `data/manual-reviews.json`

## Setup Options

### Option 1: Google Places API (Recommended)

This method automatically fetches your latest Google Reviews during the build process.

#### Step 1: Get Your Google Place ID

1. Go to [Google Places API - Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Search for your business
3. Copy the Place ID (looks like: `ChIJN1t_tDeuEmsRUsoyG83frY4`)

Place ID: ChIJqVclNUpnlR4RS2IxBBZoo3E

#### Step 2: Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API** (Legacy/Old API)
   - Note: Google has deprecated the legacy Places API for new projects as of March 2025
   - If you have an existing project, you can still use the legacy API
   - Otherwise, you may need to use the new Places API or manual reviews
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Restrict the API key to "Places API" for security
6. Copy your API key


AIzaSyD92wF2sKdblAnHjmRo41smwFDxNhkA18c


#### Step 3: Create .env File

Create a `.env` file in the project root (it's already in `.gitignore`):

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   GOOGLE_PLACES_API_KEY=your-api-key-here
   GOOGLE_PLACE_ID=your-place-id-here
   ```

**Note**: The `.env` file is automatically loaded by the npm scripts. You don't need to manually set environment variables or use `dotenv` commands - just run the scripts normally!

#### Step 4: Fetch Reviews

Run the fetch script (it will automatically load your `.env` file):
```bash
npm run fetch-reviews
```

This will create `data/google-reviews.json` with your latest reviews.

**Note**: The script automatically loads environment variables from `.env`, so you don't need to manually set them or use `dotenv` commands.

#### Step 5: Build

The build process automatically includes the reviews:
```bash
npm run build
```

### Option 2: Manual Reviews

If you don't want to use the API, you can manually maintain reviews in `data/manual-reviews.json`.

#### Edit `data/manual-reviews.json`

```json
{
  "lastUpdated": "2025-01-01T00:00:00.000Z",
  "source": "manual",
  "reviews": [
    {
      "id": "review-1",
      "author": "John Doe",
      "rating": 5,
      "text": "Great service! Highly recommend.",
      "time": "2025-12-15T10:00:00.000Z",
      "authorPhoto": null,
      "relativeTime": "2 weeks ago"
    }
  ]
}
```

The build process will automatically use this file if the API is not configured.

## How It Works

1. **Build Time**: The `fetch-google-reviews.js` script runs before build
   - If API credentials are set, it fetches from Google Places API
   - If not, it falls back to `data/manual-reviews.json`
   - Saves reviews to `data/google-reviews.json`

2. **Runtime**: The `js/testimonials.js` module loads reviews from JSON
   - Fetches `/data/google-reviews.json` on page load
   - Dynamically renders testimonial cards in carousel
   - Initializes interactive carousel with drag, shift+scroll, auto-scroll
   - Falls back to static testimonials if loading fails

## Configuration

The carousel displays all reviews by default. To limit reviews, edit `js/testimonials.js`:

```javascript
loadTestimonials('.testimonials-grid', 0); // 0 = all reviews, or set max number
```

API credentials are configured via `.env` file (see Setup section above).

## Troubleshooting

### Reviews Not Showing

1. **Check browser console** for errors
2. **Verify JSON file exists** in `data/google-reviews.json`
3. **Check file path** - ensure it's copied to build output
4. **Verify API credentials** if using Google Places API

### API Errors

- **403 Forbidden**: Check API key restrictions and enabled APIs
- **404 Not Found**: Verify Place ID is correct
- **Quota Exceeded**: Check Google Cloud billing and quotas

### Fallback Behavior

If reviews fail to load, the page will show the static fallback testimonials (marked with `data-fallback-testimonial`).

## Updating Reviews

### Automatic (API)
Reviews are fetched fresh on each build. To update:
```bash
npm run fetch-reviews
npm run build
```

### Manual
Edit `data/manual-reviews.json` and rebuild:
```bash
npm run build
```

## Cost Considerations

Google Places API (Legacy) pricing:
- **Free tier**: $200/month credit
- **Places API - Place Details**: $0.017 per request
- With free tier, you get ~11,700 requests/month free

For a static site that fetches once per build, this is essentially free.

**Note**: Google has deprecated the legacy Places API for new projects. If you're setting up a new project, you may need to use the new Places API or consider manual reviews.

## Security Notes

- **Never commit API keys** to version control
- Use environment variables or `.env` files (already in `.gitignore`)
- Restrict API keys in Google Cloud Console to specific APIs and domains
- The API key is only used during build, never exposed to clients

## Support

For issues or questions:
- Check [Google Places API Documentation (Legacy)](https://developers.google.com/maps/documentation/places/web-service/details)
- Review the script logs for detailed error messages
- Ensure your Google Business Profile has reviews enabled
- **Note**: If you get a 404 error, verify you're using the legacy Places API (not the new one)

