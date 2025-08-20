const mongoose = require('mongoose');

const PackingListSchema = new mongoose.Schema({
  title:String,
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
          checked: { type: Boolean, default: false }
        }
      ]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('PackingList', PackingListSchema);
