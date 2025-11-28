/**
 * Sync Instagram Posts to Public Directory
 * 
 * Copies instagram-posts.json from data/ to public/data/ for build
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_FILE = resolve(__dirname, '../data/instagram-posts.json');
const DEST_DIR = resolve(__dirname, '../public/data');
const DEST_FILE = resolve(DEST_DIR, 'instagram-posts.json');

try {
  if (!existsSync(SOURCE_FILE)) {
    console.log('⚠️  instagram-posts.json not found, skipping sync');
    process.exit(0);
  }

  // Ensure destination directory exists
  if (!existsSync(DEST_DIR)) {
    mkdirSync(DEST_DIR, { recursive: true });
  }

  // Copy file
  copyFileSync(SOURCE_FILE, DEST_FILE);
  console.log('✅ Synced instagram-posts.json to public/data/');
} catch (error) {
  console.error('❌ Error syncing Instagram posts:', error.message);
  process.exit(1);
}

