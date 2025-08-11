const Post = require('../models/Post');

async function create(data) { return Post.create(data); }
async function list(q = {}) { return Post.find(q); }
async function get(id) { return Post.findById(id); }
async function update(id, data) { return Post.findByIdAndUpdate(id, data, { new: true }); }
async function remove(id) { return Post.findByIdAndDelete(id); }

module.exports = { create, list, get, update, remove };
