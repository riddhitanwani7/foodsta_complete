const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
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

// Compound unique index — one save per user per food
saveSchema.index({ user: 1, food: 1 }, { unique: true });

module.exports = mongoose.model('Save', saveSchema);
