/**
 * Alpine.js Setup and Configuration
 * Initializes Alpine.js for reactive components and state management
 */

import Alpine from 'alpinejs';

// Make Alpine available globally
window.Alpine = Alpine;

/**
 * Custom Alpine data stores and directives
 * Add custom Alpine functionality here
 */

// Example: Global app state
Alpine.data('appState', () => ({
  // Theme state - syncs with themeManager
  get isDark() {
    return document.body.classList.contains('dark-mode');
  },
  
  toggleTheme() {
    // Use themeManager for consistent theme handling
    if (window.themeManager) {
      window.themeManager.toggle();
    } else {
      // Fallback if themeManager not available
      const isDark = document.body.classList.contains('dark-mode');
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    }
  },
  
  // Mobile menu state
  mobileMenuOpen: false,
  
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    document.body.classList.toggle('menu-open', this.mobileMenuOpen);
  },
  
  closeMobileMenu() {
    this.mobileMenuOpen = false;
    document.body.classList.remove('menu-open');
  },
}));

// Example: Search functionality
Alpine.data('search', () => ({
  query: '',
  items: [],
  filteredItems: [],
  
  init() {
    // Initialize search items
    this.items = Array.from(document.querySelectorAll('[data-searchable]'));
    this.filteredItems = this.items;
  },
  
  filter() {
    if (!this.query) {
      this.filteredItems = this.items;
      return;
    }
    
    const lowerQuery = this.query.toLowerCase();
    this.filteredItems = this.items.filter(item => {
      return item.textContent.toLowerCase().includes(lowerQuery);
    });
  },
}));

// Example: FAQ Accordion
Alpine.data('faq', () => ({
  openIndex: null,
  
  toggle(index) {
    this.openIndex = this.openIndex === index ? null : index;
  },
  
  isOpen(index) {
    return this.openIndex === index;
  },
}));

// Start Alpine
Alpine.start();

export default Alpine;

