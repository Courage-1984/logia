/**
 * Instagram Feed Module with Carousel
 * Fetches Instagram posts using oEmbed API and displays them in a carousel
 */

import { $, $$ } from '../utils/dom.js';
import { getResourcePath } from '../utils/path.js';
import { appConfig } from '../config/app.config.js';

/**
 * Fetch Instagram post data using oEmbed API
 * NOTE: This function is NOT used in the browser due to CORS restrictions.
 * Instagram posts should be fetched at build time using the fetch-instagram-posts.js script.
 * This function is kept for reference but should not be called from the browser.
 * @param {string} postUrl - Instagram post URL
 * @returns {Promise<Object|null>} Post data or null if failed
 */
async function fetchInstagramPost(postUrl) {
  // This function causes CORS errors in the browser
  // Instagram posts should be fetched at build time, not at runtime
  console.warn('Runtime Instagram oEmbed fetching is disabled due to CORS restrictions.');
  console.warn('Please run "npm run fetch-instagram" to fetch posts at build time.');
  return null;
}

/**
 * Create Instagram post card HTML
 * @param {Object} post - Post data object
 * @param {number} index - Card index
 * @returns {string} HTML for Instagram post card
 */
function createInstagramCard(post, index) {
  // Extract image URL from thumbnail or HTML
  const imageUrl = post.thumbnailUrl || '';
  
  return `
    <div class="instagram-card" data-post-index="${index}">
      <a href="${post.postUrl}" target="_blank" rel="noopener noreferrer" class="instagram-card-link">
        <div class="instagram-image-wrapper">
          <img 
            src="${imageUrl}" 
            alt="${post.title || 'Instagram post'}" 
            loading="lazy" 
            decoding="async"
            class="instagram-image"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          >
          <div class="instagram-placeholder" style="display:none;">
            <i class="fab fa-instagram"></i>
          </div>
          <div class="instagram-overlay">
            <i class="fab fa-instagram"></i>
            <span>View on Instagram</span>
          </div>
        </div>
        ${post.title ? `
          <div class="instagram-caption">
            <p>${post.title.length > 100 ? post.title.substring(0, 100) + '...' : post.title}</p>
          </div>
        ` : ''}
      </a>
    </div>
  `;
}

/**
 * Initialize carousel functionality (reusing testimonials carousel logic)
 * @param {HTMLElement} carouselContainer - Carousel container element
 * @param {HTMLElement} track - Track element containing cards
 * @param {Array} posts - Array of post objects
 */
