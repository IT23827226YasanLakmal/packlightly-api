const Product = require('../models/Product');

async function create(data) { return Product.create(data); }
async function list(q = {}) { return Product.find(q); }
async function get(id) { return Product.findById(id); }
async function update(id, data) { return Product.findByIdAndUpdate(id, data, { new: true }); }
async function remove(id) { return Product.findByIdAndDelete(id); }

module.exports = { create, list, get, update, remove };
