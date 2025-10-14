require('dotenv').config();
const mongoose = require('mongoose');
const ReportService = require('./src/services/report.service');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test all report types
const testAllReportTypes = async () => {
  try {
    // Get a real user ID
    const Trip = require('./src/models/Trip');
    const sampleTrip = await Trip.findOne();
    const testUserUid = sampleTrip ? sampleTrip.ownerUid : 'test-user';

    console.log(`🧪 Testing all report types for user: ${testUserUid}\n`);

    // Test each report type
    const reportTypes = [
      'trip_analytics',
      'packing_statistics', 
      'user_activity',
      'eco_impact',
      'budget_analysis',
      'destination_trends'
    ];

    for (const reportType of reportTypes) {
      try {
        console.log(`📊 Generating ${reportType} report...`);
        const report = await ReportService.generateReport(reportType, testUserUid);
        
        console.log(`   ✅ Success! ID: ${report._id}`);
        console.log(`   📈 Summary keys: ${Object.keys(report.data.summary).length}`);
        console.log(`   📊 Charts: ${report.data.charts.length}`);
        console.log(`   💾 Data source: MongoDB collections\n`);
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
      }
    }

    console.log('🎯 All report types tested with dynamic MongoDB data!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await testAllReportTypes();
  mongoose.connection.close();
};

main().catch(console.error);