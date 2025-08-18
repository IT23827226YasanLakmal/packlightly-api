const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const PackingList = require("../models/PackingList");
const Checklist = require("../models/Checklist");
const News = require("../models/News");
const connectDB = require("../config/db");

async function seed() {
  await connectDB();

  // Clear existing
  await Trip.deleteMany({});
  await PackingList.deleteMany({});
  await Checklist.deleteMany({});
  await News.deleteMany({});

  // Create a Trip
  const trip = await Trip.create({
    title: "Summer Fun in Bali",
    description: "A relaxing summer vacation with beach activities and hiking",
    startDate: new Date("2025-06-10"),
    endDate: new Date("2025-06-20"),
    ownerUid: "user_12345"
  });

  // Packing List for the trip
  const packingList = await PackingList.create({
    tripId: trip._id,
    ownerUid: "user_12345",
    items: [
      { name: "T-shirts", qty: 5, checked: false },
      { name: "Shorts", qty: 3, checked: true },
      { name: "Sunscreen", qty: 1, checked: false },
      { name: "Hiking Shoes", qty: 1, checked: false }
    ]
  });

  // Checklists under the packing list
  const clothesChecklist = await Checklist.create({
    name: "Clothes Checklist",
    packingListId: packingList._id
  });

  const toiletriesChecklist = await Checklist.create({
    name: "Toiletries Checklist",
    packingListId: packingList._id
  });

  const essentialsChecklist = await Checklist.create({
    name: "Essential Checklist",
    packingListId: packingList._id
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

  console.log("✅ Sample data inserted!");
  mongoose.connection.close();
}

seed().catch((err) => console.error(err));
