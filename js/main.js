// ============================================
// LOGIA GENESIS - MAIN JAVASCRIPT
// Ultra-Modern, Smooth Interactions
// ============================================

import { $, $$, waitForElement } from '../utils/dom.js';
import { debounce, throttle, logPerformance } from '../utils/performance.js';
import { validateEmail, validatePhone, showError, showSuccessMessage, clearError } from '../utils/validation.js';
import { appConfig } from '../config/app.config.js';
import { initScrollHandlers, createScrollToTopHandler, scrollHandler } from '../utils/scroll-handler.js';
import { initTestimonials } from './testimonials.js';
import { initInstagramFeed } from './instagram-feed.js';
import { initMonitoring } from './monitoring.js';
// Theme manager initializes automatically - no need to import here

// ============================================
// SMOOTH SCROLL (Event Delegation)
// ============================================

/**
 * Initialize smooth scrolling for anchor links using event delegation
 * Adds smooth scroll behavior to all internal anchor links (#)
 */
const initSmoothScroll = () => {
    // Use event delegation on document body for all anchor links
    document.body.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = $(href);

        if (target) {
            const navHeight = $('.navbar')?.offsetHeight || 0;
            const targetPosition = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
};

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
// Now handled by unified scroll handler in utils/scroll-handler.js
// initNavbarScroll() is replaced by initScrollHandlers()

// ============================================
// MOBILE MENU
// ============================================

/**
 * Initialize mobile menu toggle functionality
 * Handles opening/closing mobile navigation menu
 */
const initMobileMenu = () => {
    const toggle = $('#mobileMenuToggle');
    const menu = $('#navMenu');
    const dropdowns = $$('.dropdown');

    if (!toggle || !menu) {
        // If elements don't exist yet, try again after a short delay
        setTimeout(initMobileMenu, 100);
        return;
    }

    // Check if already initialized
    if (toggle.dataset.initialized === 'true') return;
    toggle.dataset.initialized = 'true';

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Close menu when clicking a nav link (event delegation)
    menu.addEventListener('click', (e) => {
        const navLink = e.target.closest('.nav-link');
        if (navLink && window.innerWidth <= 768) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }

        // Handle mobile dropdown toggles
        const dropdown = e.target.closest('.dropdown');
        if (dropdown && window.innerWidth <= 768) {
            const link = dropdown.querySelector('.nav-link');
            if (link && e.target.closest('.nav-link') === link) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        }
    });
};

// Make initMobileMenu available globally for components.js
window.initMobileMenu = initMobileMenu;

// ============================================
// DARK MODE TOGGLE
// ============================================
// Theme management is now handled by utils/theme.js
// The theme manager initializes automatically to prevent FOUC
// This function is kept for backwards compatibility with components.js

/**
 * Initialize dark mode toggle functionality
 * @deprecated Use themeManager from utils/theme.js instead
 * This is kept for backwards compatibility
 */
const initDarkMode = () => {
    // Theme manager handles initialization automatically
    // This is just for backwards compatibility
    if (window.themeManager) {
        window.themeManager.initToggleButton();
    }
};

// Make initDarkMode available globally for components.js
window.initDarkMode = initDarkMode;

// ============================================
// ANIMATED COUNTERS
// ============================================

/**
 * Initialize animated counters for statistics
 * Animates numbers from 0 to target value when element enters viewport
 */
const initCounters = () => {
    const counters = $$('.stat-number[data-count]');

    /**
     * Animate a single counter from 0 to target value
     * @param {Element} counter - Counter element to animate
     */
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = appConfig.animation.counterDuration;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: appConfig.performance.lazyLoadThreshold });

    counters.forEach(counter => observer.observe(counter));
};

// ============================================
// SCROLL TO TOP BUTTON
// ============================================

/**
 * Initialize scroll to top button
 * Shows/hides button handled by unified scroll handler
 * Click handler uses event delegation (works even if button loads later)
 */
