/**
 * Download Instagram Images Script
 * 
 * Downloads images from existing URLs in instagram-posts.json
 * and updates the JSON file with local paths
 * 
 * Usage:
 *   node scripts/download-instagram-images.js
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, createWriteStream, unlinkSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JSON_FILE = resolve(__dirname, '../data/instagram-posts.json');
const IMAGES_DIR = resolve(__dirname, '../assets/images/instagram');

/**
 * Get file extension from URL
 */
function getImageExtension(url) {
  const urlMatch = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }
  return 'jpg';
}

/**
 * Generate filename for Instagram post image
 */
function generateImageFilename(postUrl, imageUrl, index) {
  const postIdMatch = postUrl.match(/\/(p|reel)\/([^\/]+)/);
  const postId = postIdMatch ? postIdMatch[2] : `post-${index}`;
  const ext = getImageExtension(imageUrl);
  return `instagram-${postId}.${ext}`;
}

/**
 * Download an image from URL
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
      console.log(`   ⏭️  Already exists: ${filename}`);
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
          file.close();
          return downloadImage(response.headers.location, filename).then(resolve).catch(reject);
        }
        
        if (response.statusCode !== 200) {
          file.close();
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(`assets/images/instagram/${filename}`);
        });
      }).on('error', (err) => {
        file.close();
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        } catch (deleteError) {
          // Ignore
        }
        reject(err);
      });
    });
  } catch (error) {
    console.warn(`   ⚠️  Failed to download ${filename}: ${error.message}`);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Downloading Instagram Images...\n');

  if (!existsSync(JSON_FILE)) {
    console.error('❌ instagram-posts.json not found. Run: npm run fetch-instagram');
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(JSON_FILE, 'utf-8'));
  
  if (!data.posts || data.posts.length === 0) {
    console.warn('⚠️  No posts found in JSON file');
    process.exit(0);
  }

  console.log(`📥 Found ${data.posts.length} posts to process\n`);

  // Download images for each post
  for (let i = 0; i < data.posts.length; i++) {
    const post = data.posts[i];
    const imageUrl = post.imageUrl || post.thumbnailUrl || '';
    
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.log(`⏭️  Post ${i + 1}/${data.posts.length}: No image URL (skipping)`);
      continue;
    }

    // Skip if already using local path
    if (imageUrl.startsWith('assets/')) {
      console.log(`⏭️  Post ${i + 1}/${data.posts.length}: Already using local image`);
      continue;
    }

    const filename = generateImageFilename(post.postUrl, imageUrl, i);
    console.log(`📥 Post ${i + 1}/${data.posts.length}: ${filename}`);
    
    try {
      const localPath = await downloadImage(imageUrl, filename);
      if (localPath) {
        post.imageUrl = localPath;
        post.thumbnailUrl = localPath;
        console.log(`   ✅ Downloaded: ${localPath}\n`);
      } else {
        console.log(`   ⚠️  Download failed, keeping original URL\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Small delay between downloads
    if (i < data.posts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Save updated JSON
  writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Updated ${JSON_FILE}`);
  console.log(`\n💡 Run: npm run sync-instagram-to-public to sync to public folder`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

