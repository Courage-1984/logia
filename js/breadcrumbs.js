// ============================================
// BREADCRUMB NAVIGATION
// Generates breadcrumb navigation from structured data
// ============================================

import { $, waitForElement } from '../utils/dom.js';
import { getBasePath } from '../utils/path.js';

/**
 * Extracts breadcrumb data from JSON-LD structured data
 * @returns {Array|null} Array of breadcrumb items or null if not found
 */
const extractBreadcrumbData = () => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of scripts) {
        try {
            const data = JSON.parse(script.textContent);
            if (data['@type'] === 'BreadcrumbList' && data.itemListElement) {
                return data.itemListElement;
            }
        } catch (error) {
            console.warn('Error parsing JSON-LD breadcrumb data:', error);
        }
    }
    
    return null;
};

/**
 * Converts URL to relative path for navigation
 * @param {string} url - Full URL or relative path
 * @returns {string} Relative path
 */
const normalizePath = (url) => {
    if (!url) return '';
    
    try {
        const urlObj = new URL(url, window.location.origin);
        return urlObj.pathname;
    } catch {
        // If URL parsing fails, treat as relative path
        if (url.startsWith('/')) {
            return url;
        }
        return `/${url}`;
    }
};

/**
 * Gets the page name from URL
 * @param {string} url - URL path
 * @returns {string} Page name
 */
const getPageName = (url) => {
    const path = normalizePath(url);
    const filename = path.split('/').pop() || 'index.html';
    
    // Map common filenames to readable names
    const pageNames = {
        'index.html': 'Home',
        'about.html': 'About Us',
        'services.html': 'Services',
        'portfolio.html': 'Portfolio',
        'contact.html': 'Contact',
        'resources.html': 'Resources',
        'speedtest.html': 'Speed Test',
        'privacy-policy.html': 'Privacy Policy',
        'terms-of-service.html': 'Terms of Service',
    };
    
    return pageNames[filename] || filename.replace('.html', '').replace(/-/g, ' ');
};

/**
 * Renders breadcrumb navigation
 * @param {HTMLElement} container - Breadcrumb container element (.breadcrumb)
 */
const renderBreadcrumbs = (container) => {
    if (!container || !container.classList.contains('breadcrumb')) {
        console.warn('Invalid breadcrumb container');
        return;
    }
    
    // Skip breadcrumbs on homepage - remove entirely
    const currentPath = window.location.pathname;
    const basePath = getBasePath();
    const isHomepage = currentPath === '/' || 
                       currentPath === `${basePath}/` || 
                       currentPath.endsWith('index.html') ||
                       currentPath.endsWith(`${basePath}/index.html`);
    
    if (isHomepage) {
        container.remove();
        // Also remove placeholder if it exists
        const placeholder = document.getElementById('breadcrumb-placeholder');
        if (placeholder) placeholder.remove();
        return;
    }
    
    const breadcrumbData = extractBreadcrumbData();
    
    if (!breadcrumbData || breadcrumbData.length === 0) {
        // Remove breadcrumb entirely if no data
        container.remove();
        // Also remove placeholder if it exists
        const placeholder = document.getElementById('breadcrumb-placeholder');
        if (placeholder) placeholder.remove();
        return;
    }
    
    const list = container.querySelector('.breadcrumb-list');
    if (!list) return;
    
    // Clear existing content
    list.innerHTML = '';
    
    // Show breadcrumb container now that we have data (remove inline display:none)
    container.style.display = 'block';
    
    // Build breadcrumb items
    breadcrumbData.forEach((item, index) => {
        const isLast = index === breadcrumbData.length - 1;
        const listItem = document.createElement('li');
        
        // Use name from structured data or fallback to page name
        const name = item.name || getPageName(item.item);
        const url = item.item;
        const path = normalizePath(url);
        
        // Handle base path for GitHub Pages
        let href = path;
        if (basePath && !path.startsWith(basePath)) {
            href = `${basePath}${path}`;
        }
        
        if (isLast) {
            // Current page - no link
            listItem.setAttribute('aria-current', 'page');
            listItem.textContent = name;
        } else {
            // Previous pages - clickable links
            const link = document.createElement('a');
            link.href = href;
            link.textContent = name;
            
            // Add home icon for first item
            if (index === 0 && name.toLowerCase() === 'home') {
                const icon = document.createElement('i');
                icon.className = 'fas fa-home breadcrumb-home-icon';
                icon.setAttribute('aria-hidden', 'true');
                link.insertBefore(icon, link.firstChild);
            }
            
            listItem.appendChild(link);
        }
        
        list.appendChild(listItem);
    });
};

/**
 * Initializes breadcrumb navigation
 * Called after breadcrumb component is loaded
 */
export const initBreadcrumbs = () => {
    // Find the breadcrumb list (should exist after component loads)
    const list = $('#breadcrumb-list');
    
    if (!list) {
        // Breadcrumb component not loaded - this is fine, breadcrumbs are optional
        return;
    }
    
    const container = list.closest('.breadcrumb');
    if (!container) {
        console.warn('Breadcrumb container not found');
        return;
    }
    
    // Render the breadcrumbs
    renderBreadcrumbs(container);
};
