/**
 * Vite plugin to inject Google Search Console verification tag
 * Reads VITE_GSC_VERIFICATION from environment and injects into HTML
 */

export function gscVerificationPlugin() {
  return {
    name: 'gsc-verification',
    transformIndexHtml(html, ctx) {
      // Get environment variable from Vite
      const verification = ctx.env?.VITE_GSC_VERIFICATION || process.env.VITE_GSC_VERIFICATION;
      
      if (!verification) {
        // Remove placeholder comment if no verification code
        return html.replace(
          /<!-- Google Search Console Verification -->[\s\S]*?<!-- Example:.*?-->[\s]*/g,
          ''
        );
      }
      
      // Inject verification tag
      const verificationTag = `<meta name="google-site-verification" content="${verification}" />`;
      
      // Replace placeholder or add after canonical URL
      if (html.includes('<!-- Google Search Console Verification -->')) {
        return html.replace(
          /<!-- Google Search Console Verification -->[\s\S]*?<!-- Example:.*?-->[\s]*/,
          `${verificationTag}\n    `
        );
      } else {
        // Add after canonical URL if placeholder not found
        return html.replace(
          /(<link rel="canonical"[^>]*>)/,
          `$1\n\n    ${verificationTag}`
        );
      }
    },
  };
}

