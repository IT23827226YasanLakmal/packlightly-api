// Report Format Helpers - Utility functions for generating standardized reports

const { Report } = require('../models/Report');

/**
 * Report Format Utilities
 * Provides helper functions for generating consistent report formats
 * across all modules according to the REPORT_FORMATS_SPECIFICATION.md
 */

class ReportFormatHelpers {
  /**
   * Generate a standardized report title
   * @param {string} type - Report type (trip_analytics, packing_statistics, etc.)
   * @param {Object} filters - Report filters
   * @returns {string} Formatted title
   */
  static generateReportTitle(type, filters = {}) {
    const typeLabels = {
      'trip_analytics': 'Trip Analytics',
      'packing_statistics': 'Packing Statistics',
      'user_activity': 'User Activity',
      'eco_impact': 'Eco Impact',
      'budget_analysis': 'Budget Analysis',
      'destination_trends': 'Destination Trends',
      'eco_inventory': 'Eco Inventory',
      'news_section': 'News Section'
    };

    const baseTitle = typeLabels[type] || 'Report';
    
    // Add date range to title if present
    if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
      const startDate = new Date(filters.dateRange.startDate);
      const endDate = new Date(filters.dateRange.endDate);
      const monthYear = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Check if it's a monthly report
      if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
        return `${baseTitle} - ${monthYear}`;
      }
      
