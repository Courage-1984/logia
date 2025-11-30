// ============================================
// LOGIA GENESIS - PAGE TRANSITIONS
// Smooth page transitions with skeleton loading
// ============================================

import { $ } from '../utils/dom.js';
import { getBasePath } from '../utils/path.js';
import cacheManager from './cache-manager.js';

/**
 * Page Transition Manager
 * Handles smooth transitions between pages with loading states
 */
class PageTransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.transitionOverlay = null;
        this.init();
    }

    /**
     * Initialize page transition system
     */
    init() {
        // Create transition overlay
        this.createOverlay();
        
        // Intercept all internal link clicks
        this.interceptLinks();
        
        // Handle browser back/forward navigation
        this.handlePopState();
        
        // Show initial page load skeleton if needed
        this.handleInitialLoad();
    }

    /**
     * Create the transition overlay element
     */
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'skeleton-page-overlay';
        overlay.id = 'page-transition-overlay';
        
        const content = document.createElement('div');
        content.className = 'skeleton-page-content';
        
        // Create skeleton structure
        const header = document.createElement('div');
        header.className = 'skeleton-page-header';
        header.innerHTML = `
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text skeleton-text--medium"></div>
        `;
        
        const body = document.createElement('div');
        body.className = 'skeleton-page-body';
        body.innerHTML = `
            <div class="skeleton-card">
                <div class="skeleton skeleton-service-icon"></div>
                <div class="skeleton skeleton-text skeleton-text--long"></div>
                <div class="skeleton skeleton-text skeleton-text--short"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton skeleton-service-icon"></div>
                <div class="skeleton skeleton-text skeleton-text--long"></div>
                <div class="skeleton skeleton-text skeleton-text--short"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton skeleton-service-icon"></div>
                <div class="skeleton skeleton-text skeleton-text--long"></div>
                <div class="skeleton skeleton-text skeleton-text--short"></div>
            </div>
        `;
        
        content.appendChild(header);
        content.appendChild(body);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        this.transitionOverlay = overlay;
    }

    /**
     * Check if a URL is an internal page
     * @param {string} url - URL to check
     * @returns {boolean} True if internal HTML page
     */
    isInternalPage(url) {
        if (!url) return false;
        
        // Skip anchors, external links, and non-HTML links
        if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:')) {
            return false;
        }
        
        // Check if external URL
        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                const linkUrl = new URL(url, window.location.origin);
                if (linkUrl.origin !== window.location.origin) {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
        
        // Only handle HTML pages
        return url.endsWith('.html') || !url.includes('.');
    }

    /**
     * Intercept all internal link clicks
     */
    interceptLinks() {
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!this.isInternalPage(href)) return;
            
            // Skip if already transitioning
            if (this.isTransitioning) {
                e.preventDefault();
                return;
            }
            
            // Skip modifier keys (Ctrl/Cmd for new tab, etc.)
            if (e.ctrlKey || e.metaKey || e.shiftKey) return;
            
            // Skip if target is _blank
            if (link.getAttribute('target') === '_blank') return;
            
            e.preventDefault();
            this.transitionToPage(href);
        });
    }

    /**
     * Handle browser back/forward navigation
     */
    handlePopState() {
        window.addEventListener('popstate', () => {
            // On back/forward, just scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Handle initial page load
     */
    handleInitialLoad() {
        // Show skeleton briefly on initial load if page takes time
        if (document.readyState === 'loading') {
            const overlay = this.transitionOverlay;
            if (overlay) {
                overlay.classList.add('active');
                
                window.addEventListener('load', () => {
                    // Hide after a short delay to show smooth transition
                    setTimeout(() => {
                        overlay.classList.remove('active');
                    }, 300);
                });
            }
        }
    }

    /**
     * Load CSS stylesheet if not already loaded
     * @param {string} href - CSS file path
     * @returns {Promise<void>}
     */
    async loadCSS(href) {
        if (!href) return;
        
        // Normalize path for comparison
        const normalizedPath = this.normalizeCSSPath(href);
        
        // Check if stylesheet is already loaded (by exact href or normalized path)
        let existingLink = document.querySelector(`link[href="${href}"]`);
        
        // Also check by normalized path to catch different href formats
        if (!existingLink && normalizedPath) {
            document.querySelectorAll('head link[rel="stylesheet"]').forEach(link => {
                const linkHref = link.getAttribute('href');
                if (linkHref && this.normalizeCSSPath(linkHref) === normalizedPath) {
                    existingLink = link;
                }
            });
        }
        
        if (existingLink) {
            // Already loaded, wait for it to be ready
            return new Promise((resolve) => {
                if (existingLink.sheet) {
                    // Stylesheet is already loaded and parsed
                    resolve();
                } else {
                    // Wait for stylesheet to load
                    existingLink.addEventListener('load', () => resolve(), { once: true });
                    existingLink.addEventListener('error', () => resolve(), { once: true });
                    // Timeout after 2 seconds to prevent hanging
                    setTimeout(() => resolve(), 2000);
                }
            });
        }
        
        // Load new stylesheet
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.addEventListener('load', () => resolve(), { once: true });
            link.addEventListener('error', () => {
                // Don't reject - continue even if CSS fails to load
                console.warn(`Failed to load CSS: ${href}`);
                resolve();
            }, { once: true });
            document.head.appendChild(link);
            
            // Timeout after 3 seconds to prevent hanging
            setTimeout(() => {
                console.warn(`CSS load timeout: ${href}`);
                resolve();
            }, 3000);
        });
    }

    /**
     * Normalize CSS href to absolute path for comparison
     * @param {string} href - CSS file path (relative or absolute)
     * @returns {string} Normalized pathname
     */
    normalizeCSSPath(href) {
        if (!href) return '';
        try {
            // Handle absolute URLs
            if (href.startsWith('http://') || href.startsWith('https://')) {
                return new URL(href).pathname;
            }
            // Handle relative URLs - resolve against current location
            return new URL(href, window.location.href).pathname;
        } catch (e) {
            // Fallback to href if URL parsing fails
            return href;
        }
    }

    /**
     * Extract and load page-specific CSS from the new page
     * @param {Document} doc - Parsed HTML document
     * @returns {Promise<void>}
     */
    async loadPageCSS(doc) {
        // Get all stylesheet links from the new page
        const stylesheets = doc.querySelectorAll('head link[rel="stylesheet"]');
        const cssPromises = [];
        
        // Get currently loaded stylesheets (normalized paths)
        const currentStylesheets = new Set();
        document.querySelectorAll('head link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const normalizedPath = this.normalizeCSSPath(href);
                if (normalizedPath) {
                    currentStylesheets.add(normalizedPath);
                }
            }
        });
        
        // Load missing stylesheets
        stylesheets.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Normalize href to compare with current stylesheets
            const normalizedPath = this.normalizeCSSPath(href);
            
            // Only load if not already present
            if (normalizedPath && !currentStylesheets.has(normalizedPath)) {
                cssPromises.push(this.loadCSS(href));
            }
        });
        
        // Wait for all CSS to load
        if (cssPromises.length > 0) {
            await Promise.all(cssPromises);
            // Small delay to ensure styles are applied
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    /**
     * Transition to a new page
     * @param {string} url - URL to navigate to
     */
    async transitionToPage(url) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const overlay = this.transitionOverlay;
        if (!overlay) {
            // Fallback to normal navigation if overlay not ready
            window.location.href = url;
            return;
        }
        
        // Normalize URL (handle base path for GitHub Pages)
        let normalizedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Handle relative paths
            const basePath = getBasePath();
            // Remove leading slash if present, then add base path
            const cleanUrl = url.replace(/^\/+/, '');
            // Ensure base path doesn't have trailing slash
            const cleanBasePath = basePath.replace(/\/$/, '');
            normalizedUrl = cleanBasePath ? `${cleanBasePath}/${cleanUrl}` : `/${cleanUrl}`;
        }
        
        // Remove hash for navigation
        normalizedUrl = normalizedUrl.split('#')[0];
        
        // Show transition overlay
        overlay.classList.add('active');
        
        // Small delay to ensure overlay is visible
        await new Promise(resolve => setTimeout(resolve, 50));
        
        try {
            // Check in-memory cache first
            let html = cacheManager.getPage(normalizedUrl);
            
            if (!html) {
                // Fetch the new page
                const response = await fetch(normalizedUrl);
                if (!response.ok) {
                    throw new Error(`Failed to load page: ${normalizedUrl}`);
                }
                
                html = await response.text();
                
                // Cache the page for future use
                cacheManager.setPage(normalizedUrl, html);
            }
            
            // Parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract main content and other important elements
            const newMain = doc.querySelector('main');
            const newTitle = doc.querySelector('title');
            const newBreadcrumbPlaceholder = doc.querySelector('#breadcrumb-placeholder');
            const newStructuredData = doc.querySelectorAll('script[type="application/ld+json"]');
            const currentMain = document.querySelector('main');
            
            if (currentMain && newMain) {
                // Load page-specific CSS before replacing content
                await this.loadPageCSS(doc);
                
                // Update page title
                if (newTitle) {
                    document.title = newTitle.textContent;
                }
                
                // Update structured data in head (needed for breadcrumbs)
                // Remove old structured data scripts
                const oldStructuredData = document.querySelectorAll('head script[type="application/ld+json"]');
                oldStructuredData.forEach(script => script.remove());
                
                // Add new structured data from the new page
                newStructuredData.forEach(script => {
                    const newScript = script.cloneNode(true);
                    document.head.appendChild(newScript);
                });
                
                // Ensure breadcrumb placeholder exists (it might have been replaced by component)
                const existingBreadcrumbPlaceholder = document.querySelector('#breadcrumb-placeholder');
                if (!existingBreadcrumbPlaceholder && newBreadcrumbPlaceholder) {
                    // Placeholder doesn't exist but should - recreate it before main content
                    const navbar = document.querySelector('.navbar');
                    const placeholder = document.createElement('div');
                    placeholder.id = 'breadcrumb-placeholder';
                    if (navbar && navbar.nextSibling) {
                        navbar.parentNode.insertBefore(placeholder, navbar.nextSibling);
                    } else if (navbar) {
                        navbar.parentNode.insertBefore(placeholder, navbar.nextSibling || navbar);
                    }
                }
                
                // Update main content with fade transition
                currentMain.style.opacity = '0';
                currentMain.style.transition = 'opacity 0.2s ease-out';
                
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Replace content
                currentMain.innerHTML = newMain.innerHTML;
                
                // Clean up breadcrumbs and restore placeholder
                // The placeholder might have been replaced by breadcrumb component
                const staleBreadcrumb = document.querySelector('.breadcrumb');
                const existingPlaceholder = document.querySelector('#breadcrumb-placeholder');
                
                if (staleBreadcrumb) {
                    // Remove the breadcrumb component
                    staleBreadcrumb.remove();
                }
                
                // If placeholder doesn't exist, recreate it (it was replaced by breadcrumb component)
                if (!existingPlaceholder && newBreadcrumbPlaceholder) {
                    const navbar = document.querySelector('.navbar');
                    if (navbar && navbar.parentNode) {
                        const placeholder = document.createElement('div');
                        placeholder.id = 'breadcrumb-placeholder';
                        navbar.parentNode.insertBefore(placeholder, navbar.nextSibling);
                    }
                }
                
                // Update URL without reload
                window.history.pushState({}, '', url);
                
                // Scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });
                
                // Force a reflow to ensure styles are applied
                void currentMain.offsetHeight;
                
                // Fade in new content
                currentMain.style.opacity = '1';
                
                // Reinitialize page features
                await this.reinitializePage();
                
                // Track page view in Google Analytics (if enabled)
                if (window.trackPageView) {
                    window.trackPageView();
                }
                
                // Hide overlay after content is visible
                setTimeout(() => {
                    overlay.classList.remove('active');
                    setTimeout(() => {
                        this.isTransitioning = false;
                    }, 200);
                }, 300);
            } else {
                // Fallback to normal navigation
                window.location.href = url;
            }
        } catch (error) {
            console.error('Page transition error:', error);
            // Fallback to normal navigation on error
            window.location.href = url;
        }
    }

    /**
     * Reinitialize page features after transition
     */
    async reinitializePage() {
        // Clean up breadcrumbs first - will be re-added if needed for the new page
        const existingBreadcrumb = document.querySelector('.breadcrumb');
        const breadcrumbPlaceholder = document.querySelector('#breadcrumb-placeholder');
        
        // Always remove any existing breadcrumb component first (clean slate)
        if (existingBreadcrumb) {
            existingBreadcrumb.remove();
        }
        
        // Dispatch custom event for other scripts to reinitialize
        const event = new CustomEvent('pageTransitionComplete', {
            detail: { url: window.location.href }
        });
        window.dispatchEvent(event);
        
        // Reload components (navbar, breadcrumb, footer) if placeholders exist
        const navbarPlaceholder = document.querySelector('#navbar-placeholder');
        const footerPlaceholder = document.querySelector('#footer-placeholder');
        
        if (navbarPlaceholder && !document.querySelector('.navbar')) {
            // Navbar needs to be reloaded
            if (typeof window.loadComponent === 'function') {
                await window.loadComponent('components/navbar.html', '#navbar-placeholder', () => {
                    if (typeof window.setActiveNavLink === 'function') {
                        window.setActiveNavLink();
                    }
                    if (window.themeManager) {
                        window.themeManager.initToggleButton();
                    }
                    if (typeof window.initMobileMenu === 'function') {
                        window.initMobileMenu();
                    }
                }, 'skeleton-navbar');
            }
        } else if (typeof window.setActiveNavLink === 'function') {
            // Just update active nav link
            window.setActiveNavLink();
        }
        
        // Reinitialize breadcrumbs after navbar is ready
        // Check if we're on homepage first
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const basePath = getBasePath();
        const isHomepage = currentPage === 'index.html' || 
                           window.location.pathname === '/' || 
                           window.location.pathname === `${basePath}/` ||
                           window.location.pathname.endsWith('/');
        
        if (isHomepage) {
            // Homepage - ensure breadcrumb is removed
            const existingBreadcrumb = document.querySelector('.breadcrumb');
            if (existingBreadcrumb) {
                existingBreadcrumb.remove();
            }
            // Remove placeholder if it exists
            if (breadcrumbPlaceholder) {
                breadcrumbPlaceholder.remove();
            }
        } else {
            // Not homepage - ensure placeholder exists and load breadcrumb component
            let placeholder = document.querySelector('#breadcrumb-placeholder');
            
            // If placeholder doesn't exist (was replaced by breadcrumb component), recreate it
            if (!placeholder) {
                const navbar = document.querySelector('.navbar');
                if (navbar && navbar.parentNode) {
                    placeholder = document.createElement('div');
                    placeholder.id = 'breadcrumb-placeholder';
                    // Insert after navbar
                    navbar.parentNode.insertBefore(placeholder, navbar.nextSibling);
                }
            }
            
            // Load breadcrumb component if placeholder exists
            if (placeholder && typeof window.loadComponent === 'function') {
                // Small delay to ensure structured data is fully updated
                await new Promise(resolve => setTimeout(resolve, 100));
                await window.loadComponent('components/breadcrumb.html', '#breadcrumb-placeholder', async () => {
                    // Additional small delay to ensure DOM is ready
                    await new Promise(resolve => setTimeout(resolve, 50));
                    // Initialize breadcrumbs after component loads
                    const { initBreadcrumbs } = await import('./breadcrumbs.js');
                    initBreadcrumbs();
                });
            }
        }
        
        if (footerPlaceholder && !document.querySelector('footer .footer-content')) {
            // Footer needs to be reloaded
            if (typeof window.loadComponent === 'function') {
                await window.loadComponent('components/footer.html', '#footer-placeholder', () => {
                    if (typeof window.reinitScrollHandlers === 'function') {
                        window.reinitScrollHandlers();
                    }
                }, 'skeleton-footer');
            }
        } else if (typeof window.reinitScrollHandlers === 'function') {
            // Reinitialize scroll handlers
            window.reinitScrollHandlers();
        }
        
        // Reinitialize AOS animations
        const aosElements = document.querySelectorAll('[data-aos]');
        aosElements.forEach(el => {
            el.classList.remove('aos-animate');
        });
        
        // Trigger AOS reinitialization if available
        if (typeof window.initAOS === 'function') {
            window.initAOS();
        }
        
        // Reinitialize testimonials if testimonials section exists
        const testimonialsGrid = document.querySelector('.testimonials-grid');
        if (testimonialsGrid && typeof window.initTestimonials === 'function') {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                if (typeof window.loadTestimonials === 'function') {
                    window.loadTestimonials('.testimonials-grid', 0);
                } else {
                    window.initTestimonials();
                }
            }, 100);
        }
        
        // Reinitialize Instagram feed if Instagram section exists
        const instagramGrid = document.querySelector('.instagram-feed-grid');
        if (instagramGrid && typeof window.initInstagramFeed === 'function') {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                if (typeof window.loadInstagramFeed === 'function') {
                    window.loadInstagramFeed('.instagram-feed-grid', 0);
                } else {
                    window.initInstagramFeed();
                }
            }, 100);
        }
    }
}

// Initialize page transition manager
let pageTransitionManager = null;

/**
 * Initialize page transitions
 * Only enable if not on a slow connection
 */
export const initPageTransitions = () => {
    // Check connection quality
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = connection && connection.saveData;
    const effectiveType = connection && connection.effectiveType;
    const isSlowConnection = effectiveType && /(^2g$|^slow-2g$)/.test(effectiveType);
    
    // Disable transitions on slow connections or data saver mode
    if (saveData || isSlowConnection) {
        return;
    }
    
    
    // Initialize transition manager
    if (!pageTransitionManager) {
        pageTransitionManager = new PageTransitionManager();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTransitions);
} else {
    initPageTransitions();
}

