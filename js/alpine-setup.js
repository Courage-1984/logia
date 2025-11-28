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
  // Theme state
  isDark: localStorage.getItem('theme') === 'dark',
  
  toggleTheme() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-mode', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
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

