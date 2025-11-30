// ============================================
// COMPONENT LOADER
// Loads reusable components (navbar, footer, etc.)
// ============================================

import { $, $$ } from '../utils/dom.js';

/**
 * Creates a skeleton loader for a component
 * @param {string} skeletonClass - CSS class for the skeleton
 * @returns {HTMLElement} Skeleton element
 */
const createSkeleton = (skeletonClass) => {
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton ${skeletonClass}`;
    return skeleton;
};

/**
 * Loads a component from a file and inserts it into the DOM
 * @param {string} componentPath - Path to the component HTML file
 * @param {string} targetSelector - CSS selector for the insertion point
 * @param {Function} callback - Optional callback after component is loaded
 * @param {string} skeletonClass - Optional skeleton class to show while loading
 * @returns {Promise<string|undefined>} The loaded HTML content or undefined on error
 */
export const loadComponent = async (componentPath, targetSelector, callback, skeletonClass = null) => {
    try {
        const target = $(targetSelector);
        
        if (!target) {
            console.warn(`Target selector "${targetSelector}" not found`);
            return;
        }
        
        // Show skeleton while loading
        let skeletonElement = null;
        if (skeletonClass) {
            skeletonElement = createSkeleton(skeletonClass);
            target.parentNode.insertBefore(skeletonElement, target);
        }
        
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentPath}`);
        }
        
        const html = await response.text();
        
        // Remove skeleton if it exists
        if (skeletonElement) {
            skeletonElement.remove();
        }
        
        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        
        // Replace the placeholder with the loaded content
        const parent = target.parentNode;
        while (tempDiv.firstChild) {
            parent.insertBefore(tempDiv.firstChild, target);
        }
        parent.removeChild(target);
        
        // Execute callback if provided
        if (callback && typeof callback === 'function') {
            callback();
        }
        
        return html;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        // Remove skeleton on error
        const target = $(targetSelector);
        if (target) {
            const skeleton = target.previousElementSibling;
            if (skeleton && skeleton.classList.contains('skeleton')) {
                skeleton.remove();
            }
        }
    }
};

/**
 * Sets the active navigation link based on current page
 * Maps the current page URL to the corresponding navigation link and applies active state
 */
export const setActiveNavLink = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageMap = {
        'index.html': 'index',
        'about.html': 'about',
        'services.html': 'services',
        'portfolio.html': 'portfolio',
        'resources.html': 'resources',
        'speedtest.html': 'speedtest',
        'contact.html': 'contact'
    };
    
    const currentPageKey = pageMap[currentPage] || 'index';
    
    // Remove active class from all nav links
    $$('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
    const activeLink = $(`.nav-link[data-page="${currentPageKey}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Also handle services dropdown active state
    if (currentPageKey === 'services') {
        const servicesLink = $('.nav-link[data-page="services"]');
        if (servicesLink) {
            servicesLink.classList.add('active');
        }
    }
};

/**
 * Initialize all components
 * Loads navbar and footer components in parallel for better performance
 * @returns {Promise<void>}
 */
export const initComponents = async () => {
    // Load breadcrumb (if placeholder exists and not on homepage)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isHomepage = currentPage === 'index.html' || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    
    // Load navbar and footer in parallel to reduce critical path latency
    await Promise.all([
        loadComponent('components/navbar.html', '#navbar-placeholder', () => {
            setActiveNavLink();
            // Initialize dark mode toggle after navbar loads
            // Theme manager initializes automatically, but we ensure toggle button is set up
            if (window.themeManager) {
                window.themeManager.initToggleButton();
            } else if (typeof window.initDarkMode === 'function') {
                window.initDarkMode();
            }
            // Initialize mobile menu after navbar is loaded
            if (typeof window.initMobileMenu === 'function') {
                window.initMobileMenu();
            }
        }, 'skeleton-navbar'),
        loadComponent('components/footer.html', '#footer-placeholder', () => {
            // Re-initialize scroll handlers after footer loads (for scroll-to-top button)
            if (typeof window.reinitScrollHandlers === 'function') {
                window.reinitScrollHandlers();
            }
        }, 'skeleton-footer')
    ]);
    
    // Load breadcrumb after navbar/footer (not critical path)
    if (!isHomepage) {
        await loadComponent('components/breadcrumb.html', '#breadcrumb-placeholder', async () => {
            // Initialize breadcrumbs after component loads
            const { initBreadcrumbs } = await import('./breadcrumbs.js');
            initBreadcrumbs();
        });
    } else {
        // Remove placeholder on homepage
        const placeholder = document.getElementById('breadcrumb-placeholder');
        if (placeholder) placeholder.remove();
    }
};

// Make setActiveNavLink and loadComponent available globally for page transitions
window.setActiveNavLink = setActiveNavLink;
window.loadComponent = loadComponent;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}

