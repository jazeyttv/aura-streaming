const express = require('express');
const router = express.Router();
const UserStats = require('../models/UserStats');
const WatchHistory = require('../models/WatchHistory');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');

// Get current user's stats
router.get('/my-stats', auth, async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.user.id });
    
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
      await stats.save();
    }
    
    // Update login streak
    stats.updateLoginStreak();
    await stats.save();
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stats for a specific user (public)
router.get('/user/:userId', async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.params.userId });
    
    if (!stats) {
      stats = new UserStats({ userId: req.params.userId });
      await stats.save();
    }
    
    // Return public stats only
    res.json({
      level: stats.level,
      xp: stats.xp,
      watchTimeMinutes: stats.watchTimeMinutes,
      messagesSent: stats.messagesSent,
      loginStreak: stats.loginStreak
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add watch time
router.post('/add-watch-time', auth, async (req, res) => {
  try {
    const { minutes, streamerId, streamerUsername, streamTitle } = req.body;
    
    if (!minutes || minutes <= 0) {
      return res.status(400).json({ message: 'Invalid watch time' });
    }
    
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
    }
    
    const leveledUp = stats.addWatchTime(minutes);
    await stats.save();
    
    // Add to watch history
    if (streamerId) {
      await WatchHistory.create({
        userId: req.user.id,
        streamerId,
        streamerUsername: streamerUsername || 'Unknown',
        streamTitle: streamTitle || 'Untitled Stream',
        watchDuration: minutes
      });
    }
    
    // Check for achievements
    const achievementsRoute = require('./achievements');
    await achievementsRoute.checkAndUnlockAchievements(req.user.id);
    
    res.json({
      message: 'Watch time added',
      leveledUp,
      newLevel: stats.level,
      totalWatchTime: stats.watchTimeMinutes,
      pointsEarned: Math.floor(minutes),
      totalPoints: stats.points
    });
  } catch (error) {
    console.error('Error adding watch time:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add chat message (called when user sends a message)
router.post('/add-message', optionalAuth, async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      // Don't return error - just acknowledge the message was sent
      // Stats tracking is optional, message was already sent via socket
      return res.json({ message: 'Message sent (stats not recorded)' });
    }
    
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
    }
    
    stats.messagesSent += 1;
    
    // Award 1 point and 5 XP per message
    stats.addPoints(1);
    const leveledUp = stats.addXP(5);
    
    await stats.save();
    
    // Check for achievements
    const achievementsRoute = require('./achievements');
    await achievementsRoute.checkAndUnlockAchievements(req.user.id);
    
    res.json({
      message: 'Message recorded',
      leveledUp,
      newLevel: stats.level
    });
  } catch (error) {
    console.error('Error recording message:', error);
    // Don't return error status - stats tracking is optional
    res.json({ message: 'Message sent (stats error)' });
  }
});

// Get watch history
router.get('/watch-history', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    const history = await WatchHistory.find({ userId: req.user.id })
      .sort({ watchedAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('streamerId', 'username displayName avatar');
    
    const total = await WatchHistory.countDocuments({ userId: req.user.id });
    
    res.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity feed
router.get('/activity', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Activity.countDocuments({ userId: req.user.id });
    
    res.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity feed for a user (public)
router.get('/activity/:userId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await Activity.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json({ activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const type = req.query.type || 'level'; // level, points, watchTime
    const limit = parseInt(req.query.limit) || 10;
    
    let sortField = 'level';
    if (type === 'points') sortField = 'totalPointsEarned';
    else if (type === 'watchTime') sortField = 'watchTimeMinutes';
    
    const leaderboard = await UserStats.find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .populate('userId', 'username displayName avatar isPartner role');
    
    res.json({ leaderboard, type });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Daily login reward
router.post('/daily-login', auth, async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) {
      stats = new UserStats({ userId: req.user.id });
    }
    
    const streak = stats.updateLoginStreak();
    await stats.save();
    
    // Create activity
    await Activity.create({
      userId: req.user.id,
      activityType: 'joined',
      activityData: { streak },
      activityText: `Logged in! Current streak: ${streak} days 🔥`
    });
    
    res.json({
      message: 'Daily login recorded',
      streak,
      bonusPoints: Math.min(streak * 10, 100)
    });
  } catch (error) {
    console.error('Error recording daily login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

