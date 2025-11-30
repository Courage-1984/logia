/**
 * Fetch Instagram Posts Script
 * 
 * This script fetches Instagram posts using Instagram Graph API
 * and saves them to a JSON file for use in the static site.
 * 
 * Usage:
 *   node scripts/fetch-instagram-posts.js
 * 
 * Environment Variables:
 *   INSTAGRAM_ACCESS_TOKEN - Your Instagram Graph API access token
 *   INSTAGRAM_USER_ID - Your Instagram Business Account User ID (optional, will be fetched if not provided)
 * 
 * Alternative: Manual Post URLs
 *   If API credentials are not set, you can manually add post URLs to config/app.config.js
 *   in the instagram.postUrls array
 * 
 * Setup Instructions:
 *   1. Create a Facebook App at https://developers.facebook.com/
 *   2. Add Instagram Basic Display product
 *   3. Get your access token
 *   4. Set INSTAGRAM_ACCESS_TOKEN environment variable
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync, createWriteStream, unlinkSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;
const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || 'logia_store_'; // Default from footer
const USE_BUSINESS_DISCOVERY = process.env.USE_BUSINESS_DISCOVERY === 'true'; // Enable Business Discovery API
const OUTPUT_FILE = resolve(__dirname, '../data/instagram-posts.json');
const MAX_POSTS = 12; // Maximum number of posts to fetch
const IMAGES_DIR = resolve(__dirname, '../assets/images/instagram');

/**
 * Get Instagram Business Account ID from Facebook Page using Page access token
 * @param {string} pageAccessToken - Facebook Page access token
 * @param {string} pageId - Facebook Page ID (optional, will try to find if not provided)
 * @returns {Promise<string|null>} Instagram Business Account ID or null
 */
async function getInstagramBusinessAccountFromPage(pageAccessToken, pageId = null) {
  try {
    let instagramAccountId = null;
    let pageToUse = pageId;

    // If page ID not provided, get pages for the user
    if (!pageToUse) {
      console.log('   Getting Facebook Pages...');
      const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${encodeURIComponent(pageAccessToken)}`;
      const pagesResponse = await fetch(pagesUrl);

      if (!pagesResponse.ok) {
        const errorData = await pagesResponse.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `HTTP ${pagesResponse.status}`;
        console.error(`   ❌ Error getting Pages: ${errorMsg}`);
        console.error('   💡 The token may not have permission to access /me/accounts');
        console.error('   💡 Try setting FACEBOOK_PAGE_ID in your .env file instead');

        // Try to get user info to debug
        try {
          const userUrl = `https://graph.facebook.com/v18.0/me?access_token=${encodeURIComponent(pageAccessToken)}`;
          const userResponse = await fetch(userUrl);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log(`   ✅ Token is valid for user: ${userData.name || userData.id}`);
          }
        } catch (e) {
          // Ignore
        }
      } else {
        const pagesData = await pagesResponse.json();
        if (pagesData.data && pagesData.data.length > 0) {
          // Use the first page
          pageToUse = pagesData.data[0].id;
          console.log(`   ✅ Found Page ID: ${pageToUse}`);
        } else {
          console.error('   ❌ No Pages found for this token');
        }
      }
    }

    if (!pageToUse) {
      console.error('   Could not determine Facebook Page ID');
      return null;
    }

    // Get Instagram Business Account ID from the Page
    console.log(`   Fetching Instagram Business Account from Page ${pageToUse}...`);
    const pageUrl = `https://graph.facebook.com/v18.0/${pageToUse}?fields=instagram_business_account&access_token=${encodeURIComponent(pageAccessToken)}`;
    const response = await fetch(pageUrl);

    if (!response.ok) {
      const error = await response.json();
      console.error(`   Error fetching Instagram Business Account: ${error.error?.message || response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.instagram_business_account && data.instagram_business_account.id) {
      instagramAccountId = data.instagram_business_account.id;
      console.log(`   ✅ Found Instagram Business Account ID: ${instagramAccountId}`);
      return instagramAccountId;
    }

    console.error('   No Instagram Business Account linked to this Page');
    console.error('   💡 Make sure your Instagram account is linked to the Facebook Page');
    return null;
  } catch (error) {
    console.error('   Error:', error.message);
    return null;
  }
}

/**
 * Get Instagram User ID from username using Graph API
 * @param {string} accessToken - Instagram Graph API access token
 * @param {string} username - Instagram username (without @)
 * @returns {Promise<string|null>} User ID or null
 */
async function getUserIdFromUsername(accessToken, username) {
  try {
    const url = `https://graph.instagram.com/v18.0/${username}?fields=id&access_token=${encodeURIComponent(accessToken)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      console.error(`   Error fetching user ID: ${error.error?.message || response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error('   Error:', error.message);
    return null;
  }
}

