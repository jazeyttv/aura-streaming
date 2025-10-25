const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/schedule/:username
// @desc    Get user's stream schedule
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

    res.json({
      schedule: user.streamSchedule || []
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/schedule
// @desc    Update user's stream schedule
// @access  Private
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { streamSchedule } = req.body;
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const users = global.users || [];
      const user = users.find(u => (u.id || u._id).toString() === userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.streamSchedule = streamSchedule;
      res.json({ message: 'Schedule updated', schedule: user.streamSchedule });
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.streamSchedule = streamSchedule;
      await user.save();
      res.json({ message: 'Schedule updated', schedule: user.streamSchedule });
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

