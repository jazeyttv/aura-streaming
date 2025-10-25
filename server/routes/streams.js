const express = require('express');
const router = express.Router();
const Stream = require('../models/Stream');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const authRoutes = require('./auth');

// Get environment variables
const PUBLIC_IP = process.env.PUBLIC_IP || 'localhost';
const HTTP_MEDIA_PORT = process.env.HTTP_MEDIA_PORT || '8888';
// Use MEDIA_URL from environment if set (for production/Render), otherwise construct it
const MEDIA_URL = process.env.MEDIA_URL || `http://${PUBLIC_IP}:${HTTP_MEDIA_PORT}`;

console.log('[STREAMS] Media URL configured as:', MEDIA_URL);
console.log('[STREAMS] Using environment MEDIA_URL:', !!process.env.MEDIA_URL);
console.log('[STREAMS] PUBLIC_IP:', PUBLIC_IP);
console.log('[STREAMS] HTTP_MEDIA_PORT:', HTTP_MEDIA_PORT);

// In-memory stream storage
const streams = new Map();

// Verify stream key (called by media server)
router.post('/verify-key', async (req, res) => {
  try {
    const { streamKey } = req.body;
    console.log('[VERIFY-KEY] 🔍 Checking stream key:', streamKey ? streamKey.substring(0, 15) + '...' : 'MISSING');
    
    if (!streamKey) {
      console.log('[VERIFY-KEY] ❌ No stream key provided');
      return res.json({ valid: false });
    }

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      console.log('[VERIFY-KEY] 💾 Using in-memory storage');
      const user = Array.from(authRoutes.users.values()).find(u => u.streamKey === streamKey);
      
      if (user) {
        console.log(`[VERIFY-KEY] 👤 User found: ${user.username}, isStreamer: ${user.isStreamer}, isBanned: ${user.isBanned}`);
        if (user.isStreamer && !user.isBanned) {
          console.log('[VERIFY-KEY] ✅ Valid!');
          return res.json({ 
            valid: true, 
            username: user.username,
            userId: user.id 
          });
        }
      } else {
        console.log('[VERIFY-KEY] ❌ User not found in memory');
      }
    } else {
      console.log('[VERIFY-KEY] 🗄️ Using MongoDB');
      const user = await User.findOne({ streamKey });
      
      if (user) {
        console.log(`[VERIFY-KEY] 👤 User found: ${user.username}, isStreamer: ${user.isStreamer}, isBanned: ${user.isBanned}`);
        if (user.isStreamer && !user.isBanned) {
          console.log('[VERIFY-KEY] ✅ Valid!');
          return res.json({ 
            valid: true, 
            username: user.username,
            userId: user._id.toString() 
          });
        } else {
          console.log(`[VERIFY-KEY] ❌ Invalid - isStreamer: ${user.isStreamer}, isBanned: ${user.isBanned}`);
        }
      } else {
        console.log('[VERIFY-KEY] ❌ User not found in database');
        // Log all stream keys in database for debugging
        const allUsers = await User.find({}).select('username streamKey');
        console.log(`[VERIFY-KEY] 📊 Total users in DB: ${allUsers.length}`);
        if (allUsers.length > 0 && allUsers.length < 20) {
          console.log('[VERIFY-KEY] 📋 All keys in DB:', allUsers.map(u => `${u.username}: ${u.streamKey?.substring(0, 15)}...`));
        }
      }
    }

    console.log('[VERIFY-KEY] ❌ Returning invalid');
    res.json({ valid: false });
  } catch (error) {
    console.error('[VERIFY-KEY] ❌ Error:', error);
    res.json({ valid: false });
  }
});

