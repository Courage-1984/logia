# Network Optimization Guide

Comprehensive guide for optimizing network performance through server configuration, CDN usage, compression, and DNS optimization.

## Overview

This guide covers server-side and infrastructure optimizations that complement the build-time optimizations already in place.

---

## 1. HTTP/2 Server Configuration

### What is HTTP/2?

HTTP/2 is a major revision of the HTTP protocol that provides:
- **Multiplexing**: Multiple requests over a single connection
- **Header compression**: Reduced overhead
- **Server push**: Proactive resource delivery
- **Binary protocol**: More efficient than HTTP/1.1

### Benefits for Logia Genesis

- Faster page loads (especially with multiple assets)
- Reduced latency
- Better utilization of bandwidth
- Improved Core Web Vitals

### Server Configuration

#### For Nginx

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name your-domain.com;
    
    # SSL Configuration (required for HTTP/2)
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # HTTP/2 Settings
    http2_max_field_size 16k;
    http2_max_header_size 32k;
    
    # ... rest of your configuration
}
```

#### For Apache

```apache
LoadModule http2_module modules/mod_http2.so

<VirtualHost *:443>
    ServerName your-domain.com
    
    # Enable HTTP/2
    Protocols h2 http/1.1
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # ... rest of your configuration
</VirtualHost>
```

#### For Node.js/Express

If using a Node.js server:

```javascript
const https = require('https');
const http2 = require('http2');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private.key'),
  cert: fs.readFileSync('path/to/certificate.crt')
};

const server = http2.createSecureServer(options, (req, res) => {
  // Your server logic
});

server.listen(443);
```

### Verification

Check if HTTP/2 is enabled:
1. Open Chrome DevTools → Network tab
2. Look for "Protocol" column (enable it if hidden)
3. Verify requests show "h2" (HTTP/2) instead of "http/1.1"

Or use online tools:
- https://tools.keycdn.com/http2-test
- https://http2.pro/check

---

## 2. CDN Configuration

### What is a CDN?

Content Delivery Network (CDN) distributes your static assets across multiple geographically distributed servers, reducing latency by serving content from the nearest location.

### Recommended CDN Providers

1. **Cloudflare** (Free tier available)
   - Easy setup
   - Free SSL
   - DDoS protection
   - Automatic caching

2. **AWS CloudFront**
   - Enterprise-grade
   - Pay-as-you-go pricing
   - Tight AWS integration

3. **Vercel/Netlify** (for deployments)
   - Automatic CDN
   - Built-in optimizations
   - Easy deployment

### CDN Setup Steps

#### Option 1: Cloudflare (Recommended for Start)

1. **Sign up** at cloudflare.com
2. **Add your domain**
3. **Update nameservers** to Cloudflare's
4. **Enable caching**:
   - Caching → Configuration
   - Set Browser Cache TTL to "Respect Existing Headers"
   - Set Cache Level to "Standard"

5. **Configure Page Rules**:
   ```
   Pattern: *your-domain.com/assets/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 month
   ```

#### Option 2: AWS CloudFront

1. **Create S3 bucket** for static assets
2. **Upload assets** to S3
3. **Create CloudFront distribution**
4. **Configure origins** and behaviors
5. **Set caching policies**:
   - Cache-Control: `public, max-age=31536000, immutable`
   - Edge TTL: 31536000 (1 year)

### CDN Best Practices

1. **Cache static assets** (images, fonts, CSS, JS) aggressively
   - Cache-Control: `public, max-age=31536000, immutable`

2. **Don't cache HTML** aggressively (use short TTL)
   - Cache-Control: `public, max-age=3600, must-revalidate`

3. **Use versioned filenames** (already done via Vite hash)

4. **Enable compression** on CDN (gzip/brotli)

5. **Use HTTP/2** (most CDNs support it automatically)

### Adding DNS Prefetch for CDN

Once CDN is configured, add DNS prefetch to HTML:

```html
<head>
    <!-- DNS Prefetch for CDN -->
    <link rel="dns-prefetch" href="https://cdn.your-domain.com">
    
    <!-- Preconnect if CDN is on different domain -->
    <link rel="preconnect" href="https://cdn.your-domain.com" crossorigin>
    
    <!-- ... rest of head content -->
</head>
```

---

## 3. Server-Side Compression

### Overview

While build-time compression (gzip/brotli) is already configured, server-side compression ensures:
- Dynamic content is compressed
- Proper Content-Encoding headers are set
- Browser compatibility is handled

### Nginx Configuration

```nginx
server {
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Enable Brotli compression (requires ngx_brotli module)
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Don't compress already compressed files
    gzip_disable "msie6";
}
```

### Apache Configuration

```apache
# Enable gzip compression
LoadModule deflate_module modules/mod_deflate.so

<Location />
    # Compress HTML, CSS, JavaScript, Text, XML and fonts
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE font/ttf
    AddOutputFilterByType DEFLATE font/otf
    AddOutputFilterByType DEFLATE font/woff
    AddOutputFilterByType DEFLATE font/woff2
</Location>

# Enable Brotli (requires mod_brotli)
LoadModule brotli_module modules/mod_brotli.so
<Location />
    SetOutputFilter BROTLI_COMPRESS
    SetEnvIfNoCase Request_URI \
        \.(?:gif|jpe?g|png|zip|gz|bz2|sit|rar|pdf|woff|woff2|ttf|eot)$ no-brotli
