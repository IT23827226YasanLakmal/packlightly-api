const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

class OllamaService {
  constructor() {
    this.client = axios.create({
      baseURL: OLLAMA_BASE_URL,
      timeout: 30000,
    });
  }

  async generatePackingSuggestion(tripData) {
    try {
      const prompt = this.createPackingPrompt(tripData);

      const response = await this.client.post('/api/generate', {
        model: 'phi3:mini',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      });

      return this.parsePackingList(response.data.response);
    } catch (error) {
      console.error('Ollama API error:', error.message);
      throw new Error('Failed to generate packing suggestions');
    }
  }

  createPackingPrompt(tripData) {
    return `
As a travel packing expert, suggest a comprehensive packing list for a ${tripData.type.toLowerCase()} trip to ${tripData.destination}. 
    
Trip Details:
- Destination: ${tripData.destination}
- Trip Type: ${tripData.type}
- Duration: ${tripData.durationDays} days
- Travelers: ${tripData.passengers.adults} adults, ${tripData.passengers.children} children
- Weather: ${tripData.weather.condition}, ${tripData.weather.tempRange}
- Dates: ${tripData.startDate} to ${tripData.endDate}

Provide the response as a JSON array of objects with this exact structure:
[
  {
    "category": "Clothing",
    "items": [
      { "name": "T-shirts (Adults)", "qty": ${Math.max(3, Math.ceil(tripData.durationDays / 2)) * tripData.passengers.adults}, "checked": false, "eco": false },
      { "name": "T-shirts (Children)", "qty": ${tripData.durationDays * tripData.passengers.children}, "checked": false, "eco": false },
      { "name": "Pants/Shorts (Adults)", "qty": ${Math.max(2, Math.ceil(tripData.durationDays / 3)) * tripData.passengers.adults}, "checked": false, "eco": false },
      { "name": "Pants/Shorts (Children)", "qty": ${Math.ceil(tripData.durationDays / 2) * tripData.passengers.children}, "checked": false, "eco": false },
      { "name": "Undergarments (Adults)", "qty": ${tripData.durationDays * tripData.passengers.adults}, "checked": false, "eco": false },
      { "name": "Undergarments (Children)", "qty": ${Math.ceil(tripData.durationDays * 1.5) * tripData.passengers.children}, "checked": false, "eco": false },
      { "name": "Socks (All)", "qty": ${tripData.durationDays * (tripData.passengers.adults + tripData.passengers.children)}, "checked": false, "eco": false },
      { "name": "Sleepwear (Adults)", "qty": ${2 * tripData.passengers.adults}, "checked": false, "eco": false },
      { "name": "Sleepwear (Children)", "qty": ${3 * tripData.passengers.children}, "checked": false, "eco": false }
    ]
  },
  {
    "category": "Electronics",
    "items": [
      { "name": "Phone & Charger", "qty": 1, "checked": false, "eco": false },
      { "name": "Power Bank", "qty": 1, "checked": false, "eco": false }
    ]
  },
  {
    "category": "Toiletries",
    "items": [
      { "name": "Toothbrush", "qty": (tripData.passengers.adults + tripData.passengers.children), "checked": false, "eco": true },
      { "name": "Shampoo", "qty": 1, "checked": false, "eco": true }
    ]
  },
  {
    "category": "Documents",
    "items": [
      { "name": "Passport", "qty": (tripData.passengers.adults + tripData.passengers.children), "checked": false, "eco": false },
      { "name": "Tickets", "qty": (tripData.passengers.adults + tripData.passengers.children), "checked": false, "eco": false }
    ]
  },
  {
    "category": "Miscellaneous",
    "items": [
      { "name": "Reusable Water Bottle", "qty": (tripData.passengers.adults + tripData.passengers.children), "checked": false, "eco": true },
      { "name": "Snacks", "qty": ${2 * (tripData.passengers.adults + tripData.passengers.children)}, "checked": false, "eco": false }
    ]
  }
]
`;
  }

  parsePackingList(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse packing list:', error);
      // Return default packing list if parsing fails
      return this.getDefaultPackingList();
    }
  }

  getDefaultPackingList() {
    return [
      {
        category: "Clothing",
        items: ["T-shirts", "Pants", "Underwear", "Socks", "Jacket"]
      },
      {
        category: "Electronics",
        items: ["Phone", "Charger", "Power bank"]
      },
      {
        category: "Toiletries",
        items: ["Toothbrush", "Toothpaste", "Deodorant"]
      },
      {
        category: "Documents",
        items: ["ID/Passport", "Travel tickets", "Insurance documents"]
      },
      {
        category: "Miscellaneous",
        items: ["Water bottle", "Snacks", "First aid kit"]
      }
    ];
  }

  
}

module.exports = new OllamaService();