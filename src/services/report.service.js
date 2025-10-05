const Report = require('../models/Report');
const Trip = require('../models/Trip');
const PackingList = require('../models/PackingList');
const Post = require('../models/Post');
const Product = require('../models/Product');

class ReportService {
  // Create a new report
  static async create(reportData) {
    return Report.create(reportData);
  }

  // List reports for a user
  static async list(ownerUid, filters = {}) {
    const query = { ownerUid };
    
    if (filters.type) query.type = filters.type;
    if (filters.fromDate) query.generatedAt = { $gte: new Date(filters.fromDate) };
    if (filters.toDate) {
      query.generatedAt = query.generatedAt || {};
      query.generatedAt.$lte = new Date(filters.toDate);
    }

    return Report.find(query)
      .sort({ generatedAt: -1 })
      .limit(filters.limit || 50);
  }

  // Get a specific report
  static async get(id, ownerUid) {
    return Report.findOne({ _id: id, ownerUid });
  }

  // Delete a report
  static async remove(id, ownerUid) {
    return Report.findOneAndDelete({ _id: id, ownerUid });
  }

  // Generate Trip Analytics Report
  static async generateTripAnalytics(ownerUid, filters = {}) {
    const query = { ownerUid };
    
    // Apply date filters
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
      query.startDate = {};
      if (filters.dateRange.startDate) {
        query.startDate.$gte = new Date(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query.startDate.$lte = new Date(filters.dateRange.endDate);
      }
    }

    // Apply trip type filter
    if (filters.tripType) {
      query.type = filters.tripType;
    }

    // Apply destination filter
    if (filters.destination) {
      query.destination = new RegExp(filters.destination, 'i');
    }

    // Apply budget filter
    if (filters.budgetRange?.min || filters.budgetRange?.max) {
      query.budget = {};
      if (filters.budgetRange.min) query.budget.$gte = filters.budgetRange.min;
      if (filters.budgetRange.max) query.budget.$lte = filters.budgetRange.max;
    }

    const trips = await Trip.find(query).sort({ startDate: -1 });

    // Calculate summary statistics
    const totalTrips = trips.length;
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    const avgTripDuration = totalTrips > 0 ? 
      trips.reduce((sum, trip) => sum + (trip.durationDays || 0), 0) / totalTrips : 0;

    // Trip type distribution
    const tripTypeData = {};
    trips.forEach(trip => {
      tripTypeData[trip.type] = (tripTypeData[trip.type] || 0) + 1;
    });

    // Destination trends
    const destinationData = {};
    trips.forEach(trip => {
      if (trip.destination) {
        destinationData[trip.destination] = (destinationData[trip.destination] || 0) + 1;
      }
    });

    // Monthly trends
    const monthlyData = {};
    trips.forEach(trip => {
      if (trip.startDate) {
        const month = trip.startDate.toISOString().slice(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });

    // Budget analysis
    const budgetRanges = {
      '0-500': 0,
      '501-1000': 0,
      '1001-2000': 0,
      '2001-5000': 0,
      '5000+': 0
    };

    trips.forEach(trip => {
      const budget = trip.budget || 0;
      if (budget <= 500) budgetRanges['0-500']++;
      else if (budget <= 1000) budgetRanges['501-1000']++;
      else if (budget <= 2000) budgetRanges['1001-2000']++;
      else if (budget <= 5000) budgetRanges['2001-5000']++;
      else budgetRanges['5000+']++;
    });

    const reportData = {
      ownerUid,
      title: 'Trip Analytics Report',
      type: 'trip_analytics',
      filters,
      data: {
        summary: {
          totalTrips,
          totalBudget,
          avgTripDuration: Math.round(avgTripDuration * 100) / 100,
          avgBudget: totalTrips > 0 ? Math.round(totalBudget / totalTrips) : 0
        },
        charts: [
          {
            type: 'pie',
            title: 'Trip Types Distribution',
            data: Object.values(tripTypeData),
            labels: Object.keys(tripTypeData)
          },
          {
            type: 'bar',
            title: 'Top Destinations',
            data: Object.values(destinationData).slice(0, 10),
            labels: Object.keys(destinationData).slice(0, 10)
          },
          {
            type: 'line',
            title: 'Monthly Trip Trends',
            data: Object.values(monthlyData),
            labels: Object.keys(monthlyData)
          },
          {
            type: 'doughnut',
            title: 'Budget Distribution',
            data: Object.values(budgetRanges),
            labels: Object.keys(budgetRanges)
          }
        ],
        details: {
          trips: trips.slice(0, 10), // Latest 10 trips
          totalPages: Math.ceil(totalTrips / 10)
        }
      }
    };

    return this.create(reportData);
  }

  // Generate Packing Statistics Report
  static async generatePackingStatistics(ownerUid, filters = {}) {
    const query = { ownerUid };

    const packingLists = await PackingList.find(query).populate('tripId');

    const totalLists = packingLists.length;
    let totalItems = 0;
    let checkedItems = 0;
    let ecoItems = 0;
    let aiGeneratedItems = 0;

    const categoryStats = {};
    const itemFrequency = {};

    packingLists.forEach(list => {
      list.categories.forEach(category => {
        if (!categoryStats[category.name]) {
          categoryStats[category.name] = { total: 0, checked: 0, eco: 0 };
        }

        category.items.forEach(item => {
          totalItems++;
          categoryStats[category.name].total++;
          
          if (item.checked) {
            checkedItems++;
            categoryStats[category.name].checked++;
          }
          
          if (item.eco) {
            ecoItems++;
            categoryStats[category.name].eco++;
          }
          
          if (item.suggestedByAI) {
            aiGeneratedItems++;
          }

          // Track item frequency
          const itemName = item.name.toLowerCase();
          itemFrequency[itemName] = (itemFrequency[itemName] || 0) + 1;
        });
      });
    });

    // Calculate percentages
    const completionRate = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
    const ecoPercentage = totalItems > 0 ? (ecoItems / totalItems) * 100 : 0;
    const aiUsagePercentage = totalItems > 0 ? (aiGeneratedItems / totalItems) * 100 : 0;

    // Most common items
    const commonItems = Object.entries(itemFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    const reportData = {
      ownerUid,
      title: 'Packing Statistics Report',
      type: 'packing_statistics',
      filters,
      data: {
        summary: {
          totalPackingLists: totalLists,
          totalItems,
          completionRate: Math.round(completionRate),
          ecoFriendlyPercentage: Math.round(ecoPercentage),
          aiUsagePercentage: Math.round(aiUsagePercentage)
        },
        charts: [
          {
            type: 'bar',
            title: 'Items by Category',
            data: Object.values(categoryStats).map(stat => stat.total),
            labels: Object.keys(categoryStats)
          },
          {
            type: 'doughnut',
            title: 'Completion Rate by Category',
            data: Object.values(categoryStats).map(stat => 
              stat.total > 0 ? Math.round((stat.checked / stat.total) * 100) : 0
            ),
            labels: Object.keys(categoryStats)
          },
          {
            type: 'bar',
            title: 'Most Common Items',
            data: commonItems.slice(0, 10).map(item => item.count),
            labels: commonItems.slice(0, 10).map(item => item.name)
          }
        ],
        details: {
          categoryStats,
          commonItems: commonItems.slice(0, 50),
          recentLists: packingLists.slice(0, 10)
        }
      }
    };

    return this.create(reportData);
  }

  // Generate Eco Impact Report
  static async generateEcoImpact(ownerUid, filters = {}) {
    const [trips, packingLists, posts] = await Promise.all([
      Trip.find({ ownerUid }),
      PackingList.find({ ownerUid }),
      Post.find({ ownerUid })
    ]);

    let totalEcoItems = 0;
    let totalItems = 0;
    const ecoCategories = {};

    packingLists.forEach(list => {
      list.categories.forEach(category => {
        category.items.forEach(item => {
          totalItems++;
          if (item.eco) {
            totalEcoItems++;
            ecoCategories[category.name] = (ecoCategories[category.name] || 0) + 1;
          }
        });
      });
    });

    // Calculate carbon footprint estimate based on trip data
    let estimatedCarbon = 0;
    trips.forEach(trip => {
      // Simple estimation: domestic trips = 500kg CO2, international = 2000kg CO2
      const isDomestic = trip.destination && trip.destination.includes('Sri Lanka');
      estimatedCarbon += isDomestic ? 500 : 2000;
    });

    // Eco-friendly posts count
    const ecoPostsCount = posts.filter(post => 
      post.tags.some(tag => ['eco', 'sustainable', 'green', 'environment'].includes(tag.toLowerCase()))
    ).length;

    const ecoPercentage = totalItems > 0 ? (totalEcoItems / totalItems) * 100 : 0;
    const carbonSaved = totalEcoItems * 0.5; // Estimate 0.5kg CO2 saved per eco item

    const reportData = {
      ownerUid,
      title: 'Eco Impact Report',
      type: 'eco_impact',
      filters,
      data: {
        summary: {
          totalTrips: trips.length,
          ecoFriendlyPercentage: Math.round(ecoPercentage),
          estimatedCarbonFootprint: Math.round(estimatedCarbon),
          carbonSaved: Math.round(carbonSaved),
          ecoPostsShared: ecoPostsCount
        },
        charts: [
          {
            type: 'pie',
            title: 'Eco Items by Category',
            data: Object.values(ecoCategories),
            labels: Object.keys(ecoCategories)
          },
          {
            type: 'bar',
            title: 'Environmental Impact Over Time',
            data: [estimatedCarbon, carbonSaved],
            labels: ['Carbon Footprint (kg)', 'Carbon Saved (kg)']
          }
        ],
        details: {
          recommendations: [
            'Consider using reusable water bottles on all trips',
            'Pack eco-friendly toiletries and personal care items',
            'Choose sustainable accommodation options',
            'Use public transportation when possible',
            'Share your eco-friendly travel tips with the community'
          ],
          ecoItemsByCategory: ecoCategories,
          sustainabilityScore: Math.min(100, Math.round(ecoPercentage + (ecoPostsCount * 5)))
        }
      }
    };

    return this.create(reportData);
  }

  // Generate User Activity Report
  static async generateUserActivity(ownerUid, filters = {}) {
    const [trips, packingLists, posts] = await Promise.all([
      Trip.find({ ownerUid }).sort({ createdAt: -1 }),
      PackingList.find({ ownerUid }).sort({ createdAt: -1 }),
      Post.find({ ownerUid }).sort({ date: -1 })
    ]);

    // Activity by month
    const monthlyActivity = {};
    const allItems = [...trips, ...packingLists, ...posts];
    
    allItems.forEach(item => {
      const date = item.createdAt || item.date;
      if (date) {
        const month = date.toISOString().slice(0, 7);
        monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
      }
    });

    // Engagement metrics
    const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

    // AI usage
    const aiGeneratedLists = packingLists.filter(list => list.isAIGenerated).length;
    const aiUsagePercentage = packingLists.length > 0 ? 
      (aiGeneratedLists / packingLists.length) * 100 : 0;

    const reportData = {
      ownerUid,
      title: 'User Activity Report',
      type: 'user_activity',
      filters,
      data: {
        summary: {
          totalTrips: trips.length,
          totalPackingLists: packingLists.length,
          totalPosts: posts.length,
          totalLikes: totalLikes,
          avgLikesPerPost: posts.length > 0 ? Math.round(totalLikes / posts.length) : 0
        },
        charts: [
          {
            type: 'line',
            title: 'Monthly Activity',
            data: Object.values(monthlyActivity),
            labels: Object.keys(monthlyActivity)
          },
          {
            type: 'doughnut',
            title: 'Content Distribution',
            data: [trips.length, packingLists.length, posts.length],
            labels: ['Trips', 'Packing Lists', 'Posts']
          }
        ],
        details: {
          recentActivity: allItems.slice(0, 20),
          aiUsagePercentage: Math.round(aiUsagePercentage),
          engagementRate: posts.length > 0 ? Math.round(((totalLikes + totalComments) / posts.length) * 100) / 100 : 0,
          memberSince: trips[0]?.createdAt || packingLists[0]?.createdAt || new Date()
        }
      }
    };

    return this.create(reportData);
  }

  // Generate Budget Analysis Report
  static async generateBudgetAnalysis(ownerUid, filters = {}) {
    const query = { ownerUid };
    
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
      query.startDate = {};
      if (filters.dateRange.startDate) {
        query.startDate.$gte = new Date(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query.startDate.$lte = new Date(filters.dateRange.endDate);
      }
    }

    const trips = await Trip.find(query).sort({ startDate: -1 });

    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    const avgBudget = trips.length > 0 ? totalBudget / trips.length : 0;

    // Budget by trip type
    const budgetByType = {};
    trips.forEach(trip => {
      if (!budgetByType[trip.type]) {
        budgetByType[trip.type] = { total: 0, count: 0 };
      }
      budgetByType[trip.type].total += trip.budget || 0;
      budgetByType[trip.type].count += 1;
    });

    // Monthly spending
    const monthlySpending = {};
    trips.forEach(trip => {
      if (trip.startDate && trip.budget) {
        const month = trip.startDate.toISOString().slice(0, 7);
        monthlySpending[month] = (monthlySpending[month] || 0) + trip.budget;
      }
    });

    const reportData = {
      ownerUid,
      title: 'Budget Analysis Report',
      type: 'budget_analysis',
      filters,
      data: {
        summary: {
          totalTrips: trips.length,
          totalBudget: Math.round(totalBudget),
          avgBudget: Math.round(avgBudget),
          maxBudget: trips.length > 0 ? Math.max(...trips.map(t => t.budget || 0)) : 0,
          minBudget: trips.length > 0 ? Math.min(...trips.map(t => t.budget || 0)) : 0
        },
        charts: [
          {
            type: 'bar',
            title: 'Average Budget by Trip Type',
            data: Object.values(budgetByType).map(data => 
              data.count > 0 ? Math.round(data.total / data.count) : 0
            ),
            labels: Object.keys(budgetByType)
          },
          {
            type: 'line',
            title: 'Monthly Spending Trends',
            data: Object.values(monthlySpending),
            labels: Object.keys(monthlySpending)
          }
        ],
        details: {
          budgetByType: Object.entries(budgetByType).map(([type, data]) => ({
            type,
            total: data.total,
            average: data.count > 0 ? Math.round(data.total / data.count) : 0,
            trips: data.count
          })),
          expensiveTrips: trips
            .filter(t => t.budget)
            .sort((a, b) => (b.budget || 0) - (a.budget || 0))
            .slice(0, 10)
        }
      }
    };

    return this.create(reportData);
  }

  // Main method to generate any type of report
  static async generateReport(type, ownerUid, filters = {}) {
    switch (type) {
      case 'trip_analytics':
        return this.generateTripAnalytics(ownerUid, filters);
      case 'packing_statistics':
        return this.generatePackingStatistics(ownerUid, filters);
      case 'eco_impact':
        return this.generateEcoImpact(ownerUid, filters);
      case 'user_activity':
        return this.generateUserActivity(ownerUid, filters);
      case 'budget_analysis':
        return this.generateBudgetAnalysis(ownerUid, filters);
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }

  // Get available report types
  static getReportTypes() {
    return Report.getReportTypes();
  }
}

module.exports = ReportService;