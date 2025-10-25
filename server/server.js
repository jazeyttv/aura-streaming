const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const os = require('os');

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/auth');
const streamRoutes = require('./routes/streams');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const hlsProxyRoutes = require('./routes/hls-proxy');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');

// Import IP ban middleware
const { checkIPBan, getClientIP, initBannedIPs } = require('./middleware/ipBanCheck');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Get network interfaces to display IP addresses
function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
}

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

// Socket.IO with dynamic CORS
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow all origins in development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // Check against allowed origins
      if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// EMERGENCY UNBAN ENDPOINT - BEFORE IP CHECK!
app.post('/api/emergency-unban-jazey', express.json(), async (req, res) => {
  try {
    const { password } = req.body;
    
    // Secret emergency password to prevent abuse
    if (password !== '1919') {
      return res.status(403).json({ message: 'Invalid emergency password' });
    }

    const User = require('./models/User');
    const { unbanIP } = require('./middleware/ipBanCheck');
    
    // Find Jazey
    const jazey = await User.findOne({ username: 'Jazey' });
    
    if (!jazey) {
      return res.status(404).json({ message: 'Jazey not found' });
    }

    // Get IPs before unbanning
    const bannedIPs = [jazey.ipAddress, jazey.lastIpAddress].filter(Boolean);
    
    // Remove IP ban from database
    jazey.isIpBanned = false;
    await jazey.save();
    
    // Remove IPs from in-memory ban list
    bannedIPs.forEach(ip => {
      if (ip) unbanIP(ip);
    });

    console.log('🚨 EMERGENCY UNBAN: Jazey unbanned successfully!');
    console.log(`   Unbanned IPs: ${bannedIPs.join(', ')}`);

    res.json({ 
      success: true,
      message: '✅ Jazey has been unbanned!',
      unbannedIPs: bannedIPs
    });
  } catch (error) {
    console.error('Emergency unban error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// IP Ban Check Middleware - AFTER emergency endpoint
app.use(checkIPBan);

// Maintenance Mode Middleware
const maintenanceMode = require('./middleware/maintenanceMode');
app.use(maintenanceMode);

// Middleware - Dynamic CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (with fallback to in-memory storage)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aura', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    global.mongoose = mongoose;
    console.log('✅ MongoDB connected successfully');
    
    // Cleanup old streams on server restart
    await cleanupOldStreams();
  } catch (err) {
    console.log('⚠️  MongoDB connection failed, using in-memory storage');
    console.log('   To use MongoDB, make sure MongoDB is installed and running');
    global.mongoose = null;
  }
};

// Cleanup old streams that are marked as live but shouldn't be
const cleanupOldStreams = async () => {
  try {
    const Stream = require('./models/Stream');
    const result = await Stream.updateMany(
      { isLive: true },
      { 
        $set: { 
          isLive: false,
          viewerCount: 0
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`🧹 Cleaned up ${result.modifiedCount} old stream(s) on server restart`);
    }
  } catch (error) {
    console.error('Error cleaning up old streams:', error);
  }
};

connectDB();

// Store active streams and chat messages in memory
global.activeStreams = new Map();
global.chatMessages = new Map();
global.streamViewers = new Map();
global.bannedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join stream room
  socket.on('join-stream', ({ streamId, username, userId, userRole }) => {
    const bannedInStream = global.bannedUsers.get(streamId);
    if (bannedInStream && bannedInStream.has(userId)) {
      socket.emit('banned-from-stream', { message: 'You are banned from this stream' });
      return;
    }

    socket.join(streamId);
    socket.streamId = streamId;
    socket.userId = userId;
    socket.username = username;
    socket.userRole = userRole || 'user';
    
    if (!global.streamViewers.has(streamId)) {
      global.streamViewers.set(streamId, new Set());
    }
    global.streamViewers.get(streamId).add(socket.id);
    
    const viewerCount = global.streamViewers.get(streamId).size;
    io.to(streamId).emit('viewer-count', viewerCount);
    
    io.to(streamId).emit('user-joined', { 
      username, 
      role: socket.userRole,
      timestamp: new Date() 
    });
    
    console.log(`${username} (${socket.userRole}) joined stream ${streamId}`);
  });

  // Handle chat messages with role
  socket.on('chat-message', async ({ streamId, username, message, userId, userRole, isPartner, chatColor, channelName }) => {
    try {
      // Check for chat commands
      if (message.startsWith('/')) {
        const User = require('./models/User');
        const parts = message.split(' ');
        const command = parts[0].toLowerCase();
        const targetUsername = parts[1];

        // Get channel owner
        const channel = await User.findOne({ username: channelName });
        if (!channel) {
          socket.emit('error-message', { message: 'Channel not found' });
          return;
        }

        // Check if user is channel owner or admin
        const isOwner = channel._id.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
          socket.emit('error-message', { message: 'Only the channel owner can use this command' });
          return;
        }

        // Handle /mod command
        if (command === '/mod') {
          if (!targetUsername) {
            socket.emit('system-message', { message: 'Usage: /mod username' });
            return;
          }

          const targetUser = await User.findOne({ username: targetUsername });
          if (!targetUser) {
            socket.emit('error-message', { message: `User ${targetUsername} not found` });
            return;
          }

          // Add to moderators list
          if (!channel.moderators.includes(targetUser._id)) {
            channel.moderators.push(targetUser._id);
            await channel.save();
            
            io.to(streamId).emit('system-message', { 
              message: `${targetUsername} is now a moderator`,
              username: 'System'
            });
          } else {
            socket.emit('error-message', { message: `${targetUsername} is already a moderator` });
          }
          return;
        }

        // Handle /unmod command
        if (command === '/unmod') {
          if (!targetUsername) {
            socket.emit('system-message', { message: 'Usage: /unmod username' });
            return;
          }

          const targetUser = await User.findOne({ username: targetUsername });
          if (!targetUser) {
            socket.emit('error-message', { message: `User ${targetUsername} not found` });
            return;
          }

          // Remove from moderators list
          const index = channel.moderators.indexOf(targetUser._id);
          if (index > -1) {
            channel.moderators.splice(index, 1);
            await channel.save();
            
            io.to(streamId).emit('system-message', { 
              message: `${targetUsername} is no longer a moderator`,
              username: 'System'
            });
          } else {
            socket.emit('error-message', { message: `${targetUsername} is not a moderator` });
          }
          return;
        }

        // If command not recognized, continue as normal message
      }

      // Check in-memory bans first (backwards compatibility)
      const bannedInStream = global.bannedUsers.get(streamId);
      if (bannedInStream && bannedInStream.has(userId)) {
        socket.emit('error-message', { message: 'You are banned from chatting' });
        return;
      }

      // Check database bans and timeouts if MongoDB is available
      if (global.mongoose && global.mongoose.connection && global.mongoose.connection.readyState === 1) {
        const ChatBan = require('./models/ChatBan');
        const ChatTimeout = require('./models/ChatTimeout');
        const User = require('./models/User');
        
        // Get channel ID from channelName
        if (channelName) {
          const channel = await User.findOne({ username: channelName });
          if (channel) {
            // Check for permanent ban
            const ban = await ChatBan.findOne({ userId, channelId: channel._id });
            if (ban) {
              socket.emit('error-message', { message: `You are banned from this chat. Reason: ${ban.reason}` });
              return;
            }
            
            // Check for active timeout
            const timeout = await ChatTimeout.findOne({ 
              userId, 
              channelId: channel._id,
              expiresAt: { $gt: new Date() }
            });
            if (timeout) {
              const remainingSeconds = Math.ceil((timeout.expiresAt - new Date()) / 1000);
              socket.emit('error-message', { 
                message: `You are timed out for ${remainingSeconds} seconds. Reason: ${timeout.reason}` 
              });
              return;
            }
          }
        }
      }

      const chatMessage = {
        id: Date.now() + Math.random(),
        username,
        message,
        userId,
        userRole: userRole || 'user',
        isPartner: isPartner || false,
        chatColor: chatColor || '#FFFFFF',
        timestamp: new Date()
      };
      
      if (!global.chatMessages.has(streamId)) {
        global.chatMessages.set(streamId, []);
      }
      global.chatMessages.get(streamId).push(chatMessage);
      
      if (global.chatMessages.get(streamId).length > 200) {
        global.chatMessages.get(streamId).shift();
      }
      
      io.to(streamId).emit('chat-message', chatMessage);
    } catch (error) {
      console.error('Chat message error:', error);
      socket.emit('error-message', { message: 'Failed to send message' });
    }
  });

  socket.on('delete-message', ({ streamId, messageId, userId }) => {
    if (socket.userRole === 'moderator' || socket.userRole === 'admin') {
      io.to(streamId).emit('message-deleted', { messageId });
      console.log(`Message ${messageId} deleted by ${socket.username} (${socket.userRole})`);
    }
  });

  socket.on('ban-user', ({ streamId, targetUserId, targetUsername, duration }) => {
    if (socket.userRole === 'moderator' || socket.userRole === 'admin') {
      if (!global.bannedUsers.has(streamId)) {
        global.bannedUsers.set(streamId, new Set());
      }
      global.bannedUsers.get(streamId).add(targetUserId);
      
      if (duration > 0) {
        setTimeout(() => {
          const banned = global.bannedUsers.get(streamId);
          if (banned) {
            banned.delete(targetUserId);
          }
        }, duration * 1000);
      }
      
      io.to(streamId).emit('user-banned', { 
        username: targetUsername,
        duration: duration > 0 ? duration : 'permanent',
        bannedBy: socket.username
      });
      
      console.log(`${targetUsername} banned from stream ${streamId} by ${socket.username}`);
    }
  });

  socket.on('unban-user', async ({ streamId, targetUsername }) => {
    if (socket.userRole === 'admin' || socket.userRole === 'moderator') {
      // Find user by username to get their ID
      const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;
      let targetUserId = null;

      if (useMemory) {
        const authRoutes = require('./routes/auth');
        for (const [userId, userData] of authRoutes.users.entries()) {
          if (userData.username === targetUsername) {
            targetUserId = userId;
            break;
          }
        }
      } else {
        try {
          const User = require('./models/User');
          const user = await User.findOne({ username: targetUsername });
          if (user) {
            targetUserId = user._id.toString();
          }
        } catch (error) {
          console.error('Error finding user for unban:', error);
        }
      }

      if (targetUserId) {
        const banned = global.bannedUsers.get(streamId);
        if (banned && banned.has(targetUserId)) {
          banned.delete(targetUserId);
          
          io.to(streamId).emit('chat-message', {
            id: Date.now(),
            username: 'System',
            message: `${targetUsername} was unbanned by ${socket.username}`,
            userRole: 'system',
            timestamp: new Date()
          });
          
          console.log(`${targetUsername} unbanned from stream ${streamId} by ${socket.username}`);
        } else {
          socket.emit('error-message', { message: `${targetUsername} is not banned` });
        }
      } else {
        socket.emit('error-message', { message: `User ${targetUsername} not found` });
      }
    }
  });

  socket.on('toggle-slow-mode', ({ streamId, enabled, seconds }) => {
    if (socket.userRole === 'moderator' || socket.userRole === 'admin') {
      io.to(streamId).emit('slow-mode-update', { enabled, seconds });
      console.log(`Slow mode ${enabled ? 'enabled' : 'disabled'} in stream ${streamId}`);
    }
  });

  socket.on('leave-stream', (streamId) => {
    socket.leave(streamId);
    if (global.streamViewers.has(streamId)) {
      global.streamViewers.get(streamId).delete(socket.id);
      const viewerCount = global.streamViewers.get(streamId).size;
      io.to(streamId).emit('viewer-count', viewerCount);
    }
  });

  // Profile Chat Rooms
  socket.on('join-profile-chat', (roomName) => {
    socket.join(roomName);
    socket.profileRoom = roomName;
    console.log(`User joined profile chat: ${roomName}`);
    
    // Send chat history for this profile room
    if (!global.profileChatMessages) {
      global.profileChatMessages = new Map();
    }
    const history = global.profileChatMessages.get(roomName) || [];
    socket.emit('profile-chat-history', history);
  });

  socket.on('profile-chat-message', ({ roomName, message }) => {
    if (!global.profileChatMessages) {
      global.profileChatMessages = new Map();
    }
    if (!global.profileChatMessages.has(roomName)) {
      global.profileChatMessages.set(roomName, []);
    }
    
    const chatHistory = global.profileChatMessages.get(roomName);
    chatHistory.push(message);
    
    // Keep only last 200 messages
    if (chatHistory.length > 200) {
      chatHistory.shift();
    }
    
    io.to(roomName).emit('profile-chat-message', message);
    console.log(`Profile chat message in ${roomName} from ${message.username}`);
  });

  socket.on('leave-profile-chat', (roomName) => {
    socket.leave(roomName);
    console.log(`User left profile chat: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.streamId && socket.username) {
      io.to(socket.streamId).emit('user-left', { 
        username: socket.username,
        timestamp: new Date()
      });
    }
    
    global.streamViewers.forEach((viewers, streamId) => {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id);
        io.to(streamId).emit('viewer-count', viewers.size);
      }
    });
  });
});

// Make io accessible to routes
app.set('io', io);

// Static file serving for uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes); // Image upload routes
app.use('/api/hls-proxy', hlsProxyRoutes); // HLS proxy for HTTPS streaming
app.use('/api/notifications', notificationRoutes); // Notifications system
app.use('/api/channel-settings', require('./routes/channelSettings')); // Channel settings
app.use('/api/maintenance', require('./routes/maintenance')); // Maintenance mode
app.use('/api/schedule', require('./routes/schedule')); // Stream schedule
app.use('/api/panels', require('./routes/panels')); // Channel panels
app.use('/api/followers', require('./routes/followers')); // Followers/Following lists
app.use('/api/chat-settings', require('./routes/chatSettings')); // Chat mode settings
app.use('/api/chat-moderation', require('./routes/chatModeration')); // Chat moderation
app.use('/api/teams', require('./routes/teams')); // Teams system

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Domain verification endpoint (for custom domains)
// Replace the path and content with your verification values from Render
app.get('/.well-known/acme-challenge/:token', (req, res) => {
  // PASTE YOUR VERIFICATION CONTENT HERE
  const verificationContent = 'dh=b507b84af8537c7c25bfd2940f6c8e1';
  res.type('text/plain');
  res.send(verificationContent);
});

// Get server info
app.get('/api/server-info', (req, res) => {
  const addresses = getNetworkAddresses();
  res.json({
    port: process.env.PORT || 5000,
    rtmpPort: process.env.RTMP_PORT || 1935,
    httpMediaPort: process.env.HTTP_MEDIA_PORT || 8000,
    networkAddresses: addresses,
    publicIP: process.env.PUBLIC_IP || 'localhost'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
  const addresses = getNetworkAddresses();
  
  // Initialize banned IPs from database
  await initBannedIPs();
  
  console.log('');
  console.log('🚀 ========================================');
  console.log('   AURA STREAMING PLATFORM - LIVE');
  console.log('========================================');
  console.log('');
  console.log('✨ Features: Real RTMP streaming, Admin system, Enhanced chat');
  console.log('');
  console.log('📡 SERVER ADDRESSES:');
  console.log(`   Local:          http://localhost:${PORT}`);
  console.log(`   Local Network:  http://127.0.0.1:${PORT}`);
  
  addresses.forEach(addr => {
    console.log(`   Network:        http://${addr}:${PORT}`);
  });
  
  console.log('');
  console.log('🎥 RTMP STREAMING:');
  console.log('   To start media server for OBS: npm run media-server');
  console.log(`   RTMP URL: rtmp://localhost:${process.env.RTMP_PORT || 1935}/live`);
  
  if (addresses.length > 0) {
    console.log(`   Public RTMP: rtmp://${addresses[0]}:${process.env.RTMP_PORT || 1935}/live`);
  }
  
  console.log('');
  console.log('🌐 ACCESS FROM OTHER DEVICES:');
  addresses.forEach(addr => {
    console.log(`   Use: http://${addr}:3000 (frontend)`);
  });
  
  console.log('');
  console.log('========================================');
  console.log('');
});
