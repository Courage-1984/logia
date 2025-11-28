/**
 * Vite Plugin: URL Transform
 * Transforms URLs in HTML files based on build target
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { getBuildConfig } from './build-config.js';

/**
 * Transform URLs in HTML content based on build config
 * @param {string} html - HTML content
 * @param {object} config - Build configuration
 * @param {string} filePath - Path to the HTML file
 * @returns {string} Transformed HTML
 */
function transformUrls(html, config, filePath) {
  const baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const basePath = (config.basePath || '/').replace(/\/$/, ''); // Remove trailing slash, keep leading
  
  // Get relative path for this file (for canonical URLs)
  const fileName = filePath.split('/').pop() || 'index.html';
  const pagePath = fileName === 'index.html' ? '' : fileName.replace(/^\//, '');
  
  // Build canonical URL: baseUrl + basePath + pagePath
  // For GitHub Pages: https://courage-1984.github.io/logia/about.html
  // For production: https://www.logia.co.za/about.html
  let canonicalUrl;
  if (basePath && basePath !== '/') {
    // Has basePath (GitHub Pages case)
    canonicalUrl = pagePath 
      ? `${baseUrl}${basePath}/${pagePath}`
      : `${baseUrl}${basePath}/`;
  } else {
    // No basePath (production case)
    canonicalUrl = pagePath 
      ? `${baseUrl}/${pagePath}`
      : baseUrl;
  }
  
  // Replace canonical URLs
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']+["']\s*>/gi,
    `<link rel="canonical" href="${canonicalUrl}">`
  );
  
  // Replace Open Graph URLs
  html = html.replace(
    /<meta\s+property=["']og:url["']\s+content=["'][^"']+["']\s*>/gi,
    `<meta property="og:url" content="${canonicalUrl}">`
  );
  
  // Replace Open Graph images (keep absolute URLs with basePath)
  const imageBaseUrl = basePath && basePath !== '/' ? `${baseUrl}${basePath}` : baseUrl;
  html = html.replace(
    /<meta\s+property=["']og:image["']\s+content=["']https:\/\/[^"']+logia\.co\.za\//gi,
    `<meta property="og:image" content="${imageBaseUrl}/`
  );
  
  // Replace Twitter Card images (keep absolute URLs with basePath)
  html = html.replace(
    /<meta\s+name=["']twitter:image["']\s+content=["']https:\/\/[^"']+logia\.co\.za\//gi,
    `<meta name="twitter:image" content="${imageBaseUrl}/`
  );
  
  // Replace structured data URLs (JSON-LD)
  // Need to handle basePath for GitHub Pages
  const structuredDataBaseUrl = basePath && basePath !== '/' ? `${baseUrl}${basePath}` : baseUrl;
  
  html = html.replace(
    /"url":\s*"https:\/\/[^"']*logia\.co\.za([^"]*)"/gi,
    (match, path) => {
      // Preserve the path but ensure it starts with basePath if needed
      const cleanPath = path.replace(/^\//, '');
      if (basePath && basePath !== '/') {
        return `"url": "${structuredDataBaseUrl}/${cleanPath}"`;
      }
      return `"url": "${baseUrl}/${cleanPath}"`;
    }
  );
  
  html = html.replace(
    /"@id":\s*"https:\/\/[^"']*logia\.co\.za([^"]*)"/gi,
    (match, path) => {
      const cleanPath = path.replace(/^\//, '');
      if (basePath && basePath !== '/') {
        return `"@id": "${structuredDataBaseUrl}/${cleanPath}"`;
      }
      return `"@id": "${baseUrl}/${cleanPath}"`;
    }
  );
  
  html = html.replace(
    /"item":\s*"https:\/\/[^"']*logia\.co\.za([^"]*)"/gi,
    (match, path) => {
      const cleanPath = path.replace(/^\//, '');
      if (basePath && basePath !== '/') {
        return `"item": "${structuredDataBaseUrl}/${cleanPath}"`;
      }
      return `"item": "${baseUrl}/${cleanPath}"`;
    }
  );
  
  html = html.replace(
    /"target":\s*"https:\/\/[^"']*logia\.co\.za([^"]*)"/gi,
    (match, path) => {
      const cleanPath = path.replace(/^\//, '');
      if (basePath && basePath !== '/') {
        return `"target": "${structuredDataBaseUrl}/${cleanPath}"`;
      }
      return `"target": "${baseUrl}/${cleanPath}"`;
    }
  );
  
  // Replace logo URLs in structured data
  html = html.replace(
    /"logo":\s*"https:\/\/[^"']*logia\.co\.za([^"]*)"/gi,
    (match, path) => {
      const cleanPath = path.replace(/^\//, '');
      if (basePath && basePath !== '/') {
        return `"logo": "${structuredDataBaseUrl}/${cleanPath}"`;
      }
      return `"logo": "${baseUrl}/${cleanPath}"`;
    }
  );
  
  html = html.replace(
    /"image":\s*"https:\/\/[^"']*logia\.co\.za([^"]*)"/gi,
    (match, path) => {
      const cleanPath = path.replace(/^\//, '');
      if (basePath && basePath !== '/') {
        return `"image": "${structuredDataBaseUrl}/${cleanPath}"`;
      }
      return `"image": "${baseUrl}/${cleanPath}"`;
    }
  );
  
  // Transform relative asset paths in HTML (images, etc.)
  // Only transform if basePath is set (GitHub Pages case)
  if (basePath && basePath !== '/') {
    // Ensure basePath ends with a slash for proper path joining
    // basePath already has trailing slash removed, so we add it back
    const basePathWithSlash = `${basePath}/`;
    
    // Transform src attributes with relative asset paths
    // Match: src="assets/..." or src="/assets/..." (but not absolute URLs or paths that already have basePath)
    html = html.replace(
      /(<img[^>]*\ssrc=["'])(?!https?:\/\/)(?!\/logia\/)(\/?)(assets\/[^"']+)(["'])/gi,
      (match, prefix, leadingSlash, assetPath, suffix) => {
        // Remove leading slash if present, then add basePath with slash
        const cleanPath = assetPath.replace(/^\//, '');
        const transformedPath = `${basePathWithSlash}${cleanPath}`;
        return `${prefix}${transformedPath}${suffix}`;
      }
    );
    
    // Transform srcset attributes with relative asset paths
    // This is more complex as srcset can contain multiple URLs with descriptors
    // Pattern: "path1 320w, path2 640w, ..." or "path1, path2 2x, ..."
    html = html.replace(
      /(<source[^>]*\ssrcset=["'])([^"']+)(["'])/gi,
      (match, prefix, srcsetValue, suffix) => {
        // Split srcset by comma, transform each URL
        const transformedSrcset = srcsetValue.split(',').map(entry => {
          const trimmed = entry.trim();
          // Match: "path descriptor" or just "path"
          const parts = trimmed.match(/^(\S+)(\s+.+)?$/);
          if (parts) {
            const url = parts[1];
            const descriptor = parts[2] || '';
            
            // Only transform if it's a relative asset path (starts with assets/ or /assets/)
            // But not if it already has basePath or is an absolute URL
            if ((url.startsWith('assets/') || url.startsWith('/assets/')) && 
                !url.startsWith(basePath) && 
                !url.startsWith('http://') && 
                !url.startsWith('https://')) {
              const cleanUrl = url.replace(/^\//, '');
              const transformedUrl = `${basePathWithSlash}${cleanUrl}`;
              return `${transformedUrl}${descriptor}`;
            }
            // If it's already an absolute URL or has basePath, leave it
            return trimmed;
          }
          return trimmed;
        }).join(', ');
        
        return `${prefix}${transformedSrcset}${suffix}`;
      }
    );
    
    // Also transform img srcset attributes
    html = html.replace(
      /(<img[^>]*\ssrcset=["'])([^"']+)(["'])/gi,
      (match, prefix, srcsetValue, suffix) => {
        const transformedSrcset = srcsetValue.split(',').map(entry => {
          const trimmed = entry.trim();
          const parts = trimmed.match(/^(\S+)(\s+.+)?$/);
          if (parts) {
            const url = parts[1];
            const descriptor = parts[2] || '';
            
            if ((url.startsWith('assets/') || url.startsWith('/assets/')) && 
                !url.startsWith(basePath) && 
                !url.startsWith('http://') && 
                !url.startsWith('https://')) {
              const cleanUrl = url.replace(/^\//, '');
              const transformedUrl = `${basePathWithSlash}${cleanUrl}`;
              return `${transformedUrl}${descriptor}`;
            }
            return trimmed;
          }
          return trimmed;
        }).join(', ');
        
        return `${prefix}${transformedSrcset}${suffix}`;
      }
    );
  }
  
  return html;
}

/**
 * Vite plugin to transform URLs in HTML files
 * @param {string} mode - Build mode
 * @returns {object} Vite plugin
 */
export function urlTransformPlugin(mode = 'production') {
  const config = getBuildConfig(mode);
  
  return {
    name: 'url-transform',
    enforce: 'post',
    generateBundle(options, bundle) {
      // Transform HTML files in the bundle
      Object.keys(bundle).forEach((fileName) => {
        const file = bundle[fileName];
        
        if (file.type === 'asset' && fileName.endsWith('.html')) {
          const html = file.source.toString();
          const transformedHtml = transformUrls(html, config, fileName);
          file.source = transformedHtml;
        }
      });
    },
    writeBundle(options, bundle) {
      // Also transform HTML files after they're written
      // This handles files that might not be in the bundle
      const outDir = options.dir || config.outDir;
      
      // We'll handle this in the closeBundle hook instead
    },
    closeBundle() {
      // Transform HTML and CSS files in the output directory
      const outDir = resolve(process.cwd(), config.outDir);
      const basePath = (config.basePath || '/').replace(/\/$/, ''); // Remove trailing slash, keep leading
      
      function processDirectory(dir) {
        try {
          const files = readdirSync(dir);
          
          files.forEach((file) => {
            const filePath = resolve(dir, file);
            const stat = statSync(filePath);
            
            if (stat.isDirectory()) {
              processDirectory(filePath);
            } else if (file.endsWith('.html')) {
              const html = readFileSync(filePath, 'utf-8');
              const transformedHtml = transformUrls(html, config, file);
              writeFileSync(filePath, transformedHtml, 'utf-8');
            } else if (file.endsWith('.css') && basePath && basePath !== '/') {
              // Transform CSS files for GitHub Pages (fix font paths)
              const css = readFileSync(filePath, 'utf-8');
              // Transform relative font paths: url(../assets/fonts/...) -> url(../assets/fonts/...)
              // Actually, relative paths should work, but let's ensure absolute paths work too
              // Transform: url(../assets/fonts/...) when CSS is in /logia/css/ and fonts are in /logia/assets/fonts/
              // The relative path ../assets/ from /logia/css/ should resolve to /logia/assets/
              // But if the CSS is processed and moved, we might need to adjust
              // For now, let's transform any url() that references assets/ to use basePath
              const transformedCss = css.replace(
                /url\((["']?)(\.\.\/)*assets\/([^"')]+)(["']?)\)/gi,
                (match, quote1, dots, assetPath, quote2) => {
                  // If basePath is set, we need to ensure the path is correct
                  // If CSS is at /logia/css/file.css and font is at /logia/assets/fonts/font.woff2
                  // Relative path ../assets/ should work, but let's make it absolute with basePath
                  const cleanPath = assetPath.replace(/^\//, '');
                  return `url(${quote1}${basePath}assets/${cleanPath}${quote2})`;
                }
              );
              writeFileSync(filePath, transformedCss, 'utf-8');
            }
          });
        } catch (error) {
          // Directory might not exist yet, that's okay
          if (error.code !== 'ENOENT') {
            console.warn(`Warning: Could not process directory ${dir}:`, error.message);
          }
        }
      }
      
      processDirectory(outDir);
    },
  };
}

