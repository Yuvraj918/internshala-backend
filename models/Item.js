const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemType: {
    type: String,
    required: true,
    trim: true
  },
  itemDescription: {
    type: String,
    required: true,
    trim: true
  },
  coverImage: {
    type: String,
    default: null
  },
  additionalImages: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema);