// ============================================
// COMPONENT LOADER
// Loads reusable components (navbar, footer, etc.)
// ============================================

import { $, $$ } from '../utils/dom.js';

/**
 * Loads a component from a file and inserts it into the DOM
 * @param {string} componentPath - Path to the component HTML file
 * @param {string} targetSelector - CSS selector for the insertion point
 * @param {Function} callback - Optional callback after component is loaded
 * @returns {Promise<string|undefined>} The loaded HTML content or undefined on error
 */
export const loadComponent = async (componentPath, targetSelector, callback) => {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentPath}`);
        }
        
        const html = await response.text();
        const target = $(targetSelector);
        
        if (!target) {
            console.warn(`Target selector "${targetSelector}" not found`);
            return;
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
 * Loads navbar and footer components and initializes dependent features
 * @returns {Promise<void>}
 */
export const initComponents = async () => {
    // Load navbar
    await loadComponent('components/navbar.html', '#navbar-placeholder', () => {
        setActiveNavLink();
        // Initialize dark mode after navbar is loaded
        if (typeof window.initDarkMode === 'function') {
            window.initDarkMode();
        }
        // Initialize mobile menu after navbar is loaded
        if (typeof window.initMobileMenu === 'function') {
            window.initMobileMenu();
        }
    });
    
    // Load footer
    await loadComponent('components/footer.html', '#footer-placeholder');
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}