// Notify that stream is live (called by media server)
router.post('/notify-live', async (req, res) => {
  try {
    console.log('[BACKEND] 🔴 Received notify-live request:', req.body);
    const { streamKey, userId } = req.body;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    let user;
    if (useMemory) {
      user = authRoutes.users.get(userId);
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if there's already an active stream
    const existingStreamId = global.activeStreams.get(userId);
    let stream;

    if (existingStreamId) {
      if (useMemory) {
        stream = streams.get(existingStreamId);
      } else {
        stream = await Stream.findById(existingStreamId);
      }
    }

    if (!stream) {
      // Create new stream with default settings
      if (useMemory) {
        const streamId = uuidv4();
        stream = {
          id: streamId,
          title: `${user.username}'s Live Stream`,
          description: '',
          category: 'Just Chatting',
          streamer: userId,
          streamerUsername: user.username,
          thumbnail: '',
          isLive: true,
          viewerCount: 0,
          streamUrl: `${MEDIA_URL}/live/${streamKey}/index.m3u8`,
          startedAt: new Date()
        };
        streams.set(streamId, stream);
        global.activeStreams.set(userId, streamId);
        global.chatMessages.set(streamId, []);
        global.streamViewers.set(streamId, new Set());
      } else {
        stream = new Stream({
          title: `${user.username}'s Live Stream`,
          description: '',
          category: 'Just Chatting',
          streamer: userId,
          streamerUsername: user.username,
          isLive: true,
          streamUrl: `${MEDIA_URL}/live/${streamKey}/index.m3u8`
        });
        await stream.save();
        
        const streamId = stream._id.toString();
        global.activeStreams.set(userId, streamId);
        global.chatMessages.set(streamId, []);
        global.streamViewers.set(streamId, new Set());
        
        user.streamCount += 1;
        await user.save();
      }
    } else {
      stream.isLive = true;
      stream.streamUrl = `${MEDIA_URL}/live/${streamKey}/index.m3u8`;
      if (!useMemory) {
        await stream.save();
      }
    }

    // Notify all connected clients via Socket.IO
    const io = req.app.get('io');
    if (io) {
      console.log('[BACKEND] 📡 Emitting stream-started event:', { 
        streamId: stream.id || stream._id,
        username: user.username 
      });
      io.emit('stream-started', { 
        streamId: stream.id || stream._id,
        username: user.username 
      });
    } else {
      console.log('[BACKEND] ⚠️ Socket.IO not available!');
    }

    console.log('[BACKEND] ✅ Stream created and live:', stream.id || stream._id);
    res.json({ message: 'Stream is now live' });
  } catch (error) {
    console.error('Notify live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Notify that stream ended (called by media server)
router.post('/notify-ended', async (req, res) => {
  try {
    console.log('[BACKEND] ⚫ Received notify-ended request:', req.body);
    const { streamKey, userId } = req.body;
    const streamId = global.activeStreams.get(userId);

    if (!streamId) {
      return res.json({ message: 'No active stream found' });
    }

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const stream = streams.get(streamId);
      if (stream) {
        stream.isLive = false;
        stream.endedAt = new Date();
      }
    } else {
      const stream = await Stream.findById(streamId);
      if (stream) {
        stream.isLive = false;
        stream.endedAt = new Date();
        await stream.save();
      }
    }

    global.activeStreams.delete(userId);

    // Notify all connected clients
    const io = req.app.get('io');
    if (io) {
      console.log('[BACKEND] 📡 Emitting stream-ended event:', { streamId });
      io.emit('stream-ended', { streamId });
    }

    console.log('[BACKEND] ✅ Stream marked as ended:', streamId);
    res.json({ message: 'Stream ended' });
  } catch (error) {
    console.error('Notify ended error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all live streams
router.get('/live', async (req, res) => {
  try {
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const liveStreams = Array.from(streams.values()).filter(s => s.isLive).map(stream => {
        const streamer = authRoutes.users.get(stream.streamer);
        return {
          ...stream,
          streamer: streamer ? {
            _id: streamer.id,
            username: streamer.username,
            displayName: streamer.displayName,
            avatar: streamer.avatar,
            role: streamer.role,
            isPartner: streamer.isPartner
          } : null
        };
      });
      console.log('[BACKEND] 📺 Get live streams request - Found:', liveStreams.length, 'streams');
      res.json(liveStreams);
    } else {
      const liveStreams = await Stream.find({ isLive: true }).populate('streamer', 'username displayName avatar role isPartner isAffiliate');
      console.log('[BACKEND] 📺 Get live streams request (DB) - Found:', liveStreams.length, 'streams');
      res.json(liveStreams);
    }
  } catch (error) {
    console.error('Get streams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stream by ID
router.get('/:streamId', async (req, res) => {
  try {
    const { streamId } = req.params;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const stream = streams.get(streamId);
      if (!stream) {
        return res.status(404).json({ message: 'Stream not found' });
      }
      
      const streamer = authRoutes.users.get(stream.streamer);
      const chatMessages = global.chatMessages.get(streamId) || [];
      const viewerCount = global.streamViewers.get(streamId)?.size || 0;
      
      res.json({ 
        stream: { 
          ...stream, 
          viewerCount,
          streamer: streamer ? {
            _id: streamer.id,
            username: streamer.username,
            displayName: streamer.displayName,
            avatar: streamer.avatar,
            role: streamer.role,
            isPartner: streamer.isPartner
          } : null
        }, 
        chatMessages 
      });
    } else {
      const stream = await Stream.findById(streamId).populate('streamer', 'username displayName avatar role isPartner isAffiliate');
      if (!stream) {
        return res.status(404).json({ message: 'Stream not found' });
      }
      
      const chatMessages = global.chatMessages.get(streamId) || [];
      const viewerCount = global.streamViewers.get(streamId)?.size || 0;
      
      res.json({ stream: { ...stream.toObject(), viewerCount }, chatMessages });
    }
  } catch (error) {
    console.error('Get stream error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stream settings
router.put('/:streamId', authMiddleware, async (req, res) => {
  try {
    const { streamId } = req.params;
    const { title, description, category } = req.body;
    const userId = req.user.userId;
    
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const stream = streams.get(streamId);
      
      if (!stream) {
        return res.status(404).json({ message: 'Stream not found' });
      }

      if (stream.streamer !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (title) stream.title = title;
      if (description) stream.description = description;
      if (category) stream.category = category;

      res.json(stream);
    } else {
      const stream = await Stream.findById(streamId);

      if (!stream) {
        return res.status(404).json({ message: 'Stream not found' });
      }

      if (stream.streamer.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (title) stream.title = title;
      if (description) stream.description = description;
      if (category) stream.category = category;
      
      await stream.save();

      res.json(stream);
    }
  } catch (error) {
    console.error('Update stream error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manually end stream
router.post('/:streamId/end', authMiddleware, async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    let stream;
    if (useMemory) {
      stream = streams.get(streamId);
      if (!stream || stream.streamer !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      stream.isLive = false;
      stream.endedAt = new Date();
    } else {
      stream = await Stream.findById(streamId);
      if (!stream || stream.streamer.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      stream.isLive = false;
      stream.endedAt = new Date();
      await stream.save();
    }

    global.activeStreams.delete(userId);

    // Notify all connected clients
    const io = req.app.get('io');
    if (io) {
      console.log('[BACKEND] 📡 Emitting stream-ended event (manual):', { streamId });
      io.emit('stream-ended', { streamId });
    }

    console.log('[BACKEND] ✅ Stream manually ended by creator:', streamId);
    res.json({ message: 'Stream ended successfully' });
  } catch (error) {
    console.error('End stream error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate stream key
router.post('/regenerate-key', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    const newStreamKey = `sk_${uuidv4().replace(/-/g, '')}`;

    if (useMemory) {
      const user = authRoutes.users.get(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Ensure user is marked as streamer
      user.isStreamer = true;
      user.streamKey = newStreamKey;

      res.json({ streamKey: newStreamKey, rtmpUrl: user.rtmpUrl || 'rtmp://72.23.212.188:1935/live' });
    } else {
      const user = await User.findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Ensure user is marked as streamer
      user.isStreamer = true;
      user.streamKey = newStreamKey;
      await user.save();

      console.log(`🔑 Regenerated stream key for user: ${user.username}`);
      res.json({ streamKey: newStreamKey, rtmpUrl: user.rtmpUrl || 'rtmp://72.23.212.188:1935/live' });
    }
  } catch (error) {
    console.error('Regenerate key error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's active stream
router.get('/user/active', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const streamId = global.activeStreams.get(userId);

    if (!streamId) {
      return res.json({ stream: null });
    }

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      const stream = streams.get(streamId);
      const viewerCount = global.streamViewers.get(streamId)?.size || 0;
      res.json({ stream: stream ? { ...stream, viewerCount } : null });
    } else {
      const stream = await Stream.findById(streamId);
      const viewerCount = global.streamViewers.get(streamId)?.size || 0;
      res.json({ stream: stream ? { ...stream.toObject(), viewerCount } : null });
    }
  } catch (error) {
    console.error('Get active stream error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
