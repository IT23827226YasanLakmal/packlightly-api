const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  ownerUid: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'trip_analytics',
      'packing_statistics', 
      'user_activity',
      'eco_impact',
      'budget_analysis',
      'destination_trends',
      'eco_inventory',
      'news_section'
    ],
    required: true
  },
  filters: {
    dateRange: {
      startDate: Date,
      endDate: Date
    },
    tripType: {
      type: String,
      enum: ["Solo", "Couple", "Family", "Group"]
    },
    destination: String,
    budgetRange: {
      min: Number,
      max: Number
    }
  },
  data: {
    summary: {
      totalTrips: { type: Number, default: 0, min: 0 },
      totalPackingLists: { type: Number, default: 0, min: 0 },
      totalBudget: { type: Number, default: 0, min: 0 },
      avgTripDuration: { type: Number, default: 0, min: 0 },
      ecoFriendlyPercentage: { type: Number, default: 0, min: 0, max: 100 },
      totalPosts: { type: Number, default: 0, min: 0 },
      totalLikes: { type: Number, default: 0, min: 0 },
      avgLikesPerPost: { type: Number, default: 0, min: 0 },
      avgBudget: { type: Number, default: 0, min: 0 },
      maxBudget: { type: Number, default: 0, min: 0 },
      minBudget: { type: Number, default: 0, min: 0 },
      completionRate: { type: Number, default: 0, min: 0, max: 100 },
      aiUsagePercentage: { type: Number, default: 0, min: 0, max: 100 },
      estimatedCarbonFootprint: { type: Number, default: 0, min: 0 },
      carbonSaved: { type: Number, default: 0, min: 0 },
      ecoPostsShared: { type: Number, default: 0, min: 0 },
      sustainabilityScore: { type: Number, default: 0, min: 0, max: 100 },
      uniqueDestinations: { type: Number, default: 0, min: 0 },
      favoriteDestination: { type: String, trim: true },
      avgStayDuration: { type: Number, default: 0, min: 0 },
      returnVisits: { type: Number, default: 0, min: 0 },
      // Eco inventory fields
      totalEcoProducts: { type: Number, default: 0, min: 0 },
      ecoProductsByCategory: { type: mongoose.Schema.Types.Mixed, default: {} },
      avgEcoRating: { type: Number, default: 0, min: 0, max: 5 },
      sustainableProducts: { type: Number, default: 0, min: 0 },
      ecoProductAvailability: { type: mongoose.Schema.Types.Mixed, default: {} },
      // News section fields
      totalNewsArticles: { type: Number, default: 0, min: 0 },
      newsBySource: { type: mongoose.Schema.Types.Mixed, default: {} },
      recentArticles: { type: Number, default: 0, min: 0 },
      trendingTopics: { type: mongoose.Schema.Types.Mixed, default: {} },
      publicationFrequency: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    charts: [
      {
        type: {
          type: String,
          enum: ['bar', 'line', 'pie', 'doughnut'],
          required: true
        },
        title: { type: String, required: true, trim: true },
        data: { type: mongoose.Schema.Types.Mixed, required: true },
        labels: [{ type: String, trim: true }]
      }
    ],
    details: mongoose.Schema.Types.Mixed
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  format: {
    type: String,
    enum: ['json', 'pdf', 'csv'],
    default: 'json'
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduleFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly']
  },
  lastGenerated: Date,
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'completed'
  },
  tags: [String]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted generation date
ReportSchema.virtual('formattedGeneratedAt').get(function() {
  if (!this.generatedAt) return 'No date available';
  
  try {
    return this.generatedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return this.generatedAt.toString();
  }
});

// Virtual for human-readable status
ReportSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'generating': 'Generating...',
    'completed': 'Completed',
    'failed': 'Failed'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for report age
ReportSchema.virtual('reportAge').get(function() {
  if (!this.generatedAt) return 'Unknown';
  
  const now = new Date();
  const diffMs = now - this.generatedAt;
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
});

// Index for efficient queries
ReportSchema.index({ ownerUid: 1, type: 1 });
ReportSchema.index({ ownerUid: 1, generatedAt: -1 });
ReportSchema.index({ generatedAt: -1 });
ReportSchema.index({ isScheduled: 1, scheduleFrequency: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ ownerUid: 1, status: 1 });
ReportSchema.index({ tags: 1 });

// Static methods for report types
ReportSchema.statics.getReportTypes = function() {
  return [
    { value: 'trip_analytics', label: 'Trip Analytics', description: 'Analyze your trip patterns and trends' },
    { value: 'packing_statistics', label: 'Packing Statistics', description: 'Statistics on your packing lists and items' },
    { value: 'user_activity', label: 'User Activity', description: 'Your activity and engagement metrics' },
    { value: 'eco_impact', label: 'Eco Impact', description: 'Environmental impact of your travel choices' },
    { value: 'budget_analysis', label: 'Budget Analysis', description: 'Analysis of your travel spending patterns' },
    { value: 'destination_trends', label: 'Destination Trends', description: 'Popular destinations and travel trends' }
  ];
};

// Instance method to check if report needs regeneration
ReportSchema.methods.needsRegeneration = function() {
  if (!this.isScheduled) return false;
  
  const now = new Date();
  const lastGen = this.lastGenerated || this.generatedAt;
  
  if (!lastGen) return true; // If no generation date, needs regeneration
  
  const diffMs = now - lastGen;
  
  switch (this.scheduleFrequency) {
    case 'daily':
      return diffMs > (24 * 60 * 60 * 1000);
    case 'weekly':
      return diffMs > (7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return diffMs > (30 * 24 * 60 * 60 * 1000);
    case 'quarterly':
      return diffMs > (90 * 24 * 60 * 60 * 1000);
    default:
      return false;
  }
};

// Instance method to validate report data
ReportSchema.methods.validateReportData = function() {
  const errors = [];
  
  // Check if data exists
  if (!this.data || typeof this.data !== 'object') {
    errors.push('Report data is missing or invalid');
    return errors;
  }
  
  // Validate summary data
  if (!this.data.summary) {
    errors.push('Report summary is missing');
  }
  
  // Validate charts
  if (this.data.charts && Array.isArray(this.data.charts)) {
    this.data.charts.forEach((chart, index) => {
      if (!chart.type || !chart.title || !chart.data) {
        errors.push(`Chart ${index + 1} is missing required fields (type, title, or data)`);
      }
      
      if (chart.data && chart.labels && chart.data.length !== chart.labels.length) {
        errors.push(`Chart ${index + 1} has mismatched data and labels length`);
      }
    });
  }
  
  return errors;
};

// Instance method to get report size (estimated)
ReportSchema.methods.getEstimatedSize = function() {
  try {
    const dataString = JSON.stringify(this.data);
    return (dataString.length / 1024).toFixed(2) + ' KB'; // Rough estimate
  } catch (error) {
    return 'Unknown';
  }
};

// Pre-save validation
ReportSchema.pre('save', function(next) {
  // Ensure generatedAt is set
  if (!this.generatedAt) {
    this.generatedAt = new Date();
  }
  
  // Validate date ranges in filters
  if (this.filters && this.filters.dateRange) {
    const { startDate, endDate } = this.filters.dateRange;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return next(new Error('Start date cannot be after end date'));
    }
  }
  
  // Validate budget ranges in filters
  if (this.filters && this.filters.budgetRange) {
    const { min, max } = this.filters.budgetRange;
    if (min !== undefined && max !== undefined && min > max) {
      return next(new Error('Minimum budget cannot be greater than maximum budget'));
    }
    if (min !== undefined && min < 0) {
      return next(new Error('Budget minimum cannot be negative'));
    }
  }
  
  next();
});

// Static method to get available report types
ReportSchema.statics.getReportTypes = function() {
  return [
    {
      value: 'trip_analytics',
      label: 'Trip Analytics',
      description: 'Comprehensive analysis of travel patterns, destinations, and trip statistics'
    },
    {
      value: 'packing_statistics',
      label: 'Packing Statistics',
      description: 'Analysis of packing lists, item usage, and packing efficiency'
    },
    {
      value: 'user_activity',
      label: 'User Activity',
      description: 'Overview of user engagement, posts, likes, and platform usage'
    },
    {
      value: 'eco_impact',
      label: 'Eco Impact',
      description: 'Environmental impact analysis and sustainability metrics'
    },
    {
      value: 'budget_analysis',
      label: 'Budget Analysis',
      description: 'Financial analysis of travel expenses and budget optimization'
    },
    {
      value: 'destination_trends',
      label: 'Destination Trends',
      description: 'Popular destinations, travel patterns, and location analytics'
    },
    {
      value: 'eco_inventory',
      label: 'Eco Inventory',
      description: 'Analysis of eco-friendly products, ratings, and availability'
    },
    {
      value: 'news_section',
      label: 'News Section',
      description: 'News analytics including sources, trends, and publication patterns'
    }
  ];
};

module.exports = mongoose.model('Report', ReportSchema);