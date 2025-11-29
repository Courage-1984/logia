# cPanel Network Optimization Guide

Step-by-step guide for implementing network optimizations via cPanel interface.

## Overview

Based on your cPanel dashboard, you can implement:
1. ✅ **Gzip Compression** - Via "Optimize Website" tool
2. ✅ **Cache Headers** - Via `.htaccess` file in File Manager
3. ⚠️ **HTTP/2** - Typically enabled by hosting provider (check SSL/TLS status)
4. 📝 **Verification** - Test via browser DevTools

---

## Step 1: Enable Gzip Compression

### Using "Optimize Website" Tool

1. **Navigate to**: `Software` → `Optimize Website`
   - You'll see this in your main content area under the "Software" section

2. **Select Your Domain**: 
   - Choose `logia.co.za` from the dropdown

3. **Enable Compression**:
   - Select **"Compress all content"** option
   - This enables gzip compression for HTML, CSS, JavaScript, and other text files

4. **Save Changes**: Click "Update Settings" or "Optimize"

**What this does**: Automatically configures Apache's `mod_deflate` module to compress content, reducing file sizes by 60-80%.

---

## Step 2: Configure Cache Headers via .htaccess

### Using File Manager

1. **Navigate to**: `Files` → `File Manager`
   - You'll see this in the main content area under the "Files" section

2. **Show Hidden Files**:
   - In File Manager, click **Settings** (gear icon) in the top right
   - Check **"Show Hidden Files (dotfiles)"**
   - Click "Save"

3. **Navigate to Root Directory**:
   - You should be in `/home/logiaco/public_html/` (your home directory)
   - This is where your website files are located

4. **Create or Edit .htaccess**:
   - If `.htaccess` doesn't exist: Click **"+ File"** → Name it `.htaccess`
   - If `.htaccess` exists: Click on it → Select **"Edit"**

5. **Add Cache Headers Configuration**:
   - Add the following Apache configuration at the **end** of your `.htaccess` file:

```apache
# ============================================
# Network Optimization - Cache Headers
# ============================================

# Enable Expires headers
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Static assets: 1 year cache
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/avif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType image/vnd.microsoft.icon "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/ttf "access plus 1 year"
    ExpiresByType font/otf "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
    
    # HTML files: 1 hour cache
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Set Cache-Control headers (if mod_headers is available)
<IfModule mod_headers.c>
    # Static assets: long-term cache with immutable
    <FilesMatch "\.(jpg|jpeg|png|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|css|js)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # HTML files: short-term cache
    <FilesMatch "\.html$">
        Header set Cache-Control "public, max-age=3600, must-revalidate"
    </FilesMatch>
</IfModule>
```

6. **Save Changes**: Click **"Save Changes"** in the editor

**Important Notes**:
- If you already have a `.htaccess` file, add this at the end (before any closing tags)
- The `<IfModule>` directives ensure the code only runs if the required Apache modules are loaded
- This won't break your site if modules aren't available

---

## Step 3: Check SSL/HTTP/2 Status

1. **Navigate to**: `Security` → `SSL/TLS Status`
   - You'll see this in the main content area under the "Security" section

2. **Review SSL Configuration**:
   - Your domain should show SSL certificate status
   - HTTP/2 is typically **automatically enabled** by the hosting provider when SSL is active
   - Look for "Protocols Supported: HTTP/2" or similar indicator

3. **If HTTP/2 Not Enabled**:
   - Contact your hosting provider - HTTP/2 is usually server-level and may require their configuration
   - Most modern cPanel hosting providers enable it by default with SSL

---

## Step 4: Verify Optimizations

### Test Compression (gzip/Brotli)

1. **Open Your Website**: Navigate to `https://www.logia.co.za` in Chrome

2. **Open DevTools**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

3. **Go to Network Tab**: Click the "Network" tab

4. **Reload Page**: Press `F5` or `Ctrl+R` to reload

