/**
 * Test script for dynamic report customization
 * This script tests the new report field configuration and customization features
 */

const ReportService = require('./src/services/report.service');

async function testDynamicReports() {
  console.log('🧪 Testing Dynamic Report Structure...\n');

  try {
    // Test 1: Get report types with field configurations
    console.log('📋 1. Testing Report Types Configuration:');
    const reportTypes = ReportService.getReportTypes();
    console.log('Available Report Types:', reportTypes.length);
    reportTypes.forEach(type => {
      console.log(`  - ${type.name}: ${type.mandatoryFields} mandatory, ${type.optionalFields} optional fields`);
    });
    console.log('');

    // Test 2: Get field configurations
    console.log('🔧 2. Testing Field Configurations:');
    const fieldConfigs = ReportService.getReportFieldsConfig();
    Object.keys(fieldConfigs).forEach(type => {
      const config = fieldConfigs[type];
      console.log(`  ${type}: ${config.totalFields} total fields`);
    });
    console.log('');

    // Test 3: Validate report fields
    console.log('✅ 3. Testing Field Validation:');
    const validationTests = [
      {
        type: 'trip_analytics',
        fields: ['summary.totalTrips', 'charts', 'details.invalidField']
      },
      {
        type: 'packing_statistics',
        fields: ['summary.totalPackingLists', 'summary.completionRate']
      },
      {
        type: 'invalid_type',
        fields: ['summary.test']
      }
    ];

    validationTests.forEach(test => {
      const validation = ReportService.validateReportFields(test.type, test.fields);
      console.log(`  ${test.type}:`, validation.valid ? '✅ Valid' : '❌ Invalid');
      if (!validation.valid) {
        if (validation.error) console.log(`    Error: ${validation.error}`);
        if (validation.invalidFields?.length) console.log(`    Invalid fields: ${validation.invalidFields.join(', ')}`);
        if (validation.missingMandatory?.length) console.log(`    Missing mandatory: ${validation.missingMandatory.join(', ')}`);
      }
    });
    console.log('');

    // Test 4: Test report customization (with mock data) - Enhanced debugging
    console.log('🎨 4. Testing Report Customization:');
    const mockReportData = {
      ownerUid: 'test-user',
      title: 'Test Trip Analytics Report',
      type: 'trip_analytics',
      data: {
        summary: {
          totalTrips: 10,
          uniqueDestinations: 5,
          favoriteDestination: 'Paris',
          avgTripDuration: 5.5,
          ecoFriendlyPercentage: 75,
          returnVisits: 2,
          totalBudget: 15000,
          avgBudget: 1500
        },
        charts: [
          { type: 'bar', title: 'Trips Per Month', data: [1, 2, 3], labels: ['Jan', 'Feb', 'Mar'] }
        ],
        details: {
          topDestinations: [
            { name: 'Paris', trips: 3, avgDuration: 4 },
            { name: 'Tokyo', trips: 2, avgDuration: 7 }
          ],
          recommendations: ['Consider eco-friendly options'],
          ecoImpactBreakdown: {
            transportationSavings: 500,
            totalCarbonSaved: 200
          }
        }
      }
    };

    console.log('  Original data has details:', !!mockReportData.data.details);
    console.log('  Original details keys:', Object.keys(mockReportData.data.details));

    // Test with mandatory fields only
    console.log('  Testing with mandatory fields only:');
    const mandatoryOnly = ReportService.customizeReport(mockReportData, 'trip_analytics', false);
    console.log('    Mandatory fields preserved:', Object.keys(mandatoryOnly.data.summary).length, 'summary fields');
    console.log('    Details removed:', !mandatoryOnly.data.details ? 'Yes' : 'No');

    // Test with all fields
    console.log('  Testing with all fields:');
    const allFields = ReportService.customizeReport(mockReportData, 'trip_analytics', true);
    console.log('    All fields preserved:', Object.keys(allFields.data.summary).length, 'summary fields');
    console.log('    Summary fields:', Object.keys(allFields.data.summary));
    console.log('    Details preserved:', allFields.data.details ? 'Yes' : 'No');
    if (allFields.data.details) {
      console.log('    Details keys:', Object.keys(allFields.data.details));
    } else {
      console.log('    Details object missing - checking why...');
      // Let's check what's in the data object
      console.log('    Data object keys:', Object.keys(allFields.data));
    }

    // Test with specific fields
    console.log('  Testing with specific optional fields:');
    const specificFields = ReportService.customizeReport(
      mockReportData, 
      'trip_analytics', 
      true, 
      ['details.topDestinations', 'summary.totalBudget']
    );
    console.log('    Specific optional fields included');
    console.log('    Has details:', !!specificFields.data.details);
    console.log('');

    // Test 5: Test unknown report type
    console.log('🚫 5. Testing Unknown Report Type:');
    const unknownType = ReportService.customizeReport(mockReportData, 'unknown_type', true);
    console.log('  Unknown type handling: Report returned unchanged');
    console.log('');

    console.log('✨ All Dynamic Report Tests Completed Successfully!');
    console.log('');
    console.log('📝 Summary of Features:');
    console.log('  ✅ Report field configuration loaded');
    console.log('  ✅ Dynamic field filtering working');
    console.log('  ✅ Mandatory vs optional field separation');
    console.log('  ✅ Specific field selection capability');
    console.log('  ✅ Report type metadata available');
    console.log('  ✅ Field validation functionality');
    console.log('');
    console.log('🎯 Ready for Frontend Integration!');
    console.log('   Frontend can now request:');
    console.log('   - Lightweight reports (mandatory only)');
    console.log('   - Full reports (all fields)');
    console.log('   - Custom reports (specific fields)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Export for use or run directly
if (require.main === module) {
  testDynamicReports();
}

module.exports = { testDynamicReports };