</Location>
```

### Node.js/Express Configuration

```javascript
const compression = require('compression');
const express = require('express');

const app = express();

// Enable gzip compression
app.use(compression({
    filter: (req, res) => {
        // Don't compress if explicitly disabled
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Use compression middleware
        return compression.filter(req, res);
    },
    level: 6, // Compression level (1-9)
    threshold: 1024, // Only compress if > 1KB
}));

// For Brotli, use shrink-ray-current
const shrinkRay = require('shrink-ray-current');
app.use(shrinkRay());
```

### Verification

Check compression is working:
1. Chrome DevTools → Network tab
2. Click on a resource
3. Check "Response Headers" for:
   - `Content-Encoding: gzip` or `Content-Encoding: br`
   - `Vary: Accept-Encoding`

Or use online tools:
- https://tools.keycdn.com/gzip-test
- https://www.giftofspeed.com/gzip-test/

---

## 4. DNS Optimization

### DNS Prefetch

DNS prefetch resolves domain names before resources are requested, reducing DNS lookup time.

### When to Use DNS Prefetch

Use for external domains that will be accessed:
- Third-party APIs
- Analytics services (Google Analytics, etc.)
- CDN domains
- Social media embeds
- External fonts (if not self-hosted)

### Implementation

Add to `<head>` section of HTML files:

```html
<head>
    <!-- DNS Prefetch for external domains -->
    <link rel="dns-prefetch" href="https://www.google-analytics.com">
    <link rel="dns-prefetch" href="https://cdn.your-domain.com">
    
    <!-- Preconnect for critical external resources -->
    <link rel="preconnect" href="https://api.example.com" crossorigin>
    
    <!-- ... rest of head content -->
</head>
```

### DNS Prefetch for Logia Genesis

Since fonts and assets are self-hosted, DNS prefetch is optional but can be added for:

1. **Analytics** (if added):
   ```html
   <link rel="dns-prefetch" href="https://www.google-analytics.com">
   <link rel="dns-prefetch" href="https://www.googletagmanager.com">
   ```

2. **CDN** (if using):
   ```html
   <link rel="dns-prefetch" href="https://cdn.your-domain.com">
   <link rel="preconnect" href="https://cdn.your-domain.com" crossorigin>
   ```

3. **Social Media** (if adding embeds):
   ```html
   <link rel="dns-prefetch" href="https://platform.twitter.com">
   <link rel="dns-prefetch" href="https://www.facebook.com">
   ```

### Preconnect vs DNS Prefetch

- **DNS Prefetch**: Only resolves DNS (fastest, least overhead)
- **Preconnect**: Resolves DNS + establishes connection (use for critical resources)

Use `preconnect` for resources that will be loaded immediately:
```html
<link rel="preconnect" href="https://api.example.com" crossorigin>
```

Use `dns-prefetch` for resources that might be loaded later:
```html
<link rel="dns-prefetch" href="https://analytics.example.com">
```

---

## 5. Cache Headers

### Static Assets

Set aggressive caching for immutable assets:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg|webp|avif)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

Or via Apache:

```apache
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg|webp|avif)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>
```

### HTML Files

Use shorter cache with revalidation:

```nginx
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, max-age=3600, must-revalidate";
}
```

Or via Apache:

```apache
<FilesMatch "\.html$">
    ExpiresActive On
    ExpiresDefault "access plus 1 hour"
    Header set Cache-Control "public, max-age=3600, must-revalidate"
</FilesMatch>
```

---

## 6. Testing Network Optimizations

### Tools

1. **Chrome DevTools**
   - Network tab: Check protocol, compression, cache headers
   - Performance tab: Analyze loading performance

2. **WebPageTest**
   - https://www.webpagetest.org/
   - Test from multiple locations
   - Check HTTP/2 usage
   - Verify compression

3. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Mobile and desktop scores
   - Core Web Vitals

4. **GTmetrix**
   - https://gtmetrix.com/
   - Performance grades
   - Detailed recommendations

### Key Metrics to Check

- ✅ HTTP/2 enabled (Protocol: h2)
- ✅ Compression enabled (Content-Encoding: gzip/br)
- ✅ Cache headers set correctly
- ✅ DNS prefetch/preconnect for external domains
- ✅ CDN serving static assets (if using)

---

## 7. Implementation Checklist

### Immediate Actions

- [ ] **Verify HTTP/2 support** on server
- [ ] **Enable gzip/brotli compression** on server
- [ ] **Set cache headers** for static assets
- [ ] **Set cache headers** for HTML

### Optional Enhancements

- [ ] **Set up CDN** (Cloudflare, CloudFront, etc.)
- [ ] **Add DNS prefetch** for external domains (analytics, CDN, etc.)
- [ ] **Configure CDN caching** policies
- [ ] **Monitor performance** after changes

### Future Considerations

- [ ] **HTTP/3** support (when widely available)
- [ ] **Edge computing** for dynamic content
- [ ] **Regional CDN** distribution

---

## Summary

Network optimizations complement build-time optimizations:

1. **HTTP/2** - Faster protocol with multiplexing
2. **CDN** - Geographic distribution of assets
3. **Compression** - Server-side gzip/brotli
4. **DNS Prefetch** - Faster DNS resolution
5. **Cache Headers** - Browser and CDN caching

These optimizations work together with existing build optimizations to deliver the best possible performance.

---

**Last Updated:** 2025  
**Version:** 1.0

