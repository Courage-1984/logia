/**
 * Instagram Token Diagnostic Script
 * 
 * Simple script to test and debug Instagram access token issues
 * 
 * Usage:
 *   dotenv -e .env -- node scripts/test-instagram-token.js
 */

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;

console.log('🔍 Instagram Token Diagnostic Tool\n');

// Check if token is set
if (!ACCESS_TOKEN) {
  console.error('❌ INSTAGRAM_ACCESS_TOKEN is not set in environment variables');
  console.log('\n💡 Make sure your .env file contains:');
  console.log('   INSTAGRAM_ACCESS_TOKEN=your_token_here');
  process.exit(1);
}

console.log('✅ Token found in environment');
console.log(`   Length: ${ACCESS_TOKEN.length} characters`);

// Check token format
console.log('\n📋 Token Format Analysis:');
console.log(`   First 20 chars: ${ACCESS_TOKEN.substring(0, 20)}...`);
console.log(`   Last 10 chars: ...${ACCESS_TOKEN.substring(ACCESS_TOKEN.length - 10)}`);

// Check for common issues
const issues = [];

if (ACCESS_TOKEN.startsWith('"') || ACCESS_TOKEN.endsWith('"')) {
  issues.push('❌ Token is wrapped in quotes - remove quotes from .env file');
}

if (ACCESS_TOKEN !== ACCESS_TOKEN.trim()) {
  issues.push('⚠️  Token has leading/trailing whitespace');
}

if (ACCESS_TOKEN.includes(' ')) {
  issues.push('❌ Token contains spaces');
}

if (ACCESS_TOKEN.length < 50) {
  issues.push(`⚠️  Token seems short (${ACCESS_TOKEN.length} chars). Expected 100+ characters.`);
}

const isPageToken = ACCESS_TOKEN.trim().startsWith('EAA');
if (isPageToken) {
  console.log('   ℹ️  Token starts with "EAA" - detected as Facebook Page access token');
  console.log('   ✅ This is valid for Instagram Business accounts linked to a Facebook Page');
  console.log('   ✅ The script will automatically fetch your Instagram Business Account ID');
}

if (issues.length > 0) {
  console.log('\n⚠️  Potential Issues Found:');
  issues.forEach(issue => console.log(`   ${issue}`));
} else {
  console.log('   ✅ No obvious format issues detected');
}

// Clean token for testing
const cleanedToken = ACCESS_TOKEN.trim().replace(/^["']|["']$/g, '');

if (cleanedToken !== ACCESS_TOKEN) {
  console.log('\n💡 Token cleaned:');
  console.log(`   Original: ${ACCESS_TOKEN.substring(0, 30)}...`);
  console.log(`   Cleaned:  ${cleanedToken.substring(0, 30)}...`);
}

// Test token with Instagram API
console.log('\n🧪 Testing Token with Instagram Graph API...');

const testEndpoints = [];

// If it's a Facebook Page token, first get the Instagram Business Account ID
let instagramAccountId = USER_ID;

if (isPageToken && !instagramAccountId) {
  console.log('\n   Detected Facebook Page token - fetching Instagram Business Account ID...');
  
  try {
    // Get pages first
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${encodeURIComponent(cleanedToken)}`;
    const pagesResponse = await fetch(pagesUrl);
    
    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      if (pagesData.data && pagesData.data.length > 0) {
        const pageId = pagesData.data[0].id;
        console.log(`   ✅ Found Facebook Page: ${pageId}`);
        
        // Get Instagram Business Account from Page
        const pageUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(cleanedToken)}`;
        const pageResponse = await fetch(pageUrl);
        
        if (pageResponse.ok) {
          const pageData = await pageResponse.json();
          if (pageData.instagram_business_account && pageData.instagram_business_account.id) {
            instagramAccountId = pageData.instagram_business_account.id;
            console.log(`   ✅ Found Instagram Business Account ID: ${instagramAccountId}`);
          } else {
            console.log('   ❌ No Instagram Business Account linked to this Page');
            console.log('   💡 Make sure your Instagram account is linked to the Facebook Page');
          }
        }
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Error fetching Instagram Business Account: ${error.message}`);
  }
}

if (instagramAccountId) {
  testEndpoints.push({
    name: 'Get Instagram Media',
    url: `https://graph.instagram.com/v18.0/${instagramAccountId}/media?fields=id&limit=1&access_token=${encodeURIComponent(cleanedToken)}`
  });
  testEndpoints.push({
    name: 'Get Instagram Account Info',
    url: `https://graph.instagram.com/v18.0/${instagramAccountId}?fields=id,username&access_token=${encodeURIComponent(cleanedToken)}`
  });
} else if (!isPageToken) {
  // For Instagram tokens, try the /me endpoint
  testEndpoints.push({
    name: 'Get Self Info (me)',
    url: `https://graph.instagram.com/v18.0/me?fields=id,username&access_token=${encodeURIComponent(cleanedToken)}`
  });
}

for (const endpoint of testEndpoints) {
  try {
    console.log(`\n   Testing: ${endpoint.name}...`);
    const response = await fetch(endpoint.url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Success!`);
      if (data.id) {
        console.log(`      User ID: ${data.id}`);
      }
      if (data.username) {
        console.log(`      Username: ${data.username}`);
      }
      if (data.data) {
        console.log(`      Media count: ${data.data.length}`);
      }
      break; // If one endpoint works, we're good
    } else {
      const error = data.error || {};
      console.log(`   ❌ Failed: ${error.message || response.statusText}`);
      console.log(`      Error Code: ${error.code || 'N/A'}`);
      console.log(`      Error Type: ${error.type || 'N/A'}`);
      
      if (error.code === 190) {
        console.log('\n   💡 Token is invalid or expired. Possible reasons:');
        console.log('      - Token has expired (tokens expire after 60 days)');
        console.log('      - Token was revoked');
        console.log('      - Token is for wrong account/app');
        console.log('      - Token format is incorrect');
      } else if (error.message && error.message.includes('parse')) {
        console.log('\n   💡 Token parsing error. Check:');
        console.log('      - Remove quotes from .env file');
        console.log('      - Remove any spaces or special characters');
        console.log('      - Copy token directly from Facebook Developer Console');
      }
    }
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
  }
}

console.log('\n📝 Recommendations:');

if (isPageToken) {
  console.log('   Since you\'re using a Facebook Page token (EAA):');
  console.log('   1. Make sure your Instagram account is linked to the Facebook Page');
  console.log('   2. The token needs permissions: pages_show_list, pages_read_engagement');
  console.log('   3. Consider using a User Access Token instead (with instagram_basic permission)');
  console.log('   4. OR set FACEBOOK_PAGE_ID in .env if you know your Page ID');
  console.log('   5. See docs/INSTAGRAM_FEED_SETUP.md for detailed instructions');
} else {
  console.log('   1. Ensure token has no quotes in .env file: INSTAGRAM_ACCESS_TOKEN=token_here');
  console.log('   2. Verify token is from Instagram Graph API (not Facebook Graph API)');
  console.log('   3. Check if token has expired (refresh if needed)');
  console.log('   4. See docs/INSTAGRAM_FEED_SETUP.md for token generation instructions');
}

console.log('\n💡 Alternative: Use manual posts from config/app.config.js (no API needed)');

