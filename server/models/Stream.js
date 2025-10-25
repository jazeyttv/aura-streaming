const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  category: {
    type: String,
    default: 'Just Chatting'
  },
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  streamerUsername: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  streamUrl: {
    type: String,
    default: ''
  },
  isLive: {
    type: Boolean,
    default: false
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Stream', streamSchema);

