const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const newsSchema = new Schema({
  title: { type: String, required: true },          // Article title
  link: { type: String, required: true, unique: true }, // Unique link
  description: { type: String },                   // Short description
  pubDate: { type: Date, required: true },         // Publication date
  source_id: { type: String },                      // Source identifier
  image: { type: String },                          // Article image URL
  content: { type: String },                        // Full article content/body
}, { timestamps: true });

module.exports = mongoose.model("News", newsSchema);
