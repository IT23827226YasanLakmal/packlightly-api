const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  durationDays: Number,
  ownerUid: String,
  weather: {
    location: String,
    tempRange: String,
    description: String,
    condition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'], // restrict to common types
      default: 'sunny'
    },
    highTemp: String,
    lowTemp: String,
    wind: String,
    humidity: String,
    chanceRain: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
