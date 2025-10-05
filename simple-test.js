const axios = require('axios');

async function testReportAPI() {
  console.log('🧪 Testing Report API...\n');
  
  try {
    // Test the report types endpoint
    console.log('Testing GET /api/reports/types');
    const response = await axios.get('http://localhost:5000/api/reports/types');
    
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', response.data.success);
    console.log('✅ Message:', response.data.message);
    console.log('✅ Report Types Found:', response.data.data.length);
    
    console.log('\n📋 Available Report Types:');
    response.data.data.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type.label} (${type.value})`);
      console.log(`      ${type.description}`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status || 'No response');
    console.log('❌ Message:', error.response?.data?.message || error.message);
  }
}

testReportAPI();