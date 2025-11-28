/**
 * Application Configuration
 * Centralized configuration for Logia Genesis
 */

export const appConfig = {
  // Application metadata
  name: 'Logia Genesis',
  tagline: 'Switching Evolved | Thoughtful Innovations',
  version: '1.0.0',
  
  // Contact information
  contact: {
    phone: '+27795523726',
    email: 'info@logiagenesis.com',
    address: 'Gauteng, South Africa',
  },
  
  // Theme configuration
  theme: {
    defaultMode: 'light', // 'light' | 'dark'
    storageKey: 'theme',
  },
  
  // Animation settings
  animation: {
    aosThreshold: 0.1,
    aosRootMargin: '0px 0px -50px 0px',
    counterDuration: 2000,
    scrollOffset: 100,
  },
  
  // Performance settings
  performance: {
    lazyLoadThreshold: 0.5,
    debounceDelay: 300,
    throttleLimit: 100,
  },
  
  // API endpoints (if needed in future)
  api: {
    baseUrl: '',
    timeout: 10000,
  },
  
  // Feature flags
  features: {
    customCursor: false,
    performanceLogging: true,
    analytics: false,
  },
};

