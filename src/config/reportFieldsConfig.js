// Report Field Configuration for Dynamic Report Generation
// This configuration defines which fields are mandatory vs optional for each report type

module.exports = {
  trip_analytics: {
    mandatory: [
      'summary.totalTrips',
      'summary.totalBudget',
      'summary.avgTripDuration',
      'summary.avgBudget',
      'summary.maxBudget',
      'summary.minBudget',
      'summary.estimatedCarbonFootprint',
      'summary.uniqueDestinations',
      'summary.favoriteDestination',
      'summary.avgStayDuration',
      'charts'
    ],
    optional: []
  },
  
  packing_statistics: {
    mandatory: [
      'summary.totalPackingLists',
      'summary.completionRate',
      'summary.totalItems',
      'charts'
    ],
    optional: [
      'summary.checkedItems',
      'summary.ecoItems',
      'summary.aiGeneratedItems',
      'summary.avgItemsPerList',
      'summary.ecoPercentage',
      'details.topItems',
      'details.topEcoItems',
      'details.recommendations',
      'details.categoryBreakdown',
      'details.completionTrends',
      'details.itemUsageStats'
    ]
  },
  
  eco_inventory: {
    mandatory: [
      'summary.totalProducts',
      'summary.trendingProducts',
      'summary.avgEcoRating',
      'charts'
    ],
    optional: [
      'summary.totalBrands',
      'summary.totalCategories',
      'summary.sustainabilityScore',
      'details.categoryBreakdown',
      'details.ecoImpact',
      'details.recommendations',
      'details.topBrands',
      'details.priceAnalysis',
      'details.sustainabilityTrends'
    ]
  },
  
  news_insights: {
    mandatory: [
      'summary.totalNews',
      'summary.activeSources',
      'summary.avgArticlesPerDay',
      'charts'
    ],
    optional: [
      'summary.totalSources',
      'summary.latestUpdate',
      'summary.topSource',
      'details.topCategories',
      'details.trendingTopics',
      'details.recommendations',
      'details.sourceBreakdown',
      'details.timelineAnalysis',
      'details.contentInsights'
    ]
  },
  
  community_analytics: {
    mandatory: [
      'summary.totalPosts',
      'summary.totalComments',
      'summary.totalLikes',
      'charts'
    ],
    optional: [
      'summary.engagementRate',
      'summary.avgCommentsPerPost',
      'summary.avgLikesPerPost',
      'details.topContributors',
      'details.mostActiveTopics',
      'details.recommendations',
      'details.engagementTrends',
      'details.contentAnalysis',
      'details.communityGrowth'
    ]
  },
  
  user_activity: {
    mandatory: [
      'summary.totalTrips',
      'summary.totalPackingLists', 
      'summary.totalPosts',
      'summary.totalLikes',
      'summary.avgLikesPerPost',
      'charts'
    ],
    optional: [
      'summary.totalComments',
      'summary.aiUsagePercentage',
      'details.recentActivity',
      'details.engagementRate',
      'details.memberSince'
    ]
  },
  
  budget_analysis: {
    mandatory: [
      'summary.totalBudget',
      'summary.avgBudget',
      'summary.budgetRange',
      'charts'
    ],
    optional: [
      'summary.maxBudget',
      'summary.minBudget',
      'summary.budgetTrends',
      'details.budgetBreakdown',
      'details.recommendations',
      'details.costSavings',
      'details.seasonalTrends',
      'details.destinationCosts'
    ]
  },
  
  destination_trends: {
    mandatory: [
      'summary.topDestinations',
      'summary.emergingDestinations',
      'summary.totalDestinations',
      'charts'
    ],
    optional: [
      'summary.avgStayDuration',
      'summary.popularSeasons',
      'summary.destinationDiversity',
      'details.seasonalTrends',
      'details.recommendations',
      'details.destinationAnalysis',
      'details.travelPatterns',
      'details.popularityChanges'
    ]
  },
  
  eco_impact: {
    mandatory: [
      'summary.totalCarbonSaved',
      'summary.ecoScore',
      'summary.sustainabilityRating',
      'charts'
    ],
    optional: [
      'summary.carbonFootprint',
      'summary.ecoChoicesCount',
      'summary.impactImprovement',
      'details.ecoBreakdown',
      'details.recommendations',
      'details.impactTrends',
      'details.sustainabilityGoals',
      'details.ecoAlternatives'
    ]
  },
  
  news_section: {
    mandatory: [
      'summary.totalNews',
      'summary.activeSources',
      'summary.avgArticlesPerDay',
      'charts'
    ],
    optional: [
      'summary.totalSources',
      'summary.latestUpdate',
      'summary.topSource',
      'details.topCategories',
      'details.trendingTopics',
      'details.recommendations',
      'details.sourceBreakdown',
      'details.timelineAnalysis',
      'details.contentInsights'
    ]
  }
};