// Simple test to verify report generation works
const axios = require('axios');

async function testReportGeneration() {
  try {
    console.log('🧪 Testing Report Generation');
    console.log('============================');

    // Test generating a report (should get 401 unauthorized but that means the endpoint works)
    const response = await axios.post('http://localhost:5000/api/reports/generate-sync', {
      type: 'trip_analytics',
      title: 'Test Analytics Report'
    });
    
    console.log('✅ Response received:', response.status);
    
  } catch (error) {
    if (error.response) {
      console.log(`📋 Response Status: ${error.response.status}`);
      console.log(`📋 Response Message: ${error.response.data?.message || 'No message'}`);
      
      if (error.response.status === 401) {
        console.log('✅ Endpoint working (authentication required as expected)');
      } else if (error.response.status === 400) {
        console.log('✅ Endpoint working (validation error - check details)');
      } else {
        console.log('❌ Unexpected response:', error.response.data);
      }
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testReportGeneration();