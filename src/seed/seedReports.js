const mongoose = require("mongoose");
const Report = require("../models/Report");
const connectDB = require("../config/db");

async function seedReports() {
  await connectDB();

  // Clear existing reports
  await Report.deleteMany({});
  console.log("🗑️ Cleared existing reports");

  const sampleUsers = [
    "aZlm3SLXkYfNGq3CuDmWTbmO3gF3", // Main user
    "bYmn4TLYlZgOHr4DvEnXUcnP4hG4", // User 2
    "cZno5UMZmAhPIs5EwFoYVdoQ5iH5"  // User 3
  ];

  const reports = [
    // Trip Analytics Reports
    {
      ownerUid: sampleUsers[0],
      title: "Annual Trip Analytics 2025",
      type: "trip_analytics",
      filters: {
        dateRange: {
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-12-31")
        }
      },
      data: {
        summary: {
          totalTrips: 8,
          totalBudget: 15000,
          avgTripDuration: 8.5,
          avgBudget: 1875,
          ecoFriendlyPercentage: 35
        },
        charts: [
          {
            type: "pie",
            title: "Trip Types Distribution",
            data: [3, 2, 2, 1],
            labels: ["Solo", "Family", "Couple", "Group"]
          },
          {
            type: "bar",
            title: "Top Destinations",
            data: [2, 2, 1, 1, 1, 1],
            labels: ["Bali", "Tokyo", "Paris", "Bangkok", "New York", "London"]
          },
          {
            type: "line",
            title: "Monthly Trip Trends",
            data: [1, 0, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          },
          {
            type: "doughnut",
            title: "Budget Distribution",
            data: [2, 3, 2, 1, 0],
            labels: ["$0-$500", "$501-$1000", "$1001-$2000", "$2001-$5000", "$5000+"]
          }
        ],
        details: {
          trips: [
            { destination: "Bali", type: "Family", budget: 2500, duration: 10 },
            { destination: "Tokyo", type: "Solo", budget: 1800, duration: 7 },
            { destination: "Paris", type: "Couple", budget: 3000, duration: 12 }
          ],
          totalPages: 3
        }
      },
      generatedAt: new Date("2025-09-01"),
      status: "completed",
      tags: ["annual", "overview"]
    },

    {
      ownerUid: sampleUsers[1],
      title: "Business Travel Analytics Q3 2025",
      type: "trip_analytics",
      filters: {
        dateRange: {
          startDate: new Date("2025-07-01"),
          endDate: new Date("2025-09-30")
        },
        tripType: "Solo"
      },
      data: {
        summary: {
          totalTrips: 5,
          totalBudget: 8500,
          avgTripDuration: 4.2,
          avgBudget: 1700,
          ecoFriendlyPercentage: 45
        },
        charts: [
          {
            type: "bar",
            title: "Monthly Business Trips",
            data: [2, 2, 1],
            labels: ["July", "August", "September"]
          },
          {
            type: "line",
            title: "Average Trip Cost",
            data: [1600, 1800, 1700],
            labels: ["July", "August", "September"]
          }
        ],
        details: {
          trips: [
            { destination: "Singapore", budget: 1500, duration: 3 },
            { destination: "Seoul", budget: 1800, duration: 4 },
            { destination: "Hong Kong", budget: 1400, duration: 3 }
          ],
          totalPages: 2
        }
      },
      generatedAt: new Date("2025-09-15"),
      status: "completed",
      tags: ["business", "quarterly"]
    },

    // Packing Statistics Reports
    {
      ownerUid: sampleUsers[0],
      title: "Comprehensive Packing Statistics 2025",
      type: "packing_statistics",
      filters: {},
      data: {
        summary: {
          totalPackingLists: 12,
          totalItems: 156,
          completionRate: 78,
          ecoFriendlyPercentage: 32,
          aiUsagePercentage: 25
        },
        charts: [
          {
            type: "doughnut",
            title: "Completion Rate by Category",
            data: [85, 72, 95, 68, 70],
            labels: ["Clothing", "Toiletries", "Electronics", "Documents", "Miscellaneous"]
          },
          {
            type: "bar",
            title: "Items per Category",
            data: [45, 28, 18, 12, 53],
            labels: ["Clothing", "Toiletries", "Electronics", "Documents", "Miscellaneous"]
          },
          {
            type: "pie",
            title: "Eco-Friendly Items Distribution",
            data: [15, 12, 5, 2, 16],
            labels: ["Clothing", "Toiletries", "Electronics", "Documents", "Miscellaneous"]
          }
        ],
        details: {
          mostCommonItems: [
            { name: "T-shirts", count: 24, ecoFriendly: true },
            { name: "Phone Charger", count: 12, ecoFriendly: false },
            { name: "Toothbrush", count: 12, ecoFriendly: true },
            { name: "Passport", count: 12, ecoFriendly: false },
            { name: "Reusable Water Bottle", count: 8, ecoFriendly: true }
          ],
          forgottenItems: [
            { name: "Sunscreen", count: 5 },
            { name: "Power Bank", count: 4 },
            { name: "Rain Jacket", count: 3 }
          ],
          aiSuggestions: {
            accepted: 18,
            rejected: 12,
            acceptanceRate: 60
          }
        }
      },
      generatedAt: new Date("2025-08-20"),
      status: "completed",
      tags: ["comprehensive", "yearly"]
    },

    {
      ownerUid: sampleUsers[2],
      title: "Family Packing Efficiency Report",
      type: "packing_statistics",
      filters: {
        tripType: "Family"
      },
      data: {
        summary: {
          totalPackingLists: 6,
          totalItems: 89,
          completionRate: 82,
          ecoFriendlyPercentage: 28,
          aiUsagePercentage: 40
        },
        charts: [
          {
            type: "bar",
            title: "Items by Family Member",
            data: [25, 22, 18, 15, 9],
            labels: ["Dad", "Mom", "Child 1", "Child 2", "Shared"]
          },
          {
            type: "doughnut",
            title: "Packing Efficiency",
            data: [73, 16, 11],
            labels: ["Packed", "Forgotten", "Overpacked"]
          }
        ],
        details: {
          familyTips: [
            "Create separate lists for each family member",
            "Pack shared items in one category",
            "Double-check children's essential items"
          ]
        }
      },
      generatedAt: new Date("2025-09-05"),
      status: "completed",
      tags: ["family", "efficiency"]
    },

    // User Activity Reports
    {
      ownerUid: sampleUsers[0],
      title: "User Engagement Analytics 2025",
      type: "user_activity",
      filters: {},
      data: {
        summary: {
          totalTrips: 8,
          totalPackingLists: 12,
          totalPosts: 15,
          totalLikes: 245,
          avgLikesPerPost: 16.3
        },
        charts: [
          {
            type: "line",
            title: "Monthly Activity Trends",
            data: [2, 1, 3, 2, 1, 2, 1, 2, 1, 0, 0, 0],
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          },
          {
            type: "doughnut",
            title: "Content Distribution",
            data: [8, 12, 15],
            labels: ["Trips", "Packing Lists", "Posts"]
          },
          {
            type: "bar",
            title: "Engagement by Content Type",
            data: [245, 156, 89],
            labels: ["Post Likes", "List Views", "Trip Views"]
          }
        ],
        details: {
          engagementRate: 18.5,
          memberSince: new Date("2024-12-15"),
          streakDays: 45,
          achievementsBadges: [
            "Early Adopter",
            "Eco Warrior",
            "Travel Blogger",
            "Packing Expert"
          ]
        }
      },
      generatedAt: new Date("2025-09-10"),
      status: "completed",
      tags: ["engagement", "analytics"]
    },

    // Eco Impact Reports
    {
      ownerUid: sampleUsers[0],
      title: "Environmental Impact Assessment 2025",
      type: "eco_impact",
      filters: {},
      data: {
        summary: {
          totalTrips: 8,
          ecoFriendlyPercentage: 35,
          estimatedCarbonFootprint: 12500,
          carbonSaved: 850,
          ecoPostsShared: 8
        },
        charts: [
          {
            type: "pie",
            title: "Eco Items by Category",
            data: [15, 12, 5, 2, 16],
            labels: ["Clothing", "Toiletries", "Electronics", "Documents", "Miscellaneous"]
          },
          {
            type: "bar",
            title: "Carbon Footprint by Trip",
            data: [2500, 1800, 3000, 1200, 1500, 1000, 800, 700],
            labels: ["Bali", "Tokyo", "Paris", "Bangkok", "NY", "London", "Local1", "Local2"]
          },
          {
            type: "line",
            title: "Monthly Carbon Savings",
            data: [50, 80, 120, 100, 150, 120, 90, 110, 30, 0, 0, 0],
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          }
        ],
        details: {
          sustainabilityScore: 72,
          improvements: [
            "Increased eco-friendly item usage by 15%",
            "Reduced carbon footprint per trip by 8%",
            "Shared 8 sustainability-focused posts"
          ],
          recommendations: [
            "Consider train travel for shorter distances",
            "Pack 50% more reusable items",
            "Choose eco-certified accommodations",
            "Offset remaining carbon emissions"
          ],
          certifications: [
            "Eco Traveler Bronze",
            "Sustainable Packer"
          ]
        }
      },
      generatedAt: new Date("2025-09-22"),
      status: "completed",
      tags: ["environment", "sustainability", "impact"]
    },

    {
      ownerUid: sampleUsers[1],
      title: "Business Travel Carbon Footprint Q3",
      type: "eco_impact",
      filters: {
        dateRange: {
          startDate: new Date("2025-07-01"),
          endDate: new Date("2025-09-30")
        }
      },
      data: {
        summary: {
          totalTrips: 5,
          ecoFriendlyPercentage: 45,
          estimatedCarbonFootprint: 6800,
          carbonSaved: 320,
          ecoPostsShared: 2
        },
        charts: [
          {
            type: "bar",
            title: "Carbon Footprint by Business Trip",
            data: [1500, 1800, 1400, 1200, 900],
            labels: ["Singapore", "Seoul", "Hong Kong", "Kuala Lumpur", "Bangkok"]
          }
        ],
        details: {
          businessSustainabilityScore: 68,
          companyInitiatives: [
            "Use eco-friendly hotels",
            "Pack reusable business supplies",
            "Choose direct flights when possible"
          ]
        }
      },
      generatedAt: new Date("2025-09-28"),
      status: "completed",
      tags: ["business", "carbon", "quarterly"]
    },

    // Budget Analysis Reports
    {
      ownerUid: sampleUsers[0],
      title: "Annual Budget Analysis 2025",
      type: "budget_analysis",
      filters: {
        dateRange: {
          startDate: new Date("2025-01-01"),
          endDate: new Date("2025-12-31")
        }
      },
      data: {
        summary: {
          totalTrips: 8,
          totalBudget: 15000,
          avgBudget: 1875,
          maxBudget: 3000,
          minBudget: 700
        },
        charts: [
          {
            type: "bar",
            title: "Average Budget by Trip Type",
            data: [1600, 2100, 2400, 1800],
            labels: ["Solo", "Family", "Couple", "Group"]
          },
          {
            type: "line",
            title: "Monthly Spending Trends",
            data: [2500, 0, 4200, 1200, 1500, 2500, 800, 1800, 500, 0, 0, 0],
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          },
          {
            type: "doughnut",
            title: "Budget Allocation",
            data: [35, 25, 20, 15, 5],
            labels: ["Accommodation", "Transport", "Food", "Activities", "Shopping"]
          },
          {
            type: "pie",
            title: "Budget Range Distribution",
            data: [2, 3, 2, 1, 0],
            labels: ["$0-$500", "$501-$1000", "$1001-$2000", "$2001-$5000", "$5000+"]
          }
        ],
        details: {
          budgetByType: [
            { type: "Solo", total: 4800, average: 1600, trips: 3 },
            { type: "Family", total: 4200, average: 2100, trips: 2 },
            { type: "Couple", total: 4800, average: 2400, trips: 2 },
            { type: "Group", total: 1800, average: 1800, trips: 1 }
          ],
          savingsGoals: {
            targetAnnual: 20000,
            currentSpent: 15000,
            remaining: 5000,
            onTrack: true
          },
          budgetTips: [
            "Your family trips average 31% higher than solo trips",
            "Consider booking accommodations 2-3 months earlier for better rates",
            "Food costs are 20% of your total budget - try local markets"
          ]
        }
      },
      generatedAt: new Date("2025-09-25"),
      status: "completed",
      tags: ["budget", "annual", "analysis"]
    },

    // Destination Trends Report
    {
      ownerUid: sampleUsers[0],
      title: "Personal Destination Trends & Preferences",
      type: "destination_trends",
      filters: {},
      data: {
        summary: {
          totalTrips: 8,
          uniqueDestinations: 6,
          favoriteDestination: "Bali",
          avgStayDuration: 8.5,
          returnVisits: 2
        },
        charts: [
          {
            type: "bar",
            title: "Visits per Destination",
            data: [2, 2, 1, 1, 1, 1],
            labels: ["Bali", "Tokyo", "Paris", "Bangkok", "New York", "London"]
          },
          {
            type: "pie",
            title: "Destination Types",
            data: [4, 2, 2],
            labels: ["Beach/Tropical", "Urban/City", "Cultural/Historical"]
          },
          {
            type: "line",
            title: "Seasonal Travel Patterns",
            data: [1, 0, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          },
          {
            type: "doughnut",
            title: "Travel Distance Preferences",
            data: [3, 3, 2],
            labels: ["Regional (< 3 hours)", "Medium (3-8 hours)", "Long-haul (8+ hours)"]
          }
        ],
        details: {
          destinationPreferences: {
            climate: "Tropical/Warm",
            budget: "Mid-range",
            activities: ["Beaches", "Cultural sites", "Food tours"],
            accommodationType: "Hotels & Resorts"
          },
          upcomingTrends: [
            "Sustainable tourism destinations gaining popularity",
            "Digital nomad-friendly cities trending upward",
            "Off-season travel for better prices"
          ],
          personalRecommendations: [
            "Based on your preferences, consider: Sri Lanka, Thailand, Costa Rica",
            "You tend to travel more in spring/summer - try shoulder seasons for savings",
            "Your favorite destination type: Beach/Tropical with cultural elements"
          ]
        }
      },
      generatedAt: new Date("2025-09-18"),
      status: "completed",
      tags: ["destinations", "trends", "preferences"]
    },

    // Scheduled Reports
    {
      ownerUid: sampleUsers[0],
      title: "Weekly Packing Efficiency Update",
      type: "packing_statistics",
      filters: {
        dateRange: {
          startDate: new Date("2025-09-15"),
          endDate: new Date("2025-09-22")
        }
      },
      data: {
        summary: {
          totalPackingLists: 1,
          totalItems: 24,
          completionRate: 95,
          ecoFriendlyPercentage: 40,
          aiUsagePercentage: 60
        },
        charts: [
          {
            type: "bar",
            title: "Weekly Progress",
            data: [95, 85, 78],
            labels: ["This Week", "Last Week", "Average"]
          }
        ],
        details: {
          weeklyImprovement: "+10% completion rate",
          trends: ["Higher AI usage", "Better eco choices"]
        }
      },
      generatedAt: new Date("2025-09-22"),
      status: "completed",
      isScheduled: true,
      scheduleFrequency: "weekly",
      lastGenerated: new Date("2025-09-22"),
      tags: ["weekly", "scheduled", "efficiency"]
    },

    // Failed Report Example
    {
      ownerUid: sampleUsers[1],
      title: "Comprehensive Travel Report Q4 2025",
      type: "trip_analytics",
      filters: {
        dateRange: {
          startDate: new Date("2025-10-01"),
          endDate: new Date("2025-12-31")
        }
      },
      data: {},
      generatedAt: new Date("2025-09-30"),
      status: "failed",
      tags: ["failed", "comprehensive"]
    },

    // Pending Report Example
    {
      ownerUid: sampleUsers[2],
      title: "Family Travel Budget Planning 2026",
      type: "budget_analysis",
      filters: {
        tripType: "Family"
      },
      data: {},
      generatedAt: new Date("2025-09-30"),
      status: "generating",
      tags: ["planning", "2026", "generating"]
    }
  ];

  // Insert all reports
  const insertedReports = await Report.insertMany(reports);
  
  console.log(`✅ Successfully seeded ${insertedReports.length} reports:`);
  console.log(`   📊 Trip Analytics: ${reports.filter(r => r.type === 'trip_analytics').length}`);
  console.log(`   📦 Packing Statistics: ${reports.filter(r => r.type === 'packing_statistics').length}`);
  console.log(`   👤 User Activity: ${reports.filter(r => r.type === 'user_activity').length}`);
  console.log(`   🌱 Eco Impact: ${reports.filter(r => r.type === 'eco_impact').length}`);
  console.log(`   💰 Budget Analysis: ${reports.filter(r => r.type === 'budget_analysis').length}`);
  console.log(`   🗺️  Destination Trends: ${reports.filter(r => r.type === 'destination_trends').length}`);
  console.log(`   ⏰ Scheduled Reports: ${reports.filter(r => r.isScheduled).length}`);
  console.log(`   ❌ Failed Reports: ${reports.filter(r => r.status === 'failed').length}`);
  console.log(`   ⏳ Generating Reports: ${reports.filter(r => r.status === 'generating').length}`);

  await mongoose.connection.close();
  console.log("🔌 Database connection closed");
}

// Add some utility functions for generating more sample data
async function generateAdditionalReports(userUid, count = 5) {
  const reportTypes = ['trip_analytics', 'packing_statistics', 'user_activity', 'eco_impact', 'budget_analysis'];
  const additionalReports = [];

  for (let i = 0; i < count; i++) {
    const randomType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    const randomDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    additionalReports.push({
      ownerUid: userUid,
      title: `Generated Report ${i + 1} - ${randomType.replace('_', ' ').toUpperCase()}`,
      type: randomType,
      filters: {},
      data: {
        summary: {
          totalTrips: Math.floor(Math.random() * 10) + 1,
          totalBudget: (Math.floor(Math.random() * 50) + 10) * 100,
          avgBudget: Math.floor(Math.random() * 2000) + 500
        },
        charts: [],
        details: {}
      },
      generatedAt: randomDate,
      status: Math.random() > 0.1 ? 'completed' : 'failed',
      tags: ['generated', 'sample']
    });
  }

  return Report.insertMany(additionalReports);
}

// Run the seed function
if (require.main === module) {
  seedReports().catch((err) => {
    console.error("❌ Error seeding reports:", err);
    process.exit(1);
  });
}

module.exports = { seedReports, generateAdditionalReports };