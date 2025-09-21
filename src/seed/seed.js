const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const PackingList = require("../models/PackingList");
const Product = require("../models/Product");
const Post = require("../models/Post"); // ✅ import Post model
const connectDB = require("../config/db");

async function seed() {
  await connectDB();

  // Clear existing data
  await Trip.deleteMany({});
  await PackingList.deleteMany({});
  await Product.deleteMany({});
  await Post.deleteMany({}); // ✅ clear posts too

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

  console.log("✅ Sample data inserted (Trips + PackingList + Products + Posts)!");
  await mongoose.connection.close();
}

seed().catch((err) => console.error(err));
