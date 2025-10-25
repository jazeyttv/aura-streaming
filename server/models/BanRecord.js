const mongoose = require('mongoose');

const banRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  streamId: {
    type: String,
    required: true
  },
  bannedBy: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in minutes, 0 = permanent
    default: 0
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BanRecord', banRecordSchema);

