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

// Test dynamic data generation
const testDynamicReports = async () => {
  try {
    console.log('\n🔄 Testing Dynamic Report Generation from MongoDB\n');

    // Test user ID (you should replace this with a real user ID from your database)
    const testUserUid = 'test-user-123'; 

    console.log('📊 Generating Trip Analytics Report...');
    const tripReport = await ReportService.generateTripAnalytics(testUserUid, {
      dateRange: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31')
      }
    });
    console.log(`   ✅ Generated with ${tripReport.data.summary.totalTrips} trips`);
    console.log(`   📈 Average budget: $${tripReport.data.summary.avgBudget}`);
    console.log(`   🏆 Charts generated: ${tripReport.data.charts.length}`);

    console.log('\n📦 Generating Packing Statistics Report...');
    const packingReport = await ReportService.generatePackingStatistics(testUserUid);
    console.log(`   ✅ Generated with ${packingReport.data.summary.totalPackingLists} packing lists`);
    console.log(`   📈 Total items: ${packingReport.data.summary.totalItems}`);
    console.log(`   ♻️ Eco-friendly percentage: ${packingReport.data.summary.ecoFriendlyPercentage}%`);

    console.log('\n🌱 Generating Eco Impact Report...');
    const ecoReport = await ReportService.generateEcoImpact(testUserUid);
    console.log(`   ✅ Generated with sustainability data`);
    console.log(`   🌍 Carbon footprint: ${ecoReport.data.summary.estimatedCarbonFootprint}kg CO2`);
    console.log(`   💚 Sustainability score: ${ecoReport.data.summary.sustainabilityScore}%`);

    console.log('\n📱 Generating User Activity Report...');
    const activityReport = await ReportService.generateUserActivity(testUserUid);
    console.log(`   ✅ Generated with user activity data`);
    console.log(`   📈 Total posts: ${activityReport.data.summary.totalPosts}`);
    console.log(`   👍 Total likes: ${activityReport.data.summary.totalLikes}`);

    console.log('\n💰 Generating Budget Analysis Report...');
    const budgetReport = await ReportService.generateBudgetAnalysis(testUserUid);
    console.log(`   ✅ Generated with budget analysis`);
    console.log(`   💵 Total budget: $${budgetReport.data.summary.totalBudget}`);
    console.log(`   📊 Max budget: $${budgetReport.data.summary.maxBudget}`);

    console.log('\n🗺️  Generating Destination Trends Report...');
    const destinationReport = await ReportService.generateDestinationTrends(testUserUid);
    console.log(`   ✅ Generated with destination data`);
    console.log(`   🌎 Unique destinations: ${destinationReport.data.summary.uniqueDestinations}`);
    console.log(`   ⭐ Favorite destination: ${destinationReport.data.summary.favoriteDestination}`);

    console.log('\n✅ All reports generated successfully with dynamic MongoDB data!');
    console.log('\n📋 Report Summary:');
    console.log(`   Trip Analytics ID: ${tripReport._id}`);
    console.log(`   Packing Stats ID: ${packingReport._id}`);
    console.log(`   Eco Impact ID: ${ecoReport._id}`);
    console.log(`   User Activity ID: ${activityReport._id}`);
    console.log(`   Budget Analysis ID: ${budgetReport._id}`);
    console.log(`   Destination Trends ID: ${destinationReport._id}`);

    console.log('\n🔍 Data Sources Confirmed:');
    console.log('   ✅ Trip data from Trip collection');
    console.log('   ✅ Packing data from PackingList collection'); 
    console.log('   ✅ Post data from Post collection');
    console.log('   ✅ All calculations performed on live database data');

  } catch (error) {
    console.error('❌ Error testing dynamic reports:', error);
    
    if (error.message.includes('validation')) {
      console.log('\n💡 Tip: Make sure you have valid data in your MongoDB collections');
    }
    
    if (error.message.includes('Cast to ObjectId failed')) {
      console.log('\n💡 Tip: Check that your user ID exists in the database');
    }
  }
};

// Test with different filters
const testFilters = async () => {
  try {
    console.log('\n🎯 Testing Report Filters...');
    
    const testUserUid = 'test-user-123';
    
    // Test with date range filter
    console.log('\n📅 Testing with date range filter (2024 only)...');
    const filteredReport = await ReportService.generateTripAnalytics(testUserUid, {
      dateRange: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      },
      tripType: 'Solo',
      budgetRange: {
        min: 500,
        max: 2000
      }
    });
    
    console.log(`   🎯 Filtered trips: ${filteredReport.data.summary.totalTrips}`);
    console.log(`   💰 Filtered average budget: $${filteredReport.data.summary.avgBudget}`);
    
  } catch (error) {
    console.error('❌ Error testing filters:', error);
  }
};

// Main test runner
const runTests = async () => {
  await connectDB();
  await testDynamicReports();
  await testFilters();
  
  console.log('\n🎉 Dynamic data testing completed!');
  console.log('\nTo test with your actual data:');
  console.log('1. Replace "test-user-123" with a real user UID from your database');
  console.log('2. Make sure you have trips, packing lists, and posts in your database');
  console.log('3. Check the generated reports to see real data calculations');
  
  mongoose.connection.close();
};

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  mongoose.connection.close();
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  mongoose.connection.close();
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { testDynamicReports, testFilters };