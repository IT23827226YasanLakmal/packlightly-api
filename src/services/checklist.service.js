const Checklist = require('../models/Checklist');

async function create(data) {
  return await Checklist.create(data);
}

async function list(filter) {
  return await Checklist.find(filter).sort({ createdAt: -1 });
}

async function get(id) {
  return await Checklist.findById(id);
}

async function update(id, data) {
  return await Checklist.findByIdAndUpdate(id, data, { new: true });
}

async function remove(id) {
  return await Checklist.findByIdAndDelete(id);
}

module.exports = { create, list, get, update, remove };
