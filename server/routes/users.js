const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stream = require('../models/Stream');
const authMiddleware = require('../middleware/auth');
const authRoutes = require('./auth');
const bcrypt = require('bcryptjs');
const { getAllBadges, isValidBadgeId, getBadgeById } = require('../config/badges');
const { createFollowNotification, emitNotification } = require('../utils/notifications');

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = Array.from(authRoutes.users.values()).find(u => u.username === username);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        banner: user.banner,
        role: user.role,
        isStreamer: user.isStreamer,
        isPartner: user.isPartner || false,
        isAffiliate: user.isAffiliate || false,
        customBadges: user.customBadges || [],
        selectedBadge: user.selectedBadge,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        createdAt: user.createdAt
      });
    } else {
      const user = await User.findOne({ username }).select('-password -streamKey');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        banner: user.banner,
        role: user.role,
        isStreamer: user.isStreamer,
        isPartner: user.isPartner || false,
        isAffiliate: user.isAffiliate || false,
        customBadges: user.customBadges || [],
        selectedBadge: user.selectedBadge,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        createdAt: user.createdAt
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, displayName, bio, avatar, banner, socialMedia } = req.body;
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if username is already taken (if changing)
      if (username && username !== user.username) {
        const existingUser = Array.from(authRoutes.users.values()).find(u => u.username === username);
        if (existingUser) {
          return res.status(400).json({ message: 'Username already taken' });
        }
        user.username = username;
      }

      if (displayName !== undefined) user.displayName = displayName;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;
      if (banner !== undefined) user.banner = banner;
      if (socialMedia !== undefined) user.socialMedia = socialMedia;

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          bio: user.bio,
          avatar: user.avatar,
          banner: user.banner,
          socialMedia: user.socialMedia || {},
          isStreamer: user.isStreamer,
          role: user.role,
          chatColor: user.chatColor || '#FFFFFF',
          isPartner: user.isPartner || false,
          isAffiliate: user.isAffiliate || false
        }
      });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if username is already taken (if changing)
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: 'Username already taken' });
        }
        user.username = username;
      }

      if (displayName !== undefined) user.displayName = displayName;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;
      if (banner !== undefined) user.banner = banner;
      if (socialMedia !== undefined) user.socialMedia = socialMedia;

      await user.save();

      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          bio: user.bio,
          avatar: user.avatar,
          banner: user.banner,
          socialMedia: user.socialMedia || {},
          isStreamer: user.isStreamer,
          role: user.role,
          chatColor: user.chatColor || '#FFFFFF',
          isPartner: user.isPartner || false,
          isAffiliate: user.isAffiliate || false
        }
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.password = hashedPassword;
      res.json({ message: 'Password updated successfully' });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update chat color
