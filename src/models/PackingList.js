const mongoose = require('mongoose');

const PackingListSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  items: [{ name: String, qty: Number, checked: { type: Boolean, default: false } }],
  ownerUid: String
}, { timestamps: true });

module.exports = mongoose.model('PackingList', PackingListSchema);
