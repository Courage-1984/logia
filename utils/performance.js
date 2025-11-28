/**
 * Performance Utility Functions
 * Functions for performance optimization and monitoring
 */

/**
 * Debounce function - delays execution until after wait time has passed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - limits execution to once per limit period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Request Animation Frame wrapper for smooth animations
 * @param {Function} callback - Function to call on each frame
 * @returns {number} Animation frame ID
 */
export const requestFrame = (callback) => {
  return requestAnimationFrame(callback);
};

/**
 * Cancel Animation Frame wrapper
 * @param {number} id - Animation frame ID to cancel
 */
export const cancelFrame = (id) => {
  cancelAnimationFrame(id);
};

/**
 * Log performance metrics to console
 * @param {Object} options - Performance logging options
 * @param {boolean} options.enabled - Whether to log metrics
 */
export const logPerformance = (options = { enabled: true }) => {
  if (!options.enabled || !window.performance || !window.performance.timing) {
    return;
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      console.log(`%c⚡ Performance Metrics`, 'color: #00D9FF; font-weight: bold; font-size: 14px;');
      console.log(`Page Load Time: ${pageLoadTime}ms`);
      console.log(`Connect Time: ${connectTime}ms`);
      console.log(`Render Time: ${renderTime}ms`);
    }, 0);
  });
};

