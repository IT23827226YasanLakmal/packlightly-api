const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const PackingList = require("../models/PackingList");
const Product = require("../models/Product");
const Post = require("../models/Post"); // ✅ import Post model
const Report = require("../models/Report"); // ✅ import Report model
const connectDB = require("../config/db");

async function seed() {
  await connectDB();

  // Clear existing data
  await Trip.deleteMany({});
  await PackingList.deleteMany({});
  await Product.deleteMany({});
  await Post.deleteMany({}); // ✅ clear posts too
  await Report.deleteMany({}); // ✅ clear reports too

  // Create a Trip (Family Example)
  const trip = await Trip.create({
    ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
    title: "Summer Fun in Bali",
    type: "Family",
    destination: "Bali",
    startDate: new Date("2025-06-10"),
    endDate: new Date("2025-06-20"),
    durationDays: 10,
    passengers: { adults: 2, children: 2, total: 4 },
    budget: 2000,
    ecoSuggestions: true,
    weather: {
      location: "Bali",
      tempRange: "26°C - 32°C",
      description: "Sunny with light breeze",
      condition: "sunny",
      highTemp: "32°C",
      lowTemp: "26°C",
      wind: "15 km/h",
      humidity: "70%",
      chanceRain: "10%",
    },
  });

  // Create a second Trip (Solo Example)
  const trip2 = await Trip.create({
    ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
    title: "Solo Adventure in Tokyo",
    type: "Solo",
    destination: "Tokyo",
    startDate: new Date("2025-08-15"),
    endDate: new Date("2025-08-22"),
    durationDays: 7,
    passengers: { adults: 1, children: 0, total: 1 },
    budget: 1800,
    ecoSuggestions: true,
    weather: {
      location: "Tokyo",
      tempRange: "22°C - 28°C",
      description: "Partly cloudy with occasional rain",
      condition: "cloudy",
      highTemp: "28°C",
      lowTemp: "22°C",
      wind: "10 km/h",
      humidity: "65%",
      chanceRain: "30%",
    },
  });

  // Packing List
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
          { name: "Hiking Shoes", qty: 2, checked: false, eco: true, suggestedByAI: false },
        ],
      },
      {
        name: "Toiletries",
        items: [
          { name: "Sunscreen", qty: 1, checked: false, eco: true, suggestedByAI: false },
          { name: "Toothbrush", qty: 4, checked: true, eco: true, suggestedByAI: false },
          { name: "Shampoo", qty: 1, checked: false, eco: true, suggestedByAI: false },
        ],
      },
      {
        name: "Electronics",
        items: [
          { name: "Phone Charger", qty: 2, checked: true, eco: false, suggestedByAI: false },
          { name: "Camera", qty: 1, checked: false, eco: true, suggestedByAI: false },
          { name: "Power Bank", qty: 2, checked: false, eco: true, suggestedByAI: false },
        ],
      },
      {
        name: "Documents",
        items: [
          { name: "Passport", qty: 4, checked: true, eco: false, suggestedByAI: false },
          { name: "Travel Insurance", qty: 1, checked: false, eco: false, suggestedByAI: false },
        ],
      },
      {
        name: "Miscellaneous",
        items: [
          { name: "Reusable Water Bottle", qty: 2, checked: true, eco: true, suggestedByAI: false },
          { name: "Snacks", qty: 10, checked: false, eco: false, suggestedByAI: false },
        ],
      },
    ],
  });

  // Second Packing List for Tokyo Trip
  await PackingList.create({
    title: "Tokyo Solo Trip Essentials",
    tripId: trip2._id,
    ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
    isAIGenerated: false,
    lastAIGeneratedAt: null,
    categories: [
      {
        name: "Clothing",
        items: [
          { name: "Light Jacket", qty: 1, checked: true, eco: false, suggestedByAI: false },
          { name: "Jeans", qty: 2, checked: true, eco: false, suggestedByAI: false },
          { name: "T-shirts", qty: 4, checked: false, eco: true, suggestedByAI: false },
          { name: "Comfortable Shoes", qty: 1, checked: true, eco: true, suggestedByAI: false },
          { name: "Rain Jacket", qty: 1, checked: false, eco: true, suggestedByAI: false },
        ],
      },
      {
        name: "Toiletries",
        items: [
          { name: "Travel Shampoo", qty: 1, checked: true, eco: true, suggestedByAI: false },
          { name: "Toothbrush", qty: 1, checked: true, eco: true, suggestedByAI: false },
          { name: "Sunscreen", qty: 1, checked: false, eco: true, suggestedByAI: false },
        ],
      },
      {
        name: "Electronics",
        items: [
          { name: "Phone Charger", qty: 1, checked: true, eco: false, suggestedByAI: false },
          { name: "Portable WiFi Device", qty: 1, checked: false, eco: false, suggestedByAI: false },
          { name: "Camera", qty: 1, checked: true, eco: false, suggestedByAI: false },
        ],
      },
      {
        name: "Documents",
        items: [
          { name: "Passport", qty: 1, checked: true, eco: false, suggestedByAI: false },
          { name: "JR Pass", qty: 1, checked: false, eco: false, suggestedByAI: false },
          { name: "Hotel Reservations", qty: 1, checked: true, eco: false, suggestedByAI: false },
        ],
      },
      {
        name: "Miscellaneous",
        items: [
          { name: "Reusable Chopsticks", qty: 1, checked: false, eco: true, suggestedByAI: false },
          { name: "Pocket Translator", qty: 1, checked: true, eco: false, suggestedByAI: false },
          { name: "Energy Bars", qty: 5, checked: false, eco: false, suggestedByAI: false },
        ],
      },
    ],
  });

  // Eco Products
  const now = new Date();
  await Product.insertMany([
    { name: "Reusable Water Bottle", price: 1200, category: 1, eco: 5, description: "Stainless steel reusable water bottle, eco-friendly and durable.", availableLocation: ["Colombo","Kandy","Galle"], createdAt: now, updatedAt: now },
    { name: "Bamboo Toothbrush", price: 350, category: 2, eco: 5, description: "Biodegradable bamboo toothbrush with soft bristles.", availableLocation: ["Colombo","Negombo"], createdAt: now, updatedAt: now },
    { name: "Organic Cotton T-Shirt", price: 2500, category: 3, eco: 4, description: "Eco-conscious cotton T-shirt made with sustainable materials.", availableLocation: ["Colombo","Jaffna","Matara"], createdAt: now, updatedAt: now },
    { name: "Solar Powered Lamp", price: 5200, category: 4, eco: 5, description: "Portable solar-powered LED lamp for indoor and outdoor use.", availableLocation: ["Colombo","Anuradhapura","Kurunegala"], createdAt: now, updatedAt: now },
    { name: "Recycled Notebook", price: 450, category: 5, eco: 3, description: "Notebook made from 100% recycled paper with eco-friendly ink.", availableLocation: ["Colombo","Gampaha"], createdAt: now, updatedAt: now },
  ]);

  // ✅ Posts with embedded comments
  await Post.insertMany([
    {
      title: "Eco-Friendly Packing Tips for Your Next Adventure",
      description: "Travel light and sustainable — bring reusable bottles, bamboo cutlery, and eco toiletries.",
      ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
      tags: ["eco", "packing", "tips"],
      status: "Published",
      date: new Date("2025-08-12"),
      imageUrl: "uploads/eco-packing.jpg",
      likeCount: 15,
      comments: [
        { user: "EcoTraveler", text: "Great reminder! I always pack my metal straw.", createdAt: new Date("2025-08-13") },
        { user: "GreenNomad", text: "Reusable bottles are a must-have. 🌍", createdAt: new Date("2025-08-14") },
      ],
    },
    {
      title: "Top 5 Sustainable Destinations for 2025",
      description: "Discover eco-conscious travel spots like Costa Rica, Bhutan, and Sri Lanka.",
      ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
      tags: ["destinations", "eco", "travel"],
      status: "Published",
      date: new Date("2025-08-15"),
      imageUrl: "uploads/sustainable-destinations.jpg",
      likeCount: 28,
      comments: [
        { user: "Wanderlust", text: "Bhutan is on my bucket list! 💚", createdAt: new Date("2025-08-16") },
      ],
    },
    {
      title: "Why Slow Travel is the New Eco Travel",
      description: "Spend more time in fewer places. Reduce emissions, support locals, and travel consciously.",
      ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
      tags: ["slowtravel", "eco", "sustainability"],
      status: "Draft",
      date: new Date("2025-08-20"),
      imageUrl: "uploads/slow-travel.jpg",
      likeCount: 5,
      comments: [],
    },
  ]);

  // ✅ Sample Reports
  await Report.insertMany([
    {
      ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
      title: "My Travel Analytics - Summer 2025",
      type: "trip_analytics",
      filters: {
        dateRange: {
          startDate: new Date("2025-06-01"),
          endDate: new Date("2025-08-31")
        }
      },
      data: {
        summary: {
          totalTrips: 2,
          totalBudget: 4000,
          avgTripDuration: 10,
          avgBudget: 2000,
          ecoFriendlyPercentage: 25
        },
        charts: [
          {
            type: "pie",
            title: "Trip Types Distribution",
            data: [1, 1],
            labels: ["Family", "Solo"]
          },
          {
            type: "bar",
            title: "Monthly Spending",
            data: [2000, 2000],
            labels: ["June", "August"]
          }
        ],
        details: {
          topDestinations: ["Bali", "Colombo"],
          totalPages: 1
        }
      },
      generatedAt: new Date("2025-08-25"),
      status: "completed"
    },
    {
      ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
      title: "Packing Efficiency Report",
      type: "packing_statistics",
      filters: {},
      data: {
        summary: {
          totalPackingLists: 2,
          totalItems: 27,
          completionRate: 67,
          ecoFriendlyPercentage: 19,
          aiUsagePercentage: 0
        },
        charts: [
          {
            type: "doughnut",
            title: "Completion Rate by Category",
            data: [80, 60, 100, 50, 75],
            labels: ["Clothing", "Toiletries", "Electronics", "Documents", "Miscellaneous"]
          },
          {
            type: "bar",
            title: "Items per Category",
            data: [8, 3, 3, 2, 11],
            labels: ["Clothing", "Toiletries", "Electronics", "Documents", "Miscellaneous"]
          }
        ],
        details: {
          mostCommonItems: [
            { name: "t-shirts", count: 8 },
            { name: "snacks", count: 10 },
            { name: "passport", count: 4 }
          ]
        }
      },
      generatedAt: new Date("2025-08-20"),
      status: "completed"
    },
    {
      ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
      title: "Environmental Impact Assessment",
      type: "eco_impact",
      filters: {},
      data: {
        summary: {
          totalTrips: 2,
          ecoFriendlyPercentage: 19,
          estimatedCarbonFootprint: 4000,
          carbonSaved: 3,
          ecoPostsShared: 2
        },
        charts: [
          {
            type: "pie",
            title: "Eco Items by Category",
            data: [1, 1, 1, 0, 2],
            labels: ["Clothing", "Toiletries", "Electronics", "Documents", "Miscellaneous"]
          },
          {
            type: "bar",
            title: "Environmental Impact",
            data: [4000, 3],
            labels: ["Carbon Footprint (kg)", "Carbon Saved (kg)"]
          }
        ],
        details: {
          sustainabilityScore: 29,
          recommendations: [
            "Consider using reusable water bottles on all trips",
            "Pack eco-friendly toiletries and personal care items",
            "Choose sustainable accommodation options"
          ]
        }
      },
      generatedAt: new Date("2025-08-15"),
      status: "completed"
    },
    {
      ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
      title: "User Activity Summary",
      type: "user_activity",
      filters: {},
      data: {
        summary: {
          totalTrips: 2,
          totalPackingLists: 2,
          totalPosts: 3,
          totalLikes: 48,
          avgLikesPerPost: 16
        },
        charts: [
          {
            type: "line",
            title: "Monthly Activity",
            data: [1, 1, 1, 2, 2],
            labels: ["2025-06", "2025-07", "2025-08", "2025-08", "2025-08"]
          },
          {
            type: "doughnut",
            title: "Content Distribution",
            data: [2, 2, 3],
            labels: ["Trips", "Packing Lists", "Posts"]
          }
        ],
        details: {
          engagementRate: 16,
          memberSince: new Date("2025-06-10")
        }
      },
      generatedAt: new Date("2025-08-30"),
      status: "completed"
    },
    {
      ownerUid: "aZlm3SLXkYfNGq3CuDmWTbmO3gF3",
      title: "Budget Analysis Report",
      type: "budget_analysis",
      filters: {
        dateRange: {
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-12-31")
        }
      },
      data: {
        summary: {
          totalTrips: 2,
          totalBudget: 4000,
          avgBudget: 2000,
          maxBudget: 2000,
          minBudget: 2000
        },
        charts: [
          {
            type: "bar",
            title: "Average Budget by Trip Type",
            data: [2000],
            labels: ["Family"]
          },
          {
            type: "line",
            title: "Monthly Spending Trends",
            data: [2000, 2000],
            labels: ["2025-06", "2025-08"]
          }
        ],
        details: {
          budgetByType: [
            {
              type: "Family",
              total: 4000,
              average: 2000,
              trips: 2
            }
          ]
        }
      },
      generatedAt: new Date("2025-09-01"),
      status: "completed"
    }
  ]);

  console.log("✅ Sample data inserted (Trips + PackingList + Products + Posts + Reports)!");
  await mongoose.connection.close();
}

seed().catch((err) => console.error(err));
