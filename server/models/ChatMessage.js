const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  streamId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  userRole: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

