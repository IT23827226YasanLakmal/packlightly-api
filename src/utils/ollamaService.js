const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

class OllamaService {
  constructor() {
    this.client = axios.create({
      baseURL: OLLAMA_BASE_URL,
      timeout: 0, // disable timeout for streaming
    });
  }
async generatePackingSuggestion(tripData, existingPackingList = null) {
  try {
    const prompt = this.createPackingPrompt(tripData, existingPackingList);

    // Regular (non-streaming) request
    const response = await this.client.post(
      '/api/chat',
      {
        model: 'qwen3:0.6b',
        stream: false, // Disable streaming
        messages: [
          {
            role: "system",
            content: existingPackingList 
              ? "You are an expert travel packing assistant with deep knowledge of global destinations, climates, cultures, and travel requirements. Analyze ALL trip details comprehensively - destination specifics, weather patterns, cultural norms, trip type requirements, duration impacts, and traveler demographics. You must ONLY suggest NEW items that are NOT already in the user's existing packing list. Output valid JSON with a 'title' and 'categories' array containing only intelligent, destination-specific new suggestions that fill gaps in the existing packing list."
              : "You are an expert travel packing assistant with comprehensive knowledge of global destinations, climates, cultures, and travel logistics. Analyze ALL trip details - destination characteristics, weather conditions, cultural requirements, trip type specifics, duration considerations, and traveler needs - to create a complete, intelligent packing list. Output valid JSON with a 'title' and 'categories' array with appropriate quantities and eco-friendly options where applicable.",
          },
          { role: "user", content: prompt },
        ],
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }
    );

    // Directly access the complete response
    const aiResponse = response.data;
    console.log('Ollama AI Response:', aiResponse);
    
    // Parse and return the packing list
    const parsedList = this.parsePackingList(aiResponse, existingPackingList);
    return parsedList;
    
  } catch (error) {
    console.error('Ollama API error:', error.message);
    throw new Error('Failed to generate packing suggestions');
  }
}

