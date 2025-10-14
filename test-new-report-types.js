// Test for new report categories: eco_inventory and news_section
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/reports';

async function testNewReportTypes() {
  console.log('🧪 Testing New Report Categories...\n');

  try {
    console.log('1. Testing Report Types Endpoint');
    const typesResponse = await axios.get(`${BASE_URL}/types`);
    console.log('✅ Status:', typesResponse.status);
    
    const reportTypes = typesResponse.data.data;
    console.log('📋 Total Report Types:', reportTypes.length);
    
    // Check for new report types
    const ecoInventory = reportTypes.find(type => type.value === 'eco_inventory');
    const newsSection = reportTypes.find(type => type.value === 'news_section');
    
    if (ecoInventory) {
      console.log('✅ Eco Inventory report type found:');
      console.log('   Label:', ecoInventory.label);
      console.log('   Description:', ecoInventory.description);
    } else {
      console.log('❌ Eco Inventory report type NOT found');
    }
    
    if (newsSection) {
      console.log('✅ News Section report type found:');
      console.log('   Label:', newsSection.label);
      console.log('   Description:', newsSection.description);
    } else {
      console.log('❌ News Section report type NOT found');
    }
    
    console.log('\n📋 All available report types:');
    reportTypes.forEach(type => {
      console.log(`   - ${type.value}: ${type.label}`);
    });
    
  } catch (error) {
    console.log('❌ Error testing report types:', error.response?.status, error.response?.data?.message || error.message);
  }
}

// Run the test
if (require.main === module) {
  testNewReportTypes().then(() => {
    console.log('\n🎉 Test completed!');
  }).catch(console.error);
}

module.exports = { testNewReportTypes };