5. **Check Response Headers**:
   - Click on any CSS, JS, or HTML file
   - Look at the "Response Headers" section
   - You should see: `Content-Encoding: br` (Brotli - **even better than gzip!**) or `Content-Encoding: gzip`
   - **Note**: Brotli (`br`) provides 15-25% better compression than gzip

### Test Cache Headers

1. **In the Same Network Tab**:
   - Click on an image file (`.jpg`, `.png`, etc.)
   - Check "Response Headers"
   - Look for: `Cache-Control: public, max-age=31536000, immutable`
   
2. **For HTML Files**:
   - Click on an `.html` file
   - Check "Response Headers"
   - Look for: `Cache-Control: public, max-age=3600, must-revalidate`

### Test HTTP/2

1. **In Network Tab**:
   - Look at the "Protocol" column (you may need to enable it)
   - Right-click column headers → Check "Protocol"
   - Reload the page
   - You should see `h2` for HTTP/2 or `http/2.0`

2. **Alternative Test**: Visit https://tools.keycdn.com/http2-test
   - Enter your domain: `logia.co.za`
   - Check if HTTP/2 is supported

---

## Troubleshooting

### Compression Not Working

**If you see `Content-Encoding: br` (Brotli)**: ✅ Perfect! This is actually better than gzip.

**If you don't see any compression**:
- Check if mod_deflate (gzip) or mod_brotli is enabled
- The build process pre-generates `.br` files - your server may be serving those
- Contact hosting if compression headers are missing

**Understanding Compression**:
- `Content-Encoding: br` = Brotli (best compression, ~20% smaller than gzip)
- `Content-Encoding: gzip` = Gzip (good compression, widely supported)
- Either is acceptable, but Brotli is preferred for modern browsers

### Cache Headers Not Working

**Check if mod_expires/mod_headers are enabled**:
- The `<IfModule>` directives prevent errors if modules aren't loaded
- If headers don't appear, contact hosting to enable these modules

### 500 Error After Editing .htaccess

1. **Revert Changes**: Delete the lines you just added
2. **Check Syntax**: Ensure all tags are properly closed
3. **Contact Support**: If error persists, contact hosting provider

---

## Additional cPanel Optimizations (Optional)

### 1. Enable LiteSpeed Cache

**You have both available!** Here's how to configure them:

#### LiteSpeed Web Cache Manager (LSCache) - Already Active!

**Good News:** LSCache (LiteSpeed Cache) is likely already enabled and working for your static site! LiteSpeed servers automatically cache static HTML pages and assets.

**What is LSCache?**
- Server-level caching that dramatically reduces page load times
- Handles traffic spikes with ease
- Provides exceptional user experience
- Works automatically for static sites (HTML/CSS/JS)

**What You'll See in the Interface:**

The LiteSpeed Web Cache Manager shows information about LSCache and provides cache management options:

1. **Information Panel**: Explains what LSCache does and its benefits
2. **Flush LSCache**: Clears cache for individual sites (if you have site-specific options)
3. **Flush All**: Clears cache for ALL sites on your account

---

### How to Use LSCache

#### ✅ For Static Sites (Like Yours)

**LSCache is Already Working!**

For static HTML sites, LSCache automatically caches your pages when they're accessed. No configuration needed - it just works!

**Your Setup:**
- ✅ LSCache is active at the server level
- ✅ Automatically caches HTML, CSS, JS, images
- ✅ Works with your `.htaccess` cache headers
- ✅ Complements your service worker

#### 🔄 Flushing Cache (After Deployments)

**When to Flush:**
- After uploading new files to your server
- When you've made changes to HTML, CSS, or JS files
- If you notice visitors seeing old content

**How to Flush:**

