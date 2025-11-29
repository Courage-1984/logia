/**
 * Google Analytics 4 (GA4) Integration
 * Handles page views, events, and user interactions
 */

import { appConfig } from '../config/app.config.js';

/**
 * Initialize Google Analytics
 */
export function initGoogleAnalytics() {
  // Check if GA is enabled and Measurement ID is provided
  if (!appConfig.googleAnalytics.enabled || !appConfig.googleAnalytics.measurementId) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Google Analytics is disabled or Measurement ID not set');
    }
    return;
  }

  const measurementId = appConfig.googleAnalytics.measurementId;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    // Privacy settings
    anonymize_ip: true, // Anonymize IP addresses for GDPR compliance
    allow_google_signals: false, // Disable Google Signals (optional, for privacy)
    allow_ad_personalization_signals: false, // Disable ad personalization (optional, for privacy)
  });

  // Track initial page view
  trackPageView();

  if (import.meta.env.DEV) {
    console.log('[Analytics] Google Analytics initialized with Measurement ID:', measurementId);
  }
}

/**
 * Track page view
 * @param {string} path - Optional path to track (defaults to current path)
 * @param {string} title - Optional page title (defaults to current title)
 */
export function trackPageView(path = null, title = null) {
  if (!appConfig.googleAnalytics.enabled || !window.gtag) {
    return;
  }

  const pagePath = path || window.location.pathname + window.location.search;
  const pageTitle = title || document.title;

  window.gtag('config', appConfig.googleAnalytics.measurementId, {
    page_path: pagePath,
    page_title: pageTitle,
  });

  if (import.meta.env.DEV) {
    console.log('[Analytics] Page view tracked:', { path: pagePath, title: pageTitle });
  }
}

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} eventParams - Event parameters (optional)
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!appConfig.googleAnalytics.enabled || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, eventParams);

  if (import.meta.env.DEV) {
    console.log('[Analytics] Event tracked:', eventName, eventParams);
  }
}

/**
 * Track form submission
 * @param {string} formName - Form name/identifier
 * @param {string} formLocation - Where the form is located (e.g., 'contact', 'quote')
 */
export function trackFormSubmission(formName, formLocation = 'unknown') {
  trackEvent('form_submit', {
    form_name: formName,
    form_location: formLocation,
  });
}

/**
 * Track button click
 * @param {string} buttonName - Button name/identifier
 * @param {string} buttonLocation - Where the button is located
 */
export function trackButtonClick(buttonName, buttonLocation = 'unknown') {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: buttonLocation,
  });
}

/**
 * Track phone call click
 */
export function trackPhoneCall() {
  trackEvent('phone_call', {
    phone_number: appConfig.contact.phone,
  });
}

/**
 * Track email click
 */
export function trackEmailClick() {
  trackEvent('email_click', {
    email: appConfig.contact.email,
  });
}

/**
 * Track external link click
 * @param {string} url - External URL
 * @param {string} linkText - Link text/identifier
 */
export function trackExternalLink(url, linkText = '') {
  trackEvent('external_link_click', {
    link_url: url,
    link_text: linkText,
  });
}

/**
 * Track scroll depth
 * @param {number} depth - Scroll depth percentage (0-100)
 */
export function trackScrollDepth(depth) {
  // Only track at 25%, 50%, 75%, and 100% milestones
  const milestones = [25, 50, 75, 100];
  const milestone = milestones.find(m => depth >= m && depth < m + 25);
  
  if (milestone && !window._gaScrollDepthTracked?.[milestone]) {
    if (!window._gaScrollDepthTracked) {
      window._gaScrollDepthTracked = {};
    }
    window._gaScrollDepthTracked[milestone] = true;
    
    trackEvent('scroll_depth', {
      depth: milestone,
    });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleAnalytics);
} else {
  initGoogleAnalytics();
}

// Make trackPageView available globally for page transitions
window.trackPageView = trackPageView;

