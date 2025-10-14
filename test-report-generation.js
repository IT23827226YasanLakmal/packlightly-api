// Test script to verify new report generation methods
const mongoose = require('mongoose');
require('dotenv').config();

async function testNewReportGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/packlightly');
    console.log('✅ Connected to MongoDB');

    const ReportService = require('./src/services/report.service');
    
    // Test dummy user ID
    const testUserId = 'test-user-123';
    
    console.log('\n🧪 Testing Eco Inventory Report Generation...');
    try {
      const ecoReport = await ReportService.generateReport('eco_inventory', testUserId, {});
      console.log('✅ Eco Inventory report generated successfully');
      console.log('   Report ID:', ecoReport._id);
      console.log('   Title:', ecoReport.title);
      console.log('   Type:', ecoReport.type);
      console.log('   Summary Keys:', Object.keys(ecoReport.data.summary));
    } catch (error) {
      console.log('❌ Error generating eco inventory report:', error.message);
    }

    console.log('\n🧪 Testing News Section Report Generation...');
    try {
      const newsReport = await ReportService.generateReport('news_section', testUserId, {});
      console.log('✅ News Section report generated successfully');
      console.log('   Report ID:', newsReport._id);
      console.log('   Title:', newsReport.title);
      console.log('   Type:', newsReport.type);
      console.log('   Summary Keys:', Object.keys(newsReport.data.summary));
    } catch (error) {
      console.log('❌ Error generating news section report:', error.message);
    }

    console.log('\n🧪 Testing Invalid Report Type...');
    try {
      await ReportService.generateReport('invalid_type', testUserId, {});
      console.log('⚠️  Unexpected success with invalid type');
    } catch (error) {
      console.log('✅ Correctly handled invalid report type:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testNewReportGeneration().then(() => {
    console.log('\n🎉 Test completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testNewReportGeneration };