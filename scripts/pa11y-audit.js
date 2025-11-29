/**
 * Pa11y Accessibility Audit
 * Runs automated accessibility testing using pa11y
 * 
 * Usage:
 *   node scripts/pa11y-audit.js [url]
 *   node scripts/pa11y-audit.js http://localhost:3000
 *   node scripts/pa11y-audit.js http://localhost:3000/index.html
 *   node scripts/pa11y-audit.js http://localhost:3000 --all
 *   node scripts/pa11y-audit.js --all  (defaults to http://localhost:3000)
 */

import pa11y from 'pa11y';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get arguments from command line
const args = process.argv.slice(2);
const url = args.find(arg => !arg.startsWith('--'));
const allPages = args.includes('--all') || (!url && args.length === 0);

// List of all pages to audit
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

/**
 * Run pa11y audit
 */
async function runPa11yAudit(targetUrl) {
  console.log(`\nRunning Pa11y audit on: ${targetUrl}\n`);

  try {
    const results = await pa11y(targetUrl, {
      // Standard configuration
      standard: 'WCAG2AA',
      // Include warnings
      includeWarnings: true,
      // Include notices
      includeNotices: true,
      // Timeout
      timeout: 30000,
      // Wait for page to be ready
      wait: 1000,
      // Screenshot on error (optional)
      // screenshot: 'pa11y-screenshot.png',
      // Log level
      log: {
        debug: console.log,
        error: console.error,
        info: console.log,
      },
      // Chrome launch options
      chromeLaunchConfig: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    return results;
  } catch (error) {
    console.error('Error running pa11y:', error);
    throw error;
  }
}

/**
 * Format and display results for a single page
 */
function displayResults(results, showDetails = true) {
  if (showDetails) {
    console.log('\n' + '='.repeat(80));
    console.log('PA11Y ACCESSIBILITY AUDIT RESULTS');
    console.log('='.repeat(80));
    console.log(`\nURL: ${results.pageUrl || 'N/A'}`);
    console.log(`Title: ${results.documentTitle || 'N/A'}`);
    
    // Handle timestamp safely
    if (results.date) {
      try {
        const timestamp = new Date(results.date);
        if (!isNaN(timestamp.getTime())) {
          console.log(`Timestamp: ${timestamp.toISOString()}\n`);
        } else {
          console.log(`Timestamp: ${new Date().toISOString()}\n`);
        }
      } catch (error) {
        console.log(`Timestamp: ${new Date().toISOString()}\n`);
      }
    } else {
      console.log(`Timestamp: ${new Date().toISOString()}\n`);
    }
  }

  const { issues = [] } = results;

  // Categorize issues
  const errors = issues.filter(i => i && i.type === 'error');
  const warnings = issues.filter(i => i && i.type === 'warning');
  const notices = issues.filter(i => i && i.type === 'notice');

  // Summary
  if (showDetails) {
    console.log('SUMMARY:');
    console.log(`  ❌ Errors: ${errors.length}`);
    console.log(`  ⚠️  Warnings: ${warnings.length}`);
    console.log(`  ℹ️  Notices: ${notices.length}`);
    console.log(`  📊 Total Issues: ${issues.length}`);
    console.log('');

    // Errors
    if (errors.length > 0) {
      console.log('='.repeat(80));
      console.log('ERRORS (Must Fix):');
      console.log('='.repeat(80));
      console.log('');

      errors.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.code}: ${issue.message}`);
        console.log(`   Type: ${issue.type}`);
        console.log(`   WCAG: ${issue.code}`);
        if (issue.selector) {
          console.log(`   Selector: ${issue.selector}`);
        }
        if (issue.context) {
          console.log(`   Context: ${issue.context.substring(0, 100)}${issue.context.length > 100 ? '...' : ''}`);
        }
        console.log('');
      });
    }

    // Warnings
    if (warnings.length > 0) {
      console.log('='.repeat(80));
      console.log('WARNINGS (Should Fix):');
      console.log('='.repeat(80));
      console.log('');

      warnings.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.code}: ${issue.message}`);
        console.log(`   Type: ${issue.type}`);
        if (issue.selector) {
          console.log(`   Selector: ${issue.selector}`);
        }
        if (issue.context) {
          console.log(`   Context: ${issue.context.substring(0, 100)}${issue.context.length > 100 ? '...' : ''}`);
        }
        console.log('');
      });
    }

    // Notices (informational)
    if (notices.length > 0) {
      console.log('='.repeat(80));
      console.log('NOTICES (Informational):');
      console.log('='.repeat(80));
      console.log('');

      notices.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.code}: ${issue.message}`);
        if (issue.selector) {
          console.log(`   Selector: ${issue.selector}`);
        }
        console.log('');
      });

      if (notices.length > 10) {
        console.log(`... and ${notices.length - 10} more notices\n`);
      }
    }
  }

  // Return summary for aggregation
  return {
    url: results.pageUrl || 'N/A',
    title: results.documentTitle || 'N/A',
    errors: errors.length,
    warnings: warnings.length,
    notices: notices.length,
    total: issues.length,
    hasErrors: errors.length > 0
  };
}

/**
 * Build URL from base and page
 */
function buildUrl(baseUrl, page) {
  const base = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  if (page.startsWith('http')) {
    return page; // Already a full URL
  }
  return `${base}/${page}`;
}

/**
 * Audit all pages
 */
async function auditAllPages(baseUrl = 'http://localhost:3000') {
  console.log('\n' + '='.repeat(80));
  console.log('PA11Y ACCESSIBILITY AUDIT - ALL PAGES');
  console.log('='.repeat(80));
  console.log(`\nBase URL: ${baseUrl}`);
  console.log(`Pages to audit: ${PAGES.length}\n`);

  const results = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalNotices = 0;
  let pagesWithErrors = 0;

  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    const pageUrl = buildUrl(baseUrl, page);
    const pageNum = i + 1;

    console.log(`\n[${pageNum}/${PAGES.length}] Auditing: ${page}`);
    console.log(`URL: ${pageUrl}`);

    try {
      const auditResults = await runPa11yAudit(pageUrl);
      const summary = displayResults(auditResults, false);
      results.push(summary);

      totalErrors += summary.errors;
      totalWarnings += summary.warnings;
      totalNotices += summary.notices;

      if (summary.hasErrors) {
        pagesWithErrors++;
        console.log(`  ❌ ${summary.errors} error(s), ⚠️  ${summary.warnings} warning(s), ℹ️  ${summary.notices} notice(s)`);
      } else {
        console.log(`  ✅ ${summary.errors} error(s), ⚠️  ${summary.warnings} warning(s), ℹ️  ${summary.notices} notice(s)`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to audit ${page}: ${error.message || error}`);
      results.push({
        url: pageUrl,
        title: page,
        errors: 0,
        warnings: 0,
        notices: 0,
        total: 0,
        hasErrors: false,
        error: error.message || 'Unknown error'
      });
    }
  }

  // Summary report
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY REPORT - ALL PAGES');
  console.log('='.repeat(80));
  console.log(`\nTotal Pages Audited: ${results.length}`);
  console.log(`Pages with Errors: ${pagesWithErrors}`);
  console.log(`\nTotal Issues Across All Pages:`);
  console.log(`  ❌ Errors: ${totalErrors}`);
  console.log(`  ⚠️  Warnings: ${totalWarnings}`);
  console.log(`  ℹ️  Notices: ${totalNotices}`);
  console.log(`  📊 Total: ${totalErrors + totalWarnings + totalNotices}`);

  // Pages with errors
  const errorPages = results.filter(r => r.hasErrors);
  if (errorPages.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('PAGES WITH ERRORS:');
    console.log('='.repeat(80));
    errorPages.forEach(page => {
      console.log(`\n${page.title} (${page.url})`);
      console.log(`  ❌ ${page.errors} error(s), ⚠️  ${page.warnings} warning(s), ℹ️  ${page.notices} notice(s)`);
    });
  }

  // Detailed breakdown
  console.log('\n' + '='.repeat(80));
  console.log('DETAILED BREAKDOWN BY PAGE:');
  console.log('='.repeat(80));
  results.forEach(page => {
    const status = page.hasErrors ? '❌' : '✅';
    console.log(`${status} ${page.title.padEnd(30)} | Errors: ${String(page.errors).padStart(3)} | Warnings: ${String(page.warnings).padStart(3)} | Notices: ${String(page.notices).padStart(4)}`);
  });

  // Final verdict
  console.log('\n' + '='.repeat(80));
  if (totalErrors > 0) {
    console.log(`❌ AUDIT FAILED: ${totalErrors} total error(s) found across ${pagesWithErrors} page(s)`);
    console.log('='.repeat(80));
    process.exit(1);
  } else {
    console.log('✅ AUDIT PASSED: No errors found across all pages');
    if (totalWarnings > 0) {
      console.log(`⚠️  ${totalWarnings} total warning(s) found (should be reviewed)`);
    }
    console.log('='.repeat(80));
    process.exit(0);
  }
}

