# Instagram Feed Setup Guide

This guide explains how to set up and use the Instagram feed carousel on your website.

## Overview

The Instagram feed carousel displays your Instagram posts in a beautiful, interactive carousel. It automatically fetches your Instagram posts using Instagram Graph API at build time, similar to how Google Reviews are fetched.

## Setup Instructions

### Option 1: Automatic Feed (Recommended)

The easiest way is to use Instagram Graph API to automatically fetch your posts:

#### 1. Set Up Instagram Graph API

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the "Instagram Basic Display" product to your app
4. Get your **Access Token**:
   - Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Select your app
   - Add permissions: `instagram_basic`, `pages_read_engagement`
   - Generate Access Token
5. Get your **Instagram User ID**:
   - Use the Graph API Explorer with your access token
   - Query: `me/accounts` to get your pages
   - Or query your Instagram username: `/{username}?fields=id`

#### 2. Configure Environment Variables

Create or update your `.env` file:

```env
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
INSTAGRAM_USER_ID=your_user_id_here
```

#### 3. Fetch Instagram Posts

Run the fetch script:

```bash
npm run fetch-instagram
```

This will:
- Fetch your recent Instagram posts using Graph API
- Save them to `data/instagram-posts.json`
- Copy to `public/data/` for dev server access

The posts will automatically load on your website!

### Option 2: Manual Post URLs (Fallback)

If you don't want to use Instagram Graph API, you can manually add post URLs:

#### 1. Get Instagram Post URLs

1. Open Instagram in your browser
2. Navigate to the post you want to include
3. Click the three dots (⋯) on the post
4. Select "Copy Link" or "Copy Link to Post"
5. The URL will look like: `https://www.instagram.com/p/ABC123xyz/`

#### 2. Configure Post URLs

Open `config/app.config.js` and add your Instagram post URLs to the `instagram.postUrls` array:

```javascript
instagram: {
  enabled: true,
  postUrls: [
    'https://www.instagram.com/p/ABC123xyz/',
    'https://www.instagram.com/p/DEF456uvw/',
    'https://www.instagram.com/p/GHI789rst/',
    // Add more post URLs as needed
  ],
  maxPosts: 0, // 0 = display all posts, or set a number to limit
},
```

**Note:** Manual URLs will be fetched via oEmbed API at runtime, which may have CORS limitations.

## How It Works

The Instagram feed works in two ways:

1. **Build-time (Recommended)**: Posts are fetched using Instagram Graph API during build and saved to `data/instagram-posts.json`. This avoids CORS issues and provides better performance.

2. **Runtime (Fallback)**: If no JSON file exists, it falls back to fetching posts via oEmbed API using URLs from config. This may have CORS limitations.

### 3. Add Instagram Section to Your Page

Add the Instagram feed section to any HTML page where you want to display the feed:

```html
<!-- Instagram Feed Section -->
<section class="section instagram-section">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-label">Follow Us</span>
            <h2 class="section-title">Follow Us on Instagram</h2>
            <p class="section-description">
                Stay connected and see our latest projects, updates, and behind-the-scenes content
            </p>
        </div>

        <div class="instagram-feed-grid">
            <!-- Instagram feed will be loaded dynamically -->
        </div>

        <div class="text-center" data-aos="fade-up" style="margin-top: var(--space-8);">
            <a href="https://www.instagram.com/logia_genesis_inc/" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-lg">
                <i class="fab fa-instagram"></i> Follow Us on Instagram
            </a>
        </div>
    </div>
</section>
```

The feed will automatically load when the page loads (initialized in `js/main.js`).

## Features

- **Interactive Carousel**: Drag, swipe, or use arrow buttons to navigate
- **Infinite Loop**: Seamless infinite scrolling
- **Auto-scroll**: Automatically advances every 5 seconds (pauses on hover)
- **Responsive**: Adapts to mobile, tablet, and desktop screens
- **Keyboard Navigation**: Arrow keys to navigate
- **Touch Support**: Swipe gestures on mobile devices
- **Shift + Scroll**: Hold Shift and scroll to navigate

## Customization

### Limit Number of Posts

Set `maxPosts` in the config to limit how many posts are displayed:

```javascript
instagram: {
  maxPosts: 6, // Only show first 6 posts
},
```

### Styling

The Instagram feed uses the same carousel styles as the testimonials section. You can customize the appearance by modifying the CSS classes in `css/style.css`:

- `.instagram-section` - Section container
- `.instagram-carousel` - Carousel container
- `.instagram-card` - Individual post card
- `.instagram-image-wrapper` - Image container
- `.instagram-caption` - Post caption

## Troubleshooting

### Posts Not Loading

1. **Check Access Token**: Make sure `INSTAGRAM_ACCESS_TOKEN` is set correctly
2. **Check User ID**: Verify `INSTAGRAM_USER_ID` is correct
3. **Run Fetch Script**: Make sure you've run `npm run fetch-instagram` before building
4. **Check JSON File**: Verify `data/instagram-posts.json` exists and has posts
5. **CORS Issues**: If using manual URLs, Instagram's oEmbed API may have CORS restrictions

### "No Instagram post URLs configured" Error

This means:
- The JSON file doesn't exist or is empty
- No post URLs are in the config

**Solution**: Run `npm run fetch-instagram` to fetch posts automatically, or add post URLs to `config/app.config.js`

### Images Not Displaying

- Check that posts are public (not private)
- Verify the access token has correct permissions
- Check browser console for network errors
- Make sure the JSON file has valid `imageUrl` or `thumbnailUrl` fields

### API Limitations

Instagram Graph API has rate limits:
- Access tokens expire (usually 60 days)
- You may need to refresh your token periodically
- Consider running the fetch script before each build

### Getting Access Token

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create/select your app
3. Go to Tools → Graph API Explorer
4. Select your app and add permissions
5. Generate token
6. For long-lived tokens, use the Access Token Debugger to extend

## Alternative Approaches

If Instagram's oEmbed API doesn't work for your use case, consider:

1. **Instagram Basic Display API**: Requires OAuth setup, more complex but official
2. **Instagram Graph API**: For business accounts, requires Facebook app setup
3. **Third-party Services**: Services like SnapWidget, Elfsight, or Juicer
4. **Manual Curation**: Manually add post images and links without API

## Notes

- The feed uses Instagram's public oEmbed API
- Posts must be public to be displayed
- The API may have rate limits
- Images are lazy-loaded for performance
- The carousel automatically handles responsive layouts

## Example Configuration

```javascript
instagram: {
  enabled: true,
  postUrls: [
    'https://www.instagram.com/p/ABC123xyz/',
    'https://www.instagram.com/p/DEF456uvw/',
    'https://www.instagram.com/p/GHI789rst/',
    'https://www.instagram.com/p/JKL012mno/',
    'https://www.instagram.com/p/PQR345pqr/',
  ],
  maxPosts: 0, // Show all posts
},
```

---

**Last Updated**: January 2025

