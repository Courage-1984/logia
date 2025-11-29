// ============================================
// LOGIA GENESIS - CACHE WARMING
// Pre-loads critical pages and assets for faster navigation
// ============================================

import { getBasePath } from '../utils/path.js';
import cacheManager from './cache-manager.js';

/**
 * Critical pages to warm up (pre-load)
 */
const CRITICAL_PAGES = [
  'about.html',
  'services.html',
  'contact.html',
  'portfolio.html'
];

/**
 * Warm up cache for critical pages
 * Loads pages in background after initial page load
 */
export const warmCache = () => {
  // Only warm cache on fast connections
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = connection && connection.saveData;
  const effectiveType = connection && connection.effectiveType;
  const isSlowConnection = effectiveType && /(^2g$|^slow-2g$)/.test(effectiveType);
  
  if (saveData || isSlowConnection) {
    return; // Don't warm cache on slow connections
  }
  
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    window.addEventListener('load', () => {
      setTimeout(warmPages, 2000); // Wait 2 seconds after load
    });
  } else {
    setTimeout(warmPages, 2000);
  }
};

/**
 * Warm up critical pages
 */
const warmPages = () => {
  const basePath = getBasePath();
  
  CRITICAL_PAGES.forEach((page, index) => {
    // Stagger requests to avoid overwhelming the network
    setTimeout(() => {
      const url = basePath ? `${basePath}/${page}` : `/${page}`;
      
      // Check if already cached
      if (cacheManager.getPage(url)) {
        return; // Already cached
      }
      
      // Fetch in background
      fetch(url)
        .then(response => {
          if (response.ok) {
            return response.text();
          }
          return null;
        })
        .then(html => {
          if (html) {
            cacheManager.setPage(url, html);
            console.log(`✅ Cache warmed: ${page}`);
          }
        })
        .catch(error => {
          // Silently fail - cache warming is optional
          console.debug(`Cache warming failed for ${page}:`, error);
        });
    }, index * 500); // 500ms delay between each page
  });
};

/**
 * Warm up critical data (reviews, Instagram posts)
 */
export const warmDataCache = () => {
  // Only warm data on fast connections
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = connection && connection.saveData;
  const effectiveType = connection && connection.effectiveType;
  const isSlowConnection = effectiveType && /(^2g$|^slow-2g$)/.test(effectiveType);
  
  if (saveData || isSlowConnection) {
    return;
  }
  
  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    window.addEventListener('load', () => {
      setTimeout(warmData, 3000); // Wait 3 seconds after load
    });
  } else {
    setTimeout(warmData, 3000);
  }
};

/**
 * Warm up data cache
 */
const warmData = () => {
  const basePath = getBasePath();
  
  // Warm up Google Reviews
  const reviewsUrl = basePath ? `${basePath}/data/google-reviews.json` : '/data/google-reviews.json';
  if (!cacheManager.getData('google-reviews')) {
    fetch(reviewsUrl)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) {
          cacheManager.setData('google-reviews', data);
          console.log('✅ Cache warmed: Google Reviews');
        }
      })
      .catch(() => {
        // Silently fail
      });
  }
  
  // Warm up Instagram posts
  const instagramUrl = basePath ? `${basePath}/data/instagram-posts.json` : '/data/instagram-posts.json';
  if (!cacheManager.getData('instagram-posts')) {
    fetch(instagramUrl)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) {
          cacheManager.setData('instagram-posts', data);
          console.log('✅ Cache warmed: Instagram Posts');
        }
      })
      .catch(() => {
        // Silently fail
      });
  }
};

// Auto-initialize cache warming
if (typeof window !== 'undefined') {
  warmCache();
  warmDataCache();
}

