# 📊 PackLightly API - Report Formats Specification

This document defines **consistent reporting formats** for all modules in the PackLightly API, fully aligned with the existing `ReportSchema` structure.

## 🏗️ Base Report Structure

Every report follows this standardized format:

```javascript
{
  ownerUid: "user123",
  title: "Module Report - October 2025",
  type: "report_type", // One of the enum values
  filters: {
    dateRange: { startDate: "2025-10-01", endDate: "2025-10-31" },
    tripType: "Solo|Couple|Family|Group", // Optional
    destination: "Location Name", // Optional
    budgetRange: { min: 100, max: 5000 } // Optional
  },
  data: {
    summary: { /* Key metrics */ },
    charts: [ /* Chart configurations */ ],
    details: { /* Detailed breakdown */ }
  },
  format: "json|pdf|csv",
  status: "completed",
  tags: ["analytics", "monthly"],
  isScheduled: false,
  generatedAt: "2025-10-14T10:30:00Z"
}
```

---

## 🧳 1. Trip Analytics (`trip_analytics`)

### Purpose
Analyze travel patterns, destinations, duration, and eco-impact of user trips.

### Summary Fields
```javascript
summary: {
  totalTrips: 42,                    // Total number of trips
  uniqueDestinations: 18,            // Number of distinct destinations
  favoriteDestination: "Ella",       // Most visited destination
  avgTripDuration: 4.8,              // Average days per trip
  avgStayDuration: 4.8,              // Same as avgTripDuration
  ecoFriendlyPercentage: 67,         // % of eco-friendly trips
  returnVisits: 5,                   // Number of repeat destinations
  estimatedCarbonFootprint: 280.5,   // kg CO₂ emitted
  carbonSaved: 65.2                  // kg CO₂ saved via eco choices
}
```

### Chart Configurations
```javascript
charts: [
  {
    type: "bar",
    title: "Trips Per Month",
    data: [3, 5, 2, 8, 6, 4, 7, 9, 3, 2, 1, 0],
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  {
    type: "pie",
    title: "Trip Types Distribution",
    data: [15, 10, 12, 5],
    labels: ["Solo", "Couple", "Family", "Group"]
  },
  {
    type: "line",
    title: "Eco Score Improvement",
    data: [65, 68, 72, 75, 78, 81],
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  }
]
```

### Details Structure
```javascript
details: {
  topDestinations: [
    { name: "Ella", trips: 10, avgDuration: 3.5, ecoScore: 85 },
    { name: "Kandy", trips: 8, avgDuration: 4.0, ecoScore: 78 },
    { name: "Galle", trips: 6, avgDuration: 2.5, ecoScore: 92 }
  ],
  monthlyBreakdown: [
    { month: "October", trips: 4, avgDuration: 5.2, carbonFootprint: 45.2 }
  ],
  ecoImpactBreakdown: {
    transportationSavings: 35.2,
    accommodationSavings: 20.0,
    activitySavings: 10.0
  },
  recommendations: [
    "Consider eco-friendly accommodation in Colombo for better sustainability scores",
    "Your Ella trips show excellent eco-performance - continue this pattern"
  ]
}
```

---

## 🎒 2. Packing Statistics (`packing_statistics`)

### Purpose
Analyze packing list efficiency, completion rates, and eco-friendly packing trends.

### Summary Fields
```javascript
summary: {
  totalPackingLists: 20,        // Total packing lists created
  completionRate: 85,           // % of completed lists
  ecoFriendlyPercentage: 58,    // % with eco-friendly items
  aiUsagePercentage: 34,        // % generated via AI assistance
  avgItemsPerList: 18           // Average items per packing list
}
```

### Chart Configurations
```javascript
charts: [
  {
    type: "pie",
    title: "Item Categories Distribution",
    data: [35, 25, 15, 12, 8, 5],
    labels: ["Clothes", "Toiletries", "Electronics", "Documents", "Accessories", "Others"]
  },
  {
    type: "line",
    title: "Completion Rate Over Time",
    data: [75, 78, 82, 85, 88, 85],
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  },
  {
    type: "bar",
    title: "Eco vs Non-Eco Items",
    data: [12, 6],
    labels: ["Eco-Friendly", "Standard"]
  }
]
```

### Details Structure
```javascript
details: {
  categoryBreakdown: {
    "Clothes": { totalItems: 180, ecoItems: 65, avgPerList: 9 },
    "Toiletries": { totalItems: 95, ecoItems: 45, avgPerList: 4.75 },
    "Electronics": { totalItems: 60, ecoItems: 15, avgPerList: 3 }
  },
  topItems: [
    { name: "Eco-friendly toothbrush", frequency: 18, category: "Toiletries" },
    { name: "Reusable water bottle", frequency: 20, category: "Accessories" }
  ],
  packingEfficiency: {
    averagePackingTime: "25 minutes",
    mostEfficientTrip: "Kandy Weekend - 95% completion",
    improvementSuggestions: [
      "Consider adding more reusable items for eco-friendliness",
      "Electronics category needs more eco alternatives"
    ]
  }
}
```

