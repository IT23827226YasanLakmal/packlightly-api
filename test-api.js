/**
 * API test script for report endpoints
 * This script tests the actual HTTP endpoints
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Mock Firebase token for testing (in a real scenario, you'd get this from Firebase Auth)
const TEST_TOKEN = 'Bearer mock-token-for-testing';

// Test user UID
const TEST_UID = 'aZlm3SLXkYfNGq3CuDmWTbmO3gF3';

async function testReportEndpoints() {
  console.log('🌐 Testing Report API Endpoints...\n');

  try {
    // Test 1: Get report types
    console.log('1. Testing GET /api/reports/types');
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/types`, {
        headers: { Authorization: TEST_TOKEN }
      });
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Failed:', error.response?.data || error.message);
    }

    // Test 2: Get overview stats
    console.log('\n2. Testing GET /api/reports/overview');
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/overview`, {
        headers: { Authorization: TEST_TOKEN }
      });
      console.log('✅ Response:', response.data);
    } catch (error) {
      console.log('❌ Failed:', error.response?.data || error.message);
    }

    // Test 3: List reports
    console.log('\n3. Testing GET /api/reports');
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`, {
        headers: { Authorization: TEST_TOKEN }
      });
      console.log('✅ Response:', {
        success: response.data.success,
        count: response.data.count,
        sampleReport: response.data.data[0]?.title || 'No reports found'
      });
    } catch (error) {
      console.log('❌ Failed:', error.response?.data || error.message);
    }

    // Test 4: Generate a new report synchronously
    console.log('\n4. Testing POST /api/reports/generate-sync');
    try {
      const response = await axios.post(`${API_BASE_URL}/reports/generate-sync`, {
        type: 'trip_analytics',
        title: 'Test Trip Analytics Report',
        filters: {
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-12-31'
          }
        }
      }, {
        headers: { 
          Authorization: TEST_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Response:', {
        success: response.data.success,
        reportId: response.data.data?._id,
        title: response.data.data?.title
      });
    } catch (error) {
      console.log('❌ Failed:', error.response?.data || error.message);
    }

    // Test 5: Generate report with invalid type
    console.log('\n5. Testing POST /api/reports/generate-sync with invalid type');
    try {
      const response = await axios.post(`${API_BASE_URL}/reports/generate-sync`, {
        type: 'invalid_report_type',
        title: 'Invalid Report'
      }, {
        headers: { 
          Authorization: TEST_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ This should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Correctly failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 API endpoint testing completed!');

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm start');
  }
}

// Instructions for running the test
console.log('📝 API Test Instructions:');
console.log('1. Start the server: npm start');
console.log('2. In another terminal, run: node test-api.js');
console.log('3. Note: This test uses mock authentication');
console.log('   In production, you\'d need a valid Firebase token\n');

if (require.main === module) {
  testReportEndpoints().catch(console.error);
}

module.exports = { testReportEndpoints };