      return `${baseTitle} - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
    }
    
    // Default to current month/year
    const currentDate = new Date();
    const currentMonthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `${baseTitle} - ${currentMonthYear}`;
  }

  /**
   * Generate tags for a report based on type and filters
   * @param {string} type - Report type
   * @param {Object} filters - Report filters
   * @returns {Array<string>} Array of relevant tags
   */
  static generateTags(type, filters = {}) {
    const tags = ['analytics'];
    
    // Add type-specific tags
    const typeTagMap = {
      'trip_analytics': ['trips', 'travel', 'destinations'],
      'packing_statistics': ['packing', 'items', 'efficiency'],
      'user_activity': ['engagement', 'community', 'posts'],
      'eco_impact': ['sustainability', 'environment', 'carbon'],
      'budget_analysis': ['budget', 'finance', 'expenses'],
      'destination_trends': ['destinations', 'trends', 'travel'],
      'eco_inventory': ['products', 'eco-friendly', 'sustainability'],
      'news_section': ['news', 'articles', 'content']
    };
    
    if (typeTagMap[type]) {
      tags.push(...typeTagMap[type]);
    }
    
    // Add filter-based tags
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.startDate);
      const endDate = new Date(filters.dateRange.endDate);
      const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 7) tags.push('weekly');
      else if (diffDays <= 31) tags.push('monthly');
      else if (diffDays <= 93) tags.push('quarterly');
      else tags.push('annual');
    }
    
    if (filters.tripType) tags.push(filters.tripType.toLowerCase());
    if (filters.destination) tags.push('destination-specific');
    if (filters.budgetRange) tags.push('budget-filtered');
    
    return tags;
  }

  /**
   * Create a standard chart configuration
   * @param {string} type - Chart type (bar, line, pie, doughnut)
   * @param {string} title - Chart title
   * @param {Array} data - Chart data array
   * @param {Array} labels - Chart labels array
   * @returns {Object} Chart configuration object
   */
  static createChartConfig(type, title, data, labels) {
    // Validate input
    if (!['bar', 'line', 'pie', 'doughnut'].includes(type)) {
      throw new Error(`Invalid chart type: ${type}`);
    }
    
    if (!Array.isArray(data) || !Array.isArray(labels)) {
      throw new Error('Data and labels must be arrays');
    }
    
    if (data.length !== labels.length) {
      throw new Error('Data and labels arrays must have the same length');
    }
    
    return {
      type,
      title,
      data,
      labels
    };
  }

  /**
   * Initialize an empty summary object with all possible fields set to defaults
   * @returns {Object} Empty summary object with all schema fields
   */
  static initializeEmptySummary() {
    return {
      totalTrips: 0,
      totalPackingLists: 0,
      totalBudget: 0,
      avgTripDuration: 0,
      ecoFriendlyPercentage: 0,
      totalPosts: 0,
      totalLikes: 0,
      avgLikesPerPost: 0,
      avgBudget: 0,
      maxBudget: 0,
      minBudget: 0,
      completionRate: 0,
      aiUsagePercentage: 0,
      estimatedCarbonFootprint: 0,
      carbonSaved: 0,
      ecoPostsShared: 0,
      sustainabilityScore: 0,
      uniqueDestinations: 0,
      favoriteDestination: '',
      avgStayDuration: 0,
      returnVisits: 0,
      totalEcoProducts: 0,
      ecoProductsByCategory: {},
      avgEcoRating: 0,
      sustainableProducts: 0,
      ecoProductAvailability: {},
      totalNewsArticles: 0,
      newsBySource: {},
      recentArticles: 0,
      trendingTopics: {},
      publicationFrequency: {}
    };
  }

  /**
   * Validate chart data before creating chart config
   * @param {Array} data - Data array to validate
   * @param {Array} labels - Labels array to validate
   * @returns {boolean} True if valid, throws error if invalid
   */
  static validateChartData(data, labels) {
    if (!Array.isArray(data)) {
      throw new Error('Chart data must be an array');
    }
    
    if (!Array.isArray(labels)) {
      throw new Error('Chart labels must be an array');
    }
    
    if (data.length === 0) {
      throw new Error('Chart data cannot be empty');
    }
    
    if (data.length !== labels.length) {
      throw new Error(`Data length (${data.length}) must match labels length (${labels.length})`);
    }
    
    // Check if all data values are numbers
    const hasNonNumericData = data.some(value => typeof value !== 'number' || isNaN(value));
    if (hasNonNumericData) {
      throw new Error('All chart data values must be valid numbers');
    }
    
    return true;
  }

  /**
   * Calculate safe percentage with division by zero protection
   * @param {number} numerator - The numerator
   * @param {number} denominator - The denominator
   * @param {number} decimalPlaces - Number of decimal places (default: 1)
   * @returns {number} Calculated percentage
   */
  static safePercentage(numerator, denominator, decimalPlaces = 1) {
    if (denominator === 0 || !denominator) return 0;
    const percentage = (numerator / denominator) * 100;
    return Math.round(percentage * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  }

  /**
   * Calculate safe average with empty array protection
   * @param {Array} values - Array of numeric values
   * @param {number} decimalPlaces - Number of decimal places (default: 1)
   * @returns {number} Calculated average
   */
  static safeAverage(values, decimalPlaces = 1) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    
    const validValues = values.filter(value => 
      typeof value === 'number' && !isNaN(value)
    );
    
    if (validValues.length === 0) return 0;
    
    const sum = validValues.reduce((acc, value) => acc + value, 0);
    const average = sum / validValues.length;
    
    return Math.round(average * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  }

  /**
   * Generate date range for filters
   * @param {string} period - Period type ('week', 'month', 'quarter', 'year')
   * @param {Date} endDate - End date (default: now)
   * @returns {Object} Date range object with startDate and endDate
   */
  static generateDateRange(period = 'month', endDate = new Date()) {
    const end = new Date(endDate);
    const start = new Date(endDate);
    
    switch (period) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setMonth(end.getMonth() - 1); // Default to month
    }
    
    return {
      startDate: start,
      endDate: end
    };
  }

  /**
   * Create a complete report structure with all required fields
   * @param {string} ownerUid - User ID
   * @param {string} type - Report type
   * @param {Object} data - Report data (summary, charts, details)
   * @param {Object} filters - Report filters
   * @param {Object} options - Additional options
   * @returns {Object} Complete report object ready for saving
   */
  static createReportStructure(ownerUid, type, data, filters = {}, options = {}) {
    return {
      ownerUid,
      title: this.generateReportTitle(type, filters),
      type,
      filters: {
        dateRange: filters.dateRange || this.generateDateRange(),
        tripType: filters.tripType || undefined,
        destination: filters.destination || undefined,
        budgetRange: filters.budgetRange || undefined
      },
      data: {
        summary: { ...this.initializeEmptySummary(), ...data.summary },
        charts: data.charts || [],
        details: data.details || {}
      },
      format: options.format || 'json',
      status: options.status || 'completed',
      tags: this.generateTags(type, filters),
      isScheduled: options.isScheduled || false,
      scheduleFrequency: options.scheduleFrequency || undefined,
      generatedAt: new Date()
    };
  }

  /**
   * Validate a complete report structure against the schema
   * @param {Object} reportData - Report data to validate
   * @returns {Object} Validation result with errors array
   */
  static validateReportStructure(reportData) {
    const errors = [];
    
    // Required fields validation
    if (!reportData.ownerUid) errors.push('ownerUid is required');
    if (!reportData.title) errors.push('title is required');
    if (!reportData.type) errors.push('type is required');
    
    // Type validation
    const validTypes = [
      'trip_analytics', 'packing_statistics', 'user_activity',
      'eco_impact', 'budget_analysis', 'destination_trends',
      'eco_inventory', 'news_section'
    ];
    if (reportData.type && !validTypes.includes(reportData.type)) {
      errors.push(`Invalid report type: ${reportData.type}`);
    }
    
    // Data structure validation
    if (!reportData.data) {
      errors.push('data object is required');
    } else {
      if (!reportData.data.summary) errors.push('data.summary is required');
      if (reportData.data.charts && !Array.isArray(reportData.data.charts)) {
        errors.push('data.charts must be an array');
      }
      
      // Validate each chart
      if (reportData.data.charts) {
        reportData.data.charts.forEach((chart, index) => {
          if (!chart.type || !chart.title || !chart.data) {
            errors.push(`Chart ${index + 1} is missing required fields (type, title, or data)`);
          }
          
          if (chart.data && chart.labels && chart.data.length !== chart.labels.length) {
            errors.push(`Chart ${index + 1} has mismatched data and labels length`);
          }
        });
      }
    }
    
    // Date range validation
    if (reportData.filters && reportData.filters.dateRange) {
      const { startDate, endDate } = reportData.filters.dateRange;
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        errors.push('Start date cannot be after end date');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate sample data for testing report formats
   * @param {string} type - Report type
   * @returns {Object} Sample report data
   */
  static generateSampleData(type) {
    const sampleData = {
      trip_analytics: {
        summary: {
          totalTrips: 42,
          uniqueDestinations: 18,
          favoriteDestination: "Ella",
          avgTripDuration: 4.8,
          ecoFriendlyPercentage: 67,
          returnVisits: 5,
          estimatedCarbonFootprint: 280.5,
          carbonSaved: 65.2
        },
        charts: [
          this.createChartConfig('bar', 'Trips Per Month', [3, 5, 2, 8, 6, 4], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']),
          this.createChartConfig('pie', 'Trip Types', [15, 10, 12, 5], ['Solo', 'Couple', 'Family', 'Group'])
        ],
        details: {
          topDestinations: [
            { name: "Ella", trips: 10, avgDuration: 3.5, ecoScore: 85 },
            { name: "Kandy", trips: 8, avgDuration: 4.0, ecoScore: 78 }
          ]
        }
      },
      
      packing_statistics: {
        summary: {
          totalPackingLists: 20,
          completionRate: 85,
          ecoFriendlyPercentage: 58,
          aiUsagePercentage: 34
        },
        charts: [
          this.createChartConfig('pie', 'Item Categories', [35, 25, 15, 12, 8], ['Clothes', 'Toiletries', 'Electronics', 'Documents', 'Others']),
          this.createChartConfig('line', 'Completion Rate', [75, 78, 82, 85, 88, 85], ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'])
        ],
        details: {
          topItems: [
            { name: "Eco-friendly toothbrush", frequency: 18, category: "Toiletries" },
            { name: "Reusable water bottle", frequency: 20, category: "Accessories" }
          ]
        }
      }
    };
    
    return sampleData[type] || {
      summary: this.initializeEmptySummary(),
      charts: [],
      details: {}
    };
  }
}

module.exports = ReportFormatHelpers;