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
  socket.on('chat-message', ({ streamId, username, message, userId, userRole, isPartner, chatColor }) => {
    const bannedInStream = global.bannedUsers.get(streamId);
    if (bannedInStream && bannedInStream.has(userId)) {
      socket.emit('error-message', { message: 'You are banned from chatting' });
      return;
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/hls-proxy', hlsProxyRoutes); // HLS proxy for HTTPS streaming

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date()
  });
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
server.listen(PORT, '0.0.0.0', () => {
  const addresses = getNetworkAddresses();
  
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
