// ============================================
// LOGIA GENESIS - MAIN JAVASCRIPT
// Ultra-Modern, Smooth Interactions
// ============================================

// ============================================
// UTILITY FUNCTIONS
// ============================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============================================
// SMOOTH SCROLL
// ============================================
const initSmoothScroll = () => {
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = $(href);
            
            if (target) {
                const navHeight = $('.navbar').offsetHeight;
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
const initNavbarScroll = () => {
    const navbar = $('#navbar');
    
    const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
};

// ============================================
// MOBILE MENU
// ============================================
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
    
    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        const isDark = document.body.classList.contains('dark-mode');
        toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
};

// Make initDarkMode available globally for components.js
window.initDarkMode = initDarkMode;

// ============================================
// ANIMATED COUNTERS
// ============================================
const initCounters = () => {
    const counters = $$('.stat-number[data-count]');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
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
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
};

// ============================================
// SCROLL TO TOP BUTTON
// ============================================
const initScrollToTop = () => {
    const scrollBtn = $('#scrollTop');
    if (!scrollBtn) return;
    
    const handleScroll = throttle(() => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }, 100);
    
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
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
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
const initActiveNavLink = () => {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');
    
    const handleScroll = throttle(() => {
        const scrollPos = window.scrollY + 100;
        
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
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
};

// ============================================
// FORM VALIDATION
// ============================================
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePhone = (phone) => {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

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
                input.classList.remove('error');
                const errorMsg = input.parentElement.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
                
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

const showError = (input, message) => {
    input.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--color-accent)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = 'var(--space-2)';
    input.parentElement.appendChild(errorDiv);
};

const showSuccessMessage = (form) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="
            background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
            color: white;
            padding: var(--space-6);
            border-radius: var(--radius-lg);
            text-align: center;
            margin-top: var(--space-6);
            animation: slideIn 0.3s ease-out;
        ">
            <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: var(--space-3);"></i>
            <h3 style="margin-bottom: var(--space-2); color: white;">Thank You!</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.9);">Your message has been received. We'll get back to you soon.</p>
        </div>
    `;
    
    form.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
};

// ============================================
// LOADING ANIMATION
// ============================================
const initPageLoad = () => {
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
};

// ============================================
// 3D CARD TILT EFFECT
// ============================================
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
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
};

// ============================================
// FAQ ACCORDION
// ============================================
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
const initCursorEffect = () => {
    if (window.innerWidth < 1024) return; // Only on desktop
    
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
// PERFORMANCE MONITORING
// ============================================
const logPerformance = () => {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const connectTime = perfData.responseEnd - perfData.requestStart;
                const renderTime = perfData.domComplete - perfData.domLoading;
                
                console.log(`%c⚡ Performance Metrics`, 'color: #00D9FF; font-weight: bold; font-size: 14px;');
                console.log(`Page Load Time: ${pageLoadTime}ms`);
                console.log(`Connect Time: ${connectTime}ms`);
                console.log(`Render Time: ${renderTime}ms`);
            }, 0);
        });
    }
};

// ============================================
// INITIALIZE ALL
// ============================================
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
    logPerformance();
    
    // Optional: Uncomment for custom cursor
    // initCursorEffect();
};

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================
// EXPORT FOR MODULE USE (if needed)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init };
}