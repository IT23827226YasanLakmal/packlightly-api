const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: String,
  body: String,
  source: String,
  publishedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
