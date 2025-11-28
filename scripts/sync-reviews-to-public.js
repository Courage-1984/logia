/**
 * Sync Reviews to Public Directory
 * 
 * Copies google-reviews.json from data/ to public/data/ for dev server access
 */

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceFile = resolve(__dirname, '../data/google-reviews.json');
const publicDataDir = resolve(__dirname, '../public/data');
const destFile = resolve(publicDataDir, 'google-reviews.json');

if (existsSync(sourceFile)) {
  if (!existsSync(publicDataDir)) {
    mkdirSync(publicDataDir, { recursive: true });
  }
  copyFileSync(sourceFile, destFile);
  console.log('✓ Synced reviews to public/data for dev server');
} else {
  console.warn('⚠️  Source file not found:', sourceFile);
}

