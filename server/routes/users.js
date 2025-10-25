const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stream = require('../models/Stream');
const authMiddleware = require('../middleware/auth');
const authRoutes = require('./auth');
const bcrypt = require('bcryptjs');

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
        isStreamer: user.isStreamer,
        followers: user.followers.length,
        following: user.following.length,
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
        isStreamer: user.isStreamer,
        followers: user.followers.length,
        following: user.following.length,
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
    const { username, displayName, bio, avatar } = req.body;
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

      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatar: user.avatar,
          isStreamer: user.isStreamer,
          role: user.role
        }
      });
    } else {
      const user = await User.findOne({ _id: userId });

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

      await user.save();

      res.json({
        user: {
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          avatar: user.avatar,
          isStreamer: user.isStreamer,
          role: user.role
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

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update chat color
router.put('/chat-color', authMiddleware, async (req, res) => {
  try {
    const { color } = req.body;
    const userId = req.user.userId;

    if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ message: 'Invalid color format. Use hex format like #FF0000' });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.chatColor = color;
    await user.save();

    console.log(`🎨 User ${user.username} changed chat color to ${color}`);
    res.json({ message: 'Chat color updated successfully', chatColor: color });
  } catch (error) {
    console.error('Change chat color error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow user
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    console.log('📌 Follow request:', { 
      userId, 
      followerId, 
      userIdType: typeof userId,
      followerIdType: typeof followerId,
      areEqual: userId === followerId,
      areEqualString: userId.toString() === followerId.toString()
    });

    // Check if trying to follow self
    if (userId === followerId || userId.toString() === followerId.toString()) {
      console.log('⚠️ Cannot follow yourself');
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findOne({ _id: userId });
    const follower = await User.findOne({ _id: followerId });

    if (!userToFollow || !follower) {
      console.log('❌ User not found:', { userToFollow: !!userToFollow, follower: !!follower });
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 Users found:', {
      userToFollow: userToFollow.username,
      follower: follower.username,
      currentFollowing: follower.following.map(id => id.toString())
    });

    // Check if already following (convert ObjectIds to strings for comparison)
    const isAlreadyFollowing = follower.following.some(id => id.toString() === userId.toString());
    if (isAlreadyFollowing) {
      console.log('⚠️ Already following - returning 200 with isFollowing:true');
      // Return success instead of error - frontend already thinks they're following
      return res.json({ message: 'Already following this user', isFollowing: true });
    }

    // Add to following/followers
    follower.following.push(userId);
    userToFollow.followers.push(followerId);

    await follower.save();
    await userToFollow.save();

    console.log('✅ Follow successful - new following list:', follower.following.map(id => id.toString()));
    res.json({ message: 'User followed successfully', isFollowing: true });
  } catch (error) {
    console.error('❌ Follow user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow user
router.delete('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    console.log('🔄 Unfollow request:', { userId, followerId });

    const userToUnfollow = await User.findOne({ _id: userId });
    const follower = await User.findOne({ _id: followerId });

    if (!userToUnfollow || !follower) {
      console.log('❌ User not found for unfollow');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 Before unfollow:', {
      follower: follower.username,
      currentFollowing: follower.following.map(id => id.toString())
    });

    // Remove from following/followers (convert to string for comparison)
    follower.following = follower.following.filter(id => id.toString() !== userId.toString());
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== followerId.toString());

    await follower.save();
    await userToUnfollow.save();

    console.log('✅ Unfollow successful - new following list:', follower.following.map(id => id.toString()));
    res.json({ message: 'User unfollowed successfully', isFollowing: false });
  } catch (error) {
    console.error('❌ Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if following
router.get('/:userId/following', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    console.log('🔍 Check following:', { userId, followerId });

    const follower = await User.findOne({ _id: followerId });
    if (!follower) {
      console.log('❌ Follower not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 Follower following list:', follower.following.map(id => id.toString()));

    // Convert ObjectIds to strings for comparison
    const isFollowing = follower.following.some(id => id.toString() === userId.toString());
    
    console.log(`✅ Is following: ${isFollowing}`);
    res.json({ isFollowing });
  } catch (error) {
    console.error('❌ Check following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get live streams from followed users
router.get('/following/live', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({ _id: userId }).populate('following', '_id username displayName avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followedUserIds = user.following.map(u => u._id);

    const liveStreams = await Stream.find({
      streamer: { $in: followedUserIds },
      isLive: true
    })
      .populate('streamer', 'username displayName avatar role isPartner isAffiliate')
      .sort({ viewerCount: -1 });

    const streams = liveStreams.map(stream => ({
      id: stream._id,
      _id: stream._id,
      title: stream.title,
      description: stream.description,
      category: stream.category,
      streamer: {
        _id: stream.streamer._id,
        username: stream.streamer.username,
        displayName: stream.streamer.displayName,
        avatar: stream.streamer.avatar,
        role: stream.streamer.role,
        isPartner: stream.streamer.isPartner,
        isAffiliate: stream.streamer.isAffiliate
      },
      streamKey: stream.streamKey,
      streamUrl: stream.streamUrl,
      isLive: stream.isLive,
      viewerCount: stream.viewerCount,
      startedAt: stream.startedAt
    }));

    res.json(streams);
  } catch (error) {
    console.error('Get following live streams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

