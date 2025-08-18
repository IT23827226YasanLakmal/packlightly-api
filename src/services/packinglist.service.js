const PackingList = require('../models/PackingList');

async function create(data) { return PackingList.create(data); }
async function list(q = {}) { return PackingList.find(q); }
async function get(id) { return PackingList.findById(id); }
async function update(id, data) { return PackingList.findByIdAndUpdate(id, data, { new: true }); }
async function remove(id) { return PackingList.findByIdAndDelete(id); }

module.exports = { create, list, get, update, remove };
