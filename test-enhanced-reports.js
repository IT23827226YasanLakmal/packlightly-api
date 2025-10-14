// Test Enhanced Report Formats
// This file demonstrates how to test the new standardized report formats

const axios = require('axios');

// Base URL for the API (adjust as needed)
const BASE_URL = 'http://localhost:3000/api';

// Test configuration
const testConfig = {
  // Sample user for testing (use a real user ID in actual testing)
  userUid: 'test_user_123',
  
  // Test filters
  filters: {
    dateRange: {
      startDate: '2025-09-01',
      endDate: '2025-10-31'
    },
    tripType: 'Solo',
    destination: 'Ella'
  }
};

/**
 * Test all enhanced report formats
 */
async function testEnhancedReports() {
  console.log('🧪 Testing Enhanced Report Formats\n');

  const reportTypes = [
    'trip_analytics',
    'packing_statistics', 
    'user_activity',
    'eco_impact',
    'budget_analysis',
    'destination_trends',
    'eco_inventory',
    'news_section'
  ];

  for (const type of reportTypes) {
    console.log(`\n📊 Testing ${type} report...`);
    
    try {
      // Test sample data generation
      await testSampleReport(type);
      
      // Test enhanced report generation (would need auth token)
      // await testEnhancedReportGeneration(type);
      
    } catch (error) {
      console.error(`❌ Error testing ${type}:`, error.message);
    }
  }
}

/**
 * Test sample report data generation
 */
async function testSampleReport(type) {
  try {
    const response = await axios.get(`${BASE_URL}/reports/sample/${type}`);
    
    if (response.data.success) {
      console.log(`✅ Sample ${type} report generated successfully`);
      console.log(`   - Title: ${response.data.data.title}`);
      console.log(`   - Summary fields: ${Object.keys(response.data.data.data.summary).length}`);
      console.log(`   - Charts: ${response.data.data.data.charts.length}`);
      console.log(`   - Validation: ${response.data.validation.isValid ? 'PASS' : 'FAIL'}`);
      
      if (!response.data.validation.isValid) {
        console.log(`   - Errors: ${response.data.validation.errors.join(', ')}`);
      }
    } else {
      console.log(`❌ Failed to generate sample ${type} report`);
    }
  } catch (error) {
    console.error(`❌ Sample ${type} request failed:`, error.response?.data?.message || error.message);
  }
}

/**
 * Test enhanced report generation (requires authentication)
 */
async function testEnhancedReportGeneration(type, authToken) {
  try {
    const requestData = {
      type,
      filters: testConfig.filters,
      title: `Test ${type} Report - ${new Date().toLocaleDateString()}`
    };

    const response = await axios.post(
      `${BASE_URL}/reports/enhanced`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log(`✅ Enhanced ${type} report generated successfully`);
      console.log(`   - Report ID: ${response.data.data._id}`);
      console.log(`   - Size: ${response.data.metadata.estimatedSize}`);
      console.log(`   - Validation: ${response.data.validation.isValid ? 'PASS' : 'FAIL'}`);
    } else {
      console.log(`❌ Failed to generate enhanced ${type} report`);
    }
  } catch (error) {
    console.error(`❌ Enhanced ${type} request failed:`, error.response?.data?.message || error.message);
  }
}

/**
 * Test report formats specification
 */
async function testReportFormats() {
  console.log('\n📋 Testing Report Formats Specification...');
  
  try {
    const response = await axios.get(`${BASE_URL}/reports/formats`);
    
    if (response.data.success) {
      console.log('✅ Report formats specification retrieved successfully');
      console.log(`   - Available types: ${response.data.data.availableTypes.length}`);
      console.log(`   - Common structure defined: ${Object.keys(response.data.data.commonStructure).length} sections`);
      
      response.data.data.availableTypes.forEach(type => {
        console.log(`   - ${type.type}: ${type.summaryFields.length} summary fields, ${type.chartTypes.length} chart types`);
      });
    } else {
      console.log('❌ Failed to retrieve report formats specification');
    }
  } catch (error) {
    console.error('❌ Report formats request failed:', error.response?.data?.message || error.message);
  }
}

/**
 * Test report validation
 */
