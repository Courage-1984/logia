/**
 * Bundle Size Monitoring Script
 * Tracks JavaScript, CSS, image, and font file sizes over time
 * Compares against budgets and maintains history
 */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, extname } from 'path';

// Budgets in bytes
const BUDGETS = {
  js: {
    total: 500 * 1024, // 500KB total
    individual: 200 * 1024, // 200KB per file
  },
  css: {
    total: 200 * 1024, // 200KB total
    individual: 100 * 1024, // 100KB per file
  },
  images: {
    total: 2 * 1024 * 1024, // 2MB total
    individual: 500 * 1024, // 500KB per image
  },
  fonts: {
    total: 300 * 1024, // 300KB total
    individual: 150 * 1024, // 150KB per font
  },
};

// History file path
const HISTORY_DIR = '.bundle-history';
const HISTORY_FILE = join(HISTORY_DIR, 'bundle-sizes.json');

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    return statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

/**
 * Get all files in a directory recursively
 */
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Categorize file by extension
 */
function categorizeFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  
  if (['.js', '.mjs'].includes(ext)) return 'js';
  if (['.css'].includes(ext)) return 'css';
  if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return 'fonts';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'].includes(ext)) return 'images';
  
  return null;
}

/**
 * Analyze bundle sizes in a directory
 */
function analyzeBundles(dir) {
  const files = getAllFiles(dir);
  const categorized = {
    js: [],
    css: [],
    images: [],
    fonts: [],
  };

  files.forEach((filePath) => {
    const category = categorizeFile(filePath);
    if (!category) return;

    const size = getFileSize(filePath);
    const relativePath = filePath.replace(dir + '/', '');

    categorized[category].push({
      path: relativePath,
      size,
    });
  });

  // Calculate totals
  const totals = {
    js: categorized.js.reduce((sum, file) => sum + file.size, 0),
    css: categorized.css.reduce((sum, file) => sum + file.size, 0),
    images: categorized.images.reduce((sum, file) => sum + file.size, 0),
    fonts: categorized.fonts.reduce((sum, file) => sum + file.size, 0),
  };

  return {
    files: categorized,
    totals,
  };
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check budgets and report violations
 */
function checkBudgets(analysis) {
  const violations = [];
  const warnings = [];

  // Check totals
  Object.keys(BUDGETS).forEach((category) => {
    const total = analysis.totals[category];
    const budget = BUDGETS[category].total;

    if (total > budget) {
      violations.push({
        type: 'total',
        category,
        size: total,
        budget,
        message: `${category.toUpperCase()} total size (${formatBytes(total)}) exceeds budget (${formatBytes(budget)})`,
      });
    }
  });

  // Check individual files
  Object.keys(analysis.files).forEach((category) => {
    const budget = BUDGETS[category].individual;

    analysis.files[category].forEach((file) => {
      if (file.size > budget) {
        warnings.push({
          type: 'individual',
          category,
          file: file.path,
          size: file.size,
          budget,
          message: `${file.path} (${formatBytes(file.size)}) exceeds individual budget (${formatBytes(budget)})`,
        });
      }
    });
  });

  return { violations, warnings };
}

/**
 * Load history
 */
function loadHistory() {
  if (!existsSync(HISTORY_FILE)) {
    return [];
  }

  try {
    const content = readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load history:', error.message);
    return [];
  }
}

/**
 * Save history
 */
function saveHistory(history) {
  if (!existsSync(HISTORY_DIR)) {
    mkdirSync(HISTORY_DIR, { recursive: true });
  }

  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Main function
 */
function main() {
  const outDir = process.argv[2] || 'dist';
  const dirPath = resolve(process.cwd(), outDir);

  if (!existsSync(dirPath)) {
    console.error(`Error: Directory ${dirPath} does not exist`);
    console.error('Please run a build first: npm run build');
    process.exit(1);
  }

  console.log(`\n📦 Analyzing bundle sizes in ${outDir}/...\n`);

  // Analyze bundles
  const analysis = analyzeBundles(dirPath);

  // Check budgets
  const { violations, warnings } = checkBudgets(analysis);

  // Display results
  console.log('📊 Bundle Size Summary:\n');
  
  Object.keys(analysis.totals).forEach((category) => {
    const total = analysis.totals[category];
    const budget = BUDGETS[category].total;
    const percentage = ((total / budget) * 100).toFixed(1);
    const status = total > budget ? '❌' : total > budget * 0.8 ? '⚠️' : '✅';
    
    console.log(`  ${status} ${category.toUpperCase()}: ${formatBytes(total)} / ${formatBytes(budget)} (${percentage}%)`);
  });

  // Show largest files
  console.log('\n📁 Largest Files:\n');
  
  const allFiles = [
    ...analysis.files.js.map(f => ({ ...f, category: 'js' })),
    ...analysis.files.css.map(f => ({ ...f, category: 'css' })),
    ...analysis.files.images.map(f => ({ ...f, category: 'images' })),
    ...analysis.files.fonts.map(f => ({ ...f, category: 'fonts' })),
  ];

  allFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.path} (${formatBytes(file.size)}) [${file.category}]`);
    });

  // Display violations
  if (violations.length > 0) {
    console.log('\n❌ Budget Violations:\n');
    violations.forEach((violation) => {
      console.log(`  - ${violation.message}`);
    });
  }

  // Display warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:\n');
    warnings.forEach((warning) => {
      console.log(`  - ${warning.message}`);
    });
  }

  // Load and update history
  const history = loadHistory();
  const entry = {
    timestamp: new Date().toISOString(),
    outDir,
    totals: analysis.totals,
    files: analysis.files,
    violations: violations.length,
    warnings: warnings.length,
  };

  history.push(entry);
  
  // Keep only last 50 entries
  if (history.length > 50) {
    history.shift();
  }

  saveHistory(history);

  // Show comparison with previous build
  if (history.length > 1) {
    const previous = history[history.length - 2];
    console.log('\n📈 Changes from previous build:\n');
    
    Object.keys(analysis.totals).forEach((category) => {
      const current = analysis.totals[category];
      const prev = previous.totals[category] || 0;
      const diff = current - prev;
      const diffPercent = prev > 0 ? ((diff / prev) * 100).toFixed(1) : 0;
      const sign = diff > 0 ? '+' : '';
      
      console.log(`  ${category.toUpperCase()}: ${sign}${formatBytes(diff)} (${sign}${diffPercent}%)`);
    });
  }

  console.log('\n');

  // Exit with error code if violations exist
  if (violations.length > 0) {
    console.error('❌ Build failed: Budget violations detected');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Build completed with warnings');
  } else {
    console.log('✅ All budgets met!');
  }
}

main();

