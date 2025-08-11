const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  email: String,
  displayName: String,
  photoURL: String,
  role: { type: String, default: 'user' } // optional; sync with Firebase custom claims if used
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
