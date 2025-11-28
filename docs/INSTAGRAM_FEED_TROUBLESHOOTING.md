# Instagram Feed Troubleshooting Guide

## Problem: Images Not Loading / Placeholder Images

If you're seeing placeholder images instead of actual Instagram post images, here are the solutions:

## Solution 1: Instagram oEmbed API is Blocked (Most Common)

Instagram's oEmbed API (`https://api.instagram.com/oembed`) often blocks automated requests and returns HTML instead of JSON. This is a known limitation.

### Workaround: Get Image URLs Manually

1. **Open each Instagram post in your browser**
2. **Right-click on the post image** → "Copy image address" or "Inspect element"
3. **Get the direct image URL** - it will look like:
   ```
   https://instagram.com/p/POST_ID/media/?size=l
   ```
   Or for reels:
   ```
   https://instagram.com/reel/REEL_ID/media/?size=l
   ```

4. **Update your config** to use manual image URLs:

```javascript
// In config/app.config.js
instagram: {
  enabled: true,
  manualPosts: [
    {
      postUrl: 'https://www.instagram.com/p/DCRi-2SoxNX/',
      imageUrl: 'https://instagram.com/p/DCRi-2SoxNX/media/?size=l',
      caption: 'Your post caption (optional)'
    },
    {
      postUrl: 'https://www.instagram.com/reel/C32hCk5SoVd/',
      imageUrl: 'https://instagram.com/reel/C32hCk5SoVd/media/?size=l',
      caption: 'Your reel caption (optional)'
    },
    // Add more posts...
  ],
  maxPosts: 0,
},
```

5. **Update the fetch script** to support manualPosts format (or modify `scripts/fetch-instagram-posts.js` to read from `manualPosts` instead of `postUrls`)

## Solution 2: Use Instagram Graph API (Recommended for Production)

The most reliable solution is to use Instagram Graph API:

1. **Set up Facebook App** at https://developers.facebook.com/
2. **Add Instagram Basic Display** product
3. **Get Access Token** and **User ID**
4. **Add to `.env` file**:
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_token_here
   INSTAGRAM_USER_ID=your_user_id_here
   ```
5. **Run fetch script**:
   ```bash
   npm run fetch-instagram
   ```

This will fetch posts directly from Instagram's API (no oEmbed needed).

## Solution 3: Use a CORS Proxy (Not Recommended)

You can use a CORS proxy service, but this is **not recommended for production** as it:
- Adds latency
- May violate Instagram's Terms of Service
- Is unreliable

## Solution 4: Manual Image URLs in JSON

You can manually edit `data/instagram-posts.json` and add image URLs:

```json
{
  "posts": [
    {
      "id": "manual-0",
      "postUrl": "https://www.instagram.com/p/DCRi-2SoxNX/",
      "caption": "Your caption",
      "imageUrl": "https://instagram.com/p/DCRi-2SoxNX/media/?size=l",
      "thumbnailUrl": "https://instagram.com/p/DCRi-2SoxNX/media/?size=l",
      "mediaType": "IMAGE",
      "timestamp": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

Then run:
```bash
npm run sync-instagram-to-public
```

## Quick Fix: Get Direct Image URLs

The easiest immediate fix is to get direct image URLs:

1. Visit each Instagram post
2. Right-click image → "Copy image address"
3. Use that URL in your config or JSON file

## Why This Happens

Instagram's oEmbed API:
- Has rate limiting
- Blocks automated requests
- Returns HTML error pages instead of JSON
- May require authentication for some posts

The Instagram Graph API is more reliable but requires setup.

---

**Recommended Solution**: Use Instagram Graph API (Solution 2) for production, or manually add image URLs (Solution 1) for quick fixes.