1. **Flush All** (Recommended after deployments):
   - Click **"Flush All"** button
   - **⚠️ Warning Message**: You'll see: *"Caution: This will clear the cache for all owned LSCache enabled sites."*
   - **What this means**: If you have multiple sites on your account, it clears cache for ALL of them
   - **When to use**: 
     - ✅ After deploying updates to your site
     - ✅ When you want to ensure all visitors see the latest version
     - ⚠️ Only use if you're okay clearing cache for all your sites, or if `logia.co.za` is your only site
   - **Is it safe?** Yes! Your site will continue working normally - it just rebuilds the cache as visitors access pages

2. **Flush Single Site** (If available):
   - The warning message mentions: *"If you would like to flush LSCache for a single site, please do so through the administrator backend/dashboard for that site."*
   - Some hosting setups allow site-specific cache flushing through WordPress/application dashboards
   - For a static site like yours, "Flush All" is usually fine (especially if you only have one site)
   - If you have multiple sites and only want to clear one, check if your hosting provides site-specific cache controls

**Typical Workflow:**
1. Build your site: `npm run build`
2. Upload files to server (via FTP/cPanel File Manager)
3. **Flush LSCache**: Click "Flush All" in LiteSpeed Web Cache Manager
4. Service worker auto-updates on next visit (cache versioning)
5. Done! Visitors now see the latest version

---

### Advanced Operations

#### Restart Detached PHP Processes

If you see an option labeled **"Restart Detached PHP Processes"** (or just **"Restart"**) in the LiteSpeed Web Cache Manager, this will instruct LiteSpeed Web Server to restart all detached PHP processes under your account the next time PHP is requested. This can help resolve certain PHP caching or process issues.

> **Should I click restart?**  
> For most static sites, this isn't necessary. If you're troubleshooting, have just updated your PHP code, or were advised by support, you can safely click **Restart** to refresh PHP processes. Otherwise, it's okay to leave it alone.

---

**Benefits for Your Site:**
- ✅ Faster page loads for first-time visitors (server-side cache)
- ✅ Reduced server load during traffic spikes
- ✅ Better performance scores (Lighthouse, PageSpeed)
- ✅ Works seamlessly with your existing caching layers

#### LiteSpeed Redis Cache Manager (Optional - Less Critical for Static Sites)

Redis is an in-memory database cache, more useful for dynamic sites. For a static site like yours, this is optional but can still help.

**When to Enable:**
- If you have dynamic features (database queries, API calls)
- If you want to cache data lookups (Google Reviews, Instagram posts)
- For future scalability if you add dynamic features

**Step-by-Step Setup:**

1. **Navigate to**: `Advanced` → `LiteSpeed Redis Cache Manager`

2. **Check Status**:
   - See if Redis is already running (should show "Running" status)
   - If not running, you may need to install/enable it first

3. **Enable for Your Site** (if applicable):
   - Some hosts auto-enable Redis for all sites
   - If you see options, enable Redis caching for `logia.co.za`

4. **Configure TTL** (Time To Live):
   - Set to `1 hour` (3600 seconds) for data caching
   - This works well with your service worker's 1-hour data cache TTL

**Note:** For a pure static site, Redis cache may not provide significant benefits beyond Web Cache. Focus on **LiteSpeed Web Cache Manager** first.

---

### Integration with Your Existing Setup

**Your Caching Layers (from fastest to slowest):**

1. **LiteSpeed Web Cache** (Server memory) → Instant
2. **Service Worker** (Browser cache) → Instant (already cached)
3. **In-Memory Cache** (JavaScript) → Instant (page transitions)
4. **Browser Cache** (via `.htaccess` headers) → Fast (cached assets)
5. **Network Request** → Slower (if nothing cached)

**All layers work together for maximum performance!**

**Cache Purge Workflow After Deploying:**

1. Upload new files to server
2. Purge LiteSpeed cache: `Advanced` → `LiteSpeed Web Cache Manager` → `Purge All`
3. Service worker will auto-update on next visit (cache versioning)
4. Browser cache updates automatically based on file hashes

---

