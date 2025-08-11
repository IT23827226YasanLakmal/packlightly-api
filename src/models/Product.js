const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  ownerUid: String
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
