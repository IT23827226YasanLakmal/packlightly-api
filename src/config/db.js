const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

async function connectDB() {
  if (!MONGO_URI) throw new Error('MONGO_URI not set');
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
}

module.exports = connectDB;
