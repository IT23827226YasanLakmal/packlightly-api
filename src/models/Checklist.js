const mongoose = require('mongoose');

const ChecklistSchema = new mongoose.Schema({
  name: { type: String, required: true },             // e.g. "Clothes Checklist"
  packingListId: {                                    // parent PackingList
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PackingList',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Checklist', ChecklistSchema);