  createPackingPrompt(tripData, existingPackingList = null) {
    let existingItemsText = '';
    
    if (existingPackingList && existingPackingList.categories) {
      existingItemsText = '\n\nEXISTING PACKING LIST (DO NOT SUGGEST THESE ITEMS AGAIN):\n';
      existingPackingList.categories.forEach(category => {
        existingItemsText += `${category.name}: ${category.items.map(item => item.name).join(', ')}\n`;
      });
      existingItemsText += '\nONLY suggest NEW items that are NOT in the existing list above.\n';
    }

    const basePrompt = `
Create ${existingPackingList ? 'intelligent additional NEW' : 'a comprehensive, destination-optimized'} packing suggestions for a ${tripData.type} trip to ${tripData.destination}.
${existingPackingList ? 'Analyze the existing packing list and identify missing essentials based on the comprehensive trip analysis below.' : 'Provide a creative, destination-specific title that reflects the trip purpose and location.'}

DETAILED TRIP ANALYSIS:

🌍 DESTINATION: ${tripData.destination}
📅 DATES: ${tripData.startDate} to ${tripData.endDate} (${tripData.durationDays} days)
🎯 PURPOSE: ${tripData.type}
👥 TRAVELERS: ${tripData.passengers.adults} adults, ${tripData.passengers.children} children
🌤️ WEATHER: ${tripData.weather.condition}, Temperature: ${tripData.weather.tempRange}

CRITICAL CONSIDERATIONS:
1. Destination Climate & Culture: Local customs, dress codes, seasonal weather patterns
2. Trip Duration Impact: Laundry availability, medication quantities, entertainment needs
3. Weather Specifics: Layer requirements, protection needs, comfort items
4. Trip Type Requirements: Business/leisure/adventure specific gear and attire
5. Traveler Demographics: Adult work needs, children's comfort and entertainment
6. Local Infrastructure: Electrical adapters, connectivity, transportation needs
7. Health & Safety: Destination-specific health requirements, safety gear${existingItemsText}`;

    if (existingPackingList) {
      return basePrompt + `

Consider ALL trip details when suggesting NEW items:

DESTINATION ANALYSIS (${tripData.destination}):
- Local customs, dress codes, and cultural requirements
- Electrical outlets and voltage (adapters needed?)
- Local climate patterns and seasonal variations
- Popular activities and tourist attractions
- Language barriers (translation apps, phrasebooks?)
- Currency and payment methods
- Health and safety considerations

WEATHER SPECIFICS (${tripData.weather.condition}, ${tripData.weather.tempRange}):
- Layering needs for temperature variations
- Rain/snow protection requirements
- Sun protection (UV levels at destination)
- Humidity considerations
- Seasonal weather patterns

TRIP TYPE CONSIDERATIONS (${tripData.type}):
- Business: Professional attire, presentation materials, business cards
- Vacation: Leisure clothes, entertainment items, comfort items
- Adventure: Outdoor gear, safety equipment, specialized clothing
- Family: Games, snacks, entertainment for children
- Romantic: Special occasion outfits, camera, romantic accessories

DURATION IMPACT (${tripData.durationDays} days):
- Laundry needs and supplies for longer trips
- Medication quantities
- Entertainment for long journeys
- Backup items for extended stays

TRAVELER SPECIFICS (${tripData.passengers.adults} adults, ${tripData.passengers.children} children):
- Child-specific needs (toys, snacks, comfort items)
- Adult work/leisure requirements
- Family activity supplies
- Age-appropriate entertainment and necessities

Respond STRICTLY as a JSON object with this structure (only include categories with NEW items):
{
  "title": "Smart Packing Suggestions for ${tripData.destination}",
  "categories": [
    {
      "category": "Category Name",
      "items": [
        { "name": "New Item Name", "qty": 1, "checked": false, "eco": false }
      ]
    }
  ]
}

IMPORTANT: Analyze the existing packing list and suggest items that complement what's already packed, filling gaps based on the comprehensive trip analysis above. Do not repeat any items already in the existing packing list.`;
    }

    return basePrompt + `

COMPREHENSIVE TRIP ANALYSIS:

DESTINATION SPECIFICS (${tripData.destination}):
- Research local customs, dress codes, and cultural norms
- Consider electrical outlets (adapters needed?)
- Local climate and seasonal weather patterns
- Popular activities and required gear
- Language considerations
- Currency and payment methods
- Health, safety, and vaccination requirements

WEATHER PLANNING (${tripData.weather.condition}, ${tripData.weather.tempRange}):
- Layer-appropriate clothing for temperature range
- Weather protection (rain, sun, wind, snow)
- Seasonal considerations and climate variations
- Comfort items for weather conditions

TRIP TYPE REQUIREMENTS (${tripData.type}):
- Business: Professional attire, work materials, networking items
- Vacation: Leisure wear, entertainment, relaxation items
- Adventure: Outdoor gear, safety equipment, specialized clothing
- Family: Child entertainment, comfort items, family activities
- Cultural: Appropriate dress, guidebooks, cultural items

DURATION CONSIDERATIONS (${tripData.durationDays} days):
- Clothing quantity based on laundry availability
- Medication and health supplies for trip length
- Entertainment and comfort items for journey duration
- Backup and replacement items for longer stays

TRAVELER NEEDS (${tripData.passengers.adults} adults, ${tripData.passengers.children} children):
- Age-specific requirements and preferences
- Professional vs leisure needs for adults
- Child safety, entertainment, and comfort items
- Family activity and bonding supplies

Respond STRICTLY as a JSON object with this structure:
{
  "title": "Complete ${tripData.type} Packing List for ${tripData.destination}",
  "categories": [
    {
      "category": "Clothing",
      "items": [
        { "name": "Weather-appropriate tops", "qty": ${Math.max(3, Math.ceil(tripData.durationDays / 2)) * tripData.passengers.adults}, "checked": false, "eco": false },
        { "name": "Climate-suitable bottoms", "qty": ${Math.max(2, Math.ceil(tripData.durationDays / 3)) * tripData.passengers.adults}, "checked": false, "eco": false },
        { "name": "Destination-appropriate outerwear", "qty": ${tripData.passengers.adults}, "checked": false, "eco": false },
        { "name": "Undergarments (Adults)", "qty": ${tripData.durationDays * tripData.passengers.adults}, "checked": false, "eco": false },
        { "name": "Socks suitable for activities", "qty": ${tripData.durationDays * (tripData.passengers.adults + tripData.passengers.children)}, "checked": false, "eco": false },
        { "name": "Sleepwear (Adults)", "qty": ${2 * tripData.passengers.adults}, "checked": false, "eco": false }${tripData.passengers.children > 0 ? `,
        { "name": "Children's clothing sets", "qty": ${tripData.durationDays * tripData.passengers.children}, "checked": false, "eco": false },
        { "name": "Children's outerwear", "qty": ${tripData.passengers.children}, "checked": false, "eco": false },
        { "name": "Children's sleepwear", "qty": ${3 * tripData.passengers.children}, "checked": false, "eco": false }` : ''}
      ]
    },
    {
      "category": "Electronics & Tech",
      "items": [
        { "name": "Phone & Universal Charger", "qty": 1, "checked": false, "eco": false },
        { "name": "Power Bank (High Capacity)", "qty": 1, "checked": false, "eco": false },
        { "name": "Travel Adapter for ${tripData.destination}", "qty": 1, "checked": false, "eco": false },
        { "name": "Camera/Phone Camera accessories", "qty": 1, "checked": false, "eco": false }${tripData.durationDays > 3 ? `,
        { "name": "Portable WiFi/Data solution", "qty": 1, "checked": false, "eco": false }` : ''}
      ]
    },
    {
      "category": "Health & Toiletries",
      "items": [
        { "name": "Toothbrush & Travel Toothpaste", "qty": ${tripData.passengers.adults + tripData.passengers.children}, "checked": false, "eco": true },
        { "name": "Travel-sized Shampoo/Body Wash", "qty": 1, "checked": false, "eco": true },
        { "name": "Sunscreen (SPF appropriate for destination)", "qty": 1, "checked": false, "eco": true },
        { "name": "Personal medications (${tripData.durationDays + 3} days supply)", "qty": 1, "checked": false, "eco": false },
        { "name": "First Aid Kit", "qty": 1, "checked": false, "eco": false },
        { "name": "Hand sanitizer", "qty": 1, "checked": false, "eco": true }
      ]
    },
    {
      "category": "Travel Documents",
      "items": [
        { "name": "Passport/ID (${tripData.passengers.adults + tripData.passengers.children} copies)", "qty": ${tripData.passengers.adults + tripData.passengers.children}, "checked": false, "eco": false },
        { "name": "Travel Insurance Documents", "qty": 1, "checked": false, "eco": false },
        { "name": "Flight/Transport Tickets", "qty": ${tripData.passengers.adults + tripData.passengers.children}, "checked": false, "eco": false },
        { "name": "Emergency Contact Information", "qty": 1, "checked": false, "eco": false },
        { "name": "Destination Maps/Guidebook", "qty": 1, "checked": false, "eco": false }
      ]
    },
    {
      "category": "Comfort & Convenience",
      "items": [
        { "name": "Reusable Water Bottle", "qty": ${tripData.passengers.adults + tripData.passengers.children}, "checked": false, "eco": true },
        { "name": "Travel Pillow & Blanket", "qty": ${Math.ceil((tripData.passengers.adults + tripData.passengers.children) / 2)}, "checked": false, "eco": false },
        { "name": "Snacks for Journey", "qty": ${Math.ceil(tripData.durationDays / 2)}, "checked": false, "eco": false },
        { "name": "Entertainment (Books/Downloads)", "qty": 1, "checked": false, "eco": false }${tripData.passengers.children > 0 ? `,
        { "name": "Children's Activities/Toys", "qty": ${tripData.passengers.children * 2}, "checked": false, "eco": false },
        { "name": "Children's Comfort Items", "qty": ${tripData.passengers.children}, "checked": false, "eco": false }` : ''}
      ]
    }${tripData.type === 'business' ? `,
    {
      "category": "Business Essentials",
      "items": [
        { "name": "Professional Attire", "qty": ${tripData.durationDays}, "checked": false, "eco": false },
        { "name": "Business Cards", "qty": 1, "checked": false, "eco": false },
        { "name": "Laptop & Accessories", "qty": 1, "checked": false, "eco": false },
        { "name": "Presentation Materials", "qty": 1, "checked": false, "eco": false }
      ]
    }` : ''}${tripData.type.includes('adventure') || tripData.type.includes('outdoor') ? `,
    {
      "category": "Adventure Gear",
      "items": [
        { "name": "Appropriate Footwear", "qty": ${tripData.passengers.adults + tripData.passengers.children}, "checked": false, "eco": false },
        { "name": "Weather Protection Gear", "qty": 1, "checked": false, "eco": false },
        { "name": "Activity-specific Equipment", "qty": 1, "checked": false, "eco": false },
        { "name": "Safety Equipment", "qty": 1, "checked": false, "eco": false }
      ]
    }` : ''}
  ]
}

Generate quantities based on:
- Trip duration (${tripData.durationDays} days)
- Number of travelers (${tripData.passengers.adults} adults, ${tripData.passengers.children} children)
- Weather conditions (${tripData.weather.condition})
- Destination requirements (${tripData.destination})
- Trip purpose (${tripData.type})`;
  }

