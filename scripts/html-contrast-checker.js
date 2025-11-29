/**
 * HTML Contrast Checker
 * Checks contrast ratios of text elements in HTML files
 * Uses our existing contrast calculation logic
 * 
 * Usage:
 *   node scripts/html-contrast-checker.js [file|url]
 *   node scripts/html-contrast-checker.js dist/index.html
 *   node scripts/html-contrast-checker.js http://localhost:3000
 *   node scripts/html-contrast-checker.js dist --all
 *   node scripts/html-contrast-checker.js http://localhost:3000 --all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of pages to audit
const PAGES = [
  'index.html',
  'about.html',
  'services.html',
  'portfolio.html',
  'contact.html',
  'resources.html',
  'speedtest.html',
  'privacy-policy.html',
  'terms-of-service.html',
  '404.html'
];

// Contrast calculation functions (copied from contrast-audit.js for standalone use)
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function checkCompliance(ratio, size = 'normal') {
  const isAA = size === 'normal' ? ratio >= 4.5 : ratio >= 3;
  const isAAA = size === 'normal' ? ratio >= 7 : ratio >= 4.5;
  
  return {
    ratio: ratio.toFixed(2),
    AA: isAA,
    AAA: isAAA,
    status: isAAA ? 'AAA' : isAA ? 'AA' : 'FAIL',
  };
}

/**
 * Get computed styles for an element
 */
function getComputedStyles(element, dom) {
  const { window } = dom;
  const computed = window.getComputedStyle(element);
  return {
    color: computed.color,
    backgroundColor: computed.backgroundColor,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
  };
}

/**
 * Convert CSS color to hex
 */
function cssColorToHex(cssColor) {
  // Handle rgb/rgba
  const rgbMatch = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  // Handle hex
  if (cssColor.startsWith('#')) {
    return cssColor;
  }

  // Handle named colors (basic set)
  const namedColors = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF0000',
    green: '#008000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    gray: '#808080',
    grey: '#808080',
  };

  return namedColors[cssColor.toLowerCase()] || null;
}

/**
 * Get background color by traversing up the DOM tree
 */
function getBackgroundColor(element, dom) {
  const { window } = dom;
  let current = element;

  while (current && current !== window.document.body) {
    const computed = window.getComputedStyle(current);
    const bgColor = computed.backgroundColor;

    // Check if background is not transparent
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return bgColor;
    }

    current = current.parentElement;
  }

  // Default to white if no background found
  return 'rgb(255, 255, 255)';
}

/**
 * Check if text is large (18px+ or 14px+ bold)
 */
function isLargeText(fontSize, fontWeight) {
  const size = parseFloat(fontSize);
  const weight = parseInt(fontWeight) || 400;
  return size >= 18 || (size >= 14 && weight >= 700);
}

/**
 * Find all text elements and check contrast
 */
function checkContrast(html, source) {
  const dom = new JSDOM(html, {
    url: source.startsWith('http') ? source : `file://${path.resolve(source)}`,
    resources: 'usable',
  });

  const { document } = dom.window;

  // Find all text-containing elements
  const textElements = [];
  const { NodeFilter } = dom.window;
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    const { Node } = dom.window;
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node;
      const text = element.textContent?.trim();

      // Skip if no text or only whitespace
      if (!text || text.length === 0) {
        continue;
      }

      // Skip script, style, and other non-visible elements
      const tagName = element.tagName?.toLowerCase();
      if (['script', 'style', 'meta', 'link', 'head', 'title'].includes(tagName)) {
        continue;
      }

      // Get computed styles
      const styles = getComputedStyles(element, dom);
      const fgColor = cssColorToHex(styles.color);
      const bgColor = cssColorToHex(getBackgroundColor(element, dom));

      if (fgColor && bgColor) {
        const ratio = getContrastRatio(fgColor, bgColor);
        const isLarge = isLargeText(styles.fontSize, styles.fontWeight);
        const compliance = checkCompliance(ratio, isLarge ? 'large' : 'normal');

        if (compliance.status === 'FAIL') {
          textElements.push({
            element: element.tagName?.toLowerCase() || 'unknown',
            text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            selector: getSelector(element, dom),
            foreground: fgColor,
            background: bgColor,
            ratio: parseFloat(compliance.ratio),
            required: isLarge ? 3 : 4.5,
            size: isLarge ? 'large' : 'normal',
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
          });
        }
      }
    }
  }

  return textElements;
}

