const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
  },
  video: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  cuisine: {
    type: String,
    default: 'General',
    trim: true,
  },
  foodPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodPartner',
    required: true,
  },
  likeCount: {
    type: Number,
    default: 0,
  },
  savesCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Food', foodSchema);
