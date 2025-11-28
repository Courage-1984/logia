// ============================================
// FILTER FUNCTIONALITY - Lazy Loaded Module
// ============================================

import { $$ } from '../../utils/dom.js';

/**
 * Initialize filter functionality using event delegation
 * Filters items based on category when filter buttons are clicked
 */
export const initFilters = () => {
    const filterContainer = document.querySelector('[data-filter-container], .filter-container, .portfolio-filters, .service-filters');
    const filterBtns = $$('[data-filter]');
    const filterItems = $$('[data-category]');
    
    if (filterBtns.length === 0 || filterItems.length === 0) return;
    
    // Use event delegation if container exists, otherwise delegate on document
    const delegateTarget = filterContainer || document;
    
    delegateTarget.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        
        const filter = btn.getAttribute('data-filter');
        
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter items
        filterItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.style.display = '';
                item.classList.add('aos-animate');
            } else {
                item.style.display = 'none';
                item.classList.remove('aos-animate');
            }
        });
    });
};