const initScrollToTop = () => {
    // Visibility is handled by unified scroll handler
    // Click handler uses event delegation - always set up, works even if button loads later
    document.body.addEventListener('click', (e) => {
        const scrollBtn = e.target.closest('#scrollTop');
        if (scrollBtn) {
            e.preventDefault();
            e.stopPropagation();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
};

// ============================================
// SIMPLE AOS (ANIMATE ON SCROLL)
// ============================================

/**
 * Initialize Animate On Scroll functionality
 * Adds animation classes when elements enter viewport
 */
const initAOS = () => {
    const elements = $$('[data-aos]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: appConfig.animation.aosThreshold,
        rootMargin: appConfig.animation.aosRootMargin
    });

    elements.forEach((element, index) => {
        const delay = element.getAttribute('data-aos-delay') || 0;
        element.style.transitionDelay = `${delay}ms`;
        observer.observe(element);
    });
};

// ============================================
// ACTIVE NAV LINK
// ============================================
// Now handled by unified scroll handler in utils/scroll-handler.js
// initActiveNavLink() is replaced by initScrollHandlers()

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Initialize form validation
 * Validates forms marked with data-validate attribute
 */
const initFormValidation = () => {
    const forms = $$('form[data-validate]');

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;
            const inputs = form.querySelectorAll('[required]');

            inputs.forEach(input => {
                const value = input.value.trim();
                const type = input.type;

                // Remove previous error states
                clearError(input);

                // Validate
                if (!value) {
                    showError(input, 'This field is required');
                    isValid = false;
                } else if (type === 'email' && !validateEmail(value)) {
                    showError(input, 'Please enter a valid email address');
                    isValid = false;
                } else if (type === 'tel' && !validatePhone(value)) {
                    showError(input, 'Please enter a valid phone number');
                    isValid = false;
                }
            });

            if (!isValid) return;

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';

            try {
                // Prepare form data
                const formData = new FormData(form);

                // Submit to Formspree
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Show success message
                    showSuccessMessage(form);
                    form.reset();
                } else {
                    // Show error message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.cssText = 'background: var(--color-accent); color: white; padding: var(--space-4); border-radius: var(--radius-lg); margin-top: var(--space-4); text-align: center;';
                    errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was an error submitting your form. Please try again or contact us directly.';
                    form.appendChild(errorDiv);

                    setTimeout(() => {
                        errorDiv.remove();
                    }, 5000);
                }
            } catch (error) {
                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.cssText = 'background: var(--color-accent); color: white; padding: var(--space-4); border-radius: var(--radius-lg); margin-top: var(--space-4); text-align: center;';
                errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Network error. Please check your connection and try again.';
                form.appendChild(errorDiv);

                setTimeout(() => {
                    errorDiv.remove();
                }, 5000);
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    });
};

// ============================================
// LOADING ANIMATION
// ============================================

/**
 * Initialize page load animation
 * Adds 'loaded' class to body when page finishes loading
 */
const initPageLoad = () => {
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
};

// ============================================
// 3D CARD TILT EFFECT
// ============================================

/**
 * Initialize 3D tilt effect on cards using optimized event delegation
 * Adds interactive 3D tilt animation on hover for service/portfolio cards
 */
const init3DTilt = () => {
    const cards = $$('.service-card, .why-card, .portfolio-card');
    if (cards.length === 0) return;

    // Respect user and device capabilities:
    // - Disable on reduced motion preference
    // - Disable on coarse pointers (most touch/mobile devices)
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    // Use a single throttled event handler with event delegation for mousemove
    let activeCard = null;

    const handleMouseMove = throttle((event) => {
        const e = event;
        const card = e.target.closest('.service-card, .why-card, .portfolio-card');

        // Reset previous card if mouse moved to different card
        if (activeCard && activeCard !== card) {
            activeCard.style.transform = '';
            activeCard = null;
        }

        if (!card) {
            if (activeCard) {
                activeCard.style.transform = '';
                activeCard = null;
            }
            return;
        }

        activeCard = card;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    }, appConfig.performance.throttleLimit || 100);

    document.body.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Reset transform when mouse leaves card
    document.body.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.service-card, .why-card, .portfolio-card');
        if (card && !card.contains(e.relatedTarget) && activeCard === card) {
            card.style.transform = '';
            activeCard = null;
        }
    });
};

