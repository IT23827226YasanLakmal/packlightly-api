/**
 * Debug script for 400 error on POST /api/reports/generate
 * This will help identify what's causing the bad request error
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/reports';

// Test different scenarios that might cause 400 error
async function debug400Error() {
  console.log('🔍 Debugging POST /api/reports/generate 400 Error...\n');

  // First, get available types
  console.log('1. Getting available report types...');
  try {
    const typesResponse = await axios.get(`${BASE_URL}/types`);
    const validTypes = typesResponse.data.data.map(t => t.value);
    console.log('✅ Valid types:', validTypes.join(', '));
    console.log();
  } catch (error) {
    console.log('❌ Failed to get types:', error.message);
    return;
  }

  // Test scenarios that might cause 400 errors
  const testCases = [
    {
      name: 'Missing type field',
      body: {},
      expectedError: 'Report type is required'
    },
    {
      name: 'Invalid type value',
      body: { type: 'invalid_type' },
      expectedError: 'Invalid report type'
    },
    {
      name: 'Invalid date range (end before start)',
      body: { 
        type: 'trip_analytics',
        filters: {
          dateRange: {
            startDate: '2025-12-31',
            endDate: '2025-01-01'
          }
        }
      },
      expectedError: 'Start date must be before end date'
    },
    {
      name: 'Valid request with minimal data',
      body: { type: 'trip_analytics' },
      expectedError: null
    },
    {
      name: 'Valid request with title',
      body: { 
        type: 'trip_analytics',
        title: 'Debug Test Report'
      },
      expectedError: null
    },
    {
      name: 'Valid request with filters',
      body: { 
        type: 'trip_analytics',
        title: 'Filtered Debug Report',
        filters: {
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-12-31'
          },
          tripType: 'Solo'
        }
      },
      expectedError: null
    }
  ];

  // NOTE: These tests will fail with 401 (Unauthorized) because we don't have a valid Firebase token
  // But they will help identify the request format that should work

  for (const testCase of testCases) {
    console.log(`2.${testCases.indexOf(testCase) + 1} Testing: ${testCase.name}`);
    console.log('   Request body:', JSON.stringify(testCase.body, null, 2));
    
    try {
      const response = await axios.post(`${BASE_URL}/generate`, testCase.body, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (testCase.expectedError) {
        console.log('   ⚠️  Expected error but got success:', response.status);
      } else {
        console.log('   ✅ Success:', response.status);
      }
      
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 401) {
        console.log('   🔒 Expected 401 (No auth token provided)');
      } else if (status === 400) {
        console.log('   ❌ 400 Error:', message);
        if (testCase.expectedError && message.includes(testCase.expectedError)) {
          console.log('   ✅ Error matches expected:', testCase.expectedError);
        }
      } else {
        console.log('   ❓ Unexpected error:', status, message);
      }
    }
    console.log();
  }

  console.log('📋 Common causes of 400 errors:');
  console.log('   1. Missing "type" field in request body');
  console.log('   2. Invalid report type (not one of: trip_analytics, packing_statistics, user_activity, eco_impact, budget_analysis, destination_trends)');
  console.log('   3. Invalid date range in filters (startDate after endDate)');
  console.log('   4. Malformed JSON in request body');
  console.log('   5. Missing Content-Type: application/json header');
  console.log();
  
  console.log('🔧 To fix your request, ensure:');
  console.log('   1. Include Authorization: Bearer <your-firebase-token> header');
  console.log('   2. Include Content-Type: application/json header');
  console.log('   3. Request body contains: { "type": "trip_analytics" } at minimum');
  console.log('   4. If using filters, ensure valid date format (YYYY-MM-DD)');
  console.log();
  
  console.log('📝 Example working request:');
  console.log(`
  curl -X POST http://localhost:5000/api/reports/generate \\
    -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \\
    -H "Content-Type: application/json" \\
    -d '{
      "type": "trip_analytics",
      "title": "My Trip Report",
      "filters": {
        "dateRange": {
          "startDate": "2025-01-01",
          "endDate": "2025-12-31"
        }
      }
    }'
  `);
}

debug400Error().catch(console.error);