/**
 * Main function
 */
async function main() {
  if (allPages) {
    const baseUrl = url || 'http://localhost:3000';
    await auditAllPages(baseUrl);
  } else if (!url) {
    console.error('Error: No URL specified');
    console.error('\nUsage:');
    console.error('  node scripts/pa11y-audit.js <url>');
    console.error('  node scripts/pa11y-audit.js <baseUrl> --all');
    console.error('  node scripts/pa11y-audit.js --all');
    console.error('\nExamples:');
    console.error('  node scripts/pa11y-audit.js http://localhost:3000');
    console.error('  node scripts/pa11y-audit.js http://localhost:3000/index.html');
    console.error('  node scripts/pa11y-audit.js http://localhost:3000 --all');
    console.error('  node scripts/pa11y-audit.js --all');
    console.error('  node scripts/pa11y-audit.js https://www.logia.co.za --all');
    console.error('\nTip: Make sure your dev server is running:');
    console.error('  npm run dev');
    process.exit(1);
  } else {
    try {
      const results = await runPa11yAudit(url);
      displayResults(results, true);
    } catch (error) {
      console.error('Error:', error.message || error);
      if (error.message && error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        console.error('\nTip: Make sure your dev server is running:');
        console.error('  npm run dev');
      }
      process.exit(1);
    }
  }
}

// Run if called directly
const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  main();
}

