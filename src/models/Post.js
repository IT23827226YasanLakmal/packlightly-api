const mongoose = require("mongoose");

// ====================
// Comment Subschema
// ====================
const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// ====================
// Post Schema
// ====================
const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
  date: { type: Date, default: Date.now },
  comments: [commentSchema],
  imageUrl: { type: String, default: "" },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model("Post", postSchema);
