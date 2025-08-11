const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  authorUid: String,
  published: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
