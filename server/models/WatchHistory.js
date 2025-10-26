const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  streamerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  streamerUsername: {
    type: String,
    required: true
  },
  streamTitle: {
    type: String,
    default: 'Untitled Stream'
  },
  watchedAt: {
    type: Date,
    default: Date.now
  },
  watchDuration: {
    type: Number,
    default: 0 // in minutes
  }
});

// Index for faster queries
watchHistorySchema.index({ userId: 1, watchedAt: -1 });
watchHistorySchema.index({ streamerId: 1 });

module.exports = mongoose.model('WatchHistory', watchHistorySchema);