function initCarousel(carouselContainer, track, posts) {
  const totalCards = posts.length;
  let currentIndex = 0;
  let autoScrollInterval = null;
  let isPaused = false;
  let isTransitioning = false;
  
  // Drag state
  let isDragging = false;
  let dragStartX = 0;
  let dragCurrentX = 0;
  let dragStartIndex = 0;
  
  // Clone cards for infinite loop
  const originalCards = Array.from(track.querySelectorAll('.instagram-card'));
  
  // Clone last 3 cards and prepend
  const lastCards = originalCards.slice(-3);
  lastCards.reverse().forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('carousel-clone');
    track.insertBefore(clone, track.firstChild);
  });
  
  // Clone first 3 cards and append
  const firstCards = originalCards.slice(0, 3);
  firstCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('carousel-clone');
    track.appendChild(clone);
  });
  
  // Re-query all cards including clones
  const allCards = track.querySelectorAll('.instagram-card');
  
  // Set initial position
  currentIndex = 3;
  
  // Create navigation buttons
  let prevBtn = carouselContainer.querySelector('.carousel-btn-prev');
  let nextBtn = carouselContainer.querySelector('.carousel-btn-next');
  let dotsContainer = carouselContainer.querySelector('.carousel-dots');
  
  if (!prevBtn) {
    prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-btn carousel-btn-prev';
    prevBtn.setAttribute('aria-label', 'Previous Instagram posts');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    carouselContainer.appendChild(prevBtn);
  }
  
  if (!nextBtn) {
    nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-btn carousel-btn-next';
    nextBtn.setAttribute('aria-label', 'Next Instagram posts');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    carouselContainer.appendChild(nextBtn);
  }
  
  // Create dots
  if (!dotsContainer && totalCards > 1) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to post ${i + 1}`);
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
  
  // Get original card index
  const getOriginalIndex = () => {
    return ((currentIndex - 3 + totalCards) % totalCards);
  };
  
  // Update carousel position
  const updateCarousel = (instant = false) => {
    if (isTransitioning && !instant) return;
    
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
    
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    const translateX = -(currentIndex * (cardWidth + gap)) + centerOffset;
    
    track.style.transform = `translateX(${translateX}px)`;
    
    // Update dots
    const originalIndex = getOriginalIndex();
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === originalIndex);
      });
    }
    
    // Handle infinite loop
    const maxIndex = allCards.length - 4;
    const minIndex = 3;
    
    if (currentIndex > maxIndex && !instant) {
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
  };
  
  // Navigate functions
  const goToSlide = (originalIndex) => {
    currentIndex = originalIndex + 3;
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
  
  // Auto-scroll
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
    isPaused = true;
    dragStartX = e.clientX || e.touches?.[0]?.clientX || 0;
    dragStartIndex = currentIndex;
    track.style.transition = 'none';
    carouselContainer.style.cursor = 'grabbing';
  };
  
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    dragCurrentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const dragDistance = dragCurrentX - dragStartX;
    
    const activeCard = allCards[currentIndex];
    if (!activeCard) return;
    
    const cardWidth = activeCard.offsetWidth || 0;
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    const containerStyles = getComputedStyle(carouselContainer);
    const containerPadding = parseFloat(containerStyles.paddingLeft) + parseFloat(containerStyles.paddingRight);
    const containerWidth = carouselContainer.offsetWidth - containerPadding;
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    
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
    track.style.transition = 'transform 0.3s ease';
    
    const dragDistance = dragCurrentX - dragStartX;
    const activeCard = allCards[currentIndex];
    if (!activeCard) return;
    
    const cardWidth = activeCard.offsetWidth || 0;
    const threshold = cardWidth * 0.3;
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    } else {
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
  
  // Touch drag events
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
  
  // Shift + Scroll
  carouselContainer.addEventListener('wheel', (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      if (e.deltaY > 0) {
        nextSlide();
      } else {
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
  
  // Window resize
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
 * Load and render Instagram feed in a carousel
 * @param {string} containerSelector - CSS selector for Instagram feed container
 * @param {number} maxPosts - Maximum number of posts to display (0 = all)
 */
export async function loadInstagramFeed(containerSelector = '.instagram-feed-grid', maxPosts = 0) {
  const container = $(containerSelector);
  if (!container) {
    return;
  }

  try {
    // Show loading state
    container.innerHTML = '<div class="instagram-loading"><i class="fab fa-instagram"></i><p>Loading Instagram feed...</p></div>';
    
    let posts = [];
    
    // First, try to load from JSON file (build-time fetched posts)
    try {
      const response = await fetch(getResourcePath('/data/instagram-posts.json'));
      
      if (response.ok) {
        const data = await response.json();
        if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
          // Transform posts from JSON file
          posts = data.posts.map(post => ({
            html: '',
            thumbnailUrl: post.thumbnailUrl || post.imageUrl || '',
            title: post.caption || '',
            authorName: '',
            authorUrl: '',
            postUrl: post.postUrl || '',
            width: 640,
            height: 640,
            needsFetch: !(post.thumbnailUrl || post.imageUrl), // Mark if needs oEmbed fetch
          }));
          
          console.log(`✅ Loaded ${posts.length} posts from instagram-posts.json`);
          
          // Check for posts missing images
          const postsNeedingImages = posts.filter(p => !p.thumbnailUrl && !p.imageUrl);
          if (postsNeedingImages.length > 0) {
            console.warn(`⚠️  ${postsNeedingImages.length} posts are missing images. Run "npm run fetch-instagram" to fetch images.`);
            // Filter out posts without images to avoid showing placeholders
            posts = posts.filter(p => p.thumbnailUrl || p.imageUrl);
          }
        } else {
          console.log('📝 JSON file exists but has no posts');
        }
      } else {
        console.log('📝 JSON file not found, trying config...');
      }
    } catch (error) {
      console.log('📝 JSON file not accessible, trying config...', error.message);
    }
    
    // Fallback: Show message if no posts found
    if (posts.length === 0) {
      const postUrls = appConfig.instagram?.postUrls || [];
      
      if (postUrls.length === 0) {
        console.warn('No Instagram posts found. Run: npm run fetch-instagram');
        container.innerHTML = '<div class="instagram-error"><p>No Instagram posts configured. Please run the fetch script or add post URLs to config.</p></div>';
        return;
      } else {
        console.warn('Instagram posts found in config but JSON file is missing or empty.');
        console.warn('Run: npm run fetch-instagram to fetch posts at build time.');
        container.innerHTML = '<div class="instagram-error"><p>Instagram posts need to be fetched at build time. Please run: <code>npm run fetch-instagram</code></p></div>';
        return;
      }
    }
    
    if (maxPosts > 0) {
      posts = posts.slice(0, maxPosts);
    }
    
    if (posts.length === 0) {
      container.innerHTML = '<div class="instagram-error"><p>Unable to load Instagram feed at this time.</p></div>';
      return;
    }
    
    // Create carousel structure
    container.innerHTML = `
      <div class="instagram-carousel">
        <div class="instagram-track">
          ${posts.map((post, index) => createInstagramCard(post, index)).join('')}
        </div>
      </div>
    `;
    
    const carouselContainer = container.querySelector('.instagram-carousel');
    const track = container.querySelector('.instagram-track');
    
    // Initialize carousel after images load
    setTimeout(() => {
      initCarousel(carouselContainer, track, posts);
    }, 100);
    
  } catch (error) {
    console.error('Error loading Instagram feed:', error);
    container.innerHTML = '<div class="instagram-error"><p>Unable to load Instagram feed at this time.</p></div>';
  }
}

/**
 * Initialize Instagram feed on page load
 */
export function initInstagramFeed() {
  const init = () => {
    setTimeout(() => {
      loadInstagramFeed('.instagram-feed-grid', 0); // 0 = load all posts
    }, 100);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

