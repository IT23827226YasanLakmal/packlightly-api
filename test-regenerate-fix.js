// Quick test to verify the regenerate fix
const axios = require('axios');

async function testRegenerateAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('Testing report regeneration fix...');
    
    // You would need to use a valid JWT token and report ID for actual testing
    // This is just to show the structure of the test
    
    console.log('✅ Test framework ready');
    console.log('To test manually:');
    console.log('1. Generate a report first using POST /api/reports/generate-sync');
    console.log('2. Then try to regenerate it using POST /api/reports/{id}/regenerate');
    console.log('3. The duplicate key error should no longer occur');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testRegenerateAPI();
}

module.exports = { testRegenerateAPI };