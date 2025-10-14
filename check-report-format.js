const mongoose = require('mongoose');
const ReportService = require('./src/services/report.service');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/packlightly');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test to check current report format
const checkReportFormat = async () => {
  try {
    console.log('\n🔄 Checking Current Report Format\n');

    // Test user ID
    const testUserUid = 'test-user-123'; 

    console.log('📊 Generating a sample report...');
    const report = await ReportService.generateTripAnalytics(testUserUid, {});
    
    console.log('\n📋 CURRENT REPORT STRUCTURE:');
    console.log('=====================================');
    console.log('Report Type:', report.type);
    console.log('Report Title:', report.title);
    console.log('Owner UID:', report.ownerUid);
    
    console.log('\n📊 DATA STRUCTURE:');
    console.log('Data Object Keys:', Object.keys(report.data || {}));
    
    if (report.data?.summary) {
      console.log('\n📈 SUMMARY FIELDS:');
      console.log(Object.keys(report.data.summary));
    }
    
    if (report.data?.charts) {
      console.log('\n📊 CHARTS:');
      report.data.charts.forEach((chart, index) => {
        console.log(`  Chart ${index + 1}: ${chart.title} (${chart.type})`);
      });
    }
    
    if (report.data?.details) {
      console.log('\n🔍 DETAILS STRUCTURE:');
      console.log('Details Keys:', Object.keys(report.data.details));
    }
    
    console.log('\n🗂️ OTHER REPORT FIELDS:');
    const otherFields = Object.keys(report).filter(key => 
      !['data', '_id', '__v', 'createdAt', 'updatedAt'].includes(key)
    );
    console.log(otherFields);
    
    console.log('\n📄 FULL REPORT SAMPLE (First 500 chars):');
    console.log(JSON.stringify(report, null, 2).substring(0, 500) + '...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
};

// Run the test
(async () => {
  await connectDB();
  await checkReportFormat();
})();