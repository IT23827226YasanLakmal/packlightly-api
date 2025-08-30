const mongoose = require('mongoose');

const PackingListSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  ownerUid: { type: String, required: true },
  title: { type: String, required: true },
  categories: [
    {
      name: {
        type: String,
        enum: ['Clothing', 'Essentials', 'Toiletries', 'Electronics'], // predefined categories
        required: true
      },
      items: [
        {
          name: { type: String, required: true },
          qty: { type: Number, default: 1 },
          checked: { type: Boolean, default: false },
          eco: { type: Boolean, default: false },
          suggestedByAI: { type: Boolean, default: false }
        }
      ]
    }
  ],
  isAIGenerated: { type: Boolean, default: false },
  lastAIGeneratedAt: { type: Date, default: null }
}, { timestamps: true });

packingItemSchema.index({ tripId: 1, category: 1 });


module.exports = mongoose.model('PackingList', PackingListSchema);
