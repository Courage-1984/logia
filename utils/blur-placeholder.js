/**
 * Utility for loading and using blur-up placeholders
 * Placeholders are generated during build and stored in placeholders.json
 */

import { getResourcePath } from './path.js';

/**
 * Get blur placeholder for an image
 * @param {string} imageName - Image name without extension (e.g., 'hero-background')
 * @returns {Promise<string|null>} Base64 data URL or null if not found
 */
export async function getBlurPlaceholder(imageName) {
  try {
    const response = await fetch(getResourcePath('/assets/images/placeholders/placeholders.json'));
    if (!response.ok) return null;
    
    const placeholders = await response.json();
    return placeholders[imageName] || null;
  } catch (error) {
    console.warn(`Could not load placeholder for ${imageName}:`, error);
    return null;
  }
}

/**
 * Apply blur placeholder to an image element
 * @param {HTMLImageElement} img - Image element
 * @param {string} imageName - Image name without extension
 */
export async function applyBlurPlaceholder(img, imageName) {
  const placeholder = await getBlurPlaceholder(imageName);
  if (placeholder) {
    // Set as background while image loads
    img.style.backgroundImage = `url(${placeholder})`;
    img.style.backgroundSize = 'cover';
    img.style.backgroundPosition = 'center';
    img.style.filter = 'blur(20px)';
    img.style.transition = 'filter 0.3s';
    
    // Remove blur when image loads
    img.addEventListener('load', () => {
      img.style.filter = 'none';
    }, { once: true });
  }
}

/**
 * Generate responsive image HTML with blur placeholder
 * @param {string} imageName - Image name without extension
 * @param {string} alt - Alt text
 * @param {Object} options - Options
 * @returns {Promise<string>} HTML markup
 */
export async function generateImageWithPlaceholder(imageName, alt, options = {}) {
  const {
    className = '',
    loading = 'lazy',
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px',
  } = options;
  
  const placeholder = await getBlurPlaceholder(imageName);
  const placeholderStyle = placeholder ? `background-image: url(${placeholder}); background-size: cover; background-position: center; filter: blur(20px); transition: filter 0.3s;` : '';
  
  const widths = [320, 640, 768, 1024, 1280, 1920];
  const webpSrcset = widths.map(w => `${imageName}-${w}w.webp ${w}w`).join(', ');
  const avifSrcset = widths.map(w => `${imageName}-${w}w.avif ${w}w`).join(', ');
  const fallbackSrcset = widths.map(w => `${imageName}-${w}w.jpg ${w}w`).join(', ');
  
  return `
    <picture>
      <source srcset="${avifSrcset}" sizes="${sizes}" type="image/avif">
      <source srcset="${webpSrcset}" sizes="${sizes}" type="image/webp">
      <img 
        src="${imageName}.jpg" 
        srcset="${fallbackSrcset}"
        sizes="${sizes}"
        alt="${alt.replace(/"/g, '&quot;')}" 
        class="${className}"
        loading="${loading}"
        decoding="async"
        style="${placeholderStyle}"
        onload="this.style.filter='none'"
      >
    </picture>
  `.trim();
}

