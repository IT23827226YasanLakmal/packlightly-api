// Quick test for report endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/reports';

async function testReportEndpoints() {
  console.log('🧪 Testing Report API Endpoints...\n');

  try {
    // Test 1: Get report types (should work without auth now)
    console.log('1. Testing GET /api/reports/types (No Auth Required)');
    const typesResponse = await axios.get(`${BASE_URL}/types`);
    console.log('✅ Success:', typesResponse.status);
    console.log('📋 Available Report Types:', typesResponse.data.data.length);
    console.log('   Types:', typesResponse.data.data.map(t => t.value).join(', '));
    console.log();

  } catch (error) {
    console.log('❌ Error testing report types:', error.response?.status, error.response?.data?.message || error.message);
    console.log();
  }

  try {
    // Test 2: Try to get reports without auth (should fail)
    console.log('2. Testing GET /api/reports (No Auth - Should Fail)');
    const reportsResponse = await axios.get(`${BASE_URL}`);
    console.log('⚠️  Unexpected success:', reportsResponse.status);
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('✅ Correctly blocked without auth:', error.response.status);
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message || error.message);
    }
    console.log();
  }

  try {
    // Test 3: Try to generate report without auth (should fail)
    console.log('3. Testing POST /api/reports/generate (No Auth - Should Fail)');
    const generateResponse = await axios.post(`${BASE_URL}/generate`, {
      type: 'trip_analytics',
      title: 'Test Report'
    });
    console.log('⚠️  Unexpected success:', generateResponse.status);
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('✅ Correctly blocked without auth:', error.response.status);
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message || error.message);
    }
    console.log();
  }

  console.log('🎉 Report API endpoint tests completed!');
}

testReportEndpoints().catch(console.error);