// ============================================
// PRELOAD CRITICAL IMAGES
// ============================================

/**
 * Preload critical images for better performance
 * Loads important images before they're needed
 */
const preloadImages = () => {
    const images = [
        // Add critical image paths here
    ];

    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// ============================================
// LAZY LOAD NON-CRITICAL FUNCTIONALITY
// ============================================

/**
 * Lazy load FAQ functionality when needed
 * Loads only when FAQ elements are present in the DOM
 */
const lazyLoadFAQ = () => {
    if ($$('.faq-item').length === 0) return;

    import('./lazy/faq.js').then(({ initFAQ }) => {
        initFAQ();
    }).catch(err => {
        console.warn('Failed to lazy load FAQ:', err);
    });
};

/**
 * Lazy load filter functionality when needed
 * Loads only when filter elements are present in the DOM
 */
const lazyLoadFilters = () => {
    if ($$('[data-filter]').length === 0) return;

    import('./lazy/filters.js').then(({ initFilters }) => {
        initFilters();
    }).catch(err => {
        console.warn('Failed to lazy load filters:', err);
    });
};

/**
 * Lazy load search functionality when needed
 * Loads only when search input is present in the DOM
 */
const lazyLoadSearch = () => {
    if (!$('#searchInput')) return;

    import('./lazy/search.js').then(({ initSearch }) => {
        initSearch();
    }).catch(err => {
        console.warn('Failed to lazy load search:', err);
    });
};

/**
 * Lazy load particles net background when needed
 * Loads only when CTA sections are present in the DOM
 */
const lazyLoadParticles = () => {
    if ($('.cta-section .cta-background').length === 0) return;

    // Respect reduced motion and avoid on touch/mobile devices
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    import('./particles-net.js').then(async ({ initCTANetBackgrounds }) => {
        await initCTANetBackgrounds();
    }).catch(err => {
        console.warn('Failed to lazy load particles:', err);
    });
};

// ============================================
// LAZY LOADING IMAGES
// ============================================

/**
 * Initialize lazy loading for images
 * Loads images only when they enter the viewport
 */
const initLazyLoading = () => {
    const images = $$('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

// ============================================
// LINK PREFETCH ON HOVER
// ============================================

/**
 * Initialize link prefetching on hover
 * Prefetches pages when user hovers over internal links for faster navigation
 */
const initLinkPrefetch = () => {
    // Track prefetched URLs to avoid duplicate prefetches
    const prefetchedUrls = new Set();

    /**
     * Check if a URL is an internal HTML page that should be prefetched
     * @param {string} href - The href attribute from the link
     * @returns {boolean} - True if the link should be prefetched
     */
    const shouldPrefetch = (href) => {
        if (!href) return false;

        // Skip anchors, external links, and non-HTML links
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return false;
        }

        // Skip external URLs
        if (href.startsWith('http://') || href.startsWith('https://')) {
            // Only prefetch if it's the same origin
            try {
                const linkUrl = new URL(href, window.location.origin);
                if (linkUrl.origin !== window.location.origin) {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }

        // Only prefetch HTML pages
        return href.endsWith('.html') || !href.includes('.');
    };

    /**
     * Prefetch a page URL
     * @param {string} url - The URL to prefetch
     */
    const prefetchPage = (url) => {
        // Normalize URL (handle relative paths)
        let normalizedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Remove hash if present for prefetching
            normalizedUrl = url.split('#')[0];

            // Skip if already prefetched
            if (prefetchedUrls.has(normalizedUrl)) {
                return;
            }

            prefetchedUrls.add(normalizedUrl);

            // Create prefetch link element
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = normalizedUrl;
            link.as = 'document';
            document.head.appendChild(link);
        }
    };

    /**
     * Handle mouseenter event on links
     * @param {Event} e - Mouse event
     */
    const handleLinkHover = (e) => {
        const link = e.currentTarget;
        const href = link.getAttribute('href');

        // Avoid aggressive prefetching on slow connections or when data saver is enabled
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const saveData = connection && connection.saveData;
        const effectiveType = connection && connection.effectiveType;
        const isSlowConnection = effectiveType && /(^2g$|^slow-2g$)/.test(effectiveType);

        if (saveData || isSlowConnection) {
            return;
        }

        if (shouldPrefetch(href)) {
            // Small delay to avoid prefetching on accidental hovers
            const timeoutId = setTimeout(() => {
                prefetchPage(href);
            }, 100);

            // Store timeout ID on the link element for cleanup
            link._prefetchTimeout = timeoutId;
        }
    };

    /**
     * Handle mouseleave event to cancel prefetch if user moves away quickly
     * @param {Event} e - Mouse event
     */
    const handleLinkLeave = (e) => {
        const link = e.currentTarget;
        if (link._prefetchTimeout) {
            clearTimeout(link._prefetchTimeout);
            link._prefetchTimeout = null;
        }
    };

    /**
     * Initialize prefetch listeners for a link element
     * @param {Element} link - Link element to initialize
     */
    const initializeLink = (link) => {
        if (link.hasAttribute('data-prefetch-initialized')) return;

        const href = link.getAttribute('href');
        if (!shouldPrefetch(href)) return;

        link.setAttribute('data-prefetch-initialized', 'true');

        // Add hover event listeners
        link.addEventListener('mouseenter', handleLinkHover, { passive: true });
        link.addEventListener('mouseleave', handleLinkLeave, { passive: true });

        // Also handle touch devices (for mobile)
        link.addEventListener('touchstart', () => {
            if (shouldPrefetch(href)) {
                prefetchPage(href);
            }
        }, { passive: true, once: true });
    };

    // Initialize all existing links
    const allLinks = $$('a[href]');
    allLinks.forEach(initializeLink);

    // Use MutationObserver to handle dynamically loaded links (navbar, footer)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Check if the added node is a link
                    if (node.tagName === 'A' && node.hasAttribute('href')) {
                        initializeLink(node);
                    }
                    // Check for links within the added node
                    const links = node.querySelectorAll?.('a[href]');
                    if (links) {
                        links.forEach(initializeLink);
                    }
                }
            });
        });
    });

    // Observe the entire document for new links
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};

