const Trip = require('../models/Trip');

async function create(data) { return Trip.create(data); }
async function list(q = {}) { return Trip.find(q); }
async function get(id) { return Trip.findById(id); }
async function update(id, data) { return Trip.findByIdAndUpdate(id, data, { new: true }); }
async function remove(id) { return Trip.findByIdAndDelete(id); }

module.exports = { create, list, get, update, remove };
