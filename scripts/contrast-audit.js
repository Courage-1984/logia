/**
 * Contrast Ratio Audit Tool
 * Checks WCAG AA/AAA compliance for all color combinations
 * 
 * WCAG Requirements:
 * - Normal text (16px): 4.5:1 (AA), 7:1 (AAA)
 * - Large text (18px+ or 14px+ bold): 3:1 (AA), 4.5:1 (AAA)
 * - UI components: 3:1 (AA)
 */

// Color values from css/core/variables.css
const colors = {
  // Primary
  primary: '#0A2463',
  primaryLight: '#1E3A8A',
  primaryDark: '#061741',
  
  // Accent
  accent: '#00D9FF',
  accentHover: '#00B8DB',
  accentText: '#006B82', // Darker for light mode (updated for better contrast)
  
  // Neutrals - Light Mode
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  
  // Dark Mode
  darkBg: '#000000',
  darkSurface: '#0F172A',
  
  // Others
  warning: '#FFD700',
  warningDark: '#936C08', // Dark gold for light backgrounds
  error: '#DC2626', // Updated for better contrast
  success: '#10B981',
  whatsapp: '#0E7A6D', // Updated darker WhatsApp green
  whatsappDark: '#0D6B5F',
};

/**
 * Calculate relative luminance
 * @param {string} hex - Hex color code
 * @returns {number} Relative luminance (0-1)
 */
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 * @param {string} hex - Hex color code
 * @returns {number[]} [r, g, b]
 */
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

/**
 * Calculate contrast ratio
 * @param {string} color1 - Hex color code
 * @param {string} color2 - Hex color code
 * @returns {number} Contrast ratio
 */
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 * @param {number} ratio - Contrast ratio
 * @param {string} size - 'normal' or 'large'
 * @returns {object} Compliance status
 */
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

// Test combinations from the codebase
const tests = [
  // Light Mode - Primary Text
  { foreground: colors.gray900, background: colors.white, name: 'Primary Text on White (Light Mode)', size: 'normal' },
  { foreground: colors.gray600, background: colors.white, name: 'Muted Text on White (Light Mode)', size: 'normal' },
  { foreground: colors.gray900, background: colors.gray50, name: 'Primary Text on Surface (Light Mode)', size: 'normal' },
  
  // Dark Mode - Primary Text
  { foreground: colors.gray100, background: colors.darkBg, name: 'Primary Text on Black (Dark Mode)', size: 'normal' },
  { foreground: colors.gray400, background: colors.darkSurface, name: 'Muted Text on Dark Surface (Dark Mode)', size: 'normal' },
  
  // Accent Colors
  { foreground: colors.accent, background: colors.white, name: 'Accent Cyan on White', size: 'normal' },
  { foreground: colors.accent, background: colors.darkSurface, name: 'Accent Cyan on Dark Surface', size: 'normal' },
  { foreground: colors.accentText, background: colors.white, name: 'Accent Text (#006B82) on White', size: 'normal' },
  { foreground: colors.accentText, background: colors.gray50, name: 'Accent Text on Surface', size: 'normal' },
  
  // Primary Colors
  { foreground: colors.primary, background: colors.white, name: 'Primary Blue on White', size: 'normal' },
  { foreground: colors.white, background: colors.primary, name: 'White on Primary Blue', size: 'normal' },
  
  // Buttons
  { foreground: colors.white, background: colors.primary, name: 'White on Primary Button', size: 'normal' },
  { foreground: colors.white, background: colors.primaryLight, name: 'White on Primary Light Button', size: 'normal' },
  
  // Footer
  { foreground: colors.gray300, background: colors.gray900, name: 'Footer Text on Footer Background', size: 'normal' },
  { foreground: colors.gray400, background: colors.gray900, name: 'Footer Links on Footer Background', size: 'normal' },
  { foreground: colors.accent, background: colors.gray900, name: 'Accent on Footer Background', size: 'normal' },
  { foreground: colors.white, background: colors.gray900, name: 'White on Footer Background', size: 'normal' },
  
  // Cards
  { foreground: colors.gray900, background: colors.white, name: 'Card Text on White Card', size: 'normal' },
  { foreground: colors.gray100, background: colors.darkSurface, name: 'Card Text on Dark Card', size: 'normal' },
  
  // Form Elements
  { foreground: colors.gray900, background: colors.white, name: 'Form Text on White', size: 'normal' },
  { foreground: colors.gray100, background: colors.darkSurface, name: 'Form Text on Dark Surface', size: 'normal' },
  
  // Large Text (Headings)
  { foreground: colors.gray900, background: colors.white, name: 'Heading on White', size: 'large' },
  { foreground: colors.gray100, background: colors.darkBg, name: 'Heading on Black', size: 'large' },
  { foreground: colors.accent, background: colors.white, name: 'Accent Heading on White', size: 'large' },
  { foreground: colors.accent, background: colors.darkSurface, name: 'Accent Heading on Dark Surface', size: 'large' },
  
  // Hero Section (on gradient)
  { foreground: colors.white, background: colors.primaryDark, name: 'White Text on Primary Dark (Hero)', size: 'normal' },
  { foreground: colors.white, background: colors.primary, name: 'White Text on Primary (Hero)', size: 'normal' },
  
  // CTA Section
  { foreground: colors.white, background: colors.primaryDark, name: 'White Text on Primary Dark (CTA)', size: 'normal' },
  
  // Warning/Stars
  { foreground: colors.warningDark, background: colors.white, name: 'Warning/Stars on White (Dark Gold)', size: 'normal' },
  { foreground: colors.warning, background: colors.darkSurface, name: 'Warning/Stars on Dark Surface', size: 'normal' },
  
  // WhatsApp
  { foreground: colors.white, background: colors.whatsapp, name: 'White on WhatsApp Green', size: 'normal' },
  { foreground: colors.white, background: colors.whatsappDark, name: 'White on WhatsApp Dark Green', size: 'normal' },
  
  // Navbar
  { foreground: colors.gray600, background: colors.white, name: 'Nav Link on Navbar (Light)', size: 'normal' },
  { foreground: colors.gray100, background: colors.darkSurface, name: 'Nav Link on Navbar (Dark)', size: 'normal' },
  
  // Error States
  { foreground: colors.error, background: colors.white, name: 'Error Text on White', size: 'normal' },
];

