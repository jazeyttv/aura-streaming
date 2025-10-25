const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: '🔧 Website is currently under maintenance. Please check back soon!'
    },
    enabledAt: {
      type: Date,
      default: null
    },
    enabledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);

