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
  
  // Monitoring & Error Tracking
  monitoring: {
    // Sentry error tracking
    sentry: {
      enabled: import.meta.env.VITE_SENTRY_ENABLED === 'true' || false, // Set via environment variable VITE_SENTRY_ENABLED
      dsn: import.meta.env.VITE_SENTRY_DSN || '', // Set via environment variable VITE_SENTRY_DSN
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || 'production', // 'production' | 'development' | 'staging'
      tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE) || 0.1, // 10% of transactions
      replaysSessionSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE) || 0.1, // 10% of sessions
      replaysOnErrorSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE) || 1.0, // 100% of sessions with errors
      user: null, // Optional: { id: 'user-id', email: 'user@example.com' }
    },
    
    // Performance monitoring (Core Web Vitals)
    performance: {
      enabled: import.meta.env.VITE_PERFORMANCE_MONITORING_ENABLED !== 'false', // Default: true, set to 'false' to disable
      logToConsole: import.meta.env.VITE_PERFORMANCE_LOG_TO_CONSOLE !== 'false', // Default: true
      sendToSentry: import.meta.env.VITE_PERFORMANCE_SEND_TO_SENTRY === 'true' || false, // Default: false
      sendToAnalytics: import.meta.env.VITE_PERFORMANCE_SEND_TO_ANALYTICS === 'true' || false, // Default: false
    },
  },
};

