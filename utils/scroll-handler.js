// ============================================
// UNIFIED SCROLL HANDLER
// Consolidates all scroll event listeners into a single handler
// ============================================

import { throttle } from './performance.js';
import { $, $$ } from './dom.js';
import { appConfig } from '../config/app.config.js';

/**
 * Unified scroll handler that manages all scroll-based functionality
 * Consolidates: navbar scroll, scroll-to-top button, active nav link
 */
class ScrollHandler {
    constructor() {
        this.handlers = [];
        this.isInitialized = false;
        this.scrollHandler = throttle(() => {
            this.handlers.forEach(handler => handler());
        }, appConfig.performance.throttleLimit);
    }
    
    /**
     * Register a scroll handler function
     * @param {Function} handler - Function to call on scroll
     */
    register(handler) {
        if (typeof handler === 'function') {
            this.handlers.push(handler);
        }
    }
    
    /**
     * Initialize the scroll handler
     */
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }
    
    /**
     * Remove the scroll handler (cleanup)
     */
    destroy() {
        window.removeEventListener('scroll', this.scrollHandler);
        this.handlers = [];
        this.isInitialized = false;
    }
}

// Singleton instance
export const scrollHandler = new ScrollHandler();

/**
 * Navbar scroll handler - adds 'scrolled' class when scrollY > 50
 */
export const createNavbarScrollHandler = () => {
    const navbar = $('#navbar');
    if (!navbar) return null;
    
    return () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
};

/**
 * Scroll-to-top button handler - shows/hides button based on scroll position
 */
export const createScrollToTopHandler = () => {
    return () => {
        const scrollBtn = $('#scrollTop');
        if (!scrollBtn) return;
        
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    };
};

/**
 * Active nav link handler - updates active nav link based on scroll position
 */
export const createActiveNavLinkHandler = () => {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return null;
    
    return () => {
        const scrollPos = window.scrollY + appConfig.animation.scrollOffset;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
};

/**
 * Initialize all scroll handlers
 */
export const initScrollHandlers = () => {
    const navbarHandler = createNavbarScrollHandler();
    const scrollToTopHandler = createScrollToTopHandler();
    const activeNavLinkHandler = createActiveNavLinkHandler();
    
    if (navbarHandler) scrollHandler.register(navbarHandler);
    if (scrollToTopHandler) scrollHandler.register(scrollToTopHandler);
    if (activeNavLinkHandler) scrollHandler.register(activeNavLinkHandler);
    
    scrollHandler.init();
    
    // Trigger initial check for scroll position (in case page loads scrolled)
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
        if (scrollToTopHandler) {
            scrollToTopHandler();
        }
        if (navbarHandler) {
            navbarHandler();
        }
        if (activeNavLinkHandler) {
            activeNavLinkHandler();
        }
    }, 100);
};

