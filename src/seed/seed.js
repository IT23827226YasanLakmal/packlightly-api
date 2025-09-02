const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const PackingList = require("../models/PackingList");
const News = require("../models/News");
const connectDB = require("../config/db");

async function seed() {
  await connectDB();

  // Clear existing data
  await Trip.deleteMany({});
  await PackingList.deleteMany({});
  await News.deleteMany({});

  // Create a Trip (Family Example)
  const trip = await Trip.create({
    ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
    title: "Summer Fun in Bali",
    type: "Family", // must be one of: Solo, Couple, Family, Group
    destination: "Bali",
    startDate: new Date("2025-06-10"),
    endDate: new Date("2025-06-20"),
    durationDays: 10,
    passengers: {
      adults: 2,
      children: 2,
      total: 4
    },
    budget: 2000,
    ecoSuggestions: true,
    weather: {
      location: "Bali",
      tempRange: "26°C - 32°C",
      description: "Sunny with light breeze",
      condition: "sunny", // must be one of: sunny, cloudy, rainy, stormy, snowy
      highTemp: "32°C",
      lowTemp: "26°C",
      wind: "15 km/h",
      humidity: "70%",
      chanceRain: "10%"
    }
  });

  // Packing List with categories + items
  await PackingList.create({
    title: "Bali Packing List",
    tripId: trip._id,
    ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
    isAIGenerated: false,
    lastAIGeneratedAt: null,
    categories: [
      {
        name: "Clothing",
        items: [
          { name: "T-shirts", qty: 8, checked: false, eco: true, suggestedByAI: false },
          { name: "Shorts", qty: 4, checked: true, eco: false, suggestedByAI: false },
          { name: "Hiking Shoes", qty: 2, checked: false, eco: true, suggestedByAI: false }
        ]
      },
      {
        name: "Toiletries",
        items: [
          { name: "Sunscreen", qty: 1, checked: false, eco: true, suggestedByAI: false },
          { name: "Toothbrush", qty: 4, checked: true, eco: true, suggestedByAI: false },
          { name: "Shampoo", qty: 1, checked: false, eco: true, suggestedByAI: false }
        ]
      },
      {
        name: "Electronics",
        items: [
          { name: "Phone Charger", qty: 2, checked: true, eco: false, suggestedByAI: false },
          { name: "Camera", qty: 1, checked: false, eco: true, suggestedByAI: false },
          { name: "Power Bank", qty: 2, checked: false, eco: true, suggestedByAI: false }
        ]
      },
      {
        name: "Documents",
        items: [
          { name: "Passport", qty: 4, checked: true, eco: false, suggestedByAI: false },
          { name: "Travel Insurance", qty: 1, checked: false, eco: false, suggestedByAI: false }
        ]
      },
      {
        name: "Miscellaneous",
        items: [
          { name: "Reusable Water Bottle", qty: 2, checked: true, eco: true, suggestedByAI: false },
          { name: "Snacks", qty: 10, checked: false, eco: false, suggestedByAI: false }
        ]
      }
    ]
  });

  // Some News items
  await News.insertMany([
    {
      title: "Eco-Friendly Travel Tips",
      body: "Reduce plastic usage and carry reusable bottles when traveling.",
      source: "EcoTravel Blog",
      publishedAt: new Date("2025-08-10")
    },
    {
      title: "Top 10 Summer Destinations",
      body: "Discover the best destinations for summer fun in 2025.",
      source: "TravelWorld",
      publishedAt: new Date("2025-08-01")
    },
    {
      title: "Hiking Essentials for Beginners",
      body: "A guide to packing light but staying safe on your first hike.",
      source: "Adventure Daily",
      publishedAt: new Date("2025-07-25")
    }
  ]);

  console.log("✅ Sample data inserted (Trips + PackingList + News)!");
  await mongoose.connection.close();
}

seed().catch((err) => console.error(err));