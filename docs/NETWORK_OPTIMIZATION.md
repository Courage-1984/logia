# Network Optimization Playbook

Quick reference for server-side optimizations. See `PERFORMANCE_CHECKLIST.md` for client-side status.

## Quick Checklist

- [ ] **HTTP/2** - Enable on server (required for HTTPS)
- [ ] **Compression** - Enable gzip/brotli on server
- [ ] **Cache Headers** - Set for static assets (1 year) and HTML (1 hour)
- [ ] **CDN** (optional) - Cloudflare, CloudFront, etc.

---

## 1. HTTP/2

### Nginx
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    http2_max_field_size 16k;
    http2_max_header_size 32k;
}
```

### Apache
```apache
LoadModule http2_module modules/mod_http2.so

<VirtualHost *:443>
    Protocols h2 http/1.1
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
</VirtualHost>
```

**Verify**: Chrome DevTools → Network → Protocol column shows "h2"  
**Test**: https://tools.keycdn.com/http2-test

---

## 2. Server-Side Compression

### Nginx
```nginx
gzip on;
gzip_vary on;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript image/svg+xml;

# Brotli (requires ngx_brotli module)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml text/javascript application/json application/javascript image/svg+xml;
```

### Apache
```apache
LoadModule deflate_module modules/mod_deflate.so

<Location />
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml
</Location>
```

**Verify**: Chrome DevTools → Network → Response Headers → `Content-Encoding: gzip` or `br`

---

## 3. Cache Headers

### Static Assets (1 year)
**Nginx:**
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg|webp|avif)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**Apache:**
```apache
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg|webp|avif)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

### HTML Files (1 hour)
**Nginx:**
```nginx
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, max-age=3600, must-revalidate";
}
```

**Apache:**
```apache
<FilesMatch "\.html$">
    ExpiresActive On
    ExpiresDefault "access plus 1 hour"
    Header set Cache-Control "public, max-age=3600, must-revalidate"
</FilesMatch>
```

---

## 4. CDN Setup (Optional)

### Cloudflare (Recommended)
1. Sign up → Add domain → Update nameservers
2. **Caching → Configuration**:
   - Browser Cache TTL: "Respect Existing Headers"
   - Cache Level: "Standard"
3. **Page Rules**:
   ```
   Pattern: *your-domain.com/assets/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 month
   ```

### DNS Prefetch (if using CDN)
Add to HTML `<head>`:
```html
<link rel="dns-prefetch" href="https://cdn.your-domain.com">
<link rel="preconnect" href="https://cdn.your-domain.com" crossorigin>
```

---

## 5. Testing

**Tools:**
- Chrome DevTools → Network tab (check Protocol, Content-Encoding, Cache-Control headers)
- WebPageTest: https://www.webpagetest.org/
- PageSpeed Insights: https://pagespeed.web.dev/

**Key Checks:**
- ✅ Protocol: `h2` (HTTP/2)
- ✅ Content-Encoding: `gzip` or `br`
- ✅ Cache-Control headers set correctly
- ✅ Static assets: `max-age=31536000, immutable`
- ✅ HTML: `max-age=3600, must-revalidate`

---

**Note**: Service worker (`public/service-worker.js`) provides runtime caching even when server headers aren't configurable (e.g., GitHub Pages).

**Last Updated**: January 2025
