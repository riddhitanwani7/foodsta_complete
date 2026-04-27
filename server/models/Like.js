const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound unique index — one like per user per food
likeSchema.index({ user: 1, food: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
