const express = require('express');
const router = express.Router();
const ChatTimeout = require('../models/ChatTimeout');
const ChatBan = require('../models/ChatBan');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Check if user is moderator or owner of channel
const canModerate = async (userId, channelUsername) => {
  try {
    const channel = await User.findOne({ username: channelUsername });
    if (!channel) return false;
    
    // Channel owner can always moderate
    if (channel._id.toString() === userId.toString()) return true;
    
    // Check if user is in channel's moderators list
    if (channel.moderators && channel.moderators.some(modId => modId.toString() === userId.toString())) {
      return true;
    }
    
    // Check if user is a site-wide moderator or admin
    const user = await User.findById(userId);
    if (!user) return false;
    
    return user.role === 'moderator' || user.role === 'admin';
  } catch (error) {
    console.error('canModerate error:', error);
    return false;
  }
};

// Timeout a user
router.post('/timeout', auth, async (req, res) => {
  try {
    const { userId, username, channelName, duration, reason } = req.body;
    
    // Check if requester can moderate
    const canMod = await canModerate(req.userId, channelName);
    if (!canMod) {
      return res.status(403).json({ error: 'You do not have permission to moderate this channel' });
    }
    
    // Get channel info
    const channel = await User.findOne({ username: channelName });
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Get moderator info
    const moderator = await User.findById(req.userId);
    
    // Calculate expiration
    const expiresAt = new Date(Date.now() + (duration * 1000));
    
    // Remove existing timeout if any
    await ChatTimeout.deleteMany({ userId, channelId: channel._id });
    
    // Create new timeout
    const timeout = new ChatTimeout({
      userId,
      username,
      channelId: channel._id,
      channelName,
      reason: reason || 'No reason provided',
      duration,
      expiresAt,
      moderatorId: req.userId,
      moderatorName: moderator.username
    });
    
    await timeout.save();
    
    res.json({ 
      success: true, 
      timeout,
      message: `${username} timed out for ${duration} seconds`
    });
  } catch (error) {
    console.error('Timeout error:', error);
    res.status(500).json({ error: 'Failed to timeout user' });
  }
});

// Ban a user from chat
router.post('/ban', auth, async (req, res) => {
  try {
    const { userId, username, channelName, reason } = req.body;
    
    // Check if requester can moderate
    const canMod = await canModerate(req.userId, channelName);
    if (!canMod) {
      return res.status(403).json({ error: 'You do not have permission to moderate this channel' });
    }
    
    // Get channel info
    const channel = await User.findOne({ username: channelName });
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Get moderator info
    const moderator = await User.findById(req.userId);
    
    // Check if ban already exists
    const existingBan = await ChatBan.findOne({ userId, channelId: channel._id });
    if (existingBan) {
      return res.status(400).json({ error: 'User is already banned from this channel' });
    }
    
    // Create ban
    const ban = new ChatBan({
      userId,
      username,
      channelId: channel._id,
      channelName,
      reason: reason || 'No reason provided',
      moderatorId: req.userId,
      moderatorName: moderator.username,
      permanent: true
    });
    
    await ban.save();
    
    res.json({ 
      success: true, 
      ban,
      message: `${username} banned from chat`
    });
  } catch (error) {
    console.error('Ban error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban a user
router.post('/unban', auth, async (req, res) => {
  try {
    const { userId, channelName } = req.body;
    
    // Check if requester can moderate
    const canMod = await canModerate(req.userId, channelName);
    if (!canMod) {
      return res.status(403).json({ error: 'You do not have permission to moderate this channel' });
    }
    
    // Get channel info
    const channel = await User.findOne({ username: channelName });
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Remove ban
    const result = await ChatBan.deleteOne({ userId, channelId: channel._id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No ban found for this user' });
    }
    
    res.json({ 
      success: true,
      message: 'User unbanned from chat'
    });
  } catch (error) {
    console.error('Unban error:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// Check if user can chat
router.get('/check/:channelName/:userId', async (req, res) => {
  try {
    const { channelName, userId } = req.params;
    
    // Get channel info
    const channel = await User.findOne({ username: channelName });
    if (!channel) {
      return res.json({ canChat: true }); // If channel doesn't exist, allow chat
    }
    
    // Check for active ban
    const ban = await ChatBan.findOne({ userId, channelId: channel._id });
    if (ban) {
      return res.json({ 
        canChat: false, 
        reason: 'banned',
        message: `You are banned from this chat. Reason: ${ban.reason}`
      });
    }
    
    // Check for active timeout
    const timeout = await ChatTimeout.findOne({ 
      userId, 
      channelId: channel._id,
      expiresAt: { $gt: new Date() }
    });
    
    if (timeout) {
      const remainingSeconds = Math.ceil((timeout.expiresAt - new Date()) / 1000);
      return res.json({ 
        canChat: false, 
        reason: 'timeout',
        remainingSeconds,
        message: `You are timed out for ${remainingSeconds} seconds. Reason: ${timeout.reason}`
      });
    }
    
    res.json({ canChat: true });
  } catch (error) {
    console.error('Check chat permission error:', error);
    res.json({ canChat: true }); // Default to allowing chat on error
  }
});

// Get banned users for a channel
router.get('/bans/:channelName', auth, async (req, res) => {
  try {
    const { channelName } = req.params;
    
    // Check if requester can moderate
    const canMod = await canModerate(req.userId, channelName);
    if (!canMod) {
      return res.status(403).json({ error: 'You do not have permission to view this' });
    }
    
    // Get channel info
    const channel = await User.findOne({ username: channelName });
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Get all bans for this channel
    const bans = await ChatBan.find({ channelId: channel._id }).sort({ createdAt: -1 });
    
    res.json({ bans });
  } catch (error) {
    console.error('Get bans error:', error);
    res.status(500).json({ error: 'Failed to fetch bans' });
  }
});

// Get active timeouts for a channel
router.get('/timeouts/:channelName', auth, async (req, res) => {
  try {
    const { channelName } = req.params;
    
    // Check if requester can moderate
    const canMod = await canModerate(req.userId, channelName);
    if (!canMod) {
      return res.status(403).json({ error: 'You do not have permission to view this' });
    }
    
    // Get channel info
    const channel = await User.findOne({ username: channelName });
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Get active timeouts for this channel
    const timeouts = await ChatTimeout.find({ 
      channelId: channel._id,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json({ timeouts });
  } catch (error) {
    console.error('Get timeouts error:', error);
    res.status(500).json({ error: 'Failed to fetch timeouts' });
  }
});

// Clean up expired timeouts (optional cleanup endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    const result = await ChatTimeout.deleteMany({ expiresAt: { $lt: new Date() } });
    res.json({ 
      success: true, 
      deleted: result.deletedCount,
      message: `Cleaned up ${result.deletedCount} expired timeouts`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup' });
  }
});

module.exports = router;

