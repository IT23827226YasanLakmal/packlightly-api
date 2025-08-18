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

  // Create a Trip
  const trip = await Trip.create({
    title: "Summer Fun in Bali",
    description: "A relaxing summer vacation with beach activities and hiking",
    startDate: new Date("2025-06-10"),
    endDate: new Date("2025-06-20"),
    durationDays: 10,
    ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
    weather: {
    location: "Bali",
    tempRange: "26°C - 32°C",
    description: "Sunny with light breeze",
    condition: "sunny",
    highTemp: "32°C",
    lowTemp: "26°C",
    wind: "15 km/h",
    humidity: "70%",
    chanceRain: "10%"
  }
  });

  // Packing List with categories + items
  await PackingList.create({
    tripId: trip._id,
    ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
    categories: [
      {
        name: "Clothing",
        items: [
          { name: "T-shirts", qty: 5, checked: false },
          { name: "Shorts", qty: 3, checked: true },
          { name: "Hiking Shoes", qty: 1, checked: false }
        ]
      },
      {
        name: "Essentials",
        items: [
          { name: "Passport", qty: 1, checked: true },
          { name: "Travel Insurance", qty: 1, checked: false }
        ]
      },
      {
        name: "Toiletries",
        items: [
          { name: "Sunscreen", qty: 1, checked: false },
          { name: "Toothbrush", qty: 1, checked: true },
          { name: "Shampoo", qty: 1, checked: false }
        ]
      },
      {
        name: "Electronics",
        items: [
          { name: "Phone Charger", qty: 1, checked: true },
          { name: "Camera", qty: 1, checked: false },
          { name: "Power Bank", qty: 1, checked: false }
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

  console.log("✅ Sample data inserted (Trips + PackingList with categories + News)!");
  mongoose.connection.close();
}

seed().catch((err) => console.error(err));
