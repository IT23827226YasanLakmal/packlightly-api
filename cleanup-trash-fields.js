require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

// Cleanup plan for unnecessary fields
const CLEANUP_PLAN = {
  // Database pollution fields to remove
  DATABASE_FIELDS_TO_REMOVE: [
    '_id',
    '__v', 
    'createdAt',
    'updatedAt',
    'ownerUid' // when it duplicates the report ownerUid
  ],

  // Redundant calculations to remove
  REDUNDANT_FIELDS: {
    'trip_analytics': [
      'summary.avgStayDuration', // duplicate of avgTripDuration
    ],
    'packing_statistics': [
      'summary.bestCategory', // can be derived from categoryBreakdown
      'summary.ecoItemsCount', // redundant with ecoPercentage
      'summary.aiSuggestedCount' // redundant with aiUsagePercentage
    ],
    'user_activity': [
      'summary.totalComments' // if not used in calculations
    ]
  },

  // Hardcoded values to replace with null
  HARDCODED_VALUES_TO_CLEAN: [
    'None',
    'Unknown', 
    'N/A'
  ],

  // Overly precise numbers to round
  PRECISION_FIELDS: [
    'avgTripDuration',
    'avgBudget', 
    'avgItemsPerList',
    'completionRate',
    'ecoPercentage'
  ]
};

console.log('🧹 REPORT FIELD CLEANUP UTILITY');
console.log('================================\n');

// Function to clean up trip objects in reports
function cleanTripObject(tripObj) {
  if (!tripObj || typeof tripObj !== 'object') return tripObj;
  
  const cleaned = { ...tripObj };
  
  // Remove database-specific fields
  CLEANUP_PLAN.DATABASE_FIELDS_TO_REMOVE.forEach(field => {
    delete cleaned[field];
  });
  
  // Simplify weather object if present
  if (cleaned.weather) {
    cleaned.weather = {
      condition: cleaned.weather.condition,
      description: cleaned.weather.description,
      temperature: cleaned.weather.highTemp ? 
        `${cleaned.weather.lowTemp}°-${cleaned.weather.highTemp}°` : 
        cleaned.weather.description
    };
  }
  
  // Simplify passengers if present
  if (cleaned.passengers) {
    cleaned.passengers = cleaned.passengers.total || 
      (cleaned.passengers.adults + cleaned.passengers.children);
  }
  
  return cleaned;
}

// Function to clean up any object recursively
function cleanReportObject(obj, reportType = null) {
  if (!obj || typeof obj !== 'object') {
    // Clean hardcoded values
    if (typeof obj === 'string' && CLEANUP_PLAN.HARDCODED_VALUES_TO_CLEAN.includes(obj)) {
      return null;
    }
    
    // Round overly precise numbers
    if (typeof obj === 'number' && obj % 1 !== 0) {
      const str = obj.toString();
      if (str.includes('.') && str.split('.')[1].length > 2) {
        return Math.round(obj * 100) / 100; // 2 decimal places max
      }
    }
    
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanReportObject(item, reportType)).filter(item => item !== null);
  }
  
  const cleaned = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    // Skip redundant fields for specific report types
    if (reportType && CLEANUP_PLAN.REDUNDANT_FIELDS[reportType]?.includes(`summary.${key}`)) {
      console.log(`   🗑️  Removing redundant field: summary.${key}`);
      return;
    }
    
    if (reportType && CLEANUP_PLAN.REDUNDANT_FIELDS[reportType]?.includes(`details.${key}`)) {
      console.log(`   🗑️  Removing redundant field: details.${key}`);
      return;
    }
    
    // Clean trip objects specifically
    if ((key === 'longestTrip' || key === 'shortestTrip') && value) {
      cleaned[key] = cleanTripObject(value);
      console.log(`   🧹 Cleaned trip object: ${key}`);
      return;
    }
    
    // Recursively clean nested objects
    cleaned[key] = cleanReportObject(value, reportType);
  });
  
  return cleaned;
}

// Create cleaned version of reportFieldsConfig
function createCleanedFieldsConfig() {
  console.log('📋 Creating cleaned reportFieldsConfig...');
  
  const originalConfig = require('./src/config/reportFieldsConfig.js');
  const cleanedConfig = { ...originalConfig };
  
  // Remove redundant fields from configuration
  Object.keys(CLEANUP_PLAN.REDUNDANT_FIELDS).forEach(reportType => {
    if (cleanedConfig[reportType]) {
      const redundantFields = CLEANUP_PLAN.REDUNDANT_FIELDS[reportType];
      
      redundantFields.forEach(fieldPath => {
        const fieldName = fieldPath.split('.').pop();
        
        // Remove from mandatory array
        cleanedConfig[reportType].mandatory = cleanedConfig[reportType].mandatory
          .filter(field => !field.endsWith(fieldName));
        
        // Remove from optional array  
        cleanedConfig[reportType].optional = cleanedConfig[reportType].optional
          .filter(field => !field.endsWith(fieldName));
      });
      
      console.log(`   ✅ Cleaned ${reportType} config`);
    }
  });
  
  // Write cleaned config to new file
  const configContent = `// Cleaned Report Field Configuration
// Unnecessary and redundant fields have been removed

module.exports = ${JSON.stringify(cleanedConfig, null, 2)};`;
  
  fs.writeFileSync('./src/config/reportFieldsConfig.cleaned.js', configContent);
  console.log('   💾 Saved cleaned config to reportFieldsConfig.cleaned.js\n');
}

