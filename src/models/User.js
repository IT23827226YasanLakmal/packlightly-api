const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true },             // Firebase email
  displayName: { type: String },                       // Firebase display name
  photoURL: { type: String },                          // Profile picture
  phoneNumber: { type: String },                       // Phone number
  emailVerified: { type: Boolean, default: false },    // Firebase email verification
  role: { type: String, enum: ["user", "admin"], default: "user" }, // App-specific role
  disabled: { type: Boolean, default: false },         // Account disabled flag
  providerData: { type: Array },                       // Auth providers info from Firebase
  lastLoginAt: { type: Date },                         // Last login timestamp
  createdAt: { type: Date, default: Date.now },        // Record creation date in MongoDB
});

// Optional: index for faster queries by email
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
