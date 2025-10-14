const ReportController = require('./src/controllers/report.controller');

// Test the formatReportForExport method with sample data
const testReportFormatting = () => {
  console.log('🧪 Testing Report Export Formatting...\n');

  // Sample trip analytics report
  const tripReport = {
    _id: '64d9a8b3f1c2d4e5f6g7h8i9',
    title: 'Trip Analytics - October 2024',
    type: 'trip_analytics',
    generatedAt: new Date(),
    status: 'completed',
    data: {
      summary: {
        totalTrips: 15,
        avgTripDuration: 7.5,
        ecoFriendlyPercentage: 78,
        favoriteDestination: 'Costa Rica',
        estimatedCarbonFootprint: 2400,
        carbonSaved: 380,
        uniqueDestinations: 8
      },
      charts: [
        {
          title: 'Monthly Trips Distribution',
          type: 'bar',
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          data: [2, 3, 4, 3, 3]
        },
        {
          title: 'Trip Types Breakdown',
          type: 'pie',
          labels: ['Eco-Tourism', 'Adventure', 'Cultural', 'Beach'],
          data: [45, 25, 20, 10]
        },
        {
          title: 'Eco Score Trend',
          type: 'line',
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          data: [65, 72, 78, 82]
        }
      ]
    }
  };

  // Sample packing statistics report
  const packingReport = {
    _id: '64d9a8b3f1c2d4e5f6g7h8j0',
    title: 'Packing Statistics - October 2024',
    type: 'packing_statistics',
    generatedAt: new Date(),
    status: 'completed',
    data: {
      summary: {
        totalPackingLists: 25,
        completionRate: 85,
        ecoFriendlyPercentage: 67,
        topEcoItems: ['Bamboo Toothbrush', 'Solar Charger', 'Reusable Water Bottle'],
        aiUsagePercentage: 42
      },
      charts: [
        {
          title: 'Completion Rate Over Time',
          type: 'line',
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [80, 82, 87, 85]
        },
        {
          title: 'Eco Items Distribution',
          type: 'pie',
          labels: ['Eco Items', 'Regular Items'],
          data: [67, 33]
        }
      ]
    }
  };

  // Sample user activity report
  const userActivityReport = {
    _id: '64d9a8b3f1c2d4e5f6g7h8k1',
    title: 'User Activity - October 2024',
    type: 'user_activity',
    generatedAt: new Date(),
    status: 'completed',
    data: {
      summary: {
        totalPosts: 42,
        totalComments: 156,
        totalLikes: 398,
        avgLikesPerPost: 9.5,
        ecoPostsShared: 18,
        activeTopics: ['Sustainable Travel', 'Eco Products', 'Green Tips'],
        topUsers: ['EcoTraveler123', 'GreenNomad', 'SustainableJourney']
      },
      charts: [
        {
          title: 'Post Activity Over Time',
          type: 'bar',
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [8, 12, 15, 7]
        }
      ]
    }
  };

  // Test formatting for each report type
  const testCases = [
    { name: 'Trip Analytics', report: tripReport },
    { name: 'Packing Statistics', report: packingReport },
    { name: 'User Activity', report: userActivityReport }
  ];

  testCases.forEach(({ name, report }) => {
    console.log(`📊 Testing ${name} Report:`);
    console.log('Original report type:', report.type);
    
    const formatted = ReportController.formatReportForExport(report);
    
    console.log('✅ Formatted Summary Fields:');
    Object.keys(formatted.summary).forEach(key => {
      console.log(`   - ${key}: ${formatted.summary[key]}`);
    });
    
    console.log('📈 Charts included:', formatted.charts?.length || 0);
    formatted.charts?.forEach((chart, index) => {
      console.log(`   ${index + 1}. ${chart.title}`);
    });
    
    console.log('---\n');
  });

  console.log('🎉 Export formatting test completed!\n');

  // Test CSV generation
  console.log('📄 Testing CSV Generation...');
  const csvContent = ReportController.generateCSV(ReportController.formatReportForExport(tripReport));
  console.log('CSV Preview (first 500 chars):');
  console.log(csvContent.substring(0, 500) + '...\n');

  console.log('✅ All tests completed successfully!');
};

// Run the test
try {
  testReportFormatting();
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}