/**
 * Test script for analytics helper functions
 * Run with: node test-analytics.js
 */

const AnalyticsHelper = require('./src/utils/analyticsHelper');

function testAnalyticsHelper() {
  console.log('🧮 Testing Analytics Helper Functions...\n');

  // Test 1: Calculate percentage
  console.log('1. Testing calculatePercentage()');
  const percentage = AnalyticsHelper.calculatePercentage(25, 100);
  console.log(`25 out of 100 = ${percentage}%`);
  console.log(`Edge case (0 total): ${AnalyticsHelper.calculatePercentage(5, 0)}%\n`);

  // Test 2: Calculate average
  console.log('2. Testing calculateAverage()');
  const values = [10, 20, 30, 40, 50];
  const average = AnalyticsHelper.calculateAverage(values);
  console.log(`Average of [${values.join(', ')}] = ${average}`);
  console.log(`Edge case (empty array): ${AnalyticsHelper.calculateAverage([])}\n`);

  // Test 3: Group by function
  console.log('3. Testing groupBy()');
  const sampleTrips = [
    { destination: 'Bali', type: 'Family' },
    { destination: 'Tokyo', type: 'Solo' },
    { destination: 'Bali', type: 'Couple' },
    { destination: 'Paris', type: 'Family' }
  ];
  const groupedByDestination = AnalyticsHelper.groupBy(sampleTrips, 'destination');
  console.log('Grouped by destination:', Object.keys(groupedByDestination));

  // Test 4: Count occurrences
  console.log('\n4. Testing countOccurrences()');
  const destinations = ['Bali', 'Tokyo', 'Bali', 'Paris', 'Bali'];
  const counts = AnalyticsHelper.countOccurrences(destinations);
  console.log('Destination counts:', counts);

  // Test 5: Filter by date range
  console.log('\n5. Testing filterByDateRange()');
  const sampleData = [
    { name: 'Trip 1', startDate: '2025-01-15' },
    { name: 'Trip 2', startDate: '2025-03-20' },
    { name: 'Trip 3', startDate: '2025-06-10' },
    { name: 'Trip 4', startDate: '2025-09-05' }
  ];
  const filtered = AnalyticsHelper.filterByDateRange(
    sampleData, 
    'startDate', 
    '2025-03-01', 
    '2025-08-31'
  );
  console.log(`Filtered trips (Mar-Aug): ${filtered.map(t => t.name).join(', ')}`);

  // Test 6: Group by month
  console.log('\n6. Testing groupByMonth()');
  const monthlyData = AnalyticsHelper.groupByMonth(sampleData, 'startDate');
  console.log('Monthly trip counts:', monthlyData);

  // Test 7: Calculate trend
  console.log('\n7. Testing calculateTrend()');
  const trendData = [10, 15, 12, 18, 25, 30];
  const trend = AnalyticsHelper.calculateTrend(trendData);
  console.log(`Trend for [${trendData.join(', ')}]:`, trend);

  // Test 8: Get top items
  console.log('\n8. Testing getTopItems()');
  const itemCounts = { 'Bali': 5, 'Tokyo': 3, 'Paris': 8, 'London': 2 };
  const topItems = AnalyticsHelper.getTopItems(itemCounts, 3);
  console.log('Top 3 destinations:', topItems);

  // Test 9: Calculate statistics
  console.log('\n9. Testing calculateStats()');
  const budgets = [500, 1000, 1500, 800, 1200, 2000, 600];
  const stats = AnalyticsHelper.calculateStats(budgets);
  console.log('Budget statistics:', {
    count: stats.count,
    average: stats.average,
    min: stats.min,
    max: stats.max,
    median: stats.median
  });

  // Test 10: Format large numbers
  console.log('\n10. Testing formatLargeNumber()');
  console.log(`1000 = ${AnalyticsHelper.formatLargeNumber(1000)}`);
  console.log(`15000 = ${AnalyticsHelper.formatLargeNumber(15000)}`);
  console.log(`2500000 = ${AnalyticsHelper.formatLargeNumber(2500000)}`);

  // Test 11: Generate color palette
  console.log('\n11. Testing generateColorPalette()');
  const colors = AnalyticsHelper.generateColorPalette(5);
  console.log('Color palette for 5 items:', colors);

  // Test 12: Validate date range
  console.log('\n12. Testing validateDateRange()');
  const validRange = AnalyticsHelper.validateDateRange('2025-01-01', '2025-12-31');
  const invalidRange = AnalyticsHelper.validateDateRange('2025-12-31', '2025-01-01');
  console.log('Valid range:', validRange);
  console.log('Invalid range:', invalidRange);

  // Test 13: Generate sample data
  console.log('\n13. Testing generateSampleData()');
  const generatedTrips = AnalyticsHelper.generateSampleData('trips', 3);
  console.log('Sample trips:', generatedTrips.map(t => `${t.destination} (${t.type})`));

  console.log('\n🎉 Analytics helper testing completed!');
}

// Run the test
if (require.main === module) {
  testAnalyticsHelper();
}

module.exports = { testAnalyticsHelper };