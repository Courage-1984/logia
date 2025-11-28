/**
 * Fetch Google Reviews Script
 * 
 * This script fetches Google Reviews using the Google Places API (Legacy/Old)
 * and saves them to a JSON file for use in the static site.
 * 
 * Usage:
 *   node scripts/fetch-google-reviews.js
 * 
 * Environment Variables:
 *   GOOGLE_PLACES_API_KEY - Your Google Places API key
 *   GOOGLE_PLACE_ID - Your Google Business Place ID
 * 
 * Fallback:
 *   If API key is not set, the script will use manual-reviews.json
 *   as a fallback (you can manually update this file with reviews)
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;
const OUTPUT_FILE = resolve(__dirname, '../data/google-reviews.json');
const MANUAL_FALLBACK = resolve(__dirname, '../data/manual-reviews.json');

/**
 * Fetch reviews from Google Places API (Legacy/Old)
 * @param {string} placeId - Google Place ID
 * @param {string} apiKey - Google Places API key
 * @returns {Promise<Array>} Array of review objects
 */
async function fetchGoogleReviews(placeId, apiKey) {
  if (!placeId || !apiKey) {
    console.warn('⚠️  Google Places API credentials not provided');
    return null;
  }

  try {
    // Google Places API (Legacy/Old) endpoint
    // Note: Old API may not support fields parameter, so we'll try without it first
    // This returns all place details including reviews
    let url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    
    console.log(`   Place ID: ${placeId}`);
    console.log(`   API Key: ${apiKey.substring(0, 15)}...`);
    console.log(`   URL: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   HTTP Error: ${response.status}`);
      console.error(`   Response: ${errorText.substring(0, 200)}`);
      throw new Error(`Google Places API HTTP error: ${response.status} - ${errorText}`);
    }

    let data = await response.json();
    
    // Log the response status for debugging
    if (data.status) {
      console.log(`   API Status: ${data.status}`);
    }
    
    // Check for API errors in response
    if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      const errorMsg = data.error_message || 'Unknown error';
      console.error(`   API Error: ${data.status} - ${errorMsg}`);
      throw new Error(`Google Places API error: ${data.status} - ${errorMsg}`);
    }

    // Check if result exists
    if (!data.result) {
      console.warn('   ⚠️  No result object in API response');
      if (data.status === 'ZERO_RESULTS') {
        console.log('   No place found with this Place ID');
      } else {
        console.log('   Response keys:', Object.keys(data));
        console.log('   Full response:', JSON.stringify(data, null, 2).substring(0, 1000));
      }
      return [];
    }

    // Check if reviews exist
    if (!data.result.reviews || !Array.isArray(data.result.reviews)) {
      console.warn('   ⚠️  No reviews array found in result');
      console.log('   Available fields in result:', Object.keys(data.result));
      if (data.result.reviews === undefined) {
        console.log('   Note: This place may not have any reviews, or reviews are not accessible');
      }
      return [];
    }

    console.log(`   ✅ Found ${data.result.reviews.length} reviews in API response`);

    // Transform Google API response to our format
    // Old API returns reviews in result.reviews array
    const reviews = data.result.reviews.map((review, index) => {
      const reviewId = review.author_url?.split('/').pop() || 
                      review.author_url?.split('=').pop() || 
                      `review-${Date.now()}-${index}`;
      
      const timestamp = review.time ? new Date(review.time * 1000).toISOString() : new Date().toISOString();
      
      return {
        id: reviewId,
        author: review.author_name || 'Anonymous',
        rating: review.rating || 5,
        text: review.text || '',
        time: timestamp,
        authorPhoto: review.profile_photo_url || null,
        relativeTime: review.relative_time_description || formatRelativeTime(timestamp),
      };
    });

    return reviews;
  } catch (error) {
    console.error('❌ Error fetching Google Reviews:', error.message);
    if (error.stack) {
      console.error('   Stack trace:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    return null;
  }
}

/**
 * Format timestamp to relative time (e.g., "2 weeks ago")
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Relative time string
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Load manual reviews from fallback file
 * @returns {Array|null} Array of reviews or null
 */
function loadManualReviews() {
  if (existsSync(MANUAL_FALLBACK)) {
    try {
      const content = readFileSync(MANUAL_FALLBACK, 'utf-8');
      const data = JSON.parse(content);
      console.log('📝 Using manual reviews from manual-reviews.json');
      return data.reviews || [];
    } catch (error) {
      console.error('❌ Error reading manual-reviews.json:', error.message);
      return null;
    }
  }
  return null;
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Fetching Google Reviews...\n');

  // Ensure data directory exists
  const dataDir = resolve(__dirname, '../data');
  if (!existsSync(dataDir)) {
    const { mkdirSync } = await import('fs');
    mkdirSync(dataDir, { recursive: true });
  }

  let reviews = null;

  // Try to fetch from Google Places API
  if (API_KEY && PLACE_ID) {
    console.log('📡 Fetching from Google Places API...');
    console.log(`   Place ID: ${PLACE_ID}`);
    console.log(`   API Key: ${API_KEY.substring(0, 15)}...`);
    reviews = await fetchGoogleReviews(PLACE_ID, API_KEY);
    
    if (reviews && reviews.length > 0) {
      console.log(`✅ Fetched ${reviews.length} reviews from Google Places API`);
    } else if (reviews !== null) {
      console.warn('⚠️  API returned empty reviews array');
    }
  } else {
    console.log('⚠️  Google Places API credentials not found');
    if (!API_KEY) console.log('   Missing: GOOGLE_PLACES_API_KEY');
    if (!PLACE_ID) console.log('   Missing: GOOGLE_PLACE_ID');
    console.log('   Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID environment variables');
  }

  // Fallback to manual reviews if API fetch failed
  if (!reviews || reviews.length === 0) {
    console.log('\n📝 Attempting to load manual reviews...');
    reviews = loadManualReviews();
    
    if (reviews && reviews.length > 0) {
      console.log(`✅ Loaded ${reviews.length} reviews from manual-reviews.json`);
    }
  }

  // If still no reviews, create empty structure
  if (!reviews || reviews.length === 0) {
    console.warn('\n⚠️  No reviews found. Creating empty reviews file.');
    console.log('   You can either:');
    console.log('   1. Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID environment variables');
    console.log('   2. Create data/manual-reviews.json with your reviews');
    reviews = [];
  }

  // Save reviews to output file
  const output = {
    lastUpdated: new Date().toISOString(),
    source: API_KEY && PLACE_ID && reviews && reviews.length > 0 ? 'google-places-api' : 'manual',
    reviews: reviews,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Reviews saved to ${OUTPUT_FILE}`);
  console.log(`   Total reviews: ${reviews.length}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

