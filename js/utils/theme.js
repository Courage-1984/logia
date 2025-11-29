/**
 * Theme Management Utility
 * Handles dark/light mode switching with system preference detection,
 * FOUC prevention, smooth transitions, and persistence
 */

import { appConfig } from '../../config/app.config.js';

/**
 * Theme Manager Class
 * Centralized theme management with system preference support
 */
class ThemeManager {
  constructor() {
    this.storageKey = appConfig.theme.storageKey || 'theme';
    this.defaultMode = appConfig.theme.defaultMode || 'light';
    this.currentTheme = null;
    this.toggleButton = null;
    this.mediaQuery = null;
    this.isTransitioning = false;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.getSystemPreference = this.getSystemPreference.bind(this);
    this.getStoredTheme = this.getStoredTheme.bind(this);
    this.getTheme = this.getTheme.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.toggle = this.toggle.bind(this);
    this.updateToggleIcon = this.updateToggleIcon.bind(this);
    this.handleSystemChange = this.handleSystemChange.bind(this);
  }

  /**
   * Get system color scheme preference
   * @returns {string} 'dark' or 'light'
   */
  getSystemPreference() {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return this.defaultMode;
    }
    
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (error) {
      console.warn('Theme: Could not detect system preference:', error);
      return this.defaultMode;
    }
  }

  /**
   * Get stored theme from localStorage
   * @returns {string|null} 'dark', 'light', or null if not set
   */
  getStoredTheme() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (error) {
      console.warn('Theme: Could not read from localStorage:', error);
      return null;
    }
  }

  /**
   * Get current theme (stored preference or system preference)
   * @returns {string} 'dark' or 'light'
   */
  getTheme() {
    const stored = this.getStoredTheme();
    
    // If user has explicitly set a preference, use it
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    
    // Otherwise, use system preference
    return this.getSystemPreference();
  }

  /**
   * Set theme and update UI
   * @param {string} theme - 'dark' or 'light'
   * @param {boolean} persist - Whether to save to localStorage (default: true)
   */
  setTheme(theme, persist = true) {
    if (this.isTransitioning) return;
    
    const isDark = theme === 'dark';
    const body = document.body;
    
    // Prevent multiple rapid toggles
    this.isTransitioning = true;
    
    // Apply theme class
    if (isDark) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
    
    // Update current theme
    this.currentTheme = theme;
    
    // Persist to localStorage
    if (persist) {
      try {
        localStorage.setItem(this.storageKey, theme);
      } catch (error) {
        console.warn('Theme: Could not save to localStorage:', error);
      }
    }
    
    // Update toggle button icon
    this.updateToggleIcon(isDark);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme, isDark }
    }));
    
    // Reset transition lock after animation
    setTimeout(() => {
      this.isTransitioning = false;
    }, 300);
  }

  /**
   * Toggle between dark and light mode
   */
  toggle() {
    const current = this.getTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Update toggle button icon
   * @param {boolean} isDark - Whether dark mode is active
   */
  updateToggleIcon(isDark) {
    if (!this.toggleButton) return;
    
    const icon = this.toggleButton.querySelector('i');
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    } else {
      // Fallback: update innerHTML if no icon element
      this.toggleButton.innerHTML = isDark 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    }
    
    // Update aria-label for accessibility
    this.toggleButton.setAttribute(
      'aria-label',
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  /**
   * Handle system preference changes
   * Only applies if user hasn't explicitly set a preference
   */
  handleSystemChange() {
    const stored = this.getStoredTheme();
    
    // Only auto-update if user hasn't set a preference
    if (!stored || stored === 'auto' || stored === 'system') {
      const systemTheme = this.getSystemPreference();
      this.setTheme(systemTheme, false); // Don't persist auto-updates
    }
  }

  /**
   * Initialize theme manager
   * Should be called as early as possible to prevent FOUC
   */
  init() {
    // Apply theme immediately to prevent FOUC
    const theme = this.getTheme();
    this.setTheme(theme, false); // Don't persist on initial load if using system preference
    
    // If user has a stored preference, use it
    const stored = this.getStoredTheme();
    if (stored === 'dark' || stored === 'light') {
      this.setTheme(stored, false); // Already persisted
    }
    
    // Set up system preference listener
    if (window.matchMedia) {
      try {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Modern browsers
        if (this.mediaQuery.addEventListener) {
          this.mediaQuery.addEventListener('change', this.handleSystemChange);
        } 
        // Legacy browsers
        else if (this.mediaQuery.addListener) {
          this.mediaQuery.addListener(this.handleSystemChange);
        }
      } catch (error) {
        console.warn('Theme: Could not set up system preference listener:', error);
      }
    }
    
    // Initialize toggle button when available
    this.initToggleButton();
  }

  /**
   * Initialize toggle button
   * Can be called multiple times safely
   */
  initToggleButton() {
    const toggle = document.getElementById('themeToggle');
    
    if (!toggle) {
      // Retry after a short delay if button not found
      setTimeout(() => this.initToggleButton(), 100);
      return;
    }
    
    // Prevent duplicate initialization
    if (toggle.dataset.themeInitialized === 'true') return;
    toggle.dataset.themeInitialized = 'true';
    
    this.toggleButton = toggle;
    
    // Update icon to match current theme
    const isDark = document.body.classList.contains('dark-mode');
    this.updateToggleIcon(isDark);
    
    // Add click handler
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
  }

  /**
   * Cleanup - remove event listeners
   */
  destroy() {
    if (this.mediaQuery) {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', this.handleSystemChange);
      } else if (this.mediaQuery.removeListener) {
        this.mediaQuery.removeListener(this.handleSystemChange);
      }
    }
  }
}

// Create singleton instance
const themeManager = new ThemeManager();

// Initialize immediately to prevent FOUC
// This runs before DOM is ready, so it applies theme as early as possible
if (document.readyState === 'loading') {
  // DOM is still loading
  themeManager.init();
} else {
  // DOM is already loaded
  themeManager.init();
}

// Also initialize toggle button when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeManager.initToggleButton();
  });
} else {
  themeManager.initToggleButton();
}

// Export for use in other modules
export default themeManager;

// Export convenience functions
export const getTheme = () => themeManager.getTheme();
export const setTheme = (theme) => themeManager.setTheme(theme);
export const toggleTheme = () => themeManager.toggle();
export const initTheme = () => themeManager.init();

// Make available globally for backwards compatibility
window.themeManager = themeManager;
window.initDarkMode = () => themeManager.initToggleButton();

