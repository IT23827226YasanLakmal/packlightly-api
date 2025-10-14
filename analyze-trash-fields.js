require('dotenv').config();
const mongoose = require('mongoose');
const ReportService = require('./src/services/report.service');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Analyze actual field values for trash data
const analyzeTrashFields = async () => {
  try {
    // Get a real user ID
    const Trip = require('./src/models/Trip');
    const sampleTrip = await Trip.findOne();
    const testUserUid = sampleTrip ? sampleTrip.ownerUid : 'test-user';

    console.log('🗑️  ANALYZING TRASH FIELDS AND VALUES\n');
    
    const reportTypes = ['trip_analytics', 'packing_statistics', 'user_activity'];
    
    for (const reportType of reportTypes) {
      try {
        console.log(`\n📊 Analyzing ${reportType.toUpperCase()}...`);
        
        const report = await ReportService.generateReport(reportType, testUserUid);
        
        console.log('\n🔍 TRASH FIELD ANALYSIS:');
        
        // Analyze summary fields
        if (report.data.summary) {
          console.log('\n   📋 SUMMARY FIELDS:');
          analyzeObjectForTrash(report.data.summary, '   summary');
        }
        
        // Analyze details fields  
        if (report.data.details) {
          console.log('\n   📋 DETAILS FIELDS:');
          analyzeObjectForTrash(report.data.details, '   details', 2); // Limit depth
        }
        
        // Check for unnecessary database fields
        if (reportType === 'trip_analytics' && report.data.details?.travelPatterns) {
          console.log('\n   🗄️  DATABASE FIELD POLLUTION:');
          const longestTrip = report.data.details.travelPatterns.longestTrip;
          const shortestTrip = report.data.details.travelPatterns.shortestTrip;
          
          if (longestTrip) {
            console.log('     LONGEST TRIP OBJECT CONTAINS:');
            Object.keys(longestTrip).forEach(key => {
              console.log(`       - ${key}: ${typeof longestTrip[key]} ${Array.isArray(longestTrip[key]) ? '(array)' : ''}`);
            });
          }
          
          if (shortestTrip) {
            console.log('     SHORTEST TRIP OBJECT CONTAINS:');
            Object.keys(shortestTrip).forEach(key => {
              console.log(`       - ${key}: ${typeof shortestTrip[key]} ${Array.isArray(shortestTrip[key]) ? '(array)' : ''}`);
            });
          }
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🧹 SPECIFIC TRASH FIELDS IDENTIFIED:');
    console.log('='.repeat(60));
    
    console.log('\n1. DATABASE POLLUTION IN TRIP_ANALYTICS:');
    console.log('   - details.travelPatterns.longestTrip._id (MongoDB ObjectId)');
    console.log('   - details.travelPatterns.longestTrip.__v (Mongoose version key)');
    console.log('   - details.travelPatterns.longestTrip.createdAt (raw timestamp)');
    console.log('   - details.travelPatterns.longestTrip.updatedAt (raw timestamp)');
    console.log('   - details.travelPatterns.shortestTrip._id (MongoDB ObjectId)');
    console.log('   - details.travelPatterns.shortestTrip.__v (Mongoose version key)');
    console.log('   - details.travelPatterns.shortestTrip.createdAt (raw timestamp)');
    console.log('   - details.travelPatterns.shortestTrip.updatedAt (raw timestamp)');
    console.log('   - details.travelPatterns.longestTrip.ownerUid (duplicate user ID)');
    console.log('   - details.travelPatterns.shortestTrip.ownerUid (duplicate user ID)');

    console.log('\n2. REDUNDANT CALCULATIONS:');
    console.log('   - summary.avgStayDuration (same as avgTripDuration)');
    console.log('   - summary.bestCategory vs summary.mostCommonItem (similar purpose)');
    console.log('   - summary.ecoItemsCount vs summary.totalItems (can calculate percentage)');

    console.log('\n3. HARDCODED/DEFAULT VALUES:');
    console.log('   - favoriteDestination: "None" (should be null)');
    console.log('   - recommendations: default fallback text');
    console.log('   - Empty arrays for unavailable data');

    console.log('\n4. OVERLY DETAILED NESTED OBJECTS:');
    console.log('   - Full weather object in trip data (too detailed for reports)');
    console.log('   - Complete passenger breakdowns (not needed in summary)');
    console.log('   - Full category breakdowns when only totals needed');

    console.log('\n5. CALCULATIONS THAT SHOULD BE SIMPLIFIED:');
    console.log('   - Math.round(value * 10) / 10 (overly precise for reports)');
    console.log('   - Complex nested reduce operations for simple sums');
    console.log('   - Repeated similar calculations across different report types');

  } catch (error) {
    console.error('❌ Analysis error:', error);
  }
};

function analyzeObjectForTrash(obj, prefix = '', maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth || !obj || typeof obj !== 'object') return;
  
  Object.entries(obj).forEach(([key, value]) => {
    const fullPath = `${prefix}.${key}`;
    
    // Check for trash patterns
    if (value === 'None' || value === 'Unknown') {
      console.log(`     ❌ HARDCODED DEFAULT: ${fullPath} = "${value}"`);
    }
    
    if (value === 0 && key.includes('total')) {
      console.log(`     ⚠️  ZERO TOTAL: ${fullPath} = 0 (might be meaningless)`);
    }
    
    if (Array.isArray(value) && value.length === 0) {
      console.log(`     📭 EMPTY ARRAY: ${fullPath} = [] (consider null)`);
    }
    
    if (key.includes('_id') || key.includes('__v') || key.includes('createdAt') || key.includes('updatedAt')) {
      console.log(`     🗄️  DB FIELD: ${fullPath} (raw database field in report)`);
    }
    
    if (typeof value === 'number' && value.toString().includes('.') && value.toString().split('.')[1].length > 2) {
      console.log(`     🔢 OVERLY PRECISE: ${fullPath} = ${value} (too many decimals)`);
    }
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      analyzeObjectForTrash(value, fullPath, maxDepth, currentDepth + 1);
    }
  });
}

// Main function
const main = async () => {
  await connectDB();
  await analyzeTrashFields();
  mongoose.connection.close();
  console.log('\n✅ Trash field analysis complete!');
};

main().catch(console.error);