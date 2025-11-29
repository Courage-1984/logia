// ============================================
// LOGIA GENESIS - MONITORING & ERROR TRACKING
// Error tracking (Sentry) and performance monitoring (Web Vitals)
// ============================================

import { appConfig } from '../config/app.config.js';

/**
 * Initialize error tracking with Sentry
 * Monitors JavaScript errors in production
 */
export const initErrorTracking = () => {
    // Only initialize in production and if DSN is configured
    if (!appConfig.monitoring?.sentry?.enabled) {
        return;
    }

    const dsn = appConfig.monitoring.sentry.dsn;
    if (!dsn) {
        console.warn('Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    // Dynamically import Sentry SDK
    import('@sentry/browser').then((SentryModule) => {
        const Sentry = SentryModule.default || SentryModule;
        
        Sentry.init({
            dsn: dsn,
            environment: appConfig.monitoring.sentry.environment || 'production',
            tracesSampleRate: appConfig.monitoring.sentry.tracesSampleRate || 0.1,
            replaysSessionSampleRate: appConfig.monitoring.sentry.replaysSessionSampleRate || 0.1,
            replaysOnErrorSampleRate: appConfig.monitoring.sentry.replaysOnErrorSampleRate || 1.0,
            
            // Capture unhandled promise rejections
            captureUnhandledRejections: true,
            
            // Integrate with browser integrations
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration({
                    maskAllText: true,
                    blockAllMedia: true,
                }),
            ],
            
            // Performance monitoring
            beforeSend(event, hint) {
                // Filter out known non-critical errors
                const error = hint.originalException;
                if (error && error.message) {
                    // Ignore common browser extension errors
                    if (
                        error.message.includes('chrome-extension://') ||
                        error.message.includes('moz-extension://') ||
                        error.message.includes('safari-extension://')
                    ) {
                        return null;
                    }
                }
                return event;
            },
        });

        // Make Sentry available globally for performance monitoring
        window.Sentry = Sentry;

        // Set user context if available
        if (appConfig.monitoring.sentry.user) {
            Sentry.setUser(appConfig.monitoring.sentry.user);
        }

        console.log('Error tracking initialized');
    }).catch((err) => {
        console.warn('Failed to initialize Sentry:', err);
    });
};

/**
 * Track Core Web Vitals performance metrics
 * Measures LCP, FID, CLS, FCP, TTFB
 */
export const initPerformanceMonitoring = () => {
    if (!appConfig.monitoring?.performance?.enabled) {
        return;
    }

    // Dynamically import Web Vitals library
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
        // Track Largest Contentful Paint (LCP)
        onLCP((metric) => {
            reportMetric('LCP', metric.value, metric.rating);
        });

        // Track First Input Delay (FID) - deprecated, use INP instead
        onFID((metric) => {
            reportMetric('FID', metric.value, metric.rating);
        });

        // Track Interaction to Next Paint (INP) - modern replacement for FID
        onINP((metric) => {
            reportMetric('INP', metric.value, metric.rating);
        });

        // Track Cumulative Layout Shift (CLS)
        onCLS((metric) => {
            reportMetric('CLS', metric.value, metric.rating);
        });

        // Track First Contentful Paint (FCP)
        onFCP((metric) => {
            reportMetric('FCP', metric.value, metric.rating);
        });

        // Track Time to First Byte (TTFB)
        onTTFB((metric) => {
            reportMetric('TTFB', metric.value, metric.rating);
        });

        console.log('Performance monitoring initialized');
    }).catch((err) => {
        console.warn('Failed to initialize Web Vitals:', err);
    });
};

/**
 * Report a performance metric
 * @param {string} name - Metric name (LCP, FID, CLS, etc.)
 * @param {number} value - Metric value
 * @param {string} rating - Metric rating ('good', 'needs-improvement', 'poor')
 */
const reportMetric = (name, value, rating) => {
    // Log to console in development
    if (appConfig.monitoring.performance.logToConsole) {
        console.log(`[Web Vitals] ${name}:`, {
            value: Math.round(value),
            rating,
            unit: getMetricUnit(name),
        });
    }

    // Send to Sentry if available
    if (window.Sentry && appConfig.monitoring.performance.sendToSentry) {
        window.Sentry.metrics.distribution(`web_vitals.${name.toLowerCase()}`, value, {
            tags: {
                rating,
            },
            unit: getMetricUnit(name),
        });
    }

    // Send custom event for analytics (if configured)
    if (appConfig.monitoring.performance.sendToAnalytics) {
        // Dispatch custom event that can be captured by analytics
        window.dispatchEvent(new CustomEvent('webvitals', {
            detail: {
                name,
                value,
                rating,
                unit: getMetricUnit(name),
            },
        }));
    }
};

/**
 * Get the unit for a metric
 * @param {string} name - Metric name
 * @returns {string} - Metric unit
 */
const getMetricUnit = (name) => {
    const units = {
        LCP: 'millisecond',
        FID: 'millisecond',
        INP: 'millisecond',
        CLS: 'unitless',
        FCP: 'millisecond',
        TTFB: 'millisecond',
    };
    return units[name] || 'millisecond';
};

/**
 * Initialize all monitoring features
 */
export const initMonitoring = () => {
    initErrorTracking();
    initPerformanceMonitoring();
};

