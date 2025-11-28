// ============================================
// LOGIA GENESIS - MAIN JAVASCRIPT
// Ultra-Modern, Smooth Interactions
// ============================================

import { $, $$, waitForElement } from '../utils/dom.js';
import { debounce, throttle, logPerformance } from '../utils/performance.js';
import { validateEmail, validatePhone, showError, showSuccessMessage, clearError } from '../utils/validation.js';
import { appConfig } from '../config/app.config.js';

// ============================================
// SMOOTH SCROLL
// ============================================

/**
 * Initialize smooth scrolling for anchor links
 * Adds smooth scroll behavior to all internal anchor links (#)
 */
const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
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
    });
};

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

/**
 * Initialize navbar scroll effect
 * Adds 'scrolled' class to navbar when user scrolls past 50px
 */
const initNavbarScroll = () => {
    const navbar = $('#navbar');
    if (!navbar) return;
    
    const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, appConfig.performance.throttleLimit);
    
    window.addEventListener('scroll', handleScroll);
};

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
    
    // Close menu when clicking a nav link
    const navLinks = menu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });
    
    // Mobile dropdown toggles
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
};

// Make initMobileMenu available globally for components.js
window.initMobileMenu = initMobileMenu;

// ============================================
// DARK MODE TOGGLE
// ============================================

/**
 * Initialize dark mode toggle functionality
 * Handles theme switching and persistence in localStorage
 */
const initDarkMode = () => {
    const toggle = $('#themeToggle');
    if (!toggle) {
        // If toggle doesn't exist yet, try again after a short delay
        setTimeout(initDarkMode, 100);
        return;
    }
    
    // Check if already initialized
    if (toggle.dataset.initialized === 'true') return;
    toggle.dataset.initialized = 'true';
    
    // Check for saved theme preference or use default
    const currentTheme = localStorage.getItem(appConfig.theme.storageKey) || appConfig.theme.defaultMode;
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        const isDark = document.body.classList.contains('dark-mode');
        toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        localStorage.setItem(appConfig.theme.storageKey, isDark ? 'dark' : 'light');
    });
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
 * Shows/hides button and handles smooth scroll to top
 */
const initScrollToTop = () => {
    const scrollBtn = $('#scrollTop');
    if (!scrollBtn) return;
    
    const handleScroll = throttle(() => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }, appConfig.performance.throttleLimit);
    
    window.addEventListener('scroll', handleScroll);
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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

/**
 * Initialize active navigation link highlighting
 * Updates active nav link based on current scroll position
 */
const initActiveNavLink = () => {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');
    
    const handleScroll = throttle(() => {
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
    }, appConfig.performance.throttleLimit);
    
    window.addEventListener('scroll', handleScroll);
};

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
        form.addEventListener('submit', (e) => {
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
            
            if (isValid) {
                // Show success message
                showSuccessMessage(form);
                form.reset();
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
 * Initialize 3D tilt effect on cards
 * Adds interactive 3D tilt animation on hover for service/portfolio cards
 */
const init3DTilt = () => {
    const cards = $$('.service-card, .why-card, .portfolio-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
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
// FILTER FUNCTIONALITY (for portfolio/services)
// ============================================

/**
 * Initialize filter functionality
 * Filters items based on category when filter buttons are clicked
 */
const initFilters = () => {
    const filterBtns = $$('[data-filter]');
    const filterItems = $$('[data-category]');
    
    if (filterBtns.length === 0) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter items
            filterItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = '';
                    item.classList.add('aos-animate');
                } else {
                    item.style.display = 'none';
                    item.classList.remove('aos-animate');
                }
            });
        });
    });
};

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

/**
 * Initialize search functionality
 * Filters searchable items based on search query
 */
const initSearch = () => {
    const searchInput = $('#searchInput');
    const searchItems = $$('[data-searchable]');
    
    if (!searchInput) return;
    
    const handleSearch = debounce((query) => {
        const lowerQuery = query.toLowerCase();
        
        searchItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            
            if (text.includes(lowerQuery) || !query) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }, appConfig.performance.debounceDelay);
    
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
};

// ============================================
// FAQ ACCORDION
// ============================================

/**
 * Initialize FAQ accordion functionality
 * Handles expand/collapse behavior for FAQ items
 */
const initFAQ = () => {
    const faqItems = $$('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) return;
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(i => {
                i.classList.remove('active');
                const a = i.querySelector('.faq-answer');
                if (a) a.style.maxHeight = null;
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
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
// CURSOR EFFECT (Optional Enhancement)
// ============================================

/**
 * Initialize custom cursor effect
 * Creates a custom animated cursor (desktop only)
 */
const initCursorEffect = () => {
    if (window.innerWidth < 1024 || !appConfig.features.customCursor) return;
    
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid var(--color-accent);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.15s ease;
        display: none;
    `;
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.display = 'block';
    });
    
    const animate = () => {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animate);
    };
    
    animate();
    
    // Scale cursor on interactive elements
    const interactiveElements = $$('a, button, input, textarea, select');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
        });
    });
};

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
    initNavbarScroll();
    // initMobileMenu() is now called after navbar loads in components.js
    // initDarkMode() is now called after navbar loads in components.js
    initCounters();
    initScrollToTop();
    initAOS();
    initActiveNavLink();
    initFormValidation();
    init3DTilt();
    initFilters();
    initSearch();
    initFAQ();
    initLazyLoading();
    preloadImages();
    
    // Performance logging (if enabled)
    if (appConfig.features.performanceLogging) {
        logPerformance({ enabled: true });
    }
    
    // Optional: Uncomment for custom cursor
    if (appConfig.features.customCursor) {
        initCursorEffect();
    }
};

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
