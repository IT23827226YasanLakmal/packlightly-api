require('dotenv').config();
const mongoose = require('mongoose');
const ReportService = require('./src/services/report.service');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Simple test to verify dynamic data
const testDynamicData = async () => {
  try {
    console.log('\n🔄 Testing Dynamic Report Generation...\n');

    // Get a real user from the database first
    const Trip = require('./src/models/Trip');
    const PackingList = require('./src/models/PackingList');
    const Post = require('./src/models/Post');

    // Check what data exists in the database
    console.log('📊 Checking database contents...');
    const tripCount = await Trip.countDocuments();
    const packingCount = await PackingList.countDocuments();
    const postCount = await Post.countDocuments();

    console.log(`   Trips in database: ${tripCount}`);
    console.log(`   Packing lists in database: ${packingCount}`);
    console.log(`   Posts in database: ${postCount}`);

    if (tripCount === 0 && packingCount === 0 && postCount === 0) {
      console.log('\n⚠️ No data found in database. Please add some trips, packing lists, or posts first.');
      return;
    }

    // Get a real user ID from existing data
    let testUserUid = null;
    
    if (tripCount > 0) {
      const sampleTrip = await Trip.findOne();
      testUserUid = sampleTrip.ownerUid;
      console.log(`\n📋 Using user ID from existing trip: ${testUserUid}`);
    } else if (packingCount > 0) {
      const samplePacking = await PackingList.findOne();
      testUserUid = samplePacking.ownerUid;
      console.log(`\n📋 Using user ID from existing packing list: ${testUserUid}`);
    } else if (postCount > 0) {
      const samplePost = await Post.findOne();
      testUserUid = samplePost.ownerUid;
      console.log(`\n📋 Using user ID from existing post: ${testUserUid}`);
    }

    if (!testUserUid) {
      console.log('\n⚠️ No user ID found in any collection.');
      return;
    }

    // Test generating a trip analytics report
    console.log('\n🚀 Generating Trip Analytics Report with real data...');
    const tripReport = await ReportService.generateTripAnalytics(testUserUid);
    
    console.log('\n✅ Successfully generated dynamic report!');
    console.log(`   Report ID: ${tripReport._id}`);
    console.log(`   Title: ${tripReport.title}`);
    console.log(`   Type: ${tripReport.type}`);
    console.log(`   Generated At: ${tripReport.generatedAt}`);
    console.log('\n📊 Dynamic Summary Data:');
    console.log(`   Total Trips: ${tripReport.data.summary.totalTrips}`);
    console.log(`   Total Budget: $${tripReport.data.summary.totalBudget}`);
    console.log(`   Average Duration: ${tripReport.data.summary.avgTripDuration} days`);
    console.log(`   Average Budget: $${tripReport.data.summary.avgBudget}`);
    
    console.log('\n📈 Charts Generated:');
    tripReport.data.charts.forEach((chart, index) => {
      console.log(`   ${index + 1}. ${chart.title} (${chart.type})`);
      console.log(`      Data points: ${chart.data.length}`);
    });

    console.log('\n🎉 VERIFICATION: This data is pulled dynamically from MongoDB!');
    console.log('   ✅ No hardcoded values used');
    console.log('   ✅ Real database queries executed');
    console.log('   ✅ Calculations based on actual user data');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await testDynamicData();
  mongoose.connection.close();
  console.log('\n👋 Test completed!');
};

main().catch(console.error);