/**
 * Fetch Instagram posts using Business Discovery API (by username)
 * Uses Facebook Graph API with business_discovery endpoint
 * See: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/business-discovery
 * @param {string} accessToken - Instagram User Access Token
 * @param {string} appUserId - Your app user's Instagram User ID
 * @param {string} targetUsername - Target Instagram username (without @)
 * @returns {Promise<Array>} Array of post objects
 */
async function fetchInstagramPostsViaBusinessDiscovery(accessToken, appUserId, targetUsername) {
  if (!accessToken || !appUserId || !targetUsername) {
    console.warn('⚠️  Business Discovery API requires access token, app user ID, and target username');
    return null;
  }

  try {
    // Business Discovery API endpoint - query by username
    // Format: /{APP_USER_IG_USER_ID}?fields=business_discovery.username(TARGET_USERNAME){media{...}}
    const url = `https://graph.facebook.com/v18.0/${appUserId}?fields=business_discovery.username(${targetUsername}){media{id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count}}&access_token=${encodeURIComponent(accessToken)}`;

    console.log(`📡 Fetching Instagram posts via Business Discovery API...`);
    console.log(`   App User ID: ${appUserId}`);
    console.log(`   Target Username: ${targetUsername}`);
    console.log(`   Max Posts: ${MAX_POSTS}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
      console.error(`   ❌ API Error: ${errorMsg}`);

      if (errorData.error?.code === 190) {
        console.error('   ⚠️  Invalid access token. Business Discovery requires Instagram User Access Token.');
      } else if (errorData.error?.code === 100) {
        console.error('   ⚠️  Invalid app user ID or username.');
      } else if (errorData.error?.code === 100 && errorMsg.includes('business_discovery')) {
        console.error('   ⚠️  Business Discovery API error. Make sure:');
        console.error('      - Your app has Instagram product added');
        console.error('      - You have an Instagram User Access Token (not Page token)');
        console.error('      - The target account is a Business or Creator account');
      }

      throw new Error(`Business Discovery API error: ${errorMsg}`);
    }

    const data = await response.json();

    if (!data.business_discovery || !data.business_discovery.media || !data.business_discovery.media.data) {
      console.warn('   ⚠️  No posts found in API response');
      return [];
    }

    const mediaData = data.business_discovery.media.data;
    console.log(`   ✅ Found ${mediaData.length} posts in API response`);

    // Limit to MAX_POSTS
    const limitedPosts = mediaData.slice(0, MAX_POSTS);

    // Transform Instagram API response to our format and download images
    const posts = [];
    for (let i = 0; i < limitedPosts.length; i++) {
      const post = limitedPosts[i];
      const imageUrl = post.media_url || post.thumbnail_url || '';
      const postUrl = post.permalink || `https://www.instagram.com/p/${post.id}/`;

      let localImageUrl = imageUrl;
      let localThumbnailUrl = post.thumbnail_url || post.media_url || '';

      // Download image if available
      if (imageUrl) {
        const filename = generateImageFilename(postUrl, imageUrl);
        console.log(`   📥 Downloading image ${i + 1}/${limitedPosts.length}: ${filename}`);

        try {
          const localPath = await downloadImage(imageUrl, filename);
          if (localPath) {
            localImageUrl = localPath;
            localThumbnailUrl = localPath;
            console.log(`   ✅ Downloaded: ${localPath}`);
          }
        } catch (error) {
          console.warn(`   ⚠️  Image download failed, using original URL: ${error.message}`);
        }
      }

      posts.push({
        id: post.id,
        postUrl: postUrl,
        caption: post.caption || '',
        imageUrl: localImageUrl,
        thumbnailUrl: localThumbnailUrl,
        mediaType: post.media_type || 'IMAGE', // IMAGE, VIDEO, CAROUSEL_ALBUM
        timestamp: post.timestamp || new Date().toISOString(),
        likeCount: post.like_count || 0,
        commentCount: post.comments_count || 0,
      });

      // Add small delay between downloads
      if (i < limitedPosts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return posts;
  } catch (error) {
    console.error('❌ Error fetching Instagram posts via Business Discovery:', error.message);
    if (error.stack) {
      console.error('   Stack trace:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    return null;
  }
}

/**
 * Fetch Instagram posts using Graph API
 * @param {string} accessToken - Instagram Graph API access token
 * @param {string} userId - Instagram User ID
 * @returns {Promise<Array>} Array of post objects
 */
async function fetchInstagramPosts(accessToken, userId, isPageToken = false) {
  if (!accessToken || !userId) {
    console.warn('⚠️  Instagram API credentials not provided');
    return null;
  }

  try {
    // For Instagram Business accounts, we can use either:
    // 1. Instagram User Access Token directly with Instagram User ID
    // 2. Facebook Page Access Token with Instagram Business Account ID
    // Both work with the same endpoint

    // Instagram Graph API endpoint to get user's media
    // Fields: id, caption, media_type, media_url, permalink, thumbnail_url, timestamp
    const url = `https://graph.instagram.com/v18.0/${userId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=${MAX_POSTS}&access_token=${encodeURIComponent(accessToken)}`;

    console.log(`📡 Fetching Instagram posts from Graph API...`);
    console.log(`   Account ID: ${userId}`);
    console.log(`   Max Posts: ${MAX_POSTS}`);
    if (isPageToken) {
      console.log(`   Using Facebook Page access token`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
      console.error(`   ❌ API Error: ${errorMsg}`);

      if (errorData.error?.code === 190) {
        console.error('   ⚠️  Invalid access token. Please check your INSTAGRAM_ACCESS_TOKEN.');
      } else if (errorData.error?.code === 100) {
        console.error('   ⚠️  Invalid user ID. Please check your INSTAGRAM_USER_ID.');
      }

      throw new Error(`Instagram Graph API error: ${errorMsg}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('   ⚠️  No posts found in API response');
      return [];
    }

    console.log(`   ✅ Found ${data.data.length} posts in API response`);

    // Transform Instagram API response to our format and download images
    const posts = [];
    for (let i = 0; i < data.data.length; i++) {
      const post = data.data[i];
      const imageUrl = post.media_url || post.thumbnail_url || '';
      const postUrl = post.permalink || `https://www.instagram.com/p/${post.id}/`;

      let localImageUrl = imageUrl;
      let localThumbnailUrl = post.thumbnail_url || post.media_url || '';

      // Download image if available
      if (imageUrl) {
        const filename = generateImageFilename(postUrl, imageUrl);
        console.log(`   📥 Downloading image ${i + 1}/${data.data.length}: ${filename}`);

        try {
          const localPath = await downloadImage(imageUrl, filename);
          if (localPath) {
            localImageUrl = localPath;
            localThumbnailUrl = localPath;
            console.log(`   ✅ Downloaded: ${localPath}`);
          }
        } catch (error) {
          console.warn(`   ⚠️  Image download failed, using original URL: ${error.message}`);
        }
      }

      posts.push({
        id: post.id,
        postUrl: postUrl,
        caption: post.caption || '',
        imageUrl: localImageUrl,
        thumbnailUrl: localThumbnailUrl,
        mediaType: post.media_type || 'IMAGE', // IMAGE, VIDEO, CAROUSEL_ALBUM
        timestamp: post.timestamp || new Date().toISOString(),
      });

      // Add small delay between downloads
      if (i < data.data.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return posts;
  } catch (error) {
    console.error('❌ Error fetching Instagram posts:', error.message);
    if (error.stack) {
      console.error('   Stack trace:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
    return null;
  }
}

/**
 * Download an image from URL and save it locally
 * @param {string} imageUrl - Image URL to download
 * @param {string} filename - Filename to save as
 * @returns {Promise<string|null>} Local path or null if failed
 */
async function downloadImage(imageUrl, filename) {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return null;
  }

  try {
    // Ensure images directory exists
    if (!existsSync(IMAGES_DIR)) {
      mkdirSync(IMAGES_DIR, { recursive: true });
    }

    const filePath = join(IMAGES_DIR, filename);

    // Skip if already downloaded
    if (existsSync(filePath)) {
      return `assets/images/instagram/${filename}`;
    }

    return new Promise((resolve, reject) => {
      const protocol = imageUrl.startsWith('https') ? https : http;
      const file = createWriteStream(filePath);

      protocol.get(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.instagram.com/',
        }
      }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirect
          file.close();
          return downloadImage(response.headers.location, filename).then(resolve).catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(`assets/images/instagram/${filename}`);
        });
      }).on('error', (err) => {
        file.close();
        // Try to delete partial file if it exists
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        } catch (deleteError) {
          // Ignore delete errors
        }
        reject(err);
      });
    });
  } catch (error) {
    console.warn(`   ⚠️  Failed to download image ${filename}: ${error.message}`);
    return null;
  }
}

/**
 * Get file extension from URL or content type
 * @param {string} url - Image URL
 * @returns {string} File extension
 */
function getImageExtension(url) {
  // Try to get extension from URL
  const urlMatch = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }
  // Default to jpg
  return 'jpg';
}

/**
 * Generate filename for Instagram post image
 * @param {string} postUrl - Instagram post URL
 * @param {string} imageUrl - Image URL
 * @returns {string} Filename
 */
function generateImageFilename(postUrl, imageUrl) {
  // Extract post ID from URL
  const postIdMatch = postUrl.match(/\/(p|reel)\/([^\/]+)/);
  const postId = postIdMatch ? postIdMatch[2] : Date.now().toString();
  const ext = getImageExtension(imageUrl);
  return `instagram-${postId}.${ext}`;
}

/**
 * Fetch Instagram post data using oEmbed API (for manual URLs)
 * @param {string} postUrl - Instagram post URL
 * @returns {Promise<Object|null>} Post data or null if failed
 */
async function fetchPostViaOEmbed(postUrl) {
  try {
    // Clean up URL - remove trailing slashes and whitespace
    const cleanUrl = postUrl.trim().replace(/\/$/, '');

    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}&omitscript=true`;

    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      // Check if response is HTML (error page)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error(`Instagram returned HTML instead of JSON (likely blocked or rate limited)`);
      }
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!data.thumbnail_url) {
      throw new Error('No thumbnail_url in response');
    }

    return {
      thumbnailUrl: data.thumbnail_url || '',
      imageUrl: data.thumbnail_url || '',
      caption: data.title || '',
    };
  } catch (error) {
    console.warn(`   ⚠️  Failed to fetch image for ${postUrl}: ${error.message}`);
    return null;
  }
}

/**
 * Load manual posts from config file and fetch their images
 * @returns {Promise<Array|null>} Array of posts or null
 */
async function loadManualPosts() {
  try {
    const configPath = resolve(__dirname, '../config/app.config.js');
    if (!existsSync(configPath)) {
      return null;
    }

    const content = readFileSync(configPath, 'utf-8');

    // First, check for manualPosts array (with image URLs already provided)
    const manualPostsMatch = content.match(/manualPosts:\s*\[([\s\S]*?)\]/);
    if (manualPostsMatch) {
      console.log('📝 Found manualPosts in config (with image URLs)');
      // Try to parse manual posts (simplified - expects object format)
      // For now, we'll extract URLs and try to fetch images
      // This is a simplified parser - for complex configs, consider using a proper JS parser
    }

    // Extract postUrls from config - match quoted strings in array
    const postUrlsMatch = content.match(/postUrls:\s*\[([\s\S]*?)\]/);

    if (postUrlsMatch) {
      // Extract all quoted strings (handles single and double quotes)
      const urlPattern = /['"](https?:\/\/[^'"]+)['"]/g;
      const urls = [];
      let match;

      while ((match = urlPattern.exec(postUrlsMatch[1])) !== null) {
        urls.push(match[1]);
      }

      // Filter to only valid Instagram URLs (exclude example URLs)
      const validUrls = urls.filter(url =>
        url &&
        url.includes('instagram.com') &&
        !url.includes('ABC123xyz') // Exclude example URLs
      );

      if (validUrls.length > 0) {
        console.log(`📝 Found ${validUrls.length} manual post URLs in config`);

        // First, check for existing images in assets/images/instagram
        console.log(`🔍 Checking for existing images in assets/images/instagram/...`);

        const posts = [];
        for (let i = 0; i < validUrls.length; i++) {
          const url = validUrls[i];
          console.log(`   Processing ${i + 1}/${validUrls.length}: ${url}`);

          // Extract post ID from URL to check for existing image
          const postIdMatch = url.match(/\/(p|reel)\/([^\/\?]+)/);
          const postId = postIdMatch ? postIdMatch[2] : null;

          let localImageUrl = '';
          let localThumbnailUrl = '';
          let caption = '';

          // Check if image already exists locally
          if (postId) {
            const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp'];
            let foundImage = false;

            for (const ext of possibleExtensions) {
              const filename = `instagram-${postId}.${ext}`;
              const filePath = join(IMAGES_DIR, filename);

              if (existsSync(filePath)) {
                localImageUrl = `assets/images/instagram/${filename}`;
                localThumbnailUrl = `assets/images/instagram/${filename}`;
                console.log(`   ✅ Found existing image: ${filename}`);
                foundImage = true;
                break;
              }
            }

            // If no existing image found, try to fetch via oEmbed
            if (!foundImage) {
              console.log(`   📡 Image not found locally, attempting to fetch via oEmbed API...`);
              const oembedData = await fetchPostViaOEmbed(url);

              if (oembedData?.caption) {
                caption = oembedData.caption;
              }

              // Download image if we got a URL
              if (oembedData?.imageUrl || oembedData?.thumbnailUrl) {
                const imageUrl = oembedData?.imageUrl || oembedData?.thumbnailUrl;
                const filename = generateImageFilename(url, imageUrl);
                console.log(`   📥 Downloading image: ${filename}`);

                try {
                  const localPath = await downloadImage(imageUrl, filename);
                  if (localPath) {
                    localImageUrl = localPath;
                    localThumbnailUrl = localPath;
                    console.log(`   ✅ Downloaded: ${localPath}`);
                  } else {
                    // Fallback to original URL if download fails
                    localImageUrl = imageUrl;
                    localThumbnailUrl = imageUrl;
                  }
                } catch (error) {
                  console.warn(`   ⚠️  Image download failed, using original URL: ${error.message}`);
                  localImageUrl = imageUrl;
                  localThumbnailUrl = imageUrl;
                }
              } else {
                console.warn(`   ⚠️  Could not fetch image for ${url}`);
              }

              // Add delay between requests to avoid rate limiting (except for last request)
              if (i < validUrls.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
              }
            }
          } else {
            console.warn(`   ⚠️  Could not extract post ID from URL: ${url}`);
          }

          posts.push({
            id: `manual-${i}`,
            postUrl: url,
            caption: caption,
            imageUrl: localImageUrl,
            thumbnailUrl: localThumbnailUrl,
            mediaType: 'IMAGE',
            timestamp: new Date().toISOString(),
          });
        }

        const successfulPosts = posts.filter(p => p.thumbnailUrl || p.imageUrl);
        console.log(`   ✅ Successfully fetched images for ${successfulPosts.length}/${posts.length} posts`);

        if (successfulPosts.length < posts.length) {
          console.log(`   ⚠️  Some posts failed to fetch. This may be due to:`);
          console.log(`      - Private posts (cannot fetch images for private posts)`);
          console.log(`      - Invalid URLs`);
          console.log(`      - Instagram API rate limiting`);
        }

        return posts;
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error reading config:', error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Fetching Instagram Posts...\n');

  // Ensure data directory exists
  const dataDir = resolve(__dirname, '../data');
  if (!existsSync(dataDir)) {
    const { mkdirSync } = await import('fs');
    mkdirSync(dataDir, { recursive: true });
  }

  let posts = null;
  let userId = USER_ID;
  const isPageToken = ACCESS_TOKEN && ACCESS_TOKEN.trim().startsWith('EAA');

  // Try Business Discovery API first if enabled and we have the right credentials
  if (ACCESS_TOKEN && (USE_BUSINESS_DISCOVERY || (!isPageToken && userId))) {
    console.log('📡 Attempting to fetch using Business Discovery API (by username)...');

    // For Business Discovery, we need:
    // 1. Instagram User Access Token (not Page token)
    // 2. App User's Instagram User ID (USER_ID in .env)
    // 3. Target username (INSTAGRAM_USERNAME in .env or default)

    if (!isPageToken && userId) {
      try {
        posts = await fetchInstagramPostsViaBusinessDiscovery(
          ACCESS_TOKEN.trim(),
          userId,
          INSTAGRAM_USERNAME
        );

        if (posts && posts.length > 0) {
          console.log(`✅ Fetched ${posts.length} posts via Business Discovery API`);
        } else if (posts !== null) {
          console.warn('⚠️  Business Discovery API returned empty posts array');
          posts = null; // Try fallback methods
        }
      } catch (error) {
        console.warn('⚠️  Business Discovery API failed, trying standard API...');
        console.warn(`   Error: ${error.message}`);
        posts = null; // Try fallback methods
      }
    } else if (isPageToken) {
      console.log('   ⚠️  Business Discovery API requires Instagram User Access Token (not Page token)');
      console.log('   💡 To use Business Discovery API:');
      console.log('      1. Get an Instagram User Access Token with instagram_basic permission');
      console.log('      2. Set it as INSTAGRAM_ACCESS_TOKEN (should NOT start with "EAA")');
      console.log('      3. Set INSTAGRAM_USER_ID to your Instagram Business Account ID');
      console.log('      4. Optionally set INSTAGRAM_USERNAME (default: logia_genesis_inc)');
    } else if (!userId) {
      console.log('   ⚠️  Business Discovery API requires INSTAGRAM_USER_ID (your app user\'s Instagram ID)');
    }
  }

  // Try to fetch from Instagram Graph API (standard method)
  if (!posts && ACCESS_TOKEN) {
    console.log('\n📡 Attempting to fetch from Instagram Graph API...');

    // Check if this is a Facebook Page token (starts with EAA)
    if (isPageToken) {
      console.log('   Detected Facebook Page access token (starts with "EAA")');
      console.log('   Will fetch Instagram Business Account from linked Facebook Page...');

      // Get Instagram Business Account ID from the Facebook Page
      const pageId = process.env.FACEBOOK_PAGE_ID || null; // Optional: can specify Page ID
      const instagramBusinessAccountId = await getInstagramBusinessAccountFromPage(ACCESS_TOKEN.trim(), pageId);

      if (instagramBusinessAccountId) {
        userId = instagramBusinessAccountId;
        console.log(`   ✅ Using Instagram Business Account ID: ${userId}`);
      } else {
        console.error('   ❌ Could not find Instagram Business Account linked to Facebook Page');
        console.error('   💡 Make sure:');
        console.error('      1. Your Instagram account is a Business or Creator account');
        console.error('      2. Your Instagram account is linked to the Facebook Page');
        console.error('      3. You have admin access to the Facebook Page');
        console.error('      4. Or set INSTAGRAM_USER_ID directly in .env file');
      }
    } else {
      // Regular Instagram token flow
      // If USER_ID not provided, try to get it from username
      if (!userId) {
        console.log('   User ID not provided, attempting to fetch from username...');
        // Try to get username from config or use default
        const username = 'logia_genesis_inc'; // Default username from footer
        userId = await getUserIdFromUsername(ACCESS_TOKEN.trim(), username);

        if (userId) {
          console.log(`   ✅ Found User ID: ${userId}`);
        } else {
          console.warn('   ⚠️  Could not fetch User ID. Please set INSTAGRAM_USER_ID environment variable.');
          console.log('   You can find your User ID at: https://developers.facebook.com/tools/explorer/');
        }
      }
    }

    if (userId) {
      posts = await fetchInstagramPosts(ACCESS_TOKEN.trim(), userId, isPageToken);

      if (posts && posts.length > 0) {
        console.log(`✅ Fetched ${posts.length} posts from Instagram Graph API`);
      } else if (posts !== null) {
        console.warn('⚠️  API returned empty posts array');
      }
    } else {
      console.warn('⚠️  Cannot fetch posts without User ID or Instagram Business Account ID');
    }
  } else {
    console.log('⚠️  Instagram access token not found');
    console.log('   Missing: INSTAGRAM_ACCESS_TOKEN');
    console.log('   Set INSTAGRAM_ACCESS_TOKEN environment variable');
    console.log('   See docs/INSTAGRAM_FEED_SETUP.md for setup instructions');
  }

  // Fallback to manual posts from config
  if (!posts || posts.length === 0) {
    console.log('\n📝 Attempting to load manual posts from config...');
    posts = await loadManualPosts();

    if (posts && posts.length > 0) {
      const postsWithImages = posts.filter(p => p.thumbnailUrl || p.imageUrl);
      console.log(`✅ Loaded ${posts.length} posts from config/app.config.js`);
      if (postsWithImages.length < posts.length) {
        console.log(`   ⚠️  ${posts.length - postsWithImages.length} posts missing images (may be private or invalid URLs)`);
      }
    }
  }

  // If still no posts, create empty structure
  if (!posts || posts.length === 0) {
    console.warn('\n⚠️  No posts found. Creating empty posts file.');
    console.log('   You can either:');
    console.log('   1. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID environment variables');
    console.log('   2. Add post URLs to config/app.config.js in instagram.postUrls array');
    console.log('   See docs/INSTAGRAM_FEED_SETUP.md for detailed instructions');
    posts = [];
  }

  // Save posts to output file
  const output = {
    lastUpdated: new Date().toISOString(),
    source: ACCESS_TOKEN && posts && posts.length > 0 ? 'instagram-graph-api' : 'manual',
    posts: posts,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Posts saved to ${OUTPUT_FILE}`);
  console.log(`   Total posts: ${posts.length}`);

  if (posts.length > 0 && posts[0].postUrl) {
    console.log(`   Example post: ${posts[0].postUrl}`);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

