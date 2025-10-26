const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const UserStats = require('../models/UserStats');
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all achievements for a user
router.get('/my-achievements', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id })
      .sort({ unlockedAt: -1 });
    
    res.json({
      achievements,
      totalUnlocked: achievements.length,
      totalAchievements: Object.keys(Achievement.ACHIEVEMENTS).length
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get achievements for a specific user (public)
router.get('/user/:userId', async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.params.userId })
      .sort({ unlockedAt: -1 });
    
    res.json({
      achievements,
      totalUnlocked: achievements.length,
      totalAchievements: Object.keys(Achievement.ACHIEVEMENTS).length
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all available achievements (definitions)
router.get('/definitions', async (req, res) => {
  try {
    res.json(Achievement.ACHIEVEMENTS);
  } catch (error) {
    console.error('Error fetching achievement definitions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlock achievement (internal use by other routes)
router.post('/unlock', auth, async (req, res) => {
  try {
    const { achievementId } = req.body;
    
    if (!Achievement.ACHIEVEMENTS[achievementId]) {
      return res.status(400).json({ message: 'Invalid achievement ID' });
    }
    
    const achievementDef = Achievement.ACHIEVEMENTS[achievementId];
    
    // Check if already unlocked
    const existing = await Achievement.findOne({
      userId: req.user.id,
      achievementId
    });
    
    if (existing) {
      return res.json({ message: 'Achievement already unlocked', achievement: existing });
    }
    
    // Create new achievement
    const achievement = new Achievement({
      userId: req.user.id,
      achievementId: achievementDef.id,
      achievementName: achievementDef.name,
      achievementDescription: achievementDef.description,
      achievementIcon: achievementDef.icon,
      achievementRarity: achievementDef.rarity
    });
    
    await achievement.save();
    
    // Award points based on rarity
    const pointsAwarded = {
      common: 100,
      rare: 250,
      epic: 500,
      legendary: 1000
    }[achievementDef.rarity] || 100;
    
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
    }
    stats.addPoints(pointsAwarded);
    const leveledUp = stats.addXP(pointsAwarded * 2);
    await stats.save();
    
    // Create activity
    await Activity.create({
      userId: req.user.id,
      activityType: 'achievement_unlocked',
      activityData: {
        achievementId,
        achievementName: achievementDef.name,
        achievementIcon: achievementDef.icon,
        rarity: achievementDef.rarity,
        pointsAwarded
      },
      activityText: `Unlocked achievement: ${achievementDef.icon} ${achievementDef.name}`
    });
    
    res.json({
      message: 'Achievement unlocked!',
      achievement,
      pointsAwarded,
      leveledUp,
      newLevel: stats.level
    });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check and unlock achievements (utility function)
async function checkAndUnlockAchievements(userId) {
  try {
    const user = await User.findById(userId);
    const stats = await UserStats.findOne({ userId });
    
    if (!user || !stats) return;
    
    const toUnlock = [];
    
    // Check follower achievements
    const followerCount = user.followers?.length || 0;
    if (followerCount >= 10) toUnlock.push('FOLLOWERS_10');
    if (followerCount >= 50) toUnlock.push('FOLLOWERS_50');
    if (followerCount >= 100) toUnlock.push('FOLLOWERS_100');
    if (followerCount >= 500) toUnlock.push('FOLLOWERS_500');
    
    // Check following achievements
    const followingCount = user.following?.length || 0;
    if (followingCount >= 10) toUnlock.push('FOLLOWING_10');
    if (followingCount >= 50) toUnlock.push('FOLLOWING_50');
    
    // Check stream achievements
    const streamCount = user.streamCount || 0;
    if (streamCount >= 1) toUnlock.push('FIRST_STREAM');
    if (streamCount >= 10) toUnlock.push('STREAM_10');
    if (streamCount >= 50) toUnlock.push('STREAM_50');
    if (streamCount >= 100) toUnlock.push('STREAM_100');
    
    // Check watch time achievements (in hours)
    const watchHours = stats.watchTimeMinutes / 60;
    if (watchHours >= 1) toUnlock.push('WATCHED_1H');
    if (watchHours >= 10) toUnlock.push('WATCHED_10H');
    if (watchHours >= 50) toUnlock.push('WATCHED_50H');
    if (watchHours >= 100) toUnlock.push('WATCHED_100H');
    
    // Check message achievements
    const messageCount = stats.messagesSent || 0;
    if (messageCount >= 1) toUnlock.push('FIRST_MESSAGE');
    if (messageCount >= 100) toUnlock.push('MESSAGES_100');
    if (messageCount >= 1000) toUnlock.push('MESSAGES_1000');
    
    // Check points achievements
    const totalPoints = stats.totalPointsEarned || 0;
    if (totalPoints >= 1000) toUnlock.push('POINTS_1000');
    if (totalPoints >= 10000) toUnlock.push('POINTS_10000');
    if (totalPoints >= 50000) toUnlock.push('POINTS_50000');
    
    // Check profile achievements
    if (user.avatar && user.banner) toUnlock.push('PROFILE_COMPLETE');
    
    // Unlock achievements that aren't already unlocked
    for (const achievementId of toUnlock) {
      const existing = await Achievement.findOne({ userId, achievementId });
      if (!existing && Achievement.ACHIEVEMENTS[achievementId]) {
        const achievementDef = Achievement.ACHIEVEMENTS[achievementId];
        
        await Achievement.create({
          userId,
          achievementId: achievementDef.id,
          achievementName: achievementDef.name,
          achievementDescription: achievementDef.description,
          achievementIcon: achievementDef.icon,
          achievementRarity: achievementDef.rarity
        });
        
        // Award points
        const pointsAwarded = {
          common: 100,
          rare: 250,
          epic: 500,
          legendary: 1000
        }[achievementDef.rarity] || 100;
        
        stats.addPoints(pointsAwarded);
        stats.addXP(pointsAwarded * 2);
        
        await Activity.create({
          userId,
          activityType: 'achievement_unlocked',
          activityData: {
            achievementId,
            achievementName: achievementDef.name,
            achievementIcon: achievementDef.icon
          },
          activityText: `Unlocked achievement: ${achievementDef.icon} ${achievementDef.name}`
        });
      }
    }
    
    await stats.save();
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// Export the utility function
router.checkAndUnlockAchievements = checkAndUnlockAchievements;

module.exports = router;

