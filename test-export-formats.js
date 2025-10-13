/**
 * Test script for enhanced report export functionality
 * Tests PDF and Excel export features
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/reports';

// You'll need to replace this with a valid Firebase token
const TEST_TOKEN = 'YOUR_FIREBASE_TOKEN_HERE';

async function testExportFormats() {
  console.log('🧪 Testing Enhanced Report Export Formats...\n');

  // First, get list of reports to find one to export
  try {
    console.log('1. Getting list of reports...');
    const reportsResponse = await axios.get(`${BASE_URL}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    if (reportsResponse.data.data.length === 0) {
      console.log('❌ No reports found. Please generate a report first.');
      return;
    }
    
    const testReport = reportsResponse.data.data[0];
    console.log(`✅ Found ${reportsResponse.data.data.length} reports. Testing with: ${testReport.title}`);
    console.log();
    
    const reportId = testReport._id;
    const formats = ['json', 'csv', 'pdf', 'excel'];
    
    // Test each export format
    for (const format of formats) {
      console.log(`2.${formats.indexOf(format) + 1} Testing ${format.toUpperCase()} export...`);
      
      try {
        const response = await axios.get(`${BASE_URL}/export/${reportId}/${format}`, {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`
          },
          responseType: format === 'json' ? 'json' : 'arraybuffer'
        });
        
        // Save file to test directory
        const filename = `test_report_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;
        const filepath = path.join(__dirname, 'test_exports', filename);
        
        // Create directory if it doesn't exist
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        if (format === 'json') {
          fs.writeFileSync(filepath, JSON.stringify(response.data, null, 2));
        } else {
          fs.writeFileSync(filepath, response.data);
        }
        
        console.log(`   ✅ ${format.toUpperCase()} export successful - saved as: ${filename}`);
        console.log(`   📁 File size: ${(response.data.length || JSON.stringify(response.data).length)} bytes`);
        
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        if (status === 401) {
          console.log(`   🔒 Auth required - update TEST_TOKEN in script`);
        } else if (status === 404) {
          console.log(`   ❌ Report not found: ${reportId}`);
        } else {
          console.log(`   ❌ Export failed (${status}): ${message}`);
        }
      }
      console.log();
    }
    
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    if (status === 401) {
      console.log('🔒 Authentication required. Please:');
      console.log('   1. Get a valid Firebase token');
      console.log('   2. Replace TEST_TOKEN in this script');
      console.log('   3. Run the script again');
    } else {
      console.log(`❌ Error: ${status} - ${message}`);
    }
  }
}

// Test format validation
async function testFormatValidation() {
  console.log('🔍 Testing format validation...\n');
  
  const invalidFormats = ['txt', 'doc', 'invalid'];
  const dummyReportId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
  
  for (const format of invalidFormats) {
    try {
      const response = await axios.get(`${BASE_URL}/export/${dummyReportId}/${format}`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      console.log(`   ⚠️  Unexpected success for ${format}`);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`   ✅ Correctly rejected invalid format: ${format}`);
      } else if (error.response?.status === 401) {
        console.log(`   🔒 Auth required (but format validation would work)`);
      } else {
        console.log(`   ❓ Unexpected error for ${format}: ${error.response?.status}`);
      }
    }
  }
}

// Example curl commands
function showExampleCommands() {
  console.log('\n📝 Example cURL commands for export:');
  console.log('');
  console.log('# JSON Export');
  console.log('curl -X GET "http://localhost:5000/api/reports/export/REPORT_ID/json" \\');
  console.log('  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"');
  console.log('');
  console.log('# CSV Export');
  console.log('curl -X GET "http://localhost:5000/api/reports/export/REPORT_ID/csv" \\');
  console.log('  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"');
  console.log('');
  console.log('# PDF Export');
  console.log('curl -X GET "http://localhost:5000/api/reports/export/REPORT_ID/pdf" \\');
  console.log('  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \\');
  console.log('  --output "report.pdf"');
  console.log('');
  console.log('# Excel Export');
  console.log('curl -X GET "http://localhost:5000/api/reports/export/REPORT_ID/excel" \\');
  console.log('  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \\');
  console.log('  --output "report.xlsx"');
  console.log('');
}

async function main() {
  if (TEST_TOKEN === 'YOUR_FIREBASE_TOKEN_HERE') {
    console.log('⚠️  Please update the TEST_TOKEN variable with a valid Firebase token');
    console.log('   You can get this from your frontend application or Firebase console');
    console.log('');
    showExampleCommands();
    return;
  }
  
  await testExportFormats();
  await testFormatValidation();
  showExampleCommands();
  
  console.log('🎉 Export testing completed!');
  console.log('📁 Check the test_exports folder for generated files');
}

main().catch(console.error);