---

## 👥 3. User Activity (`user_activity`)

### Purpose
Analyze user engagement, content creation, and community participation.

### Summary Fields
```javascript
summary: {
  totalPosts: 320,              // Total posts created
  totalLikes: 1240,             // Total likes received
  avgLikesPerPost: 3.8,         // Average likes per post
  ecoPostsShared: 75,           // Eco-related posts count
  // Additional community metrics can be added as needed
}
```

### Chart Configurations
```javascript
charts: [
  {
    type: "bar",
    title: "Posts Per Week",
    data: [8, 12, 6, 15, 10, 9, 11],
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"]
  },
  {
    type: "pie",
    title: "Content Type Distribution",
    data: [45, 30, 15, 10],
    labels: ["Trip Reviews", "Eco Tips", "Packing Advice", "General"]
  },
  {
    type: "line",
    title: "Engagement Trend",
    data: [3.2, 3.5, 3.8, 4.1, 3.9, 3.8],
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  }
]
```

### Details Structure
```javascript
details: {
  engagementMetrics: {
    postsPerMonth: 24,
    avgCommentsPerPost: 2.3,
    topPerformingPost: {
      title: "Eco-Friendly Kandy Adventure",
      likes: 45,
      comments: 12,
      date: "2025-09-15"
    }
  },
  contentAnalysis: {
    ecoContentPercentage: 23.4,
    popularTopics: ["sustainable travel", "local experiences", "budget tips"],
    engagementByCategory: {
      "Trip Reviews": 4.2,
      "Eco Tips": 3.8,
      "Packing Advice": 3.5
    }
  }
}
```

---

## 🌱 4. Eco Impact (`eco_impact`)

### Purpose
Cross-module sustainability analysis and environmental impact tracking.

### Summary Fields
```javascript
summary: {
  sustainabilityScore: 84,         // Overall sustainability score (0-100)
  carbonSaved: 120.5,              // Total carbon saved (kg CO₂)
  ecoFriendlyPercentage: 63,       // % of eco-aligned activities
  aiUsagePercentage: 27,           // AI-assisted eco recommendations
  estimatedCarbonFootprint: 450.2  // Total estimated emissions
}
```

### Chart Configurations
```javascript
charts: [
  {
    type: "line",
    title: "Sustainability Score Growth",
    data: [65, 68, 72, 76, 80, 84],
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  },
  {
    type: "bar",
    title: "Carbon Impact by Module",
    data: [280.5, 95.2, 74.5],
    labels: ["Trips", "Packing", "Inventory"]
  },
  {
    type: "pie",
    title: "Eco Activities Distribution",
    data: [40, 25, 20, 15],
    labels: ["Eco Transport", "Green Accommodation", "Sustainable Products", "Local Experiences"]
  }
]
```

### Details Structure
```javascript
details: {
  moduleBreakdown: {
    trips: {
      ecoFriendlyTrips: 28,
      carbonSaved: 65.2,
      sustainabilityScore: 78
    },
    packing: {
      ecoItems: 110,
      carbonSaved: 25.3,
      sustainabilityScore: 68
    },
    inventory: {
      sustainableProducts: 142,
      avgEcoRating: 4.3,
      sustainabilityScore: 86
    }
  },
  impactMetrics: {
    treesEquivalent: 5.4,
    waterSaved: "1,250 liters",
    wasteReduced: "15.2 kg"
  },
  recommendations: [
    "Focus on eco-friendly transportation for bigger impact",
    "Your sustainable product choices are excellent - keep it up!",
    "Consider carbon offset programs for remaining emissions"
  ]
}
```

---

## 💰 5. Budget Analysis (`budget_analysis`)

### Purpose
Financial analysis of travel expenses and budget optimization insights.

### Summary Fields
```javascript
summary: {
  totalBudget: 25000,           // Total budget allocated (LKR)
  avgBudget: 1250,              // Average budget per trip
  maxBudget: 5000,              // Highest single trip budget
  minBudget: 500                // Lowest single trip budget
}
```

### Chart Configurations
```javascript
charts: [
  {
    type: "bar",
    title: "Monthly Budget Spending",
    data: [2500, 3200, 1800, 4500, 3100, 2900],
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  },
  {
    type: "pie",
    title: "Budget Categories",
    data: [8000, 6000, 5000, 3500, 2500],
    labels: ["Accommodation", "Transport", "Food", "Activities", "Shopping"]
  },
  {
    type: "line",
    title: "Budget vs Actual Spending",
    data: [2500, 3200, 1800, 4500, 3100, 2900],
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  }
]
```

