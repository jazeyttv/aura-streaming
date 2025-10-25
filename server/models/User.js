const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  avatar: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  chatColor: {
    type: String,
    default: '#FFFFFF'
  },
  // Channel Settings
  bannedWords: [{
    type: String,
    lowercase: true
  }],
  moderationSettings: {
    sexualContent: {
      type: String,
      enum: ['unfiltered', 'minimal', 'moderate', 'maximum'],
      default: 'unfiltered'
    },
    hateSpeech: {
      type: String,
      enum: ['unfiltered', 'minimal', 'moderate', 'maximum'],
      default: 'maximum'
    },
    violence: {
      type: String,
      enum: ['unfiltered', 'minimal', 'moderate', 'maximum'],
      default: 'unfiltered'
    },
    bullying: {
      type: String,
      enum: ['unfiltered', 'minimal', 'moderate', 'maximum'],
      default: 'unfiltered'
    },
    drugs: {
      type: String,
      enum: ['unfiltered', 'minimal', 'moderate', 'maximum'],
      default: 'unfiltered'
    },
    weapons: {
      type: String,
      enum: ['unfiltered', 'minimal', 'moderate', 'maximum'],
      default: 'unfiltered'
    },
    gibberish: {
      type: Boolean,
      default: false
    },
    spam: {
      type: Boolean,
      default: false
    }
  },
  slowMode: {
    enabled: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 0 // in seconds
    }
  },
  followerGoal: {
    type: Number,
    default: null
  },
  isStreamer: {
    type: Boolean,
    default: true
  },
  isPartner: {
    type: Boolean,
    default: false
  },
  isAffiliate: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  streamKey: {
    type: String,
    default: '',
    unique: true,
    sparse: true
  },
  rtmpUrl: {
    type: String,
    default: ''
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  bannedUntil: {
    type: Date,
    default: null
  },
  isChatBanned: {
    type: Boolean,
    default: false
  },
  chatBannedUntil: {
    type: Date,
    default: null
  },
  isIpBanned: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    default: ''
  },
  lastIpAddress: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.Mixed
  }],
  following: [{
    type: mongoose.Schema.Types.Mixed
  }],
  totalViewers: {
    type: Number,
    default: 0
  },
  streamCount: {
    type: Number,
    default: 0
  },
  // Custom Badge System
  customBadges: [{
    type: String // Array of badge IDs that admin has assigned to this user
  }],
  selectedBadge: {
    type: String, // The badge ID the user has chosen to display
    default: null
  },
  // Social Media Links
  socialMedia: {
    instagram: {
      type: String,
      default: ''
    },
    twitter: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    },
    discord: {
      type: String,
      default: ''
    },
    tiktok: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
