const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  ownerUid: String
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
