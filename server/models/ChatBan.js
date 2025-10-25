const mongoose = require('mongoose');

const chatBanSchema = new mongoose.Schema({
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
  moderatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatorName: {
    type: String
  },
  permanent: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick lookups
chatBanSchema.index({ userId: 1, channelId: 1 });

module.exports = mongoose.model('ChatBan', chatBanSchema);

