// ============================================
// SEARCH FUNCTIONALITY - Lazy Loaded Module
// ============================================

import { $, $$ } from '../../utils/dom.js';
import { debounce } from '../../utils/performance.js';
import { appConfig } from '../../config/app.config.js';

/**
 * Initialize search functionality
 * Filters searchable items based on search query
 */
export const initSearch = () => {
    const searchInput = $('#searchInput');
    const searchItems = $$('[data-searchable]');
    
    if (!searchInput || searchItems.length === 0) return;
    
    const handleSearch = debounce((query) => {
        const lowerQuery = query.toLowerCase();
        
        searchItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            
            if (text.includes(lowerQuery) || !query) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }, appConfig.performance.debounceDelay);
    
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
};

