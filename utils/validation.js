/**
 * Validation Utility Functions
 * Functions for form and data validation
 */

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number format
 * Supports international formats with digits, spaces, dashes, plus, and parentheses
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid (at least 10 digits)
 */
export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required field
 * @param {string} value - Value to check
 * @returns {boolean} True if value is not empty
 */
export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim().length > 0;
};

/**
 * Show error message for form input
 * @param {Element} input - Input element to show error for
 * @param {string} message - Error message to display
 */
export const showError = (input, message) => {
  input.classList.add('error');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.color = 'var(--color-accent)';
  errorDiv.style.fontSize = '0.875rem';
  errorDiv.style.marginTop = 'var(--space-2)';
  input.parentElement.appendChild(errorDiv);
};

/**
 * Remove error message from form input
 * @param {Element} input - Input element to clear error from
 */
export const clearError = (input) => {
  input.classList.remove('error');
  const errorMsg = input.parentElement.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.remove();
  }
};

/**
 * Show success message after form submission
 * @param {Element} form - Form element to show success message in
 */
export const showSuccessMessage = (form) => {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <div style="
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      color: white;
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      text-align: center;
      margin-top: var(--space-6);
      animation: slideIn 0.3s ease-out;
    ">
      <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: var(--space-3);"></i>
      <h3 style="margin-bottom: var(--space-2); color: white;">Thank You!</h3>
      <p style="margin: 0; color: rgba(255,255,255,0.9);">Your message has been received. We'll get back to you soon.</p>
    </div>
  `;

  form.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 5000);
};