function testReportValidation() {
  console.log('\n🔍 Testing Report Validation...');
  
  const ReportFormatHelpers = require('./src/utils/reportFormatHelpers');
  
  // Test valid report structure
  const validReport = {
    ownerUid: 'test_user',
    title: 'Test Report',
    type: 'trip_analytics',
    filters: {
      dateRange: {
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-31')
      }
    },
    data: {
      summary: { totalTrips: 5 },
      charts: [
        {
          type: 'bar',
          title: 'Test Chart',
          data: [1, 2, 3],
          labels: ['A', 'B', 'C']
        }
      ],
      details: {}
    }
  };
  
  const validation = ReportFormatHelpers.validateReportStructure(validReport);
  console.log(`✅ Valid report validation: ${validation.isValid ? 'PASS' : 'FAIL'}`);
  
  // Test invalid report structure
  const invalidReport = {
    ownerUid: '',
    title: '',
    type: 'invalid_type',
    data: {
      summary: {},
      charts: [
        {
          type: 'invalid_chart',
          title: 'Test Chart',
          data: [1, 2, 3],
          labels: ['A', 'B'] // Mismatched length
        }
      ]
    }
  };
  
  const invalidValidation = ReportFormatHelpers.validateReportStructure(invalidReport);
  console.log(`✅ Invalid report validation: ${!invalidValidation.isValid ? 'PASS' : 'FAIL'}`);
  console.log(`   - Errors found: ${invalidValidation.errors.length}`);
}

/**
 * Test chart data validation
 */
function testChartValidation() {
  console.log('\n📈 Testing Chart Validation...');
  
  const ReportFormatHelpers = require('./src/utils/reportFormatHelpers');
  
  try {
    // Valid chart data
    ReportFormatHelpers.validateChartData([1, 2, 3], ['A', 'B', 'C']);
    console.log('✅ Valid chart data validation: PASS');
    
    // Invalid chart data (mismatched lengths)
    try {
      ReportFormatHelpers.validateChartData([1, 2, 3], ['A', 'B']);
      console.log('❌ Invalid chart data validation should have failed');
    } catch (error) {
      console.log('✅ Invalid chart data validation: PASS (correctly caught error)');
    }
    
    // Create chart config
    const chart = ReportFormatHelpers.createChartConfig('bar', 'Test Chart', [1, 2, 3], ['A', 'B', 'C']);
    console.log('✅ Chart config creation: PASS');
    console.log(`   - Chart type: ${chart.type}, Title: ${chart.title}, Data points: ${chart.data.length}`);
    
  } catch (error) {
    console.error('❌ Chart validation test failed:', error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Enhanced Report Format Tests\n');
  console.log('=' .repeat(50));
  
  // Test report formats specification
  await testReportFormats();
  
  // Test sample reports
  await testEnhancedReports();
  
  // Test validation functions
  testReportValidation();
  testChartValidation();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ All tests completed!\n');
  
  console.log('📝 Next Steps:');
  console.log('1. Start your server: npm run start');
  console.log('2. Test sample reports: GET /api/reports/sample/trip_analytics');
  console.log('3. Test formats spec: GET /api/reports/formats');
  console.log('4. Generate enhanced reports: POST /api/reports/enhanced');
  console.log('5. Check the REPORT_FORMATS_SPECIFICATION.md for complete documentation');
}

// Example usage for manual testing
function showUsageExamples() {
  console.log('\n📖 Usage Examples:\n');
  
  console.log('1. Get sample trip analytics report:');
  console.log('   GET /api/reports/sample/trip_analytics\n');
  
  console.log('2. Generate enhanced packing statistics report:');
  console.log(`   POST /api/reports/enhanced
   Body: {
     "type": "packing_statistics",
     "filters": {
       "dateRange": {
         "startDate": "2025-09-01",
         "endDate": "2025-10-31"
       }
     },
     "title": "October Packing Analysis"
   }\n`);
   
  console.log('3. Get all available report formats:');
  console.log('   GET /api/reports/formats\n');
  
  console.log('4. Export report as PDF:');
  console.log('   GET /api/reports/export/{reportId}/pdf\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testEnhancedReports,
  testSampleReport,
  testEnhancedReportGeneration,
  testReportFormats,
  testReportValidation,
  testChartValidation,
  runAllTests,
  showUsageExamples
};