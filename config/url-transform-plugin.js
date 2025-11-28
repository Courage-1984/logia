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
      // Transform HTML files in the output directory
      const outDir = resolve(process.cwd(), config.outDir);
      
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

