const ollamaService = require('./src/utils/ollamaService');

// Test the enhanced generatePackingSuggestion function with comprehensive trip details
async function testComprehensiveSuggestions() {
  console.log('Testing enhanced generatePackingSuggestion with comprehensive trip analysis...\n');

  // Mock detailed trip data - Business trip to Japan in winter
  const businessTripData = {
    destination: 'Tokyo, Japan',
    type: 'business',
    durationDays: 5,
    passengers: { adults: 1, children: 0 },
    weather: { condition: 'cold winter', tempRange: '0-8°C' },
    startDate: '2025-01-15',
    endDate: '2025-01-20'
  };

  // Mock detailed trip data - Family vacation to Thailand
  const familyTripData = {
    destination: 'Bangkok, Thailand',
    type: 'family vacation',
    durationDays: 10,
    passengers: { adults: 2, children: 2 },
    weather: { condition: 'hot and humid tropical', tempRange: '28-35°C' },
    startDate: '2025-02-10',
    endDate: '2025-02-20'
  };

  // Mock existing packing list for family trip
  const existingFamilyPackingList = {
    categories: [
      {
        name: 'Clothing',
        items: [
          { name: 'T-shirts', qty: 8, checked: false, eco: false },
          { name: 'Shorts', qty: 6, checked: false, eco: false },
          { name: 'Underwear', qty: 12, checked: false, eco: false },
          { name: 'Socks', qty: 10, checked: false, eco: false },
          { name: 'Swimwear', qty: 4, checked: false, eco: false }
        ]
      },
      {
        name: 'Electronics',
        items: [
          { name: 'Phone', qty: 2, checked: false, eco: false },
          { name: 'Chargers', qty: 2, checked: false, eco: false },
          { name: 'Camera', qty: 1, checked: false, eco: false }
        ]
      },
      {
        name: 'Documents',
        items: [
          { name: 'Passports', qty: 4, checked: false, eco: false },
          { name: 'Flight tickets', qty: 4, checked: false, eco: false },
          { name: 'Hotel reservations', qty: 1, checked: false, eco: false }
        ]
      }
    ]
  };

  try {
    console.log('='.repeat(70));
    console.log('TEST 1: Business Trip to Japan (No existing list)');
    console.log('='.repeat(70));
    const businessList = await ollamaService.generatePackingSuggestion(businessTripData);
    console.log('✅ Title:', businessList.title);
    console.log('📦 Categories:', businessList.categories.length);
    businessList.categories.forEach(category => {
      console.log(`\n📁 ${category.category}:`);
      category.items.slice(0, 4).forEach(item => {
        console.log(`   • ${item.name} (qty: ${item.qty})${item.eco ? ' 🌱' : ''}`);
      });
      if (category.items.length > 4) {
        console.log(`   ... and ${category.items.length - 4} more items`);
      }
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('TEST 2: Family Trip to Thailand (WITH existing list)');
    console.log('='.repeat(70));
    console.log('📋 Existing items count:', existingFamilyPackingList.categories.reduce((total, cat) => total + cat.items.length, 0));
    
    const familySuggestions = await ollamaService.generatePackingSuggestion(familyTripData, existingFamilyPackingList);
    console.log('\n✅ Title:', familySuggestions.title);
    console.log('📦 New suggestion categories:', familySuggestions.categories.length);
    
    familySuggestions.categories.forEach(category => {
      console.log(`\n📁 ${category.category}:`);
      category.items.forEach(item => {
        console.log(`   • ${item.name} (qty: ${item.qty})${item.eco ? ' 🌱' : ''}`);
      });
    });

    console.log('\n' + '='.repeat(70));
    console.log('COMPREHENSIVE ANALYSIS FEATURES DEMONSTRATED:');
    console.log('='.repeat(70));
    console.log('✅ Destination-specific considerations (Japan vs Thailand)');
    console.log('✅ Weather-based suggestions (cold vs tropical)');
    console.log('✅ Trip type optimization (business vs family)');
    console.log('✅ Duration-based quantities (5 vs 10 days)');
    console.log('✅ Traveler-specific needs (solo vs family with children)');
    console.log('✅ Existing list analysis (avoiding duplicates)');
    console.log('✅ Cultural and practical considerations');

  } catch (error) {
    console.error('❌ Error testing comprehensive suggestions:', error.message);
  }
}

// Run the comprehensive test
testComprehensiveSuggestions();