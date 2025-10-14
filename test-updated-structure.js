// Test to verify the updated report controller is using enhanced service
const Report = require('./src/models/Report');

console.log('🔍 Testing Report Model Configuration');
console.log('=====================================');

// Test getReportTypes method
try {
  console.log('\n📊 Available Report Types:');
  if (Report.getReportTypes) {
    const types = Report.getReportTypes();
    types.forEach((type, index) => {
      console.log(`  ${index + 1}. ${type.value} - ${type.label}`);
    });
    console.log(`\n✅ Total report types: ${types.length}`);
    
    // Check if new types are included
    const typeValues = types.map(t => t.value);
    const hasEcoInventory = typeValues.includes('eco_inventory');
    const hasNewsSection = typeValues.includes('news_section');
    
    console.log(`✅ Has eco_inventory: ${hasEcoInventory}`);
    console.log(`✅ Has news_section: ${hasNewsSection}`);
    
    if (hasEcoInventory && hasNewsSection) {
      console.log('\n🎉 SUCCESS: Report model includes new report types!');
    } else {
      console.log('\n❌ ISSUE: Missing new report types');
    }
  } else {
    console.log('❌ getReportTypes method not found');
  }
} catch (error) {
  console.error('❌ Error testing report types:', error.message);
}

console.log('\n📋 Report Schema Enum Values:');
try {
  // Access the schema enum values
  const schema = Report.schema;
  const typeField = schema.paths.type;
  if (typeField && typeField.enumValues) {
    console.log('  Enum values:', typeField.enumValues);
    console.log(`  Total enum values: ${typeField.enumValues.length}`);
  } else {
    console.log('  Could not access enum values');
  }
} catch (error) {
  console.error('❌ Error accessing schema:', error.message);
}

console.log('\n🔄 Testing Controller Service Import...');
try {
  const ReportController = require('./src/controllers/report.controller');
  console.log('✅ Report controller loaded successfully');
  
  const EnhancedReportService = require('./src/services/enhancedReport.service');
  console.log('✅ Enhanced report service loaded successfully');
  
  // Check if enhanced service has the required methods
  const methods = [
    'generateTripAnalyticsReport',
    'generatePackingStatisticsReport', 
    'generateUserActivityReport',
    'generateEcoImpactReport',
    'generateBudgetAnalysisReport',
    'generateDestinationTrendsReport',
    'generateEcoInventoryReport',
    'generateNewsSectionReport'
  ];
  
  console.log('\n📊 Enhanced Service Methods:');
  methods.forEach(method => {
    const exists = typeof EnhancedReportService[method] === 'function';
    console.log(`  ${method}: ${exists ? '✅' : '❌'}`);
  });
  
} catch (error) {
  console.error('❌ Error loading services:', error.message);
}

console.log('\n🏁 Test completed!');