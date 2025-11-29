/**
 * Script to update CSP and add DNS prefetch for Google Analytics in all HTML files
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const htmlFiles = [
  'about.html',
  'contact.html',
  'services.html',
  'portfolio.html',
  'resources.html',
  'speedtest.html',
  'privacy-policy.html',
  'terms-of-service.html',
  '404.html'
];

const cspOld = `script-src 'self' 'unsafe-inline' https://*.sentry.io`;
const cspNew = `script-src 'self' 'unsafe-inline' https://*.sentry.io https://www.googletagmanager.com https://www.google-analytics.com`;

const connectSrcOld = `connect-src 'self' https://formspree.io https://*.sentry.io https://api.instagram.com`;
const connectSrcNew = `connect-src 'self' https://formspree.io https://*.sentry.io https://api.instagram.com https://www.google-analytics.com https://*.google-analytics.com`;

const dnsPrefetch = `    <!-- DNS Prefetch for Google Analytics -->
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">
    <link rel="dns-prefetch" href="https://www.google-analytics.com">
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
    <link rel="preconnect" href="https://www.google-analytics.com" crossorigin>

`;

const gscVerification = `    <!-- Google Search Console Verification -->
    <!-- Set VITE_GSC_VERIFICATION environment variable to enable -->
    <!-- Example: <meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXXXXXXXXXXX" /> -->

`;

htmlFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  
  if (!existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  let content = readFileSync(filePath, 'utf8');
  let updated = false;
  
  // Update CSP
  if (content.includes(cspOld) && !content.includes('googletagmanager.com')) {
    content = content.replace(cspOld, cspNew);
    updated = true;
  }
  
  // Update connect-src
  if (content.includes(connectSrcOld) && !content.includes('google-analytics.com')) {
    content = content.replace(connectSrcOld, connectSrcNew);
    updated = true;
  }
  
  // Add DNS prefetch (after favicon section, before preload)
  if (!content.includes('dns-prefetch') && content.includes('favicon')) {
    // Find the position after favicon section
    const faviconEnd = content.indexOf('<!-- Windows Tiles -->');
    if (faviconEnd > -1) {
      const windowsTilesEnd = content.indexOf('</meta>', faviconEnd) + 7;
      if (windowsTilesEnd > 6) {
        const insertPos = content.indexOf('\n', windowsTilesEnd) + 1;
        content = content.slice(0, insertPos) + dnsPrefetch + content.slice(insertPos);
        updated = true;
      }
    }
  }
  
  // Add GSC verification placeholder (after canonical URL)
  if (!content.includes('google-site-verification') && content.includes('canonical')) {
    content = content.replace(
      /(<link rel="canonical"[^>]*>)/,
      `$1\n\n${gscVerification}`
    );
    updated = true;
  }
  
  if (updated) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
  } else {
    console.log(`⏭️  Skipped: ${file} (already updated or no changes needed)`);
  }
});

console.log('\n✨ All HTML files processed!');

