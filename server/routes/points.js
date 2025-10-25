const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/points
// @desc    Get user's channel points
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    let user;
    if (useMemory) {
      const users = global.users || [];
      user = users.find(u => (u.id || u._id).toString() === userId);
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ points: user.channelPoints || 0 });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/points/award
// @desc    Award points to a user (for watching streams)
// @access  Public (internally called by Socket.IO)
router.post('/award', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const users = global.users || [];
      const user = users.find(u => (u.id || u._id).toString() === userId.toString());
      if (user) {
        user.channelPoints = (user.channelPoints || 0) + amount;
        return res.json({ points: user.channelPoints });
      }
    } else {
      const user = await User.findById(userId);
      if (user) {
        user.channelPoints = (user.channelPoints || 0) + amount;
        await user.save();
        return res.json({ points: user.channelPoints });
      }
    }

    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/points/spend
// @desc    Spend channel points on a reward
// @access  Private
router.post('/spend', authMiddleware, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const users = global.users || [];
      const user = users.find(u => (u.id || u._id).toString() === userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if ((user.channelPoints || 0) < amount) {
        return res.status(400).json({ message: 'Not enough points' });
      }

      user.channelPoints -= amount;
      console.log(`[POINTS] ${user.username} spent ${amount} points on: ${description}`);
      return res.json({ points: user.channelPoints, message: `Spent ${amount} points on ${description}` });
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if ((user.channelPoints || 0) < amount) {
        return res.status(400).json({ message: 'Not enough points' });
      }

      user.channelPoints -= amount;
      await user.save();
      console.log(`[POINTS] ${user.username} spent ${amount} points on: ${description}`);
      return res.json({ points: user.channelPoints, message: `Spent ${amount} points on ${description}` });
    }
  } catch (error) {
    console.error('Error spending points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/points/:username
// @desc    Get points for a specific user (public)
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    let user;
    if (useMemory) {
      const users = global.users || [];
      user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    } else {
      user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ username: user.username, points: user.channelPoints || 0 });
  } catch (error) {
    console.error('Error fetching user points:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

