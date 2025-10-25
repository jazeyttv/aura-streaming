const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stream = require('../models/Stream');
const BanRecord = require('../models/BanRecord');
const authMiddleware = require('../middleware/auth');
const authRoutes = require('./auth');

// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const allUsers = Array.from(authRoutes.users.values()).map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        isStreamer: u.isStreamer,
        streamKey: u.streamKey || null,
        isPartner: u.isPartner || false,
        isAffiliate: u.isAffiliate || false,
        isBanned: u.isBanned,
        createdAt: u.createdAt
      }));
      console.log('📋 Admin: Returning users (memory):', allUsers.length);
      res.json(allUsers);
    } else {
      const users = await User.find().select('-password');
      
      // Map users to include stream keys explicitly
      const usersWithKeys = users.map(u => ({
        _id: u._id,
        id: u._id,
        username: u.username,
        email: u.email,
        role: u.role,
        isStreamer: u.isStreamer,
        streamKey: u.streamKey || null,
        isPartner: u.isPartner || false,
        isAffiliate: u.isAffiliate || false,
        isBanned: u.isBanned,
        createdAt: u.createdAt
      }));

      console.log('📋 Admin: Returning users from DB:', usersWithKeys.length);
      console.log('🔑 Sample user with key:', {
        username: usersWithKeys[0]?.username,
        isStreamer: usersWithKeys[0]?.isStreamer,
        hasKey: !!usersWithKeys[0]?.streamKey,
        keyPreview: usersWithKeys[0]?.streamKey ? usersWithKeys[0].streamKey.substring(0, 10) + '...' : 'null'
      });
      
      res.json(usersWithKeys);
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = role;

      res.json({ 
        id: user.id, 
        username: user.username, 
        role: user.role 
      });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.role = role;
      await user.save();

      res.json({
        id: user._id,
        username: user.username,
        role: user.role
      });
    }
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ban user (admin/moderator)
router.post('/users/:userId/ban', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Moderator or admin access required' });
    }

    const { userId } = req.params;
    const { reason, duration } = req.body; // duration in minutes, 0 = permanent

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'admin') {
        return res.status(403).json({ message: 'Cannot ban an admin' });
      }

      user.isBanned = true;
      user.bannedUntil = duration > 0 ? new Date(Date.now() + duration * 60000) : null;

      res.json({ message: 'User banned successfully' });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'admin') {
        return res.status(403).json({ message: 'Cannot ban an admin' });
      }

      user.isBanned = true;
      user.bannedUntil = duration > 0 ? new Date(Date.now() + duration * 60000) : null;
      await user.save();

      // Create ban record
      const banRecord = new BanRecord({
        userId: user._id,
        username: user.username,
        streamId: 'platform',
        bannedBy: req.user.username,
        reason: reason || '',
        duration: duration || 0,
        expiresAt: user.bannedUntil
      });
      await banRecord.save();

      res.json({ message: 'User banned successfully' });
    }
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unban user (admin/moderator)
router.post('/users/:userId/unban', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Moderator or admin access required' });
    }

    const { userId } = req.params;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isBanned = false;
      user.bannedUntil = null;

      res.json({ message: 'User unbanned successfully' });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isBanned = false;
      user.bannedUntil = null;
      await user.save();

      res.json({ message: 'User unbanned successfully' });
    }
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform stats (admin only)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const totalUsers = authRoutes.users.size;
      const totalStreamers = Array.from(authRoutes.users.values()).filter(u => u.isStreamer).length;
      const liveStreams = global.activeStreams.size;
      const totalViewers = Array.from(global.streamViewers.values())
        .reduce((sum, viewers) => sum + viewers.size, 0);

      res.json({
        totalUsers,
        totalStreamers,
        liveStreams,
        totalViewers
      });
    } else {
      const totalUsers = await User.countDocuments();
      const totalStreamers = await User.countDocuments({ isStreamer: true });
      const liveStreams = await Stream.countDocuments({ isLive: true });
      const totalViewers = Array.from(global.streamViewers.values())
        .reduce((sum, viewers) => sum + viewers.size, 0);

      res.json({
        totalUsers,
        totalStreamers,
        liveStreams,
        totalViewers
      });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle partner status (admin only)
router.put('/users/:userId/partner', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isPartner } = req.body;

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isPartner = isPartner;

      res.json({ 
        id: user.id, 
        username: user.username, 
        isPartner: user.isPartner 
      });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isPartner = isPartner;
      await user.save();

      res.json({
        id: user._id,
        username: user.username,
        isPartner: user.isPartner
      });
    }
  } catch (error) {
    console.error('Toggle partner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle affiliate status (admin only)
router.put('/users/:userId/affiliate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAffiliate } = req.body;

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isAffiliate = isAffiliate;

      res.json({ 
        id: user.id, 
        username: user.username, 
        isAffiliate: user.isAffiliate 
      });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isAffiliate = isAffiliate;
      await user.save();

      res.json({
        id: user._id,
        username: user.username,
        isAffiliate: user.isAffiliate
      });
    }
  } catch (error) {
    console.error('Toggle affiliate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete stream (admin only)
router.delete('/streams/:streamId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { streamId } = req.params;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const stream = global.streams?.get(streamId);
      if (stream) {
        global.streams.delete(streamId);
        global.activeStreams.delete(stream.streamer);
      }
      res.json({ message: 'Stream deleted' });
    } else {
      await Stream.findByIdAndDelete(streamId);
      res.json({ message: 'Stream deleted' });
    }
  } catch (error) {
    console.error('Delete stream error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user's stream key (admin only)
router.post('/users/:userId/reset-key', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const crypto = require('crypto');
    
    const newStreamKey = 'sk_' + crypto.randomBytes(24).toString('hex');
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.isStreamer) {
        return res.status(400).json({ message: 'User is not a streamer' });
      }

      user.streamKey = newStreamKey;

      console.log(`🔑 Admin reset stream key for user: ${user.username}`);

      res.json({ 
        message: 'Stream key reset successfully',
        streamKey: newStreamKey,
        username: user.username
      });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.isStreamer) {
        return res.status(400).json({ message: 'User is not a streamer' });
      }

      // End any active streams for this user
      const activeStream = await Stream.findOne({ streamer: userId, isLive: true });
      if (activeStream) {
        activeStream.isLive = false;
        await activeStream.save();
        console.log(`🔴 Ended active stream for user: ${user.username}`);
      }

      // Update the stream key
      user.streamKey = newStreamKey;
      await user.save();

      console.log(`🔑 Admin reset stream key for user: ${user.username}`);

      res.json({
        message: 'Stream key reset successfully',
        streamKey: newStreamKey,
        username: user.username
      });
    }
  } catch (error) {
    console.error('Reset stream key error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Make user a streamer (admin only)
router.post('/users/:userId/make-streamer', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const crypto = require('crypto');
    
    const streamKey = 'sk_' + crypto.randomBytes(24).toString('hex');
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isStreamer) {
        return res.status(400).json({ message: 'User is already a streamer' });
      }

      user.isStreamer = true;
      user.streamKey = streamKey;

      console.log(`🎥 Admin made user a streamer: ${user.username}`);

      res.json({ 
        message: 'User is now a streamer',
        streamKey: streamKey,
        username: user.username
      });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isStreamer) {
        return res.status(400).json({ message: 'User is already a streamer' });
      }

      user.isStreamer = true;
      user.streamKey = streamKey;
      await user.save();

      console.log(`🎥 Admin made user a streamer: ${user.username}`);

      res.json({
        message: 'User is now a streamer',
        streamKey: streamKey,
        username: user.username
      });
    }
  } catch (error) {
    console.error('Make streamer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

