/**
 * Testimonials Module with Carousel
 * Dynamically renders Google Reviews as testimonials in a centered carousel
 */

import { $, $$ } from '../utils/dom.js';
import { getResourcePath } from '../utils/path.js';
import cacheManager from './cache-manager.js';

/**
 * Generate star rating HTML
 * @param {number} rating - Rating from 1 to 5
 * @returns {string} HTML for star rating
 */
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  let starsHTML = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHTML += '<i class="fas fa-star"></i>';
    } else if (i === fullStars && hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHTML += '<i class="far fa-star"></i>';
    }
  }
  return starsHTML;
}

/**
 * Format author name for display
 * @param {string} author - Author name
 * @returns {string} Formatted name
 */
function formatAuthorName(author) {
  const parts = author.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }
  return author;
}

/**
 * Create testimonial card HTML with uniform sizing
 * @param {Object} review - Review object
 * @param {number} index - Card index
 * @returns {string} HTML for testimonial card
 */
function createTestimonialCard(review, index) {
  const stars = generateStars(review.rating || 5);
  const authorName = formatAuthorName(review.author || 'Anonymous');
  const relativeTime = review.relativeTime || '';
  
  let avatarHTML;
  if (review.authorPhoto) {
    avatarHTML = `
      <img src="${review.authorPhoto}" alt="${authorName}" loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <i class="fas fa-user" style="display:none;"></i>
    `;
  } else {
    avatarHTML = '<i class="fas fa-user"></i>';
  }
  
  return `
    <div class="testimonial-card" data-review-index="${index}">
      <div class="testimonial-stars">
        ${stars}
      </div>
      <p class="testimonial-text">
        "${review.text || ''}"
      </p>
      <div class="testimonial-author">
        <div class="author-avatar">
          ${avatarHTML}
        </div>
        <div class="author-info">
          <strong class="author-name">${authorName}</strong>
          ${relativeTime ? `<p>${relativeTime}</p>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize carousel functionality with centered active card
 * @param {HTMLElement} carouselContainer - Carousel container element
 * @param {HTMLElement} track - Track element containing cards
 * @param {Array} reviews - Array of review objects
 */
function initCarousel(carouselContainer, track, reviews) {
  const totalCards = reviews.length;
  let currentIndex = 0;
  let autoScrollInterval = null;
  let isPaused = false;
  let isTransitioning = false;
  
  // Drag state
  let isDragging = false;
  let dragStartX = 0;
  let dragCurrentX = 0;
  let dragStartIndex = 0;
  
  // Clone cards for infinite loop - add clones at both ends
  const originalCards = Array.from(track.querySelectorAll('.testimonial-card'));
  
  // Clone last 3 cards and prepend (for seamless backward scrolling)
  const lastCards = originalCards.slice(-3);
  lastCards.reverse().forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('carousel-clone');
    track.insertBefore(clone, track.firstChild);
  });
  
  // Clone first 3 cards and append (for seamless forward scrolling)
  const firstCards = originalCards.slice(0, 3);
  firstCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('carousel-clone');
    track.appendChild(clone);
  });
  
  // Re-query all cards including clones
  const allCards = track.querySelectorAll('.testimonial-card');
  
  // Set initial position to first original card (after prepended clones)
  currentIndex = 3;
  
  // Create navigation buttons
  let prevBtn = carouselContainer.querySelector('.carousel-btn-prev');
  let nextBtn = carouselContainer.querySelector('.carousel-btn-next');
  let dotsContainer = carouselContainer.querySelector('.carousel-dots');
  
  if (!prevBtn) {
    prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-btn carousel-btn-prev';
    prevBtn.setAttribute('aria-label', 'Previous testimonials');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    carouselContainer.appendChild(prevBtn);
  }
  
  if (!nextBtn) {
    nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn carousel-btn-next';
    nextBtn.setAttribute('aria-label', 'Next testimonials');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    carouselContainer.appendChild(nextBtn);
  }
  
  // Create dots - one per original card
  if (!dotsContainer && totalCards > 1) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      const cardIndex = i;
      dot.addEventListener('click', () => {
        if (!isTransitioning) {
          goToSlide(cardIndex);
        }
      });
      dotsContainer.appendChild(dot);
    }
    carouselContainer.appendChild(dotsContainer);
  }
  
  // Get original card index from current position
  const getOriginalIndex = () => {
    return ((currentIndex - 3 + totalCards) % totalCards);
  };
  
  // Update carousel position - center the active card
  const updateCarousel = (instant = false) => {
    if (isTransitioning && !instant) return;
    
    // Get container's inner width (accounting for padding)
    const containerStyles = getComputedStyle(carouselContainer);
    const containerPadding = parseFloat(containerStyles.paddingLeft) + parseFloat(containerStyles.paddingRight);
    const containerWidth = carouselContainer.offsetWidth - containerPadding;
    
    const activeCard = allCards[currentIndex];
    if (!activeCard) return;
    
    const cardWidth = activeCard.offsetWidth || 0;
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    
    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.3s ease';
      isTransitioning = true;
      setTimeout(() => {
        isTransitioning = false;
      }, 300);
    }
    
    // Calculate position to center the active card horizontally
    // Center offset = container inner width / 2 - card width / 2
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    const translateX = -(currentIndex * (cardWidth + gap)) + centerOffset;
    
    track.style.transform = `translateX(${translateX}px)`;
    
    // Update dots based on original index
    const originalIndex = getOriginalIndex();
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === originalIndex);
      });
    }
    
    // Handle seamless infinite loop - jump to clones when near boundaries
    const maxIndex = allCards.length - 4; // Last position before end clones
    const minIndex = 3; // First position after start clones
    
    if (currentIndex > maxIndex && !instant) {
      // Past end, jump to start clones seamlessly
      setTimeout(() => {
        track.style.transition = 'none';
        const jumpAmount = currentIndex - maxIndex;
        currentIndex = minIndex + jumpAmount - 1;
        updateCarousel(true);
        setTimeout(() => {
          track.style.transition = 'transform 0.3s ease';
        }, 50);
      }, 300);
    } else if (currentIndex < minIndex && !instant) {
      // Before start, jump to end clones seamlessly
      setTimeout(() => {
        track.style.transition = 'none';
        const jumpAmount = minIndex - currentIndex;
        currentIndex = maxIndex - jumpAmount + 1;
        updateCarousel(true);
        setTimeout(() => {
          track.style.transition = 'transform 0.3s ease';
        }, 50);
      }, 300);
    }
    
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  };
  
  // Navigate functions
  const goToSlide = (originalIndex) => {
    currentIndex = originalIndex + 3; // Offset by prepended clones
    updateCarousel();
    resetAutoScroll();
  };
  
  const nextSlide = () => {
    if (isTransitioning) return;
    currentIndex += 1;
    updateCarousel();
    resetAutoScroll();
  };
  
  const prevSlide = () => {
    if (isTransitioning) return;
    currentIndex -= 1;
    updateCarousel();
    resetAutoScroll();
  };
  
  // Auto-scroll functionality
  const startAutoScroll = () => {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(() => {
      if (!isPaused && !isTransitioning) {
        nextSlide();
      }
    }, 5000);
  };
  
  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  };
  
  const resetAutoScroll = () => {
    stopAutoScroll();
    startAutoScroll();
  };
  
  // Drag functionality
  const handleDragStart = (e) => {
    isDragging = true;
    isPaused = true; // Pause auto-scroll while dragging
    dragStartX = e.clientX || e.touches?.[0]?.clientX || 0;
    dragStartIndex = currentIndex;
    track.classList.add('is-dragging');
    carouselContainer.style.cursor = 'grabbing';
  };
  
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    dragCurrentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const dragDistance = dragCurrentX - dragStartX;
    
    // Get card width and gap for calculation
    const activeCard = allCards[currentIndex];
    if (!activeCard) return;
    
    const cardWidth = activeCard.offsetWidth || 0;
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    const containerStyles = getComputedStyle(carouselContainer);
    const containerPadding = parseFloat(containerStyles.paddingLeft) + parseFloat(containerStyles.paddingRight);
    const containerWidth = carouselContainer.offsetWidth - containerPadding;
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    
    // Calculate drag offset
    const baseTranslateX = -(dragStartIndex * (cardWidth + gap)) + centerOffset;
    const dragOffset = dragDistance;
    const translateX = baseTranslateX + dragOffset;
    
    track.style.transform = `translateX(${translateX}px)`;
  };
  
  const handleDragEnd = () => {
    if (!isDragging) return;
    
    isDragging = false;
    isPaused = false;
    carouselContainer.style.cursor = '';
    track.classList.remove('is-dragging');
    
    // Calculate if we should move to next/prev card
    const dragDistance = dragCurrentX - dragStartX;
    const activeCard = allCards[currentIndex];
    if (!activeCard) return;
    
    const cardWidth = activeCard.offsetWidth || 0;
    const threshold = cardWidth * 0.3; // 30% of card width to trigger slide
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance < 0) {
        // Dragged left, go to next
        nextSlide();
      } else {
        // Dragged right, go to previous
        prevSlide();
      }
    } else {
      // Not enough drag, snap back to current position
      updateCarousel();
    }
  };
  
  // Mouse drag events
  track.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handleDragStart(e);
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      handleDragMove(e);
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      handleDragEnd();
    }
  });
  
  // Touch drag events (for mobile)
  track.addEventListener('touchstart', (e) => {
    handleDragStart(e);
  }, { passive: false });
  
  track.addEventListener('touchmove', (e) => {
    if (isDragging) {
      e.preventDefault();
      handleDragMove(e);
    }
  }, { passive: false });
  
  track.addEventListener('touchend', () => {
    if (isDragging) {
      handleDragEnd();
    }
  });
  
  // Shift + Scroll functionality
  carouselContainer.addEventListener('wheel', (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      if (e.deltaY > 0) {
        // Scroll down = next
        nextSlide();
      } else {
        // Scroll up = previous
        prevSlide();
      }
      resetAutoScroll();
    }
  }, { passive: false });
  
  // Pause on hover
  carouselContainer.addEventListener('mouseenter', () => {
    if (!isDragging) {
      isPaused = true;
    }
  });
  
  carouselContainer.addEventListener('mouseleave', () => {
    if (!isDragging) {
      isPaused = false;
    }
  });
  
  // Event listeners
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);
  
  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel(true);
      setTimeout(() => updateCarousel(false), 50);
    }, 250);
  });
  
  // Keyboard navigation
  carouselContainer.setAttribute('tabindex', '0');
  carouselContainer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
  
  // Initialize
  updateCarousel(true);
  setTimeout(() => {
    track.style.transition = 'transform 0.3s ease';
    updateCarousel(false);
  }, 100);
  startAutoScroll();
}

