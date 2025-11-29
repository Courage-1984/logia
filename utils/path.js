/**
 * Path Utilities
 * Utilities for handling base paths in different deployment environments
 */

/**
 * Get the base path for the current deployment
 * Detects GitHub Pages base path (/logia/) or returns empty string for production
 * @returns {string} Base path (e.g., '/logia' or '')
 */
export function getBasePath() {
  // Check if we're on GitHub Pages by looking at the pathname
  const pathname = window.location.pathname;
  
  // GitHub Pages: pathname will be '/logia/', '/logia', '/logia/index.html', etc.
  // Also check hostname as a fallback
  const isGitHubPages = 
    pathname.startsWith('/logia/') || 
    pathname === '/logia' ||
    window.location.hostname.includes('github.io');
  
  if (isGitHubPages && pathname.startsWith('/logia')) {
    return '/logia';
  }
  
  // Production or local development: no base path
  return '';
}

/**
 * Get the full path to a resource, accounting for base path
 * @param {string} path - Resource path (e.g., '/data/file.json')
 * @returns {string} Full path with base path if needed
 */
export function getResourcePath(path) {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

