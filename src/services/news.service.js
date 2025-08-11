const News = require('../models/News');

async function create(data) { return News.create(data); }
async function list(q = {}) { return News.find(q); }
async function get(id) { return News.findById(id); }
async function update(id, data) { return News.findByIdAndUpdate(id, data, { new: true }); }
async function remove(id) { return News.findByIdAndDelete(id); }

module.exports = { create, list, get, update, remove };
