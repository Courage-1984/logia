/**
 * DOM Utility Functions
 * Provides convenient DOM manipulation helpers
 */

/**
 * Shorthand for document.querySelector
 * @param {string} selector - CSS selector string
 * @returns {Element|null} The first element matching the selector, or null
 */
export const $ = (selector) => document.querySelector(selector);

/**
 * Shorthand for document.querySelectorAll
 * @param {string} selector - CSS selector string
 * @returns {NodeList} All elements matching the selector
 */
export const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector string
 * @param {number} timeout - Maximum wait time in milliseconds (default: 5000)
 * @returns {Promise<Element>} Promise that resolves with the element
 */
export const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const element = $(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = $(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

/**
 * Check if an element is in the viewport
 * @param {Element} element - DOM element to check
 * @param {number} threshold - Intersection threshold (0-1)
 * @returns {boolean} True if element is in viewport
 */
export const isInViewport = (element, threshold = 0) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.height * (1 - threshold) > 0
  );
};