### Details Structure
```javascript
details: {
  categoryBreakdown: [
    { category: "Accommodation", budgeted: 8000, spent: 7500, variance: -500 },
    { category: "Transport", budgeted: 6000, spent: 6200, variance: 200 }
  ],
  savingsOpportunities: [
    "Consider homestays in Ella for 20% accommodation savings",
    "Public transport usage can reduce transport costs by 35%"
  ],
  expenseAnalysis: {
    mostExpensiveTrip: "Maldives Gateway - LKR 5000",
    mostEconomicalTrip: "Colombo Day Trip - LKR 500",
    avgDailyCost: 280
  }
}
```

---

## 📍 6. Destination Trends (`destination_trends`)

### Purpose
Analyze popular destinations, travel patterns, and location-based insights.

### Summary Fields
```javascript
summary: {
  uniqueDestinations: 18,       // Number of unique destinations
  favoriteDestination: "Ella",  // Most visited destination
  returnVisits: 5,              // Repeat destination visits
  avgStayDuration: 4.8          // Average stay duration
}
```

### Chart Configurations
```javascript
charts: [
  {
    type: "bar",
    title: "Top Destinations by Visits",
    data: [10, 8, 6, 5, 4],
    labels: ["Ella", "Kandy", "Galle", "Nuwara Eliya", "Colombo"]
  },
  {
    type: "pie",
    title: "Destination Types",
    data: [12, 8, 6, 4],
    labels: ["Hill Country", "Coastal", "Cultural", "Urban"]
  },
  {
    type: "line",
    title: "Seasonal Travel Patterns",
    data: [2, 3, 4, 3, 2, 1, 2, 4, 6, 5, 3, 2],
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  }
]
```

### Details Structure
```javascript
details: {
  destinationProfiles: [
    {
      name: "Ella",
      visits: 10,
      avgDuration: 3.5,
      bestSeason: "Apr-Sep",
      ecoScore: 85,
      avgBudget: 1200,
      activities: ["Hiking", "Train rides", "Tea plantations"]
    }
  ],
  travelPatterns: {
    preferredTripLength: "3-4 days",
    seasonalPreference: "Dry season",
    budgetRange: "LKR 1000-2000"
  },
  hiddenGems: [
    "Haputale shows great potential based on your Ella preferences",
    "Consider Mirissa for coastal experiences"
  ]
}
```

---

## 🌿 7. Eco Inventory (`eco_inventory`)

### Purpose
Track eco-friendly product data, ratings, and availability analysis.

### Summary Fields
```javascript
summary: {
  totalEcoProducts: 230,                    // Total eco products listed
  sustainableProducts: 142,                 // Verified sustainable products
  avgEcoRating: 4.3,                       // Average eco product rating
  ecoProductsByCategory: {                  // Products by category
    "Clothing": 80,
    "Gear": 50,
    "Toiletries": 40,
    "Accessories": 35,
    "Electronics": 25
  },
  ecoProductAvailability: {                 // Stock status
    "In Stock": 200,
    "Out of Stock": 30
  }
}
```

### Chart Configurations
```javascript
charts: [
  {
    type: "bar",
    title: "Top 5 Eco Product Categories",
    data: [80, 50, 40, 35, 25],
    labels: ["Clothing", "Gear", "Toiletries", "Accessories", "Electronics"]
  },
  {
    type: "pie",
    title: "Product Availability",
    data: [200, 30],
    labels: ["In Stock", "Out of Stock"]
  },
  {
    type: "line",
    title: "Average Rating Trends",
    data: [4.0, 4.1, 4.2, 4.2, 4.3, 4.3],
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  }
]
```

### Details Structure
```javascript
details: {
  categoryAnalysis: {
    "Clothing": {
      totalProducts: 80,
      avgRating: 4.5,
      topBrands: ["EcoWear", "GreenThreads", "SustainableSri"],
      priceRange: "LKR 500-3000"
    },
    "Toiletries": {
      totalProducts: 40,
      avgRating: 4.1,
      topBrands: ["NatureCare", "EcoClean"],
      priceRange: "LKR 200-1500"
    }
  },
  topRatedProducts: [
    { name: "Bamboo Toothbrush", category: "Toiletries", rating: 4.8, price: 250 },
    { name: "Organic Cotton T-Shirt", category: "Clothing", rating: 4.7, price: 1200 }
  ],
  sustainabilityMetrics: {
    certifiedOrganic: 85,
    fairTrade: 45,
    carbonneutral: 62
  },
  recommendations: [
    "Electronics category needs more eco-friendly options",
    "Consider featuring more local sustainable brands"
  ]
}
```

