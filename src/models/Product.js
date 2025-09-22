const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  eco: Number, // 1 to 5
  description: String,
  availableLocation: [String],
  imageLink: String
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
    