/**
 * Get CSS selector for element
 */
function getSelector(element, dom) {
  if (element.id) {
    return `#${element.id}`;
  }

  const { Node } = dom.window;
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.className) {
      const classes = Array.from(element.classList).join('.');
      if (classes) {
        selector += `.${classes}`;
      }
    }
    path.unshift(selector);
    element = element.parentElement;
  }
  return path.join(' > ');
}

/**
 * Display results for a single page
 */
function displayResults(issues, source, showDetails = true) {
  if (showDetails) {
    console.log('\n' + '='.repeat(80));
    console.log('HTML CONTRAST CHECKER RESULTS');
    console.log('='.repeat(80));
    console.log(`\nSource: ${source}`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    if (issues.length === 0) {
      console.log('✅ No contrast issues found!');
      console.log('='.repeat(80));
      return { issues: 0, hasErrors: false };
    }

    console.log(`❌ Found ${issues.length} contrast issue(s):\n`);

    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.element.toUpperCase()} Element`);
      console.log(`   Text: "${issue.text}"`);
      console.log(`   Selector: ${issue.selector}`);
      console.log(`   Foreground: ${issue.foreground}`);
      console.log(`   Background: ${issue.background}`);
      console.log(`   Contrast Ratio: ${issue.ratio.toFixed(2)}:1`);
      console.log(`   Required: ${issue.required}:1 (${issue.size} text)`);
      console.log(`   Font Size: ${issue.fontSize}, Weight: ${issue.fontWeight}`);
      console.log('');
    });

    console.log('='.repeat(80));
    if (issues.length > 0) {
      console.log(`❌ AUDIT FAILED: ${issues.length} contrast issue(s) found`);
      console.log('='.repeat(80));
    }
  }

  return {
    source,
    issues: issues.length,
    hasErrors: issues.length > 0,
    details: issues
  };
}

/**
 * Build path/URL from base and page
 */
function buildTarget(base, page, isUrl) {
  if (isUrl) {
    const baseUrl = base.replace(/\/$/, '');
    return `${baseUrl}/${page}`;
  } else {
    return path.join(base, page);
  }
}

/**
 * Check all pages
 */
async function checkAllPages(baseTarget = 'dist') {
  const args = process.argv.slice(2);
  const allPages = args.includes('--all');
  const base = args.find(arg => !arg.startsWith('--')) || baseTarget;
  const isUrl = base.startsWith('http://') || base.startsWith('https://');

  console.log('\n' + '='.repeat(80));
  console.log('HTML CONTRAST CHECKER - ALL PAGES');
  console.log('='.repeat(80));
  console.log(`\nBase: ${base}`);
  console.log(`Pages to check: ${PAGES.length}\n`);

  const results = [];
  let totalIssues = 0;
  let pagesWithIssues = 0;

  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    const target = buildTarget(base, page, isUrl);
    const pageNum = i + 1;

    console.log(`[${pageNum}/${PAGES.length}] Checking: ${page}`);
    console.log(`Target: ${target}`);

    try {
      let html;
      if (isUrl) {
        const response = await fetch(target);
        if (!response.ok) {
          console.error(`  ❌ Failed to fetch: HTTP ${response.status}`);
          results.push({ source: target, issues: 0, hasErrors: false, error: `HTTP ${response.status}` });
          continue;
        }
        html = await response.text();
      } else {
        const filePath = path.resolve(target);
        if (!fs.existsSync(filePath)) {
          console.error(`  ❌ File not found: ${filePath}`);
          results.push({ source: target, issues: 0, hasErrors: false, error: 'File not found' });
          continue;
        }
        html = fs.readFileSync(filePath, 'utf8');
      }

      const issues = checkContrast(html, target);
      const summary = displayResults(issues, target, false);
      results.push(summary);

      totalIssues += summary.issues;
      if (summary.hasErrors) {
        pagesWithIssues++;
        console.log(`  ❌ ${summary.issues} issue(s) found`);
      } else {
        console.log(`  ✅ No issues found`);
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message || error}`);
      results.push({ source: target, issues: 0, hasErrors: false, error: error.message || 'Unknown error' });
    }
  }

  // Summary report
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY REPORT - ALL PAGES');
  console.log('='.repeat(80));
  console.log(`\nTotal Pages Checked: ${results.length}`);
  console.log(`Pages with Issues: ${pagesWithIssues}`);
  console.log(`\nTotal Issues Across All Pages: ${totalIssues}`);

  // Pages with issues
  const errorPages = results.filter(r => r.hasErrors);
  if (errorPages.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('PAGES WITH CONTRAST ISSUES:');
    console.log('='.repeat(80));
    errorPages.forEach(page => {
      console.log(`\n${page.source}`);
      console.log(`  ❌ ${page.issues} issue(s)`);
    });
  }

  // Detailed breakdown
  console.log('\n' + '='.repeat(80));
  console.log('DETAILED BREAKDOWN BY PAGE:');
  console.log('='.repeat(80));
  results.forEach(page => {
    const status = page.hasErrors ? '❌' : '✅';
    const pageName = path.basename(page.source);
    console.log(`${status} ${pageName.padEnd(30)} | Issues: ${String(page.issues).padStart(3)}`);
  });

  // Final verdict
  console.log('\n' + '='.repeat(80));
  if (totalIssues > 0) {
    console.log(`❌ AUDIT FAILED: ${totalIssues} total issue(s) found across ${pagesWithIssues} page(s)`);
    console.log('='.repeat(80));
    process.exit(1);
  } else {
    console.log('✅ AUDIT PASSED: No contrast issues found across all pages');
    console.log('='.repeat(80));
    process.exit(0);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const allPages = args.includes('--all');
  const target = args.find(arg => !arg.startsWith('--'));

  if (allPages) {
    await checkAllPages(target || 'dist');
    return;
  }

  if (!target) {
    console.error('Error: No target specified');
    console.error('\nUsage:');
    console.error('  node scripts/html-contrast-checker.js <file|url>');
    console.error('  node scripts/html-contrast-checker.js <base> --all');
    console.error('\nExamples:');
    console.error('  node scripts/html-contrast-checker.js dist/index.html');
    console.error('  node scripts/html-contrast-checker.js http://localhost:3000');
    console.error('  node scripts/html-contrast-checker.js dist --all');
    console.error('  node scripts/html-contrast-checker.js http://localhost:3000 --all');
    process.exit(1);
  }

  const isUrl = target.startsWith('http://') || target.startsWith('https://');

  try {
    let html;

    if (isUrl) {
      console.log(`Fetching HTML from: ${target}`);
      const response = await fetch(target);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      html = await response.text();
    } else {
      const filePath = path.resolve(target);
      if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        console.error('\nTip: Make sure you have built the project first:');
        console.error('  npm run build');
        process.exit(1);
      }
      html = fs.readFileSync(filePath, 'utf8');
    }

    const issues = checkContrast(html, target);
    const summary = displayResults(issues, target, true);
    process.exit(summary.hasErrors ? 1 : 0);
  } catch (error) {
    console.error('Error:', error.message || error);
    process.exit(1);
  }
}

// Export functions for use in other modules
export { checkContrast, getContrastRatio, checkCompliance, hexToRgb, getLuminance };

// Run if called directly
import { pathToFileURL } from 'url';
const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  main();
}