router.put('/chat-color', authMiddleware, async (req, res) => {
  try {
    const { chatColor } = req.body;
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (!chatColor) {
      return res.status(400).json({ message: 'Chat color is required' });
    }

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.chatColor = chatColor;
      res.json({ chatColor: user.chatColor });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.chatColor = chatColor;
      await user.save();

      res.json({ chatColor: user.chatColor });
    }
  } catch (error) {
    console.error('Update chat color error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow user
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    console.log('Follow request:', { userId, followerId });

    // Check if trying to follow self
    if (userId === followerId || userId.toString() === followerId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    if (useMemory) {
      const userToFollow = authRoutes.users.get(userId);
      const follower = authRoutes.users.get(followerId);

      if (!userToFollow || !follower) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Initialize arrays if they don't exist
      if (!follower.following) follower.following = [];
      if (!userToFollow.followers) userToFollow.followers = [];

      // Check if already following
      if (follower.following.includes(userId)) {
        return res.json({ message: 'Already following this user', isFollowing: true });
      }

      // Add to following/followers
      follower.following.push(userId);
      userToFollow.followers.push(followerId);

      // Create follow notification (in-memory mode - won't persist)
      const notification = await createFollowNotification(
        followerId,
        follower.username,
        userId
      );

      // Emit real-time notification
      if (notification) {
        const io = req.app.get('io');
        emitNotification(io, notification);
        
        // Emit follow event for dashboard activity feed
        io.emit('new-follower', {
          userId: userId,
          followerId: followerId,
          followerUsername: follower.username
        });
        console.log('[FOLLOW] Emitted new-follower event:', follower.username);
      }

      res.json({ message: 'User followed successfully', isFollowing: true });
    } else {
      const userToFollow = await User.findById(userId);
      const follower = await User.findById(followerId);

      if (!userToFollow || !follower) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Initialize arrays if they don't exist
      if (!follower.following) follower.following = [];
      if (!userToFollow.followers) userToFollow.followers = [];

      // Check if already following
      const isAlreadyFollowing = follower.following.some(id => 
        id && id.toString() === userId.toString()
      );
      
      if (isAlreadyFollowing) {
        return res.json({ message: 'Already following this user', isFollowing: true });
      }

      // Add to following/followers
      follower.following.push(userId);
      userToFollow.followers.push(followerId);

      await follower.save();
      await userToFollow.save();

      // Create follow notification
      const notification = await createFollowNotification(
        followerId,
        follower.username,
        userId
      );

      // Emit real-time notification
      if (notification) {
        const io = req.app.get('io');
        emitNotification(io, notification);
        
        // Emit follow event for dashboard activity feed
        io.emit('new-follower', {
          userId: userId.toString(),
          followerId: followerId.toString(),
          followerUsername: follower.username
        });
        console.log('[FOLLOW] Emitted new-follower event:', follower.username);
      }

      console.log('Follow successful');
      res.json({ message: 'User followed successfully', isFollowing: true });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow user
router.delete('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    console.log('Unfollow request:', { userId, followerId });

    if (useMemory) {
      const userToUnfollow = authRoutes.users.get(userId);
      const follower = authRoutes.users.get(followerId);

      if (!userToUnfollow || !follower) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove from following/followers
      if (follower.following) {
        follower.following = follower.following.filter(id => id !== userId);
      }
      if (userToUnfollow.followers) {
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id !== followerId);
      }

      res.json({ message: 'User unfollowed successfully', isFollowing: false });
    } else {
      const userToUnfollow = await User.findById(userId);
      const follower = await User.findById(followerId);

      if (!userToUnfollow || !follower) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove from following/followers
      if (follower.following) {
        follower.following = follower.following.filter(id => 
          id && id.toString() !== userId.toString()
        );
      }
      if (userToUnfollow.followers) {
        userToUnfollow.followers = userToUnfollow.followers.filter(id => 
          id && id.toString() !== followerId.toString()
        );
      }

      await follower.save();
      await userToUnfollow.save();

      console.log('Unfollow successful');
      res.json({ message: 'User unfollowed successfully', isFollowing: false });
    }
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if following
router.get('/:userId/following', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    console.log('Check following:', { userId, followerId });

    if (useMemory) {
      const follower = authRoutes.users.get(followerId);
      
      if (!follower) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isFollowing = follower.following?.includes(userId) || false;
      res.json({ isFollowing });
    } else {
      const follower = await User.findById(followerId);
      
      if (!follower) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if following
      const isFollowing = follower.following?.some(id => 
        id && id.toString() === userId.toString()
      ) || false;
      
      console.log(`Is following: ${isFollowing}`);
      res.json({ isFollowing });
    }
  } catch (error) {
    console.error('Check following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get live streams from followed users
router.get('/following/live', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const followedUserIds = user.following || [];
      if (followedUserIds.length === 0) {
        return res.json([]);
      }

      // Get live streams from memory
      const liveStreams = [];
      for (const [streamId, stream] of global.activeStreams.entries()) {
        if (followedUserIds.includes(stream.streamer)) {
          const streamer = authRoutes.users.get(stream.streamer);
          if (streamer) {
            liveStreams.push({
              id: streamId,
              _id: streamId,
              ...stream,
              streamer: {
                _id: streamer.id,
                username: streamer.username,
                displayName: streamer.displayName,
                avatar: streamer.avatar,
                role: streamer.role,
                isPartner: streamer.isPartner || false,
                isAffiliate: streamer.isAffiliate || false
              }
            });
          }
        }
      }

      return res.json(liveStreams);
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const followedUserIds = user.following || [];
      if (followedUserIds.length === 0) {
        return res.json([]);
      }

      const liveStreams = await Stream.find({
        streamer: { $in: followedUserIds },
        isLive: true
      }).sort({ viewerCount: -1 });

      // Manually fetch streamer data for each stream
      const streamsWithStreamers = await Promise.all(
        liveStreams.map(async (stream) => {
          const streamer = await User.findById(stream.streamer);
          if (!streamer) return null;

          return {
            id: stream._id,
            _id: stream._id,
            title: stream.title,
            description: stream.description,
            category: stream.category,
            streamer: {
              _id: streamer._id,
              username: streamer.username,
              displayName: streamer.displayName,
              avatar: streamer.avatar,
              role: streamer.role,
              isPartner: streamer.isPartner || false,
              isAffiliate: streamer.isAffiliate || false
            },
            streamKey: stream.streamKey,
            streamUrl: stream.streamUrl,
            isLive: stream.isLive,
            viewerCount: stream.viewerCount,
            startedAt: stream.startedAt
          };
        })
      );

      // Filter out any null values
      const streams = streamsWithStreamers.filter(s => s !== null);
      res.json(streams);
    }
  } catch (error) {
    console.error('Get following live streams error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========================================
// CUSTOM BADGE SYSTEM - USER ENDPOINTS
// ========================================

// Get all available badges (public)
router.get('/api/badges/all', async (req, res) => {
  try {
    const badges = getAllBadges();
    res.json({ badges });
  } catch (error) {
    console.error('Get all badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's assigned badges
router.get('/api/badges/my-badges', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get full badge objects
      const userBadges = (user.customBadges || []).map(badgeId => getBadgeById(badgeId)).filter(Boolean);

      res.json({ 
        customBadges: user.customBadges || [],
        badges: userBadges,
        selectedBadge: user.selectedBadge
      });
    } else {
      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get full badge objects
      const userBadges = (user.customBadges || []).map(badgeId => getBadgeById(badgeId)).filter(Boolean);

      res.json({
        customBadges: user.customBadges || [],
        badges: userBadges,
        selectedBadge: user.selectedBadge
      });
    }
  } catch (error) {
    console.error('Get my badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Select a badge to display
router.post('/api/badges/select', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { badgeId } = req.body;

    // Allow null to deselect badge
    if (badgeId !== null && !isValidBadgeId(badgeId)) {
      return res.status(400).json({ message: 'Invalid badge ID' });
    }

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has this badge assigned
      if (badgeId !== null && !(user.customBadges || []).includes(badgeId)) {
        return res.status(403).json({ message: 'You do not have access to this badge' });
      }

      user.selectedBadge = badgeId;

      console.log(`✨ BADGE SELECTED: ${user.username} selected ${badgeId || 'none'}`);

      res.json({ 
        message: 'Badge selected successfully',
        selectedBadge: user.selectedBadge
      });
    } else {
      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has this badge assigned
      if (badgeId !== null && !(user.customBadges || []).includes(badgeId)) {
        return res.status(403).json({ message: 'You do not have access to this badge' });
      }

      user.selectedBadge = badgeId;
      await user.save();

      console.log(`✨ BADGE SELECTED: ${user.username} selected ${badgeId || 'none'}`);

      res.json({
        message: 'Badge selected successfully',
        selectedBadge: user.selectedBadge
      });
    }
  } catch (error) {
    console.error('Select badge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Change username
router.put('/admin/change-username/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newUsername } = req.body;

    // Check if requester is admin
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change usernames' });
    }

    // Validate new username
    if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
      return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
    }

    // Check if username is alphanumeric
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Update username
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldUsername = user.username;
    user.username = newUsername;
    await user.save();

    console.log(`Admin ${requestingUser.username} changed username from ${oldUsername} to ${newUsername}`);

    res.json({
      success: true,
      message: `Username changed from ${oldUsername} to ${newUsername}`,
      oldUsername,
      newUsername
    });
  } catch (error) {
    console.error('Change username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
