const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Points/Currency System
  points: {
    type: Number,
    default: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  
  // XP and Level System
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  
  // Watch Time (in minutes)
  watchTimeMinutes: {
    type: Number,
    default: 0
  },
  
  // Chat Stats
  messagesSent: {
    type: Number,
    default: 0
  },
  
  // Streaming Stats
  totalStreamTime: {
    type: Number,
    default: 0 // in minutes
  },
  
  // Daily Activity Tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  dailyPoints: {
    type: Number,
    default: 0
  },
  lastPointsReset: {
    type: Date,
    default: Date.now
  },
  loginStreak: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate level from XP
userStatsSchema.methods.calculateLevel = function() {
  // Level formula: level = floor(sqrt(xp / 100))
  const newLevel = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  if (newLevel !== this.level) {
    this.level = newLevel;
    return true; // Level up!
  }
  return false;
};

// Add XP and check for level up
userStatsSchema.methods.addXP = function(amount) {
  this.xp += amount;
  const leveledUp = this.calculateLevel();
  this.updatedAt = Date.now();
  return leveledUp;
};

// Add points
userStatsSchema.methods.addPoints = function(amount) {
  this.points += amount;
  this.totalPointsEarned += amount;
  this.updatedAt = Date.now();
};

// Spend points
userStatsSchema.methods.spendPoints = function(amount) {
  if (this.points >= amount) {
    this.points -= amount;
    this.updatedAt = Date.now();
    return true;
  }
  return false;
};

// Add watch time and earn points/XP
userStatsSchema.methods.addWatchTime = function(minutes) {
  this.watchTimeMinutes += minutes;
  
  // Earn 1 point per minute watched
  this.addPoints(Math.floor(minutes));
  
  // Earn 10 XP per minute watched
  const leveledUp = this.addXP(Math.floor(minutes * 10));
  
  this.updatedAt = Date.now();
  return leveledUp;
};

// Update login streak
userStatsSchema.methods.updateLoginStreak = function() {
  const now = new Date();
  const lastLogin = new Date(this.lastLogin);
  const hoursSinceLastLogin = (now - lastLogin) / (1000 * 60 * 60);
  
  if (hoursSinceLastLogin < 24) {
    // Same day, no change
    return this.loginStreak;
  } else if (hoursSinceLastLogin < 48) {
    // Next day, increment streak
    this.loginStreak += 1;
    this.lastLogin = now;
    
    // Bonus points for streak
    const bonusPoints = Math.min(this.loginStreak * 10, 100);
    this.addPoints(bonusPoints);
  } else {
    // Streak broken
    this.loginStreak = 1;
    this.lastLogin = now;
  }
  
  return this.loginStreak;
};

// Update timestamp before saving
userStatsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserStats', userStatsSchema);

