const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/followers/:username
// @desc    Get user's followers list with details
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

    const followerIds = user.followers || [];
    const followers = [];

    if (useMemory) {
      const users = global.users || [];
      for (const followerId of followerIds) {
        const follower = users.find(u => (u.id || u._id).toString() === followerId.toString());
        if (follower) {
          followers.push({
            id: follower.id || follower._id,
            username: follower.username,
            displayName: follower.displayName,
            avatar: follower.avatar,
            isPartner: follower.isPartner,
            isAffiliate: follower.isAffiliate
          });
        }
      }
    } else {
      for (const followerId of followerIds) {
        const follower = await User.findById(followerId).select('username displayName avatar isPartner isAffiliate');
        if (follower) {
          followers.push(follower);
        }
      }
    }

    res.json({
      username: user.username,
      totalFollowers: followers.length,
      followers: followers
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/followers/:username/following
// @desc    Get list of users that username is following
// @access  Public
router.get('/:username/following', async (req, res) => {
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

    const followingIds = user.following || [];
    const following = [];

    if (useMemory) {
      const users = global.users || [];
      for (const followingId of followingIds) {
        const followedUser = users.find(u => (u.id || u._id).toString() === followingId.toString());
        if (followedUser) {
          following.push({
            id: followedUser.id || followedUser._id,
            username: followedUser.username,
            displayName: followedUser.displayName,
            avatar: followedUser.avatar,
            isPartner: followedUser.isPartner,
            isAffiliate: followedUser.isAffiliate
          });
        }
      }
    } else {
      for (const followingId of followingIds) {
        const followedUser = await User.findById(followingId).select('username displayName avatar isPartner isAffiliate');
        if (followedUser) {
          following.push(followedUser);
        }
      }
    }

    res.json({
      username: user.username,
      totalFollowing: following.length,
      following: following
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

