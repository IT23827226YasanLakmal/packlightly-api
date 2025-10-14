const Report = require('../models/Report');
const Trip = require('../models/Trip');
const PackingList = require('../models/PackingList');
const Post = require('../models/Post');
const Product = require('../models/Product');
const News = require('../models/News');
const reportFieldsConfig = require('../config/reportFieldsConfig');

class ReportService {
  /**
   * Customize report data based on field configuration
   * @param {Object} reportData - Raw report data
   * @param {string} type - Report type
   * @param {boolean} includeOptionals - Whether to include optional fields
   * @param {Array} specificFields - Specific fields to include (overrides includeOptionals)
   * @returns {Object} - Customized report data
   */
  static customizeReport(reportData, type, includeOptionals = true, specificFields = null) {
    const config = reportFieldsConfig[type];
    if (!config) {
      console.warn(`No field configuration found for report type: ${type}`);
      return reportData;
    }

    // Deep clone to avoid modifying original data
    const customized = JSON.parse(JSON.stringify(reportData));
    const { mandatory, optional } = config;

    // Determine allowed fields
    let allowedFields;
    if (specificFields && Array.isArray(specificFields)) {
      // Use specific fields if provided
      allowedFields = [...mandatory, ...specificFields.filter(field => optional.includes(field))];
    } else {
      // Use includeOptionals flag
      allowedFields = includeOptionals ? [...mandatory, ...optional] : mandatory;
    }

    // Clean the data object recursively
    function cleanObject(obj, path = '') {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        
        // Check if this field path is allowed
        const isAllowed = allowedFields.some(allowedField => {
          // Allow if the current path matches exactly or is a parent/child of an allowed field
          return allowedField === fullPath || 
                 allowedField.startsWith(fullPath + '.') || 
                 fullPath.startsWith(allowedField + '.');
        });
        
        if (!isAllowed) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          // Recursively clean nested objects
          cleanObject(obj[key], fullPath);
          
          // Remove empty objects after cleaning
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      });
    }

    // Apply field filtering to the data section
    if (customized.data) {
      cleanObject(customized.data);
    }

    return customized;
  }

  /**
   * Get available report types with their configurations
   * @returns {Object} - Report types with field information
   */
  static getReportFieldsConfig() {
    return Object.keys(reportFieldsConfig).reduce((acc, type) => {
      const config = reportFieldsConfig[type];
      acc[type] = {
        mandatoryFields: config.mandatory,
        optionalFields: config.optional,
        totalFields: config.mandatory.length + config.optional.length
      };
      return acc;
    }, {});
  }

  /**
   * Validate if a report type supports specific fields
   * @param {string} type - Report type
   * @param {Array} fields - Fields to validate
   * @returns {Object} - Validation result
   */
  static validateReportFields(type, fields) {
    const config = reportFieldsConfig[type];
    if (!config) {
      return { valid: false, error: `Unknown report type: ${type}` };
    }

    const { mandatory, optional } = config;
    const allValidFields = [...mandatory, ...optional];
    const invalidFields = fields.filter(field => !allValidFields.includes(field));
    const missingMandatory = mandatory.filter(field => !fields.includes(field));

    return {
      valid: invalidFields.length === 0 && missingMandatory.length === 0,
      invalidFields,
      missingMandatory,
      validFields: fields.filter(field => allValidFields.includes(field))
    };
  }

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

    // Calculate comprehensive summary statistics
    const totalTrips = trips.length;
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    const avgTripDuration = totalTrips > 0 ? 
      trips.reduce((sum, trip) => sum + (trip.durationDays || 0), 0) / totalTrips : 0;

    // Enhanced metrics for better analytics
    const uniqueDestinations = [...new Set(trips.map(trip => trip.destination).filter(Boolean))].length;
    const ecoTrips = trips.filter(trip => trip.isEcoFriendly || trip.ecoScore >= 70);
    const ecoFriendlyPercentage = totalTrips > 0 ? Math.round((ecoTrips.length / totalTrips) * 100) : 0;
    
    // Calculate favorite destination
    const destinationCounts = {};
    trips.forEach(trip => {
      if (trip.destination) {
        destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1;
      }
    });
    const favoriteDestination = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Calculate return visits (destinations visited more than once)
    const returnVisits = Object.values(destinationCounts).filter(count => count > 1).length;

    // Calculate carbon footprint (simple estimation)
    const estimatedCarbonFootprint = trips.reduce((sum, trip) => {
      // Estimate based on trip type and duration
      const baseCO2 = trip.type === 'International' ? 2000 : 500; // kg CO2
      const durationMultiplier = (trip.durationDays || 1) / 7; // per week
      return sum + (baseCO2 * durationMultiplier);
    }, 0);

    // Calculate carbon saved through eco choices
    const carbonSaved = ecoTrips.reduce((sum, trip) => {
      return sum + ((trip.carbonSaved || 0) + (trip.ecoScore || 0) * 2); // Estimate
    }, 0);

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

    // Monthly trends (last 12 months)
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    trips.forEach(trip => {
      if (trip.startDate) {
        const date = new Date(trip.startDate);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
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

    // Enhanced top destinations with metrics
    const topDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([destination, count]) => {
        const destTrips = trips.filter(trip => trip.destination === destination);
        const avgDuration = destTrips.length > 0 ? 
          destTrips.reduce((sum, trip) => sum + (trip.durationDays || 0), 0) / destTrips.length : 0;
        const avgEcoScore = destTrips.length > 0 ?
          destTrips.reduce((sum, trip) => sum + (trip.ecoScore || 0), 0) / destTrips.length : 0;
        
        return {
          name: destination,
          trips: count,
          avgDuration: Math.round(avgDuration * 10) / 10,
          ecoScore: Math.round(avgEcoScore)
        };
      });

    // Monthly breakdown with enhanced metrics
    const monthlyBreakdown = Object.entries(monthlyData)
      .map(([month, tripCount]) => {
        const monthTrips = trips.filter(trip => {
          if (!trip.startDate) return false;
          const date = new Date(trip.startDate);
          const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          return monthKey === month;
        });
        
        const avgDuration = monthTrips.length > 0 ?
          monthTrips.reduce((sum, trip) => sum + (trip.durationDays || 0), 0) / monthTrips.length : 0;
        const carbonFootprint = monthTrips.reduce((sum, trip) => sum + (trip.carbonFootprint || 0), 0);
        
        return {
          month,
          trips: tripCount,
          avgDuration: Math.round(avgDuration * 10) / 10,
          carbonFootprint: Math.round(carbonFootprint)
        };
      })
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Enhanced eco impact breakdown
    const ecoImpactBreakdown = {
      transportationSavings: trips.reduce((sum, trip) => sum + (trip.transportationSavings || 0), 0),
      accommodationSavings: trips.reduce((sum, trip) => sum + (trip.accommodationSavings || 0), 0),
      activitySavings: trips.reduce((sum, trip) => sum + (trip.activitySavings || 0), 0),
      totalCarbonSaved: carbonSaved,
      avgEcoScore: ecoTrips.length > 0 ? 
        Math.round(ecoTrips.reduce((sum, trip) => sum + (trip.ecoScore || 0), 0) / ecoTrips.length) : 0
    };

    // Smart recommendations based on data
    const recommendations = [];
    const avgEcoScore = ecoTrips.length > 0 ? 
      ecoTrips.reduce((sum, trip) => sum + (trip.ecoScore || 0), 0) / ecoTrips.length : 0;
    
    if (avgEcoScore < 70) {
      recommendations.push("Consider eco-friendly accommodation options to improve your sustainability score");
    }
    if (ecoFriendlyPercentage > 70) {
      recommendations.push(`Your ${favoriteDestination} trips show excellent eco-performance - continue this pattern`);
    }
    if (totalTrips > 5) {
      recommendations.push("You're an active traveler! Consider offsetting your carbon footprint");
    }
    if (returnVisits > 0) {
      recommendations.push("You have favorite destinations! Share your local insights with other travelers");
    }
    if (recommendations.length === 0) {
      recommendations.push("Keep exploring and sharing your travel experiences!");
    }

    const reportData = {
      ownerUid,
      title: 'Trip Analytics Report - Enhanced',
      type: 'trip_analytics',
      filters,
      data: {
        summary: {
          totalTrips,
          uniqueDestinations,
          favoriteDestination,
          avgTripDuration: Math.round(avgTripDuration * 100) / 100,
          avgStayDuration: Math.round(avgTripDuration * 100) / 100, // Same as avgTripDuration
          ecoFriendlyPercentage,
          returnVisits,
          estimatedCarbonFootprint: Math.round(estimatedCarbonFootprint),
          carbonSaved: Math.round(carbonSaved),
          totalBudget: Math.round(totalBudget),
          avgBudget: totalTrips > 0 ? Math.round(totalBudget / totalTrips) : 0,
          maxBudget: totalTrips > 0 ? Math.max(...trips.map(t => t.budget || 0)) : 0,
          minBudget: totalTrips > 0 ? Math.min(...trips.map(t => t.budget || 0)) : 0
        },
        charts: [
          {
            type: 'bar',
            title: 'Trips Per Month',
            data: Object.values(monthlyData),
            labels: Object.keys(monthlyData)
          },
          {
            type: 'pie',
            title: 'Trip Types Distribution',
            data: Object.values(tripTypeData),
            labels: Object.keys(tripTypeData)
          },
          {
            type: 'line',
            title: 'Eco Score Improvement',
            data: ecoTrips.map(trip => trip.ecoScore || 0),
            labels: ecoTrips.map((trip, index) => `Trip ${index + 1}`)
          },
          {
            type: 'doughnut',
            title: 'Budget Distribution',
            data: Object.values(budgetRanges),
            labels: Object.keys(budgetRanges)
          }
        ],
        details: {
          topDestinations,
          monthlyBreakdown,
          ecoImpactBreakdown,
          recommendations,
          recentTrips: trips.slice(0, 10).map(trip => ({
            destination: trip.destination,
            startDate: trip.startDate,
            duration: trip.durationDays,
            budget: trip.budget,
            ecoScore: trip.ecoScore,
            type: trip.type
          })),
          travelPatterns: {
            mostActiveMonth: Object.entries(monthlyData).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None',
            avgTripsPerMonth: Object.keys(monthlyData).length > 0 ? 
              Math.round(totalTrips / Object.keys(monthlyData).length * 10) / 10 : 0,
            longestTrip: trips.reduce((longest, trip) => 
              (trip.durationDays || 0) > (longest.durationDays || 0) ? trip : longest, {}),
            shortestTrip: trips.reduce((shortest, trip) => 
              (trip.durationDays || 999) < (shortest.durationDays || 999) ? trip : shortest, {})
          }
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
    const completionRateOverTime = {};

    packingLists.forEach(list => {
      // Track completion rate over time
      if (list.createdAt) {
        const month = list.createdAt.toISOString().slice(0, 7);
        if (!completionRateOverTime[month]) {
          completionRateOverTime[month] = { total: 0, completed: 0 };
        }
      }

      let listTotal = 0;
      let listCompleted = 0;

      list.categories.forEach(category => {
        if (!categoryStats[category.name]) {
          categoryStats[category.name] = { 
            total: 0, 
            checked: 0, 
            eco: 0, 
            avgPerList: 0,
            ecoPercentage: 0,
            completionRate: 0
          };
        }

        category.items.forEach(item => {
          totalItems++;
          listTotal++;
          categoryStats[category.name].total++;
          
          if (item.checked) {
            checkedItems++;
            listCompleted++;
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

      // Update monthly completion rate
      if (list.createdAt) {
        const month = list.createdAt.toISOString().slice(0, 7);
        if (completionRateOverTime[month]) {
          completionRateOverTime[month].total += listTotal;
          completionRateOverTime[month].completed += listCompleted;
        }
      }
    });

    // Calculate enhanced metrics
    const completionRate = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
    const ecoPercentage = totalItems > 0 ? (ecoItems / totalItems) * 100 : 0;
    const aiUsagePercentage = totalItems > 0 ? (aiGeneratedItems / totalItems) * 100 : 0;
    const avgItemsPerList = totalLists > 0 ? totalItems / totalLists : 0;

    // Calculate category-specific metrics
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.avgPerList = totalLists > 0 ? stats.total / totalLists : 0;
      stats.ecoPercentage = stats.total > 0 ? (stats.eco / stats.total) * 100 : 0;
      stats.completionRate = stats.total > 0 ? (stats.checked / stats.total) * 100 : 0;
    });

    // Most common items with enhanced data
    const commonItems = Object.entries(itemFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([name, count]) => ({ 
        name, 
        count, 
        frequency: Math.round((count / totalLists) * 100) // Percentage of lists containing this item
      }));

    // Enhanced category breakdown
    const categoryBreakdown = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      totalItems: stats.total,
      ecoItems: stats.eco,
      avgPerList: Math.round(stats.avgPerList * 10) / 10,
      ecoPercentage: Math.round(stats.ecoPercentage),
      completionRate: Math.round(stats.completionRate)
    })).sort((a, b) => b.totalItems - a.totalItems);

    // Top eco-friendly items
    const topEcoItems = [];
    packingLists.forEach(list => {
      list.categories.forEach(category => {
        category.items.forEach(item => {
          if (item.eco) {
            const existing = topEcoItems.find(i => i.name.toLowerCase() === item.name.toLowerCase());
            if (existing) {
              existing.count++;
            } else {
              topEcoItems.push({ name: item.name, count: 1, category: category.name });
            }
          }
        });
      });
    });
    topEcoItems.sort((a, b) => b.count - a.count).splice(10); // Top 10

    // Packing efficiency metrics
    const packingEfficiency = {
      avgCompletionRate: Math.round(completionRate),
      bestCategory: categoryBreakdown.length > 0 ? 
        categoryBreakdown.reduce((best, cat) => cat.completionRate > best.completionRate ? cat : best).category : 'None',
      worstCategory: categoryBreakdown.length > 0 ?
        categoryBreakdown.reduce((worst, cat) => cat.completionRate < worst.completionRate ? cat : worst).category : 'None',
      ecoLeader: categoryBreakdown.length > 0 ?
        categoryBreakdown.reduce((leader, cat) => cat.ecoPercentage > leader.ecoPercentage ? cat : leader).category : 'None',
      mostItemsCategory: categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'None'
    };

    // Smart recommendations
    const recommendations = [];
    if (completionRate < 70) {
      recommendations.push("Consider reviewing your packing lists more carefully - your completion rate could be improved");
    }
    if (ecoPercentage > 50) {
      recommendations.push("Great job on eco-friendly packing! You're making sustainable choices");
    } else {
      recommendations.push("Try adding more eco-friendly alternatives to your packing lists");
    }
    if (aiUsagePercentage > 30) {
      recommendations.push("You're making good use of AI suggestions! Keep leveraging smart packing tips");
    }
    if (avgItemsPerList > 25) {
      recommendations.push("Your lists are quite comprehensive - consider if all items are necessary for each trip");
    }

    // Completion rate timeline
    const completionTimeline = Object.entries(completionRateOverTime)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }));

    const reportData = {
      ownerUid,
      title: 'Packing Statistics Report - Enhanced',
      type: 'packing_statistics',
      filters,
      data: {
        summary: {
          totalPackingLists: totalLists,
          totalItems,
          completionRate: Math.round(completionRate),
          ecoFriendlyPercentage: Math.round(ecoPercentage),
          aiUsagePercentage: Math.round(aiUsagePercentage),
          avgItemsPerList: Math.round(avgItemsPerList * 10) / 10,
          mostCommonItem: commonItems[0]?.name || 'None',
          bestCategory: packingEfficiency.bestCategory,
          ecoItemsCount: ecoItems,
          aiSuggestedCount: aiGeneratedItems
        },
        charts: [
          {
            type: 'pie',
            title: 'Item Categories Distribution',
            data: Object.values(categoryStats).map(stat => stat.total),
            labels: Object.keys(categoryStats)
          },
          {
            type: 'line',
            title: 'Completion Rate Over Time',
            data: completionTimeline.map(entry => entry.completionRate),
            labels: completionTimeline.map(entry => entry.month)
          },
          {
            type: 'bar',
            title: 'Eco vs Standard Items by Category',
            data: Object.values(categoryStats).map(stat => stat.eco),
            labels: Object.keys(categoryStats)
          },
          {
            type: 'doughnut',
            title: 'Item Sources',
            data: [aiGeneratedItems, totalItems - aiGeneratedItems],
            labels: ['AI Suggested', 'User Added']
          }
        ],
        details: {
          categoryBreakdown,
          topItems: commonItems.slice(0, 15),
          topEcoItems: topEcoItems.slice(0, 10),
          packingEfficiency,
          recommendations,
          completionTimeline,
          recentLists: packingLists.slice(0, 10).map(list => ({
            id: list._id,
            tripDestination: list.tripId?.destination || 'Unknown',
            itemCount: list.categories.reduce((sum, cat) => sum + cat.items.length, 0),
            completedItems: list.categories.reduce((sum, cat) => 
              sum + cat.items.filter(item => item.checked).length, 0),
            ecoItems: list.categories.reduce((sum, cat) => 
              sum + cat.items.filter(item => item.eco).length, 0),
            createdAt: list.createdAt
          })),
          itemInsights: {
            neverPackedItems: commonItems.filter(item => item.count === 1).length,
            alwaysPackedItems: commonItems.filter(item => item.frequency >= 80).length,
            forgottenItemsRate: Math.round((totalItems - checkedItems) / totalItems * 100) || 0
          }
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

  // Generate Destination Trends Report
  static async generateDestinationTrends(ownerUid, filters = {}) {
    // Get all trips (for user-specific trends) or all trips (for global trends)
    const query = ownerUid ? { ownerUid } : {};
    
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

    const trips = await Trip.find(query).sort({ startDate: -1 });

    // Destination popularity
    const destinationCounts = {};
    const destinationBudgets = {};
    const destinationsByMonth = {};
    
    trips.forEach(trip => {
      if (trip.destination) {
        // Count visits
        destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1;
        
        // Track budgets for average calculation
        if (trip.budget) {
          if (!destinationBudgets[trip.destination]) {
            destinationBudgets[trip.destination] = { total: 0, count: 0 };
          }
          destinationBudgets[trip.destination].total += trip.budget;
          destinationBudgets[trip.destination].count += 1;
        }
        
        // Track monthly trends
        if (trip.startDate) {
          const month = trip.startDate.toISOString().slice(0, 7);
          if (!destinationsByMonth[month]) {
            destinationsByMonth[month] = {};
          }
          destinationsByMonth[month][trip.destination] = 
            (destinationsByMonth[month][trip.destination] || 0) + 1;
        }
      }
    });

    // Sort destinations by popularity
    const popularDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([destination, count]) => ({
        destination,
        visits: count,
        avgBudget: destinationBudgets[destination] ? 
          Math.round(destinationBudgets[destination].total / destinationBudgets[destination].count) : 0
      }));

    // Find trending destinations (destinations with increasing visits over time)
    const recentMonths = Object.keys(destinationsByMonth).sort().slice(-6); // Last 6 months
    const trendingDestinations = {};
    
    recentMonths.forEach((month, index) => {
      const monthDestinations = destinationsByMonth[month] || {};
      Object.entries(monthDestinations).forEach(([destination, count]) => {
        if (!trendingDestinations[destination]) {
          trendingDestinations[destination] = [];
        }
        trendingDestinations[destination].push({ month, count, index });
      });
    });

    // Calculate trend scores (simple increase over time)
    const trendingScores = {};
    Object.entries(trendingDestinations).forEach(([destination, data]) => {
      if (data.length >= 2) {
        const firstCount = data[0].count;
        const lastCount = data[data.length - 1].count;
        trendingScores[destination] = lastCount - firstCount;
      }
    });

    const topTrending = Object.entries(trendingScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([destination, score]) => ({ destination, trendScore: score }));

    const reportData = {
      ownerUid,
      title: ownerUid ? 'My Destination Trends' : 'Global Destination Trends',
      type: 'destination_trends',
      filters,
      data: {
        summary: {
          totalTrips: trips.length,
          uniqueDestinations: Object.keys(destinationCounts).length,
          favoriteDestination: popularDestinations[0]?.destination || 'None',
          avgStayDuration: trips.length > 0 ? 
            Math.round(trips.reduce((sum, trip) => sum + (trip.durationDays || 0), 0) / trips.length) : 0,
          returnVisits: Object.values(destinationCounts).filter(count => count > 1).length
        },
        charts: [
          {
            type: 'bar',
            title: 'Most Popular Destinations',
            data: popularDestinations.map(d => d.visits),
            labels: popularDestinations.map(d => d.destination)
          },
          {
            type: 'doughnut',
            title: 'Destination Distribution',
            data: popularDestinations.slice(0, 5).map(d => d.visits),
            labels: popularDestinations.slice(0, 5).map(d => d.destination)
          },
          {
            type: 'bar',
            title: 'Average Budget by Destination',
            data: popularDestinations.map(d => d.avgBudget),
            labels: popularDestinations.map(d => d.destination)
          }
        ],
        details: {
          popularDestinations,
          trendingDestinations: topTrending,
          monthlyTrends: destinationsByMonth,
          destinationStats: Object.entries(destinationCounts).map(([destination, visits]) => ({
            destination,
            visits,
            avgBudget: destinationBudgets[destination] ? 
              Math.round(destinationBudgets[destination].total / destinationBudgets[destination].count) : 0,
            totalBudget: destinationBudgets[destination]?.total || 0
          }))
        }
      }
    };

    return this.create(reportData);
  }

  // Generate Eco Inventory Report
  static async generateEcoInventory(ownerUid, filters = {}) {
    const query = {};
    
    // Apply eco rating filter if provided
    if (filters.minEcoRating) {
      query.eco = { $gte: filters.minEcoRating };
    }

    // Apply category filter if provided
    if (filters.category) {
      query.category = new RegExp(filters.category, 'i');
    }

    const products = await Product.find(query);

    // Calculate summary statistics
    const totalEcoProducts = products.length;
    const avgEcoRating = totalEcoProducts > 0 ? 
      Math.round((products.reduce((sum, product) => sum + (product.eco || 0), 0) / totalEcoProducts) * 100) / 100 : 0;

    // Group by category
    const ecoProductsByCategory = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!ecoProductsByCategory[category]) {
        ecoProductsByCategory[category] = [];
      }
      ecoProductsByCategory[category].push(product);
    });

    // Calculate category stats
    const categoryStats = Object.entries(ecoProductsByCategory).map(([category, prods]) => ({
      category,
      count: prods.length,
      avgEcoRating: Math.round((prods.reduce((sum, p) => sum + (p.eco || 0), 0) / prods.length) * 100) / 100,
      products: prods.slice(0, 5) // Limit to top 5 for details
    }));

    // Count sustainable products (eco rating 4 or higher)
    const sustainableProducts = products.filter(p => (p.eco || 0) >= 4).length;

    // Availability analysis
    const ecoProductAvailability = {};
    products.forEach(product => {
      if (product.availableLocation && Array.isArray(product.availableLocation)) {
        product.availableLocation.forEach(location => {
          ecoProductAvailability[location] = (ecoProductAvailability[location] || 0) + 1;
        });
      }
    });

    // Top locations with most eco products
    const topLocations = Object.entries(ecoProductAvailability)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }));

    // Eco rating distribution
    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = products.filter(p => Math.floor(p.eco || 0) === i).length;
    }

    const reportData = {
      ownerUid,
      title: 'Eco Inventory Analysis',
      type: 'eco_inventory',
      filters,
      data: {
        summary: {
          totalEcoProducts,
          ecoProductsByCategory: Object.keys(ecoProductsByCategory).reduce((acc, cat) => {
            acc[cat] = ecoProductsByCategory[cat].length;
            return acc;
          }, {}),
          avgEcoRating,
          sustainableProducts,
          ecoProductAvailability: topLocations.reduce((acc, loc) => {
            acc[loc.location] = loc.count;
            return acc;
          }, {})
        },
        charts: [
          {
            type: 'bar',
            title: 'Products by Category',
            data: categoryStats.map(c => c.count),
            labels: categoryStats.map(c => c.category)
          },
          {
            type: 'pie',
            title: 'Eco Rating Distribution',
            data: Object.values(ratingDistribution),
            labels: Object.keys(ratingDistribution).map(r => `${r} Star${r !== '1' ? 's' : ''}`)
          },
          {
            type: 'bar',
            title: 'Top Locations by Eco Product Availability',
            data: topLocations.map(l => l.count),
            labels: topLocations.map(l => l.location)
          }
        ],
        details: {
          categoryStats,
          topLocations,
          ratingDistribution,
          highestRatedProducts: products
            .filter(p => (p.eco || 0) >= 4)
            .sort((a, b) => (b.eco || 0) - (a.eco || 0))
            .slice(0, 10),
          availabilityStats: ecoProductAvailability
        }
      }
    };

    return this.create(reportData);
  }

  // Generate News Section Report
  static async generateNewsSection(ownerUid, filters = {}) {
    const query = {};
    
    // Apply date filters
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
      query.pubDate = {};
      if (filters.dateRange.startDate) {
        query.pubDate.$gte = new Date(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        query.pubDate.$lte = new Date(filters.dateRange.endDate);
      }
    }

    // Apply source filter
    if (filters.source) {
      query.source_id = new RegExp(filters.source, 'i');
    }

    const articles = await News.find(query).sort({ pubDate: -1 });

    // Calculate summary statistics
    const totalNewsArticles = articles.length;
    
    // Group by source
    const newsBySource = {};
    articles.forEach(article => {
      const source = article.source_id || 'Unknown';
      newsBySource[source] = (newsBySource[source] || 0) + 1;
    });

    // Recent articles (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentArticles = articles.filter(article => 
      article.pubDate && new Date(article.pubDate) >= sevenDaysAgo
    ).length;

    // Trending topics analysis (based on title keywords)
    const trendingTopics = {};
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    
    articles.forEach(article => {
      if (article.title) {
        const words = article.title.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3 && !commonWords.includes(word));
        
        words.forEach(word => {
          trendingTopics[word] = (trendingTopics[word] || 0) + 1;
        });
      }
    });

    // Get top trending topics
    const topTrending = Object.entries(trendingTopics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Publication frequency by month
    const publicationFrequency = {};
    articles.forEach(article => {
      if (article.pubDate) {
        const month = new Date(article.pubDate).toISOString().slice(0, 7); // YYYY-MM
        publicationFrequency[month] = (publicationFrequency[month] || 0) + 1;
      }
    });

    // Top sources
    const topSources = Object.entries(newsBySource)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));

    const reportData = {
      ownerUid,
      title: 'News Section Analytics',
      type: 'news_section',
      filters,
      data: {
        summary: {
          totalNewsArticles,
          newsBySource: Object.keys(newsBySource).reduce((acc, source) => {
            acc[source] = newsBySource[source];
            return acc;
          }, {}),
          recentArticles,
          trendingTopics: topTrending.reduce((acc, topic) => {
            acc[topic.topic] = topic.count;
            return acc;
          }, {}),
          publicationFrequency
        },
        charts: [
          {
            type: 'bar',
            title: 'Articles by Source',
            data: topSources.map(s => s.count),
            labels: topSources.map(s => s.source)
          },
          {
            type: 'line',
            title: 'Publication Timeline',
            data: Object.values(publicationFrequency),
            labels: Object.keys(publicationFrequency).sort()
          },
          {
            type: 'doughnut',
            title: 'Trending Topics',
            data: topTrending.slice(0, 6).map(t => t.count),
            labels: topTrending.slice(0, 6).map(t => t.topic)
          }
        ],
        details: {
          topSources,
          topTrending,
          recentArticles: articles
            .filter(article => new Date(article.pubDate) >= sevenDaysAgo)
            .slice(0, 10),
          publicationStats: publicationFrequency,
          sourceDistribution: newsBySource,
          latestArticles: articles.slice(0, 10)
        }
      }
    };

    return this.create(reportData);
  }

  // Main method to generate any type of report
  static async generateReport(type, ownerUid, filters = {}) {
    // Extract customization options from filters
    const { 
      includeOptionalFields = true, 
      specificFields = null,
      lightweight = false,
      ...reportFilters 
    } = filters;

    // Generate the base report
    let report;
    switch (type) {
      case 'trip_analytics':
        report = await this.generateTripAnalytics(ownerUid, reportFilters);
        break;
      case 'packing_statistics':
        report = await this.generatePackingStatistics(ownerUid, reportFilters);
        break;
      case 'eco_impact':
        report = await this.generateEcoImpact(ownerUid, reportFilters);
        break;
      case 'user_activity':
        report = await this.generateUserActivity(ownerUid, reportFilters);
        break;
      case 'budget_analysis':
        report = await this.generateBudgetAnalysis(ownerUid, reportFilters);
        break;
      case 'destination_trends':
        report = await this.generateDestinationTrends(ownerUid, reportFilters);
        break;
      case 'eco_inventory':
        report = await this.generateEcoInventory(ownerUid, reportFilters);
        break;
      case 'news_section':
      case 'news_insights':
        report = await this.generateNewsSection(ownerUid, reportFilters);
        break;
      default:
        throw new Error(`Unknown report type: ${type}`);
    }

    // Apply customization based on filters
    const includeOptionals = lightweight ? false : includeOptionalFields;
    const customizedReport = this.customizeReport(report, type, includeOptionals, specificFields);

    return customizedReport;
  }

  // Get available report types
  static getReportTypes() {
    const modelTypes = Report.getReportTypes();
    const configTypes = this.getReportFieldsConfig();
    
    // Merge model types with field configurations, maintaining backward compatibility
    return modelTypes.map(modelType => ({
      value: modelType.value,           // Keep original 'value' property for backend compatibility
      label: modelType.label,           // Keep original 'label' property for frontend
      description: modelType.description, // Keep original description
      type: modelType.value,            // Add 'type' alias for consistency
      name: modelType.label,            // Add 'name' alias for consistency
      mandatoryFields: configTypes[modelType.value]?.mandatoryFields?.length || 0,
      optionalFields: configTypes[modelType.value]?.optionalFields?.length || 0,
      totalFields: configTypes[modelType.value]?.totalFields || 0,
      supportsCustomization: true,
      fieldConfig: configTypes[modelType.value] || null
    }));
  }

  /**
   * Get human-readable name for report type
   * @param {string} type - Report type
   * @returns {string} - Human-readable name
   */
  static getReportTypeName(type) {
    const nameMap = {
      trip_analytics: 'Trip Analytics',
      packing_statistics: 'Packing Statistics',
      eco_inventory: 'Eco Inventory',
      news_insights: 'News Insights',
      community_analytics: 'Community Analytics',
      user_activity: 'User Activity',
      budget_analysis: 'Budget Analysis',
      destination_trends: 'Destination Trends',
      eco_impact: 'Eco Impact',
      news_section: 'News Section'
    };
    return nameMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get description for report type
   * @param {string} type - Report type
   * @returns {string} - Report description
   */
  static getReportTypeDescription(type) {
    const descriptionMap = {
      trip_analytics: 'Comprehensive analysis of travel patterns, destinations, and eco-friendly metrics',
      packing_statistics: 'Detailed statistics on packing list completion rates and item usage',
      eco_inventory: 'Analysis of eco-friendly products and sustainability trends',
      news_insights: 'Insights from travel news sources and trending topics',
      community_analytics: 'Community engagement and post activity analysis',
      user_activity: 'User behavior patterns and engagement metrics',
      budget_analysis: 'Travel budget breakdowns and spending patterns',
      destination_trends: 'Popular destinations and travel trend analysis',
      eco_impact: 'Environmental impact and sustainability scoring',
      news_section: 'Travel news aggregation and content analysis'
    };
    return descriptionMap[type] || `Analytics report for ${this.getReportTypeName(type)}`;
  }
}

module.exports = ReportService;