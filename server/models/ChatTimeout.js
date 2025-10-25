const mongoose = require('mongoose');

const chatTimeoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // Duration in seconds
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  moderatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatorName: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick lookups
chatTimeoutSchema.index({ userId: 1, channelId: 1 });
chatTimeoutSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('ChatTimeout', chatTimeoutSchema);

