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
  
  // Google Reviews configuration
  googleReviews: {
    enabled: true,
    maxReviews: 3, // Maximum number of reviews to display
    placeId: '', // Set via environment variable GOOGLE_PLACE_ID
    apiKey: '', // Set via environment variable GOOGLE_PLACES_API_KEY
  },
  
  // Instagram Feed configuration
  instagram: {
    enabled: true,
    postUrls: [
      'https://www.instagram.com/p/DCRi-2SoxNX/',
      'https://www.instagram.com/reel/C32hCk5SoVd/',
      'https://www.instagram.com/p/Cy03e8sIdT2/',
      'https://www.instagram.com/reel/C2DsIuMSlyc/',
      'https://www.instagram.com/reel/CzCAQ-MySJl/'
      // Add your Instagram post URLs here
      // Example: 'https://www.instagram.com/p/ABC123xyz/',
      // Get URLs by right-clicking on an Instagram post and selecting "Copy Link"
    ],
    maxPosts: 0, // 0 = display all posts, or set a number to limit
  },
  
  // Feature flags
  features: {
    customCursor: false,
    performanceLogging: true,
    analytics: false,
  },
};

