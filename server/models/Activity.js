const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: [
      'stream_started',
      'stream_ended',
      'followed',
      'achievement_unlocked',
      'level_up',
      'joined',
      'updated_profile',
      'became_partner',
      'became_affiliate'
    ],
    required: true
  },
  activityData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  activityText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
activitySchema.index({ userId: 1, createdAt: -1 });

// Auto-delete activities older than 30 days
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('Activity', activitySchema);

