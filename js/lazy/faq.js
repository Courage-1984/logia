// ============================================
// FAQ ACCORDION - Lazy Loaded Module
// ============================================

import { $$ } from '../../utils/dom.js';

/**
 * Initialize FAQ accordion functionality using event delegation
 * Handles expand/collapse behavior for FAQ items
 */
export const initFAQ = () => {
    const faqContainer = document.querySelector('.faq-container, .faq-list, [data-faq-container]');
    if (!faqContainer) return;
    
    const faqItems = $$('.faq-item');
    if (faqItems.length === 0) return;
    
    // Use event delegation on the container
    faqContainer.addEventListener('click', (e) => {
        const question = e.target.closest('.faq-question');
        if (!question) return;
        
        const item = question.closest('.faq-item');
        if (!item) return;
        
        const answer = item.querySelector('.faq-answer');
        if (!answer) return;
        
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(i => {
            i.classList.remove('active');
            const a = i.querySelector('.faq-answer');
            if (a) a.style.maxHeight = null;
        });
        
        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    });
};

