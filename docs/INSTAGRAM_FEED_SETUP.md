# Instagram Feed Setup Guide

**Last Updated**: January 2025

## Overview

The Instagram feed displays posts in a carousel on the homepage. The system supports:
- **Instagram Graph API** (requires access token)
- **Local image fallback** (uses images from `assets/images/instagram/` if API unavailable)
- **Automatic image detection** by post ID

## Quick Reference

**Need your Instagram credentials?**

- **Access Token**: See [Get Your Instagram Access Token](#3-get-your-instagram-access-token) below
- **User ID**: See [Get Your Instagram User ID](#4-get-your-instagram-user-id) below
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Facebook Apps Dashboard**: https://developers.facebook.com/apps/

**Quick Links:**
- Get User ID via API: `https://graph.instagram.com/me?fields=id,username&access_token=YOUR_TOKEN`
- Instagram Graph API Docs: https://developers.facebook.com/docs/instagram-api/

## Quick Setup

### Option 1: Local Images (Recommended for GitHub Pages)

1. **Add post URLs** to `config/app.config.js`:
```javascript
instagram: {
  enabled: true,
  postUrls: [
    'https://www.instagram.com/p/DCRi-2SoxNX/',
    'https://www.instagram.com/reel/C32hCk5SoVd/',
    // Add more URLs...
  ],
  maxPosts: 0, // 0 = display all
}
```

2. **Download images** and place them in `assets/images/instagram/`:
   - Filename format: `instagram-{POST_ID}.jpg`
   - Example: `instagram-DCRi-2SoxNX.jpg`
   - Extract POST_ID from URL (e.g., `DCRi-2SoxNX` from `https://www.instagram.com/p/DCRi-2SoxNX/`)

3. **Run fetch script** (will use local images automatically):
```bash
npm run fetch-instagram
```

The script automatically detects and uses existing images in `assets/images/instagram/` if available.

### Option 2: Instagram Graph API

This option requires setting up a Facebook App and obtaining access credentials.

**Recommended: Business Discovery API** (Query by Username)

The easiest method for Business/Creator accounts is using the **Business Discovery API**, which allows querying by username instead of managing User IDs. See [Method D: Business Discovery API](#method-d-business-discovery-api-recommended-for-business-accounts) below.

**Alternative: Standard Instagram Graph API**

For direct access to your account's media, use the standard Instagram Graph API. See [Method B: Instagram Graph API](#method-b-instagram-graph-api-businesscreator-accounts) below.

#### Prerequisites

- A Facebook account
- An Instagram Business or Creator account (personal accounts can use Instagram Basic Display, but this guide focuses on Graph API)
- Admin access to a Facebook Page (if using Business account)

#### Step-by-Step Setup

**1. Create a Facebook App**

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as the app type (or **"Consumer"** for personal accounts)
4. Fill in app details:
   - **App Name**: Your app name (e.g., "Logia Genesis Website")
   - **App Contact Email**: Your email address
5. Click **"Create App"**

**2. Add Instagram Product**

1. In your app dashboard, click **"Add Product"**
2. Find **"Instagram"** in the list and click **"Set Up"**
3. For **Instagram Basic Display** (personal accounts):
   - Configure OAuth settings
   - Add redirect URIs
   - Set up Instagram Test User
4. For **Instagram Graph API** (Business/Creator accounts):
   - Link your Instagram Business account to a Facebook Page
   - Requires Facebook Page admin access

**3. Get Your Instagram Access Token**

**Method A: Instagram Basic Display (Personal Accounts)**

1. In your app dashboard, go to **"Products"** → **"Instagram Basic Display"**
2. Navigate to **"Basic Display"** → **"User Token Generator"**
3. Click **"Add or Remove Instagram Testers"**
4. Add your Instagram account as a tester
5. Log in to Instagram → **Settings** → **Apps and Websites** → **Tester Invites**
6. Accept the invitation
7. Return to Facebook App → **User Token Generator**
8. Click **"Generate Token"** for your Instagram account
9. Copy the generated token → This is your `INSTAGRAM_ACCESS_TOKEN`

**Method B: Instagram Graph API (Business/Creator Accounts)**

1. Ensure your Instagram account is a **Business** or **Creator** account
2. Link Instagram to a Facebook Page:
   - Instagram → **Settings** → **Account** → **Linked Accounts**
   - Connect to Facebook Page (you must be admin of the Page)
3. In Facebook App dashboard:
   - Go to **"Products"** → **"Instagram"**
   - Add **Instagram Graph API** product
4. Use **Graph API Explorer** to generate token:
   - Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Select your app from **"Meta App"** dropdown
   - Select **"Get User Access Token"**
   - Add permissions: `instagram_basic`, `pages_read_engagement`, `pages_show_list`
   - Click **"Generate Access Token"**
   - Copy the token → This is your `INSTAGRAM_ACCESS_TOKEN`

**Method D: Business Discovery API (Recommended for Business Accounts)**

This method uses the [Business Discovery API](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/business-discovery) which allows querying by username - much simpler than managing User IDs!

**Requirements:**
- Instagram Business or Creator account
- Instagram User Access Token (not Page token)
- Your Instagram Business Account User ID

**Steps:**

1. **Get Instagram User Access Token**:
   - Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Select your app
   - Click **"Get User Access Token"**
   - Add permissions: `instagram_basic`, `business_management`
   - Generate and copy the token

2. **Get Your Instagram Business Account User ID**:
   - Visit: `https://graph.instagram.com/me?fields=id,username&access_token=YOUR_TOKEN`
   - Copy the `id` value

3. **Set Environment Variables**:
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_instagram_user_token_here
   INSTAGRAM_USER_ID=your_instagram_user_id_here
   INSTAGRAM_USERNAME=logia_genesis_inc
   USE_BUSINESS_DISCOVERY=true
   ```

4. **Run the Fetch Script**:
   ```bash
   npm run fetch-instagram
   ```

**Advantages:**
- ✅ Query by username (no need to find User IDs)
- ✅ Works with Instagram User Access Tokens
- ✅ Can query any Business/Creator account (not just your own)
- ✅ Includes engagement metrics (likes, comments)

**Note:** The token must be an Instagram User Access Token (NOT a Facebook Page token starting with "EAA").

**Method C: Using Facebook Page Access Token (Business Accounts)**

If you already have a **Facebook Page access token** (starts with "EAA"), you can use it directly:

1. Ensure your Instagram Business account is linked to the Facebook Page
2. Use your Facebook Page access token as `INSTAGRAM_ACCESS_TOKEN`
   - The script will automatically detect it's a Page token (starts with "EAA")
   - It will automatically fetch your Instagram Business Account ID from the Page
   - No need to set `INSTAGRAM_USER_ID` - it will be fetched automatically
3. Optional: If you have multiple Pages, set `FACEBOOK_PAGE_ID` in `.env`:
   ```env
   FACEBOOK_PAGE_ID=your_page_id_here
   ```

**Note:** Facebook Page tokens work differently:
- The script automatically detects tokens starting with "EAA"
- It fetches the Instagram Business Account ID from the linked Facebook Page
- You don't need to manually set `INSTAGRAM_USER_ID` when using Page tokens

**Method D: Business Discovery API (Recommended for Business Accounts)** ⭐

This is the **easiest method** for Business/Creator accounts. It allows querying by username instead of managing User IDs, and works with Instagram User Access Tokens.

**Reference:** [Instagram Business Discovery API Documentation](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/business-discovery)

**Advantages:**
- ✅ Query by username (no need to manage User IDs)
- ✅ Works with Instagram User Access Tokens (simpler than Page tokens)
- ✅ Includes engagement metrics (likes, comments)
- ✅ Can query any Business/Creator account (not just your own)

**Steps:**

1. **Get Instagram User Access Token**:
   - Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - Select your app
   - Click **"Get User Access Token"**
   - Add permissions: `instagram_basic`, `business_management`
   - Generate and copy the token
   - **Important**: This must be an Instagram User Access Token (NOT a Facebook Page token starting with "EAA")

2. **Get Your Instagram Business Account User ID** (this is your app user's ID):
   - Visit in browser: `https://graph.instagram.com/me?fields=id,username&access_token=YOUR_TOKEN`
   - Or use Graph API Explorer: `/me?fields=id,username`
   - Copy the `id` value → This is your `INSTAGRAM_USER_ID`

3. **Set Environment Variables**:
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_instagram_user_token_here
   INSTAGRAM_USER_ID=your_instagram_user_id_here
   INSTAGRAM_USERNAME=logia_genesis_inc
   USE_BUSINESS_DISCOVERY=true
   ```
   
   - `INSTAGRAM_USERNAME`: The username you want to fetch posts from (defaults to `logia_genesis_inc`)
   - `USE_BUSINESS_DISCOVERY`: Set to `true` to enable Business Discovery API

4. **Run the Fetch Script**:
   ```bash
   npm run fetch-instagram
   ```

The script will automatically use Business Discovery API when `USE_BUSINESS_DISCOVERY=true` is set.

**Important**: Tokens expire after 60 days. You'll need to refresh them periodically or use a long-lived token.

**4. Get Your Instagram User ID**

You can get your User ID in several ways:

**Method A: Using Graph API (Recommended)**

1. Open your browser and visit:
   ```
   https://graph.instagram.com/me?fields=id,username&access_token=YOUR_ACCESS_TOKEN
   ```
   Replace `YOUR_ACCESS_TOKEN` with the token you copied above.

2. The response will look like:
   ```json
   {
     "id": "17841405309211850",
     "username": "your_username"
   }
   ```
3. Copy the `id` value → This is your `INSTAGRAM_USER_ID`

**Method B: Using Graph API Explorer**

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app and set the access token
3. Enter endpoint: `/me?fields=id,username`
4. Click **"Submit"**
5. Copy the `id` from the response

**Method C: Automatic (Script Will Fetch)**

If you don't set `INSTAGRAM_USER_ID`, the fetch script will:
- **For Facebook Page tokens (EAA)**: Automatically fetch Instagram Business Account ID from the linked Page
- **For Instagram tokens**: Attempt to fetch it using your username (`logia_genesis_inc`)

**5. Set Environment Variables**

Create a `.env` file in your project root (if it doesn't exist):

```env
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
INSTAGRAM_USER_ID=your_user_id_here
```

Or set them in your terminal:

**Windows (PowerShell):**
```powershell
$env:INSTAGRAM_ACCESS_TOKEN="your_access_token_here"
$env:INSTAGRAM_USER_ID="your_user_id_here"
```

**Windows (CMD):**
```cmd
set INSTAGRAM_ACCESS_TOKEN=your_access_token_here
set INSTAGRAM_USER_ID=your_user_id_here
```

**Linux/Mac:**
```bash
export INSTAGRAM_ACCESS_TOKEN="your_access_token_here"
export INSTAGRAM_USER_ID="your_user_id_here"
```

**6. Run the Fetch Script**

```bash
npm run fetch-instagram
```

The script will:
- Use your access token to fetch posts from Instagram Graph API
- Download images to `assets/images/instagram/`
- Save post data to `data/instagram-posts.json`

**7. For GitHub Actions**

If using GitHub Actions for deployment:
- Add `INSTAGRAM_ACCESS_TOKEN` as a GitHub Secret
- Add `INSTAGRAM_USER_ID` as a GitHub Secret (optional - script can fetch automatically)
- See `docs/GITHUB_ACTIONS_SETUP.md` for details

## Troubleshooting

### Images Not Loading

**Problem**: Placeholder images or empty feed

**Solutions**:
1. **Check local images**: Ensure images exist in `assets/images/instagram/` with correct naming (`instagram-{POST_ID}.jpg`)
2. **API token**: If using API, verify `INSTAGRAM_ACCESS_TOKEN` is set correctly
3. **Fallback**: Script automatically falls back to local images if API fails

### API Errors

**"Invalid OAuth access token" (Error 190)**
- Token is expired, invalid, or revoked
- Generate a new token following the setup steps above
- Ensure you're using the correct token type (short-lived vs long-lived)

**"Invalid user ID" (Error 100)**
- User ID is incorrect or doesn't match the account
- Verify User ID using the methods in step 4 above
- Ensure the token has access to that user account

**"User ID not found"**
- The access token doesn't have permission to access the user
- Ensure your Instagram account is added as a tester (for Basic Display)
- For Business accounts, ensure the account is linked to your Facebook Page

**"Cannot parse access token" with Facebook Page Token (EAA)**

If you're using a Facebook Page access token (starts with "EAA") and getting this error:

1. **Check Token Permissions**: Your token needs these permissions:
   - `pages_show_list` - To list your Facebook Pages
   - `pages_read_engagement` - To read Page engagement data
   - `instagram_basic` - To access Instagram data

2. **Get Your Page ID**:
   ```bash
   npm run get-facebook-page-id
   ```
   This will help you find your Page ID. Then add to `.env`:
   ```env
   FACEBOOK_PAGE_ID=your_page_id_here
   ```

3. **Alternative: Use User Access Token Instead**:
   - Generate a User Access Token (not Page token) with Instagram permissions
   - Go to Graph API Explorer → Get User Access Token
   - Add permissions: `instagram_basic`, `pages_read_engagement`, `pages_show_list`
   - This will let the script automatically find your Instagram Business Account

4. **Verify Instagram is Linked**:
   - Instagram → Settings → Account → Linked Accounts
   - Make sure your Instagram Business account is linked to the Facebook Page

**"Token not provided"**
- No access token is set in environment variables
- Check your `.env` file or environment variables
- This is expected if no token is set - script will use local images automatically
- No action needed if images are in `assets/images/instagram/`

## How It Works

1. **Script checks** for existing images in `assets/images/instagram/` first
2. **If found**: Uses them directly (no API calls)
3. **If not found**: Attempts to fetch via oEmbed API
4. **Downloads images** if fetch succeeds
5. **Saves to** `data/instagram-posts.json` for use in site

## File Structure

```
assets/images/instagram/
  ├── instagram-DCRi-2SoxNX.jpg
  ├── instagram-C32hCk5SoVd.jpg
  └── ...

data/
  └── instagram-posts.json  # Generated by fetch script
```

## GitHub Actions

For GitHub Pages deployment, the script runs automatically:
- Uses GitHub Secrets if `INSTAGRAM_ACCESS_TOKEN` is set
- Falls back to local images if API unavailable
- See `docs/GITHUB_ACTIONS_SETUP.md` for secrets configuration

---

## Additional Troubleshooting

### Instagram oEmbed API Blocked

If Instagram's oEmbed API blocks automated requests:

1. **Use local images** (recommended): Place images in `assets/images/instagram/` with format `instagram-{POST_ID}.jpg`
2. **Use Instagram Graph API**: Set up Facebook App and use access token
3. **Manual JSON editing**: Edit `data/instagram-posts.json` directly with image URLs

### Getting Direct Image URLs

1. Visit each Instagram post in browser
2. Right-click image → "Copy image address"
3. Use that URL in your config or JSON file

### API Token Expiration

Instagram Graph API tokens expire (usually 60 days). Here's how to handle token expiration:

**Option 1: Generate Long-Lived Token**

1. Generate a short-lived token (as described above)
2. Exchange it for a long-lived token (valid for 60 days):
   ```
   https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=YOUR_APP_SECRET&access_token=YOUR_SHORT_LIVED_TOKEN
   ```
   - Replace `YOUR_APP_SECRET` with your Facebook App Secret (found in App Settings → Basic)
   - Replace `YOUR_SHORT_LIVED_TOKEN` with your short-lived token
3. The response will contain a long-lived token

**Option 2: Refresh Long-Lived Token**

Before your 60-day token expires, refresh it:
```
https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=YOUR_LONG_LIVED_TOKEN
```

**Option 3: Use Local Images**

- Avoid API dependency by using local images
- Add post URLs to `config/app.config.js`
- Download images manually and place in `assets/images/instagram/`
- No token refresh needed

**Option 4: Automated Token Refresh**

For production, consider setting up automated token refresh using a cron job or scheduled task that:
1. Refreshes the token before expiration
2. Updates the environment variable or GitHub Secret
3. Triggers a rebuild

See `docs/GITHUB_ACTIONS_SETUP.md` for secrets configuration

## Adding Instagram Section to Page

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

The Instagram feed uses the same carousel styles as the testimonials section. Customize via CSS classes:
- `.instagram-section` - Section container
- `.instagram-carousel` - Carousel container
- `.instagram-card` - Individual post card
- `.instagram-image-wrapper` - Image container
- `.instagram-caption` - Post caption

---

**Last Updated**: January 2025