// Cursor effect removed - unused code (customCursor feature flag is false)

// ============================================
// INITIALIZE ALL
// ============================================

/**
 * Initialize all application features
 * Sets up all interactive features and event listeners
 */
const init = () => {
    initPageLoad();
    initSmoothScroll();
    // Unified scroll handler replaces initNavbarScroll, initScrollToTop, initActiveNavLink
    initScrollHandlers();
    // initMobileMenu() is now called after navbar loads in components.js
    // initDarkMode() is now called after navbar loads in components.js
    initCounters();
    initScrollToTop(); // Only sets up click handler, visibility handled by scroll handler

    // Make reinitScrollHandlers available globally for component callbacks
    window.reinitScrollHandlers = () => {
        // Re-register scroll-to-top handler after footer loads
        const scrollToTopHandler = createScrollToTopHandler();
        if (scrollToTopHandler) {
            scrollHandler.register(scrollToTopHandler);
            // Trigger initial check
            setTimeout(() => scrollToTopHandler(), 50);
        }
    };
    initAOS();
    initFormValidation();
    init3DTilt();
    // Lazy load non-critical functionality
    lazyLoadFilters();
    lazyLoadSearch();
    lazyLoadFAQ();
    lazyLoadParticles(); // Load particles net background for CTA sections
    initLazyLoading();
    initLinkPrefetch();
    preloadImages();
    initTestimonials(); // Load Google Reviews testimonials
    initInstagramFeed(); // Load Instagram feed carousel
    
    // Initialize monitoring (error tracking & performance monitoring)
    initMonitoring();

    // Register service worker for offline caching and faster repeat visits
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Use relative path so it works for both production and GitHub Pages base paths
            navigator.serviceWorker.register('service-worker.js').catch((err) => {
                console.warn('Service worker registration failed:', err);
            });
        });
    }

    // Performance logging (if enabled)
    if (appConfig.features.performanceLogging) {
        logPerformance({ enabled: true });
    }
};

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
