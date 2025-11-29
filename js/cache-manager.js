// ============================================
// LOGIA GENESIS - CACHE MANAGER
// In-memory caching for page transitions and API responses
// ============================================

/**
 * In-memory cache manager for page transitions
 * Provides fast access to recently visited pages
 */
class CacheManager {
    constructor() {
        this.pageCache = new Map();
        this.dataCache = new Map();
        this.maxPageCacheSize = 10; // Maximum number of pages to cache
        this.maxDataCacheSize = 50; // Maximum number of data entries
        this.pageCacheTTL = 30 * 60 * 1000; // 30 minutes for pages
        this.dataCacheTTL = 5 * 60 * 1000; // 5 minutes for data
    }

    /**
     * Get cached page content
     * @param {string} url - Page URL
     * @returns {string|null} Cached HTML or null if not found/expired
     */
    getPage(url) {
        const normalizedUrl = this.normalizeUrl(url);
        const cached = this.pageCache.get(normalizedUrl);
        
        if (!cached) return null;
        
        // Check if expired
        if (Date.now() - cached.timestamp > this.pageCacheTTL) {
            this.pageCache.delete(normalizedUrl);
            return null;
        }
        
        return cached.html;
    }

    /**
     * Cache page content
     * @param {string} url - Page URL
     * @param {string} html - Page HTML content
     */
    setPage(url, html) {
        const normalizedUrl = this.normalizeUrl(url);
        
        // Remove oldest entry if cache is full
        if (this.pageCache.size >= this.maxPageCacheSize) {
            const firstKey = this.pageCache.keys().next().value;
            this.pageCache.delete(firstKey);
        }
        
        this.pageCache.set(normalizedUrl, {
            html,
            timestamp: Date.now()
        });
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null if not found/expired
     */
    getData(key) {
        const cached = this.dataCache.get(key);
        
        if (!cached) return null;
        
        // Check if expired
        if (Date.now() - cached.timestamp > this.dataCacheTTL) {
            this.dataCache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * Cache data
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    setData(key, data) {
        // Remove oldest entry if cache is full
        if (this.dataCache.size >= this.maxDataCacheSize) {
            const firstKey = this.dataCache.keys().next().value;
            this.dataCache.delete(firstKey);
        }
        
        this.dataCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Normalize URL for consistent caching
     * @param {string} url - URL to normalize
     * @returns {string} Normalized URL
     */
    normalizeUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            // Remove hash and trailing slash
            urlObj.hash = '';
            let pathname = urlObj.pathname;
            if (pathname.endsWith('/') && pathname !== '/') {
                pathname = pathname.slice(0, -1);
            }
            return urlObj.origin + pathname;
        } catch (e) {
            return url;
        }
    }

    /**
     * Clear all caches
     */
    clear() {
        this.pageCache.clear();
        this.dataCache.clear();
    }

    /**
     * Clear expired entries
     */
    clearExpired() {
        const now = Date.now();
        
        // Clear expired pages
        for (const [key, value] of this.pageCache.entries()) {
            if (now - value.timestamp > this.pageCacheTTL) {
                this.pageCache.delete(key);
            }
        }
        
        // Clear expired data
        for (const [key, value] of this.dataCache.entries()) {
            if (now - value.timestamp > this.dataCacheTTL) {
                this.dataCache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        return {
            pages: {
                size: this.pageCache.size,
                maxSize: this.maxPageCacheSize,
                ttl: this.pageCacheTTL
            },
            data: {
                size: this.dataCache.size,
                maxSize: this.maxDataCacheSize,
                ttl: this.dataCacheTTL
            }
        };
    }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Clean expired entries every 5 minutes
setInterval(() => {
    cacheManager.clearExpired();
}, 5 * 60 * 1000);

// Export cache manager
export default cacheManager;

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.cacheManager = cacheManager;
}