// Generate cleanup suggestions for report service
function generateServiceCleanupSuggestions() {
  console.log('🔧 REPORT SERVICE CLEANUP SUGGESTIONS:');
  console.log('=====================================\n');
  
  console.log('1. TRIP ANALYTICS CLEANUP:');
  console.log('   • Remove avgStayDuration calculation (duplicate of avgTripDuration)');
  console.log('   • Clean trip objects before adding to travelPatterns:');
  console.log('     - Remove _id, __v, createdAt, updatedAt, ownerUid');
  console.log('     - Simplify weather object to essential fields only');
  console.log('     - Simplify passengers to just total count');
  console.log('   • Replace "None" with null for favoriteDestination');
  
  console.log('\n2. PACKING STATISTICS CLEANUP:');
  console.log('   • Remove bestCategory (derive from categoryBreakdown[0])');
  console.log('   • Remove ecoItemsCount (redundant with ecoPercentage)');
  console.log('   • Remove aiSuggestedCount (redundant with aiUsagePercentage)');
  console.log('   • Simplify precision for percentages to 1 decimal place');
  
  console.log('\n3. USER ACTIVITY CLEANUP:');
  console.log('   • Consider removing totalComments if not used in calculations');
  console.log('   • Clean recent activity objects to remove DB fields');
  
  console.log('\n4. GLOBAL OPTIMIZATIONS:');
  console.log('   • Standardize number precision to 2 decimal places maximum');
  console.log('   • Replace hardcoded "None"/"Unknown" with null values');
  console.log('   • Remove empty arrays, replace with null');
  console.log('   • Add field filtering based on includeOptionals parameter');
  
  console.log('\n5. CONFIGURATION UPDATES:');
  console.log('   • Update reportFieldsConfig to remove redundant fields');
  console.log('   • Add validation for required vs optional field usage');
  console.log('   • Document field purposes and calculations');
}

// Generate specific code fixes
function generateCodeFixes() {
  console.log('\n📝 SPECIFIC CODE FIXES NEEDED:');
  console.log('==============================\n');
  
  const fixes = [
    {
      file: 'src/services/report.service.js',
      method: 'generateTripAnalytics',
      line: '~330',
      issue: 'Remove avgStayDuration calculation',
      fix: 'Delete the avgStayDuration property from summary object'
    },
    {
      file: 'src/services/report.service.js', 
      method: 'generateTripAnalytics',
      line: '~460',
      issue: 'Clean trip objects in travelPatterns',
      fix: 'Apply cleanTripObject() function before assigning longestTrip/shortestTrip'
    },
    {
      file: 'src/services/report.service.js',
      method: 'generatePackingStatistics', 
      line: '~550',
      issue: 'Remove redundant bestCategory field',
      fix: 'Remove bestCategory from summary, derive from categoryBreakdown when needed'
    },
    {
      file: 'src/services/report.service.js',
      method: 'generatePackingStatistics',
      line: '~560', 
      issue: 'Remove redundant count fields',
      fix: 'Remove ecoItemsCount and aiSuggestedCount from summary'
    },
    {
      file: 'src/config/reportFieldsConfig.js',
      issue: 'Update field configurations',
      fix: 'Remove redundant fields from mandatory/optional arrays'
    }
  ];
  
  fixes.forEach((fix, index) => {
    console.log(`${index + 1}. ${fix.file}`);
    if (fix.method) console.log(`   Method: ${fix.method} (around line ${fix.line})`);
    console.log(`   Issue: ${fix.issue}`);
    console.log(`   Fix: ${fix.fix}\n`);
  });
}

// Main function
const main = async () => {
  createCleanedFieldsConfig();
  generateServiceCleanupSuggestions();
  generateCodeFixes();
  
  console.log('✅ Cleanup analysis complete!');
  console.log('\nNext steps:');
  console.log('1. Review the cleaned reportFieldsConfig.cleaned.js');
  console.log('2. Apply the suggested code fixes to report.service.js');
  console.log('3. Test the reports with the cleaned configuration');
  console.log('4. Update any frontend code that depends on removed fields');
};

main().catch(console.error);