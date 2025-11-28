/**
 * Find Place ID Script
 * 
 * This script helps you find the correct Google Place ID for your business
 * by searching for it using the Google Places API.
 * 
 * Usage:
 *   node scripts/find-place-id.js "Business Name" "Location"
 * 
 * Example:
 *   node scripts/find-place-id.js "Logia Genesis" "Gauteng, South Africa"
 * 
 * Environment Variables:
 *   GOOGLE_PLACES_API_KEY - Your Google Places API key
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Search for a place and return Place IDs
 * @param {string} query - Business name or search query
 * @param {string} apiKey - Google Places API key
 * @returns {Promise<Array>} Array of place results
 */
async function searchPlace(query, apiKey) {
  if (!apiKey) {
    console.error('❌ GOOGLE_PLACES_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Google Places API Text Search endpoint (Legacy)
    const encodedQuery = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${apiKey}`;
    
    console.log(`\n🔍 Searching for: "${query}"`);
    console.log(`   API Key: ${apiKey.substring(0, 15)}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (!data.results || data.results.length === 0) {
      console.log('   ❌ No results found');
      return [];
    }

    return data.results;
  } catch (error) {
    console.error('❌ Error searching for place:', error.message);
    return [];
  }
}

/**
 * Get place details to verify it has reviews
 * @param {string} placeId - Google Place ID
 * @param {string} apiKey - Google Places API key
 * @returns {Promise<Object|null>} Place details or null
 */
async function getPlaceDetails(placeId, apiKey) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status !== 'OK' || !data.result) return null;
    
    return data.result;
  } catch (error) {
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/find-place-id.js "Business Name" [Location]');
    console.log('\nExample:');
    console.log('  node scripts/find-place-id.js "Logia Genesis" "Gauteng, South Africa"');
    console.log('\nOr set environment variable:');
    console.log('  GOOGLE_PLACES_API_KEY=your-key node scripts/find-place-id.js "Logia Genesis"');
    process.exit(1);
  }

  const query = args.join(' ');
  
  console.log('🔍 Google Place ID Finder\n');
  console.log('This script will help you find the correct Place ID for your business.\n');

  const results = await searchPlace(query, API_KEY);

  if (results.length === 0) {
    console.log('\n💡 Tips:');
    console.log('   - Try including your city/region in the search');
    console.log('   - Make sure your business is listed on Google Maps');
    console.log('   - Check the spelling of your business name');
    process.exit(0);
  }

  console.log(`\n✅ Found ${results.length} result(s):\n`);

  // Display results and check for reviews
  for (let i = 0; i < results.length; i++) {
    const place = results[i];
    const details = await getPlaceDetails(place.place_id, API_KEY);
    const hasReviews = details?.reviews && details.reviews.length > 0;
    const reviewCount = details?.reviews?.length || 0;
    const rating = details?.rating || place.rating || 'N/A';

    console.log(`📍 Result ${i + 1}:`);
    console.log(`   Name: ${place.name}`);
    console.log(`   Address: ${place.formatted_address || place.vicinity || 'N/A'}`);
    console.log(`   Place ID: ${place.place_id}`);
    console.log(`   Rating: ${rating} ⭐`);
    console.log(`   Reviews: ${hasReviews ? `✅ ${reviewCount} reviews available` : '❌ No reviews found'}`);
    console.log(`   Types: ${place.types?.slice(0, 3).join(', ') || 'N/A'}`);
    console.log('');
  }

  // Highlight the best match
  const bestMatch = results.find(r => {
    const nameLower = r.name.toLowerCase();
    const queryLower = query.toLowerCase();
    return nameLower.includes(queryLower) || queryLower.includes(nameLower);
  }) || results[0];

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 RECOMMENDED Place ID:');
  console.log(`   ${bestMatch.place_id}`);
  console.log(`\n   Business: ${bestMatch.name}`);
  console.log(`   Address: ${bestMatch.formatted_address || bestMatch.vicinity}`);
  console.log('\n📋 To use this Place ID, add it to your .env file:');
  console.log(`   GOOGLE_PLACE_ID=${bestMatch.place_id}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

