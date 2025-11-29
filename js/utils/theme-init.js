/**
 * Theme initialization script
 * Prevents FOUC (Flash of Unstyled Content) by applying theme before CSS loads
 * This is loaded synchronously in <head> before CSS
 */

(function() {
    try {
        const storageKey = 'theme';
        const defaultMode = 'light';
        const stored = localStorage.getItem(storageKey);
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored === 'dark' || stored === 'light' ? stored : (systemPrefersDark ? 'dark' : defaultMode);
        
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
        }
    } catch (e) {
        // Silently fail if localStorage or matchMedia not available
    }
})();

