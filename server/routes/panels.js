const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/panels/:username
// @desc    Get user's channel panels
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
      panels: user.channelPanels || []
    });
  } catch (error) {
    console.error('Error fetching panels:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/panels
// @desc    Update user's channel panels
// @access  Private
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { channelPanels } = req.body;
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    // Sort panels by order
    const sortedPanels = channelPanels.map((panel, index) => ({
      ...panel,
      order: panel.order !== undefined ? panel.order : index
    }));

    if (useMemory) {
      const users = global.users || [];
      const user = users.find(u => (u.id || u._id).toString() === userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.channelPanels = sortedPanels;
      res.json({ message: 'Panels updated', panels: user.channelPanels });
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.channelPanels = sortedPanels;
      await user.save();
      res.json({ message: 'Panels updated', panels: user.channelPanels });
    }
  } catch (error) {
    console.error('Error updating panels:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

