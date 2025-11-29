/**
 * Lighthouse CI Configuration
 * Automated performance testing with budgets and assertions
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:4173/', // Production build preview
        'http://localhost:4173/about.html',
        'http://localhost:4173/services.html',
        'http://localhost:4173/contact.html',
      ],
      // Number of runs per URL for more reliable results
      numberOfRuns: 3,
      // Start local server for testing
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:|localhost:4173', // Match Vite preview output
      startServerReadyTimeout: 30000, // Increased timeout for CI
    },
    assert: {
      // Performance budgets and assertions
      assertions: {
        // Performance scores (0-100)
        // Using 'warn' for performance to track progress without failing CI
        'categories:performance': ['warn', { minScore: 0.85 }], // 85% target (warning, not error)
        'categories:accessibility': ['error', { minScore: 0.95 }], // 95% minimum (critical)
        'categories:best-practices': ['error', { minScore: 0.90 }], // 90% minimum (critical)
        'categories:seo': ['error', { minScore: 0.90 }], // 90% minimum (critical)

        // Core Web Vitals
        // Using 'warn' for performance metrics to track progress
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }], // < 2.5s target
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }], // < 1.8s target
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // < 0.1 (critical for UX)
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // < 300ms target
        'speed-index': ['warn', { maxNumericValue: 3400 }], // < 3.4s target

        // Resource sizes (in bytes)
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // < 500KB total JS
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 200000 }], // < 200KB total CSS
        'resource-summary:image:size': ['error', { maxNumericValue: 2000000 }], // < 2MB total images
        'resource-summary:font:size': ['error', { maxNumericValue: 300000 }], // < 300KB total fonts

        // Individual resource limits
        'uses-optimized-images': 'off', // We handle this manually
        'uses-text-compression': 'off', // Server-side
        'uses-long-cache-ttl': 'off', // Server-side
        'modern-image-formats': 'off', // We use WebP/AVIF
        'uses-responsive-images': 'off', // We handle this manually

        // Network requests (using different assertion format)
        'network-requests': 'off', // Not directly assertable, check manually

        // Best practices
        'uses-http2': 'off', // Server-side
        'csp-xss': 'warn', // Content Security Policy warning
      },
    },
    upload: {
      // Upload results to Lighthouse CI server (optional)
      target: 'temporary-public-storage',
    },
  },
};

