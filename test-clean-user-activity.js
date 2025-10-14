// Test script to verify cleaned user activity data
const ReportService = require('./src/services/report.service');

async function testCleanUserActivity() {
    try {
        console.log('Testing User Activity Report Generation...\n');
        
        // Test with a sample user ID
        const testUserId = 'aZlm3SLXkYfNGq3CuDmWTbmO3gF3';
        
        // Generate the report
        const report = await ReportService.generateReport('user_activity', testUserId, {});
        
        console.log('Generated Report Structure:');
        console.log('='.repeat(50));
        
        // Print summary fields
        console.log('\nSUMMARY FIELDS:');
        if (report.data.summary) {
            Object.keys(report.data.summary).forEach(key => {
                console.log(`  ${key}: ${report.data.summary[key]}`);
            });
        }
        
        // Print chart info
        console.log('\nCHARTS:');
        if (report.data.charts) {
            report.data.charts.forEach((chart, index) => {
                console.log(`  Chart ${index + 1}: ${chart.title} (${chart.type})`);
            });
        }
        
        // Print details fields
        console.log('\nDETAILS FIELDS:');
        if (report.data.details) {
            Object.keys(report.data.details).forEach(key => {
                if (key === 'recentActivity') {
                    console.log(`  ${key}: Array with ${report.data.details[key].length} items`);
                    if (report.data.details[key].length > 0) {
                        console.log(`    Sample item keys: [${Object.keys(report.data.details[key][0]).join(', ')}]`);
                    }
                } else {
                    console.log(`  ${key}: ${report.data.details[key]}`);
                }
            });
        }
        
        // Check for any unwanted fields
        console.log('\nCHECKING FOR TRASH FIELDS:');
        const trashFields = [
            'totalBudget', 'avgTripDuration', 'ecoFriendlyPercentage', 'completionRate',
            'estimatedCarbonFootprint', 'carbonSaved', 'ecoPostsShared', 'sustainabilityScore',
            'uniqueDestinations', 'avgStayDuration', 'returnVisits', 'totalEcoProducts',
            'avgEcoRating', 'sustainableProducts', 'totalNewsArticles', 'recentArticles',
            'avgBudget', 'maxBudget', 'minBudget'
        ];
        
        let foundTrashFields = [];
        trashFields.forEach(field => {
            if (report.data.summary && report.data.summary.hasOwnProperty(field)) {
                foundTrashFields.push(field);
            }
        });
        
        if (foundTrashFields.length > 0) {
            console.log(`  ❌ Found trash fields: ${foundTrashFields.join(', ')}`);
        } else {
            console.log('  ✅ No trash fields found!');
        }
        
        console.log('\n='.repeat(50));
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testCleanUserActivity();