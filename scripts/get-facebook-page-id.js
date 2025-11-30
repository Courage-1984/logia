/**
 * Get Facebook Page ID Helper Script
 * 
 * This script helps you find your Facebook Page ID when using a Page access token
 * 
 * Usage:
 *   dotenv -e .env -- node scripts/get-facebook-page-id.js
 */

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ INSTAGRAM_ACCESS_TOKEN is not set in environment variables');
  console.log('\n💡 Make sure your .env file contains:');
  console.log('   INSTAGRAM_ACCESS_TOKEN=your_token_here');
  process.exit(1);
}

const token = ACCESS_TOKEN.trim();

console.log('🔍 Facebook Page ID Finder\n');

// Check if it's a Page token
if (!token.startsWith('EAA')) {
  console.log('⚠️  This doesn\'t look like a Facebook Page token (should start with "EAA")');
  console.log('   This script is for finding Page IDs from Page access tokens.\n');
}

console.log('📋 Method 1: Get all Pages for this token...\n');

try {
  // Try to get pages
  const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${encodeURIComponent(token)}`;
  const response = await fetch(pagesUrl);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
    
    console.log(`❌ Could not get Pages: ${errorMsg}`);
    console.log('\n💡 This might mean:');
    console.log('   - The token doesn\'t have permission to access /me/accounts');
    console.log('   - The token is not a valid Page access token');
    console.log('   - You need a User Access Token with pages_show_list permission');
    
    // Try to debug what we can access
    console.log('\n📋 Debugging token access...\n');
    
    try {
      const debugUrl = `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`;
      const debugResponse = await fetch(debugUrl);
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        console.log('✅ Token is valid for:');
        console.log(`   ID: ${debugData.id}`);
        console.log(`   Name: ${debugData.name || 'N/A'}`);
        console.log('\n💡 To get Pages, you need a User Access Token with pages_show_list permission');
        console.log('   OR use a Page Access Token directly (but you need to know the Page ID)');
      } else {
        const debugError = await debugResponse.json().catch(() => ({}));
        console.log(`❌ Token validation failed: ${debugError.error?.message || 'Unknown error'}`);
        console.log('\n💡 The token might be invalid, expired, or have wrong permissions');
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
    
    console.log('\n📋 Alternative: Find your Page ID manually');
    console.log('\n   1. Go to your Facebook Page');
    console.log('   2. Click "About" on the left sidebar');
    console.log('   3. Scroll down to find "Page ID"');
    console.log('   4. Copy the Page ID and add to your .env file:');
    console.log('      FACEBOOK_PAGE_ID=your_page_id_here');
    
    process.exit(1);
  }
  
  const data = await response.json();
  
  if (!data.data || data.data.length === 0) {
    console.log('❌ No Pages found for this token');
    process.exit(1);
  }
  
  console.log(`✅ Found ${data.data.length} Page(s):\n`);
  
  data.data.forEach((page, index) => {
    console.log(`   ${index + 1}. ${page.name}`);
    console.log(`      Page ID: ${page.id}`);
    console.log(`      Access Token: ${page.access_token.substring(0, 20)}...`);
    
    // Check if this page has Instagram linked
    console.log(`      Checking for Instagram Business Account...`);
    
    (async () => {
      try {
        const instagramUrl = `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${encodeURIComponent(token)}`;
        const instaResponse = await fetch(instagramUrl);
        
        if (instaResponse.ok) {
          const instaData = await instaResponse.json();
          if (instaData.instagram_business_account && instaData.instagram_business_account.id) {
            console.log(`      ✅ Instagram Business Account ID: ${instaData.instagram_business_account.id}`);
          } else {
            console.log(`      ⚠️  No Instagram Business Account linked to this Page`);
          }
        }
      } catch (e) {
        // Ignore errors for async checks
      }
    })();
    
    console.log('');
  });
  
  console.log('\n💡 Add the Page ID to your .env file:');
  console.log(`   FACEBOOK_PAGE_ID=${data.data[0].id}`);
  console.log('\n   Or use the Page Access Token directly:');
  console.log(`   INSTAGRAM_ACCESS_TOKEN=${data.data[0].access_token}`);
  
} catch (error) {
  console.error(`\n❌ Error: ${error.message}`);
  process.exit(1);
}

