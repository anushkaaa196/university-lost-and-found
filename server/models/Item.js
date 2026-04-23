const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics',
  'Stationery',
  'Keys',
  'Clothing',
  'Books',
  'ID/Cards',
  'Accessories',
  'Bags',
  'Water Bottles',
  'Other',
];

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES,
    },
    type: {
      type: String,
      required: true,
      enum: ['lost', 'found'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    heldAt: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['open', 'claimed', 'resolved'],
      default: 'open',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Text index for keyword search
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