/**
 * Load and render testimonials in a carousel
 * @param {string} containerSelector - CSS selector for testimonials container
 * @param {number} maxReviews - Maximum number of reviews (0 = all)
 */
export async function loadTestimonials(containerSelector = '.testimonials-grid', maxReviews = 0) {
  const container = $(containerSelector);
  if (!container) {
    return;
  }

  // Show skeleton loaders
  const skeletonHTML = `
    <div class="testimonials-carousel">
      <div class="testimonials-track">
        ${Array(3).fill(0).map(() => `
          <div class="skeleton-testimonial">
            <div class="skeleton-testimonial-header">
              <div class="skeleton skeleton-avatar"></div>
              <div style="flex: 1;">
                <div class="skeleton skeleton-text skeleton-text--short"></div>
                <div class="skeleton skeleton-text skeleton-text--medium"></div>
              </div>
            </div>
            <div class="skeleton-testimonial-content">
              <div class="skeleton skeleton-text skeleton-text--long"></div>
              <div class="skeleton skeleton-text skeleton-text--long"></div>
              <div class="skeleton skeleton-text skeleton-text--medium"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.innerHTML = skeletonHTML;

  try {
    // Check cache first
    const cacheKey = 'google-reviews';
    let data = cacheManager.getData(cacheKey);
    
    if (!data) {
      const response = await fetch(getResourcePath('/data/google-reviews.json'));
      
      if (!response.ok) {
        throw new Error(`Failed to load reviews: ${response.status}`);
      }

      data = await response.json();
      
      // Cache the data
      cacheManager.setData(cacheKey, data);
    }
    let reviews = data.reviews || [];
    
    if (maxReviews > 0) {
      reviews = reviews.slice(0, maxReviews);
    }

    if (reviews.length === 0) {
      // Remove skeleton and keep fallback testimonials
      const fallbackTestimonials = container.querySelectorAll('[data-fallback-testimonial]');
      if (fallbackTestimonials.length > 0) {
        container.innerHTML = '';
        fallbackTestimonials.forEach(testimonial => container.appendChild(testimonial));
      } else {
        container.innerHTML = '';
      }
      return;
    }

    // Remove fallback testimonials
    const fallbackTestimonials = container.querySelectorAll('[data-fallback-testimonial]');
    if (fallbackTestimonials.length > 0) {
      fallbackTestimonials.forEach(testimonial => testimonial.remove());
    }

    // Create carousel structure
    container.innerHTML = `
      <div class="testimonials-carousel">
        <div class="testimonials-track">
          ${reviews.map((review, index) => createTestimonialCard(review, index)).join('')}
        </div>
      </div>
    `;
    
    const carouselContainer = container.querySelector('.testimonials-carousel');
    const track = container.querySelector('.testimonials-track');
    
    // Initialize carousel after a brief delay to ensure DOM is ready
    setTimeout(() => {
      initCarousel(carouselContainer, track, reviews);
    }, 100);
    
  } catch (error) {
    // Remove skeleton and keep fallback testimonials
    const fallbackTestimonials = container.querySelectorAll('[data-fallback-testimonial]');
    if (fallbackTestimonials.length > 0) {
      container.innerHTML = '';
      fallbackTestimonials.forEach(testimonial => container.appendChild(testimonial));
    } else {
      container.innerHTML = '';
    }
  }
}

/**
 * Initialize testimonials on page load
 */
export function initTestimonials() {
  const init = () => {
    setTimeout(() => {
      loadTestimonials('.testimonials-grid', 0); // 0 = load all reviews
    }, 100);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// Make loadTestimonials available globally for page transitions
window.loadTestimonials = loadTestimonials;
window.initTestimonials = initTestimonials;
