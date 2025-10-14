require('dotenv').config();
const mongoose = require('mongoose');
const ReportService = require('./src/services/report.service');
const reportFieldsConfig = require('./src/config/reportFieldsConfig');

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

// Analyze fields in all report types
const analyzeUnnecessaryFields = async () => {
  try {
    // Get a real user ID
    const Trip = require('./src/models/Trip');
    const sampleTrip = await Trip.findOne();
    const testUserUid = sampleTrip ? sampleTrip.ownerUid : 'test-user';

    console.log('🔍 ANALYZING UNNECESSARY FIELDS IN REPORT TYPES\n');
    console.log('=' * 60);

    const reportTypes = [
      'trip_analytics',
      'packing_statistics', 
      'user_activity',
      'eco_impact',
      'budget_analysis',
      'destination_trends',
      'eco_inventory',
      'news_insights',
      'community_analytics'
    ];

    const unnecessaryFields = {};
    const duplicateFields = {};
    const redundantFields = {};

    for (const reportType of reportTypes) {
      try {
        console.log(`\n📊 Analyzing ${reportType.toUpperCase()} report...`);
        
        const report = await ReportService.generateReport(reportType, testUserUid);
        const config = reportFieldsConfig[reportType];
        
        if (!config) {
          console.log(`   ⚠️  No field configuration found for ${reportType}`);
          continue;
        }

        const actualFields = extractFieldPaths(report.data);
        const configuredFields = [...config.mandatory, ...config.optional];
        
        // Find fields that exist in actual data but not in config
        const unconfiguredFields = actualFields.filter(field => 
          !configuredFields.includes(field)
        );

        // Find potential duplicate/similar fields
        const duplicates = findDuplicateFields(actualFields);
        
        // Find redundant calculations
        const redundant = findRedundantFields(report.data);

        console.log(`   📝 Total actual fields: ${actualFields.length}`);
        console.log(`   ⚙️  Configured fields: ${configuredFields.length}`);
        console.log(`   ❌ Unconfigured fields: ${unconfiguredFields.length}`);
        console.log(`   🔄 Potential duplicates: ${duplicates.length}`);
        console.log(`   📊 Redundant calculations: ${redundant.length}`);

        if (unconfiguredFields.length > 0) {
          unnecessaryFields[reportType] = unconfiguredFields;
          console.log(`   🗑️  Unconfigured fields:`, unconfiguredFields.slice(0, 5));
        }

        if (duplicates.length > 0) {
          duplicateFields[reportType] = duplicates;
          console.log(`   🔄 Duplicate fields:`, duplicates.slice(0, 3));
        }

        if (redundant.length > 0) {
          redundantFields[reportType] = redundant;
          console.log(`   📊 Redundant fields:`, redundant.slice(0, 3));
        }

      } catch (error) {
        console.log(`   ❌ Error analyzing ${reportType}: ${error.message}`);
      }
    }

    // Generate cleanup recommendations
    console.log('\n' + '=' * 60);
    console.log('🧹 CLEANUP RECOMMENDATIONS');
    console.log('=' * 60);

    console.log('\n1. UNCONFIGURED FIELDS (not in reportFieldsConfig):');
    Object.entries(unnecessaryFields).forEach(([type, fields]) => {
      console.log(`\n   ${type}:`);
      fields.forEach(field => console.log(`     - ${field}`));
    });

    console.log('\n2. POTENTIAL DUPLICATE FIELDS:');
    Object.entries(duplicateFields).forEach(([type, duplicates]) => {
      console.log(`\n   ${type}:`);
      duplicates.forEach(dup => console.log(`     - ${dup.field1} ≈ ${dup.field2}`));
    });

    console.log('\n3. REDUNDANT CALCULATIONS:');
    Object.entries(redundantFields).forEach(([type, redundant]) => {
      console.log(`\n   ${type}:`);
      redundant.forEach(field => console.log(`     - ${field}`));
    });

    // Check for trash data patterns
    console.log('\n4. TRASH DATA PATTERNS:');
    const trashPatterns = await findTrashPatterns();
    trashPatterns.forEach(pattern => {
      console.log(`   - ${pattern}`);
    });

    console.log('\n5. OPTIMIZATION SUGGESTIONS:');
    console.log('   - Remove unconfigured fields from report generation');
    console.log('   - Consolidate duplicate fields (avgTripDuration vs avgStayDuration)');
    console.log('   - Remove redundant calculations that serve same purpose');
    console.log('   - Clean up empty or null value fields in summary data');
    console.log('   - Standardize field naming conventions');

  } catch (error) {
    console.error('❌ Analysis error:', error);
  }
};

// Extract all field paths from a nested object
function extractFieldPaths(obj, prefix = '') {
  const paths = [];
  
  if (!obj || typeof obj !== 'object') return paths;
  
  Object.keys(obj).forEach(key => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    paths.push(fullPath);
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      paths.push(...extractFieldPaths(obj[key], fullPath));
    }
  });
  
  return paths;
}

// Find potential duplicate fields
function findDuplicateFields(fields) {
  const duplicates = [];
  
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const field1 = fields[i];
      const field2 = fields[j];
      
      // Check for similar names
      if (areSimilarFields(field1, field2)) {
        duplicates.push({ field1, field2, similarity: 'naming' });
      }
    }
  }
  
  return duplicates;
}

// Check if two fields are similar
function areSimilarFields(field1, field2) {
  const words1 = field1.toLowerCase().split(/[._]/);
  const words2 = field2.toLowerCase().split(/[._]/);
  
  // Check for common patterns
  const similarPatterns = [
    ['avg', 'average'],
    ['total', 'count'],
    ['duration', 'stay'],
    ['eco', 'environment', 'sustainable'],
    ['trip', 'travel'],
    ['item', 'product']
  ];
  
  for (const pattern of similarPatterns) {
    if (pattern.some(word => words1.includes(word)) && 
        pattern.some(word => words2.includes(word))) {
      return true;
    }
  }
  
  return false;
}

// Find redundant calculations
function findRedundantFields(data) {
  const redundant = [];
  
  if (data.summary) {
    // Check for duplicate metrics with different names
    const summary = data.summary;
    
    if (summary.avgTripDuration && summary.avgStayDuration) {
      redundant.push('summary.avgStayDuration (duplicate of avgTripDuration)');
    }
    
    if (summary.totalItems && summary.ecoItemsCount && summary.aiSuggestedCount) {
      redundant.push('summary calculations that can be derived from others');
    }
    
    if (summary.ecoPercentage && summary.ecoFriendlyPercentage) {
      redundant.push('summary.ecoPercentage vs ecoFriendlyPercentage');
    }
  }
  
  return redundant;
}

// Find trash data patterns
async function findTrashPatterns() {
  const patterns = [];
  
  // Common trash patterns
  patterns.push('Empty string values in summary fields');
  patterns.push('Zero values for all users in optional metrics');
  patterns.push('Hardcoded "None" values instead of null/undefined');
  patterns.push('Calculations that always result in 0 due to missing data');
  patterns.push('Overly nested objects with single properties');
  patterns.push('Repeated data structures in different sections');
  patterns.push('Debug or development-only fields in production data');
  
  return patterns;
}

// Main function
const main = async () => {
  await connectDB();
  await analyzeUnnecessaryFields();
  mongoose.connection.close();
  console.log('\n✅ Analysis complete!');
};

main().catch(console.error);