---

## 📰 8. News Section (`news_section`)

### Purpose
Analyze news content engagement, sources, and publication trends.

### Summary Fields
```javascript
summary: {
  totalNewsArticles: 180,               // Total articles fetched
  recentArticles: 40,                   // Articles added this period
  trendingTopics: {                     // Popular topics with counts
    "eco-tourism": 25,
    "sustainable travel": 18,
    "local experiences": 15,
    "budget travel": 12
  },
  newsBySource: {                       // Articles by source
    "BBC": 45,
    "National Geographic": 60,
    "Travel Weekly": 35,
    "Eco Tourism News": 40
  },
  publicationFrequency: {               // Publishing patterns
    "daily": 20,
    "weekly": 60,
    "monthly": 100
  }
}
```

### Chart Configurations
```javascript
charts: [
  {
    type: "pie",
    title: "News Sources Distribution",
    data: [60, 45, 40, 35],
    labels: ["National Geographic", "BBC", "Eco Tourism News", "Travel Weekly"]
  },
  {
    type: "bar",
    title: "Trending Topics",
    data: [25, 18, 15, 12, 8],
    labels: ["Eco-Tourism", "Sustainable Travel", "Local Experiences", "Budget Travel", "Wildlife"]
  },
  {
    type: "line",
    title: "Articles Published Per Week",
    data: [12, 15, 8, 18, 14, 11, 16],
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"]
  }
]
```

### Details Structure
```javascript
details: {
  sourceAnalysis: {
    "BBC": {
      totalArticles: 45,
      avgReadTime: "3.5 minutes",
      topTopics: ["sustainable travel", "wildlife conservation"],
      reliability: "high"
    },
    "National Geographic": {
      totalArticles: 60,
      avgReadTime: "5.2 minutes",
      topTopics: ["eco-tourism", "local cultures"],
      reliability: "high"
    }
  },
  contentQuality: {
    avgWordCount: 850,
    avgReadTime: "4.2 minutes",
    topicDiversity: 85,
    freshnessScore: 92
  },
  engagementMetrics: {
    mostReadArticle: "Sustainable Travel in Sri Lanka",
    avgEngagementRate: 15.2,
    shareRate: 8.5
  },
  recommendations: [
    "Increase coverage of local eco-initiatives",
    "Add more practical travel tips content",
    "Feature more Sri Lankan destinations"
  ]
}
```

---

## 🔧 Implementation Guidelines

### 1. Report Generation Flow
```javascript
// Example report generation
const generateReport = async (type, ownerUid, filters) => {
  const reportData = {
    ownerUid,
    title: generateReportTitle(type, filters),
    type,
    filters,
    data: {
      summary: await generateSummary(type, ownerUid, filters),
      charts: await generateCharts(type, ownerUid, filters),
      details: await generateDetails(type, ownerUid, filters)
    },
    format: 'json',
    status: 'completed',
    tags: generateTags(type, filters)
  };
  
  return new Report(reportData);
};
```

### 2. Chart Data Structure
```javascript
// Standard chart format
{
  type: "bar|line|pie|doughnut",
  title: "Human readable title",
  data: [1, 2, 3, 4], // Array of numbers
  labels: ["Label1", "Label2", "Label3", "Label4"] // Array of strings
}
```

### 3. AI-Generated Recommendations
Each report should include contextual AI recommendations:
```javascript
details: {
  // ... other details
  recommendations: [
    "Actionable insight based on data",
    "Specific suggestion for improvement",
    "Trend-based recommendation"
  ]
}
```

### 4. Performance Considerations
- Cache frequently accessed summary data
- Use aggregation pipelines for complex calculations
- Implement pagination for large detail datasets
- Consider background generation for complex reports

### 5. Error Handling
```javascript
// Graceful degradation for missing data
summary: {
  totalTrips: userData.trips?.length || 0,
  avgTripDuration: calculateAverage(userData.trips, 'duration') || 0,
  // Provide defaults for all metrics
}
```

---

## 🎯 Next Steps

1. **Implement Report Generators**: Create service functions for each report type
2. **Add Data Validation**: Ensure all summary fields match schema constraints
3. **Create Chart Helpers**: Utility functions for generating chart configurations
4. **Add Scheduling**: Implement automatic report generation
5. **Export Formats**: Add PDF and CSV export capabilities
6. **Caching Strategy**: Implement Redis caching for performance
7. **AI Insights**: Integrate AI for generating recommendations

---

This specification ensures all reports follow a consistent structure while leveraging your existing robust schema design. Each report type provides valuable insights specific to its domain while maintaining cross-module compatibility.