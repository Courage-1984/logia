/**
 * Build Configuration
 * Defines URLs and settings for different build targets
 */

export const buildConfigs = {
  // Production build (normal server/FTP)
  production: {
    baseUrl: 'https://logia.co.za',
    basePath: '/',
    outDir: 'dist',
    sitemapUrl: 'https://logia.co.za/sitemap.xml',
  },
  
  // GitHub Pages build
  'gh-pages': {
    baseUrl: 'https://courage-1984.github.io/logia',
    basePath: '/logia/',
    outDir: 'dist-gh-pages',
    sitemapUrl: 'https://courage-1984.github.io/logia/sitemap.xml',
  },
};

/**
 * Get build config for current mode
 * @param {string} mode - Build mode ('production' or 'gh-pages')
 * @returns {object} Build configuration
 */
export function getBuildConfig(mode = 'production') {
  return buildConfigs[mode] || buildConfigs.production;
}