### 2. Check PHP Version
- Navigate to: `Software` → `MultiPHP Manager`
- Ensure you're using PHP 8.0+ for best performance

### 3. Monitor Resource Usage
- Check the right sidebar "Statistics" section regularly
- Monitor disk usage, bandwidth, and resource limits

---

## Quick Verification Checklist

After implementing, verify:

- [ ] Compression enabled (check DevTools → Network → Response Headers → `Content-Encoding: br` or `gzip` - Brotli is preferred)
- [ ] Static assets have 1-year cache headers (`Cache-Control: public, max-age=31536000, immutable`)
- [ ] HTML files have 1-hour cache headers (`Cache-Control: public, max-age=3600, must-revalidate`)
- [ ] HTTP/2 protocol active (DevTools → Network → Protocol column shows `h2`)
- [ ] LSCache working (check for `X-LiteSpeed-Cache` header in DevTools)
- [ ] No 500 errors on website
- [ ] Website loads normally

### Verify LiteSpeed Cache (LSCache) is Working

LSCache is usually enabled automatically on LiteSpeed servers. Verify it's working:

1. **Check Cache Headers**:
   - Open DevTools → Network tab
   - Reload your site
   - Click on an HTML file
   - Look for `X-LiteSpeed-Cache` header in Response Headers
   - Should show: `X-LiteSpeed-Cache: hit` or `X-LiteSpeed-Cache: miss, store` (first time)
   
2. **Test Cache Hit**:
   - **First load**: Should show `X-LiteSpeed-Cache: miss, store` (cache being built)
   - **Second load**: Should show `X-LiteSpeed-Cache: hit` (served from cache!)
   - This confirms LSCache is caching your pages

3. **If You Don't See the Header**:
   - LSCache may not be enabled for your site
   - Contact your hosting provider to enable it
   - Or check if your site needs any specific configuration

---

## Testing Tools

**Online Tools**:
- **HTTP/2 Test**: https://tools.keycdn.com/http2-test
- **Compression Test**: https://checkgzipcompression.com/
- **Cache Header Check**: https://www.webpagetest.org/
- **PageSpeed Insights**: https://pagespeed.web.dev/

**Browser DevTools**:
- Chrome DevTools → Network tab (check Protocol, Content-Encoding, Cache-Control)

---

## Notes

- **Service Worker**: Your project already has a service worker (`public/service-worker.js`) that provides runtime caching even if server headers aren't configurable. It works seamlessly with LiteSpeed cache.
- **Build Process**: The Vite build process already generates `.br` (Brotli) compressed files in `dist/` - these are additional optimizations on top of server settings
- **Cache Layering**: LiteSpeed Web Cache (server) + Service Worker (browser) + Browser Cache (headers) = Triple-layer caching for maximum performance!
- **Cache Conflicts**: No conflicts between LiteSpeed and service worker - they work at different levels (server vs. browser) and complement each other
- **CDN**: For additional performance, consider Cloudflare (see `NETWORK_OPTIMIZATION.md` section 4)

### Important: After Deploying New Builds

**Deployment Workflow:**

1. **Build your site**: `npm run build`
2. **Upload files**: Via FTP or cPanel File Manager to your server
3. **Flush LSCache**: 
   - Go to `Advanced` → `LiteSpeed Web Cache Manager`
   - Click **"Flush All"** button
   - Confirm the action
4. **Service worker auto-updates**: On next visit (thanks to cache versioning in `service-worker.js`)
5. **Browser cache updates**: Automatically (Vite generates hashed filenames)

**Why Flush LSCache?** 
LSCache stores your HTML pages in server memory for instant delivery. After uploading new versions, flushing ensures visitors get the latest content immediately instead of cached versions.

**Note:** For static sites with hashed filenames (like your Vite build), CSS/JS assets automatically get new URLs, so they bypass cache. HTML files benefit most from flushing since they use the same URLs.

---

**Last Updated**: January 2025

