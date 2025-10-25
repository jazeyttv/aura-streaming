const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/chat-settings/:username
// @desc    Get user's chat settings
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
      chatSettings: user.chatSettings || {
        followerOnly: false,
        followerOnlyDuration: 0,
        subscriberOnly: false,
        emotesOnly: false
      }
    });
  } catch (error) {
    console.error('Error fetching chat settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat-settings
// @desc    Update user's chat settings
// @access  Private
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { chatSettings } = req.body;
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const users = global.users || [];
      const user = users.find(u => (u.id || u._id).toString() === userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.chatSettings = { ...user.chatSettings, ...chatSettings };
      res.json({ message: 'Chat settings updated', chatSettings: user.chatSettings });
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.chatSettings = { ...user.chatSettings, ...chatSettings };
      await user.save();
      res.json({ message: 'Chat settings updated', chatSettings: user.chatSettings });
    }
  } catch (error) {
    console.error('Error updating chat settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat-settings/can-chat
// @desc    Check if user can chat in a channel
// @access  Public (but checks authentication)
router.post('/can-chat', async (req, res) => {
  try {
    const { channelUsername, userId } = req.body;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    // Get channel owner
    let channelOwner;
    if (useMemory) {
      const users = global.users || [];
      channelOwner = users.find(u => u.username.toLowerCase() === channelUsername.toLowerCase());
    } else {
      channelOwner = await User.findOne({ username: new RegExp(`^${channelUsername}$`, 'i') });
    }

    if (!channelOwner) {
      return res.status(404).json({ canChat: false, reason: 'Channel not found' });
    }

    // If no chat settings or all disabled, anyone can chat
    if (!channelOwner.chatSettings || 
        (!channelOwner.chatSettings.followerOnly && !channelOwner.chatSettings.subscriberOnly)) {
      return res.json({ canChat: true });
    }

    // Get user
    let user;
    if (useMemory) {
      const users = global.users || [];
      user = users.find(u => (u.id || u._id).toString() === userId);
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.json({ canChat: false, reason: 'User not found' });
    }

    // Check subscriber mode
    if (channelOwner.chatSettings.subscriberOnly) {
      const isSubscriber = user.subscribedTo && user.subscribedTo.includes(channelOwner._id || channelOwner.id);
      if (!isSubscriber) {
        return res.json({ canChat: false, reason: 'Subscriber-only mode is enabled' });
      }
    }

    // Check follower mode
    if (channelOwner.chatSettings.followerOnly) {
      const isFollowing = channelOwner.followers && 
                          channelOwner.followers.includes(userId);
      if (!isFollowing) {
        return res.json({ canChat: false, reason: 'Follower-only mode is enabled' });
      }
    }

    res.json({ canChat: true });
  } catch (error) {
    console.error('Error checking chat permissions:', error);
    res.status(500).json({ canChat: false, reason: 'Server error' });
  }
});

module.exports = router;

