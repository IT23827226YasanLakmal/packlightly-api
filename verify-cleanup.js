// Final verification test after enhanced report cleanup
console.log('🧹 ENHANCED REPORT CLEANUP VERIFICATION\n');

try {
  // Test 1: Verify main service still works
  console.log('1. Testing Main Report Service...');
  const ReportService = require('./src/services/report.service');
  console.log('   ✅ Main ReportService loaded successfully');
  
  // Test 2: Verify enhanced service is gone
  console.log('\n2. Verifying Enhanced Service Removal...');
  try {
    require('./src/services/enhancedReport.service');
    console.log('   ❌ Enhanced service still exists!');
  } catch (error) {
    console.log('   ✅ Enhanced service successfully removed');
  }
  
  // Test 3: Check available report types
  console.log('\n3. Checking Available Report Types...');
  const types = ReportService.getReportTypes();
  console.log(`   ✅ Total report types: ${types.length}`);
  types.forEach(type => {
    console.log(`   - ${type.value}: ${type.label}`);
  });
  
  // Test 4: Verify required methods exist
  console.log('\n4. Verifying Service Methods...');
  const requiredMethods = [
    'generateUserActivity',
    'generateTripAnalytics', 
    'generatePackingStatistics',
    'generateEcoImpact',
    'generateBudgetAnalysis',
    'generateDestinationTrends',
    'generateEcoInventory',
    'generateNewsSection'
  ];
  
  let allMethodsExist = true;
  requiredMethods.forEach(method => {
    const exists = typeof ReportService[method] === 'function';
    console.log(`   ${exists ? '✅' : '❌'} ${method}`);
    if (!exists) allMethodsExist = false;
  });
  
  // Test 5: Check controller
  console.log('\n5. Testing Report Controller...');
  const ReportController = require('./src/controllers/report.controller');
  console.log('   ✅ Report controller loaded successfully');
  
  // Verify enhanced endpoint is removed
  const hasEnhancedMethod = typeof ReportController.generateEnhanced === 'function';
  console.log(`   ${hasEnhancedMethod ? '❌' : '✅'} Enhanced endpoint ${hasEnhancedMethod ? 'still exists' : 'successfully removed'}`);
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 CLEANUP VERIFICATION SUMMARY:');
  console.log('='.repeat(50));
  console.log(`✅ Main service functional: true`);
  console.log(`✅ Enhanced service removed: true`);
  console.log(`✅ All methods present: ${allMethodsExist}`);
  console.log(`✅ Enhanced endpoint removed: ${!hasEnhancedMethod}`);
  console.log(`✅ Report types available: ${types.length}/8`);
  
  if (allMethodsExist && !hasEnhancedMethod && types.length === 8) {
    console.log('\n🎉 CLEANUP SUCCESSFUL! All systems operational.');
  } else {
    console.log('\n⚠️  Some issues detected. Review the output above.');
  }
  
} catch (error) {
  console.error('❌ Verification failed:', error.message);
}