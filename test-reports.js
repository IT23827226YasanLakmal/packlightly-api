/**
 * Test script for report generation functionality
 * Run with: node test-reports.js
 */

const mongoose = require('mongoose');
const ReportService = require('./src/services/report.service');
const connectDB = require('./src/config/db');

// Test data
const testOwnerUid = "aZlm3SLXkYfNGq3CuDmWTbmO3gF3";

async function testReportGeneration() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database successfully');

    console.log('\n📊 Testing Report Generation...\n');

    // Test 1: Get available report types
    console.log('1. Testing getReportTypes()...');
    const reportTypes = ReportService.getReportTypes();
    console.log('Available report types:', reportTypes.map(t => t.value));

    // Test 2: Generate Trip Analytics Report
    console.log('\n2. Generating Trip Analytics Report...');
    try {
      const tripReport = await ReportService.generateTripAnalytics(testOwnerUid);
      console.log('✅ Trip Analytics Report generated:', {
        id: tripReport._id,
        title: tripReport.title,
        totalTrips: tripReport.data.summary.totalTrips,
        avgBudget: tripReport.data.summary.avgBudget
      });
    } catch (error) {
      console.log('❌ Trip Analytics Report failed:', error.message);
    }

    // Test 3: Generate Packing Statistics Report
    console.log('\n3. Generating Packing Statistics Report...');
    try {
      const packingReport = await ReportService.generatePackingStatistics(testOwnerUid);
      console.log('✅ Packing Statistics Report generated:', {
        id: packingReport._id,
        title: packingReport.title,
        totalLists: packingReport.data.summary.totalPackingLists,
        completionRate: packingReport.data.summary.completionRate
      });
    } catch (error) {
      console.log('❌ Packing Statistics Report failed:', error.message);
    }

    // Test 4: Generate Eco Impact Report
    console.log('\n4. Generating Eco Impact Report...');
    try {
      const ecoReport = await ReportService.generateEcoImpact(testOwnerUid);
      console.log('✅ Eco Impact Report generated:', {
        id: ecoReport._id,
        title: ecoReport.title,
        ecoPercentage: ecoReport.data.summary.ecoFriendlyPercentage,
        carbonSaved: ecoReport.data.summary.carbonSaved
      });
    } catch (error) {
      console.log('❌ Eco Impact Report failed:', error.message);
    }

    // Test 5: Generate User Activity Report
    console.log('\n5. Generating User Activity Report...');
    try {
      const activityReport = await ReportService.generateUserActivity(testOwnerUid);
      console.log('✅ User Activity Report generated:', {
        id: activityReport._id,
        title: activityReport.title,
        totalTrips: activityReport.data.summary.totalTrips,
        totalPosts: activityReport.data.summary.totalPosts
      });
    } catch (error) {
      console.log('❌ User Activity Report failed:', error.message);
    }

    // Test 6: Generate Budget Analysis Report
    console.log('\n6. Generating Budget Analysis Report...');
    try {
      const budgetReport = await ReportService.generateBudgetAnalysis(testOwnerUid);
      console.log('✅ Budget Analysis Report generated:', {
        id: budgetReport._id,
        title: budgetReport.title,
        totalBudget: budgetReport.data.summary.totalBudget,
        avgBudget: budgetReport.data.summary.avgBudget
      });
    } catch (error) {
      console.log('❌ Budget Analysis Report failed:', error.message);
    }

    // Test 7: List generated reports
    console.log('\n7. Listing all reports for user...');
    try {
      const reports = await ReportService.list(testOwnerUid);
      console.log(`✅ Found ${reports.length} reports:`);
      reports.forEach(report => {
        console.log(`   - ${report.type}: ${report.title} (${report.generatedAt.toISOString()})`);
      });
    } catch (error) {
      console.log('❌ List reports failed:', error.message);
    }

    // Test 8: Test generic generateReport method
    console.log('\n8. Testing generic generateReport method...');
    try {
      const genericReport = await ReportService.generateReport('trip_analytics', testOwnerUid, {
        dateRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31')
        }
      });
      console.log('✅ Generic report generation successful:', {
        id: genericReport._id,
        type: genericReport.type,
        filters: genericReport.filters
      });
    } catch (error) {
      console.log('❌ Generic report generation failed:', error.message);
    }

    console.log('\n🎉 Report generation testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the test
if (require.main === module) {
  testReportGeneration().catch(console.error);
}

module.exports = { testReportGeneration };