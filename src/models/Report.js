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
      'destination_trends'
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
      totalTrips: { type: Number, default: 0 },
      totalPackingLists: { type: Number, default: 0 },
      totalBudget: { type: Number, default: 0 },
      avgTripDuration: { type: Number, default: 0 },
      ecoFriendlyPercentage: { type: Number, default: 0 }
    },
    charts: [
      {
        type: {
          type: String,
          enum: ['bar', 'line', 'pie', 'doughnut']
        },
        title: String,
        data: mongoose.Schema.Types.Mixed,
        labels: [String]
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
  return this.generatedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Index for efficient queries
ReportSchema.index({ ownerUid: 1, type: 1 });
ReportSchema.index({ generatedAt: -1 });
ReportSchema.index({ isScheduled: 1, scheduleFrequency: 1 });

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
  
  switch (this.scheduleFrequency) {
    case 'daily':
      return (now - lastGen) > (24 * 60 * 60 * 1000);
    case 'weekly':
      return (now - lastGen) > (7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return (now - lastGen) > (30 * 24 * 60 * 60 * 1000);
    case 'quarterly':
      return (now - lastGen) > (90 * 24 * 60 * 60 * 1000);
    default:
      return false;
  }
};

module.exports = mongoose.model('Report', ReportSchema);