  parsePackingList(response, existingPackingList = null) {
    try {
      // If response is the full object, extract the content
      if (typeof response === 'object' && response.message && response.message.content) {
        response = response.message.content;
      }

      // Extract JSON from the content, which may be wrapped in ```json
      const jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonString);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse packing list:', error, "\nRaw Response:", response);
      return this.getDefaultPackingList(existingPackingList);
    }
  }

  getDefaultPackingList(existingPackingList = null) {
    // If there's an existing packing list, return minimal new suggestions
    if (existingPackingList && existingPackingList.categories) {
      return {
        title: "Additional Packing Suggestions",
        categories: [
          { 
            category: "Essential Extras", 
            items: [
              { name: "Hand sanitizer", qty: 1, checked: false, eco: true },
              { name: "Travel-sized tissues", qty: 2, checked: false, eco: false },
              { name: "Emergency snacks", qty: 1, checked: false, eco: false }
            ] 
          }
        ]
      };
    }

    // Return full default list for new packing lists
    return {
      title: "Default Packing List",
      categories: [
        { 
          category: "Clothing", 
          items: [
            { name: "T-shirts", qty: 3, checked: false, eco: false },
            { name: "Pants", qty: 2, checked: false, eco: false },
            { name: "Underwear", qty: 4, checked: false, eco: false },
            { name: "Socks", qty: 4, checked: false, eco: false },
            { name: "Jacket", qty: 1, checked: false, eco: false }
          ] 
        },
        { 
          category: "Electronics", 
          items: [
            { name: "Phone", qty: 1, checked: false, eco: false },
            { name: "Charger", qty: 1, checked: false, eco: false },
            { name: "Power bank", qty: 1, checked: false, eco: false }
          ] 
        },
        { 
          category: "Toiletries", 
          items: [
            { name: "Toothbrush", qty: 1, checked: false, eco: true },
            { name: "Toothpaste", qty: 1, checked: false, eco: true },
            { name: "Deodorant", qty: 1, checked: false, eco: false }
          ] 
        },
        { 
          category: "Documents", 
          items: [
            { name: "ID/Passport", qty: 1, checked: false, eco: false },
            { name: "Travel tickets", qty: 1, checked: false, eco: false },
            { name: "Insurance documents", qty: 1, checked: false, eco: false }
          ] 
        },
        { 
          category: "Miscellaneous", 
          items: [
            { name: "Water bottle", qty: 1, checked: false, eco: true },
            { name: "Snacks", qty: 2, checked: false, eco: false },
            { name: "First aid kit", qty: 1, checked: false, eco: false }
          ] 
        }
      ]
    };
  }
}

module.exports = new OllamaService();