console.log('='.repeat(80));
console.log('CONTRAST RATIO AUDIT - LOGIA GENESIS');
console.log('='.repeat(80));
console.log('');

let passCount = 0;
let failCount = 0;
const issues = [];

tests.forEach(test => {
  const ratio = getContrastRatio(test.foreground, test.background);
  const compliance = checkCompliance(ratio, test.size);
  
  const status = compliance.status === 'FAIL' ? '❌' : compliance.status === 'AAA' ? '✅✅' : '✅';
  console.log(`${status} ${test.name}`);
  console.log(`   Ratio: ${compliance.ratio}:1 | ${compliance.status} | Size: ${test.size}`);
  
  if (compliance.status === 'FAIL') {
    failCount++;
    issues.push({
      ...test,
      ratio: parseFloat(compliance.ratio),
      compliance,
    });
  } else {
    passCount++;
  }
  console.log('');
});

console.log('='.repeat(80));
console.log(`SUMMARY: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(80));
console.log('');

if (issues.length > 0) {
  console.log('ISSUES FOUND:');
  console.log('='.repeat(80));
  issues.forEach(issue => {
    console.log(`❌ ${issue.name}`);
    console.log(`   Current Ratio: ${issue.compliance.ratio}:1`);
    console.log(`   Required: ${issue.size === 'normal' ? '4.5:1 (AA)' : '3:1 (AA)'} for ${issue.size} text`);
    console.log('');
  });
}

// Generate recommendations
if (issues.length > 0) {
  console.log('='.repeat(80));
  console.log('RECOMMENDATIONS:');
  console.log('='.repeat(80));
  console.log('');
  
  issues.forEach(issue => {
    const minRatio = issue.size === 'normal' ? 4.5 : 3;
    const currentRatio = issue.ratio;
    
    console.log(`Fix for: ${issue.name}`);
    console.log(`   Current ratio: ${currentRatio}:1 (needs ${minRatio}:1)`);
    
    // Calculate how much darker/lighter needed
    const needsIncrease = minRatio / currentRatio;
    console.log(`   Need to increase contrast by ${(needsIncrease * 100).toFixed(0)}%`);
    console.log('');
  });
}
