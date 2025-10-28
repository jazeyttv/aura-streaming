const mongoose = require('mongoose');

const systemAnnouncementSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByUsername: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null // null means it doesn't expire
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
systemAnnouncementSchema.index({ active: 1, createdAt: -1 });
systemAnnouncementSchema.index({ expiresAt: 1 });

// Auto-deactivate expired announcements
systemAnnouncementSchema.pre('find', function() {
  const now = new Date();
  // Update expired announcements
  this.model.updateMany(
    { expiresAt: { $lte: now }, active: true },
    { active: false }
  ).exec().catch(err => console.error('Error deactivating expired announcements:', err));
});

module.exports = mongoose.model('SystemAnnouncement', systemAnnouncementSchema);

