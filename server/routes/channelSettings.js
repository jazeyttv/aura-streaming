const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Get channel settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      bannedWords: user.bannedWords || [],
      moderationSettings: user.moderationSettings || {},
      slowMode: user.slowMode || { enabled: false, duration: 0 },
      followerGoal: user.followerGoal || null,
      chatColor: user.chatColor || '#FFFFFF'
    });
  } catch (error) {
    console.error('Error fetching channel settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update banned words
router.post('/banned-words', authMiddleware, async (req, res) => {
  try {
    const { word } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!word || word.trim() === '') {
      return res.status(400).json({ message: 'Word cannot be empty' });
    }

    const lowercaseWord = word.toLowerCase().trim();
    
    if (!user.bannedWords) {
      user.bannedWords = [];
    }

    if (user.bannedWords.includes(lowercaseWord)) {
      return res.status(400).json({ message: 'Word already banned' });
    }

    user.bannedWords.push(lowercaseWord);
    await user.save();

    res.json({ bannedWords: user.bannedWords });
  } catch (error) {
    console.error('Error adding banned word:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove banned word
router.delete('/banned-words/:word', authMiddleware, async (req, res) => {
  try {
    const { word } = req.params;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bannedWords = user.bannedWords.filter(w => w !== word.toLowerCase());
    await user.save();

    res.json({ bannedWords: user.bannedWords });
  } catch (error) {
    console.error('Error removing banned word:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update moderation settings
router.put('/moderation', authMiddleware, async (req, res) => {
  try {
    const { moderationSettings } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.moderationSettings = {
      ...user.moderationSettings,
      ...moderationSettings
    };
    
    await user.save();

    res.json({ moderationSettings: user.moderationSettings });
  } catch (error) {
    console.error('Error updating moderation settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update slow mode
router.put('/slow-mode', authMiddleware, async (req, res) => {
  try {
    const { enabled, duration } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.slowMode = {
      enabled: enabled !== undefined ? enabled : user.slowMode.enabled,
      duration: duration !== undefined ? duration : user.slowMode.duration
    };
    
    await user.save();

    res.json({ slowMode: user.slowMode });
  } catch (error) {
    console.error('Error updating slow mode:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update follower goal
router.put('/follower-goal', authMiddleware, async (req, res) => {
  try {
    const { goal } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.followerGoal = goal;
    await user.save();

    res.json({ followerGoal: user.followerGoal });
  } catch (error) {
    console.error('Error updating follower goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update chat color
router.put('/chat-color', authMiddleware, async (req, res) => {
  try {
    const { color } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.chatColor = color;
    await user.save();

    // Update user in localStorage
    const updatedUser = user.toObject();
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating chat color:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

