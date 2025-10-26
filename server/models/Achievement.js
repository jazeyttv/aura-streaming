const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: String,
    required: true
  },
  achievementName: {
    type: String,
    required: true
  },
  achievementDescription: {
    type: String,
    required: true
  },
  achievementIcon: {
    type: String,
    default: '🏆'
  },
  achievementRarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate achievements
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// Achievement definitions
const ACHIEVEMENTS = {
  // Registration & Profile
  FIRST_STEPS: {
    id: 'FIRST_STEPS',
    name: 'First Steps',
    description: 'Created your account',
    icon: '👋',
    rarity: 'common'
  },
  PROFILE_COMPLETE: {
    id: 'PROFILE_COMPLETE',
    name: 'Looking Good',
    description: 'Set your avatar and banner',
    icon: '✨',
    rarity: 'common'
  },
  
  // Streaming
  FIRST_STREAM: {
    id: 'FIRST_STREAM',
    name: 'Going Live',
    description: 'Started your first stream',
    icon: '🎥',
    rarity: 'common'
  },
  STREAM_10: {
    id: 'STREAM_10',
    name: 'Content Creator',
    description: 'Streamed 10 times',
    icon: '🎬',
    rarity: 'rare'
  },
  STREAM_50: {
    id: 'STREAM_50',
    name: 'Dedicated Streamer',
    description: 'Streamed 50 times',
    icon: '🌟',
    rarity: 'epic'
  },
  STREAM_100: {
    id: 'STREAM_100',
    name: 'Streaming Legend',
    description: 'Streamed 100 times',
    icon: '👑',
    rarity: 'legendary'
  },
  
  // Followers
  FOLLOWERS_10: {
    id: 'FOLLOWERS_10',
    name: 'Rising Star',
    description: 'Reached 10 followers',
    icon: '⭐',
    rarity: 'common'
  },
  FOLLOWERS_50: {
    id: 'FOLLOWERS_50',
    name: 'Popular Creator',
    description: 'Reached 50 followers',
    icon: '🌠',
    rarity: 'rare'
  },
  FOLLOWERS_100: {
    id: 'FOLLOWERS_100',
    name: 'Community Leader',
    description: 'Reached 100 followers',
    icon: '💫',
    rarity: 'epic'
  },
  FOLLOWERS_500: {
    id: 'FOLLOWERS_500',
    name: 'Influencer',
    description: 'Reached 500 followers',
    icon: '🔥',
    rarity: 'legendary'
  },
  
  // Watch Time
  WATCHED_1H: {
    id: 'WATCHED_1H',
    name: 'Stream Enthusiast',
    description: 'Watched 1 hour of streams',
    icon: '👀',
    rarity: 'common'
  },
  WATCHED_10H: {
    id: 'WATCHED_10H',
    name: 'Dedicated Viewer',
    description: 'Watched 10 hours of streams',
    icon: '📺',
    rarity: 'rare'
  },
  WATCHED_50H: {
    id: 'WATCHED_50H',
    name: 'Super Fan',
    description: 'Watched 50 hours of streams',
    icon: '💎',
    rarity: 'epic'
  },
  WATCHED_100H: {
    id: 'WATCHED_100H',
    name: 'Stream Addict',
    description: 'Watched 100 hours of streams',
    icon: '🎯',
    rarity: 'legendary'
  },
  
  // Chat
  FIRST_MESSAGE: {
    id: 'FIRST_MESSAGE',
    name: 'Breaking the Ice',
    description: 'Sent your first chat message',
    icon: '💬',
    rarity: 'common'
  },
  MESSAGES_100: {
    id: 'MESSAGES_100',
    name: 'Chatty',
    description: 'Sent 100 chat messages',
    icon: '💭',
    rarity: 'rare'
  },
  MESSAGES_1000: {
    id: 'MESSAGES_1000',
    name: 'Chat Master',
    description: 'Sent 1000 chat messages',
    icon: '🗨️',
    rarity: 'epic'
  },
  
  // Points
  POINTS_1000: {
    id: 'POINTS_1000',
    name: 'Point Collector',
    description: 'Earned 1000 points',
    icon: '🪙',
    rarity: 'common'
  },
  POINTS_10000: {
    id: 'POINTS_10000',
    name: 'Point Master',
    description: 'Earned 10,000 points',
    icon: '💰',
    rarity: 'rare'
  },
  POINTS_50000: {
    id: 'POINTS_50000',
    name: 'Point Legend',
    description: 'Earned 50,000 points',
    icon: '💎',
    rarity: 'epic'
  },
  
  // Social
  FOLLOWING_10: {
    id: 'FOLLOWING_10',
    name: 'Social Butterfly',
    description: 'Following 10 channels',
    icon: '🦋',
    rarity: 'common'
  },
  FOLLOWING_50: {
    id: 'FOLLOWING_50',
    name: 'Community Member',
    description: 'Following 50 channels',
    icon: '🤝',
    rarity: 'rare'
  }
};

achievementSchema.statics.ACHIEVEMENTS = ACHIEVEMENTS;

module.exports = mongoose.model('Achievement', achievementSchema);

