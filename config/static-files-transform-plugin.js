/**
 * Vite Plugin: Static Files Transform
 * Transforms URLs in static files (sitemap.xml, robots.txt) based on build target
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { getBuildConfig } from './build-config.js';

/**
 * Transform URLs in sitemap.xml
 * @param {string} content - XML content
 * @param {object} config - Build configuration
 * @returns {string} Transformed XML
 */
function transformSitemap(content, config) {
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const basePath = (config.basePath || '/').replace(/\/$/, '');
  
  // Replace all occurrences of https://logia.co.za or https://www.logia.co.za with the configured base URL
  // For GitHub Pages, we need to add the basePath
  const targetBaseUrl = basePath && basePath !== '/' ? `${baseUrl}${basePath}` : baseUrl;
  
  content = content.replace(/https:\/\/[^\/]*logia\.co\.za/g, targetBaseUrl);
  
  return content;
}

/**
 * Transform URLs in robots.txt
 * @param {string} content - robots.txt content
 * @param {object} config - Build configuration
 * @returns {string} Transformed content
 */
function transformRobots(content, config) {
  const sitemapUrl = config.sitemapUrl;
  
  // Replace sitemap URL (handle both www and non-www versions)
  content = content.replace(
    /Sitemap:\s*https:\/\/[^\/]*logia\.co\.za\/sitemap\.xml/gi,
    `Sitemap: ${sitemapUrl}`
  );
  
  return content;
}

/**
 * Vite plugin to transform static files
 * @param {string} mode - Build mode
 * @returns {object} Vite plugin
 */
export function staticFilesTransformPlugin(mode = 'production') {
  const config = getBuildConfig(mode);
  
  return {
    name: 'static-files-transform',
    enforce: 'post',
    closeBundle() {
      const outDir = resolve(process.cwd(), config.outDir);
      
      // Transform sitemap.xml
      try {
        const sitemapPath = resolve(outDir, 'sitemap.xml');
        const sitemapContent = readFileSync(sitemapPath, 'utf-8');
        const transformedSitemap = transformSitemap(sitemapContent, config);
        writeFileSync(sitemapPath, transformedSitemap, 'utf-8');
        console.log(`✓ Transformed sitemap.xml URLs for ${mode} build`);
      } catch (error) {
        // File might not exist, that's okay
        if (error.code !== 'ENOENT') {
          console.warn(`Warning: Could not transform sitemap.xml:`, error.message);
        }
      }
      
      // Transform robots.txt
      try {
        const robotsPath = resolve(outDir, 'robots.txt');
        const robotsContent = readFileSync(robotsPath, 'utf-8');
        const transformedRobots = transformRobots(robotsContent, config);
        writeFileSync(robotsPath, transformedRobots, 'utf-8');
        console.log(`✓ Transformed robots.txt URLs for ${mode} build`);
      } catch (error) {
        // File might not exist, that's okay
        if (error.code !== 'ENOENT') {
          console.warn(`Warning: Could not transform robots.txt:`, error.message);
        }
      }
    },
  };
}

