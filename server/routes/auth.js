const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// In-memory user storage (fallback if MongoDB is not available)
const users = new Map();

// CUSTOM ADMIN CREDENTIALS
const ADMIN_USERNAME = 'Jazey';
const ADMIN_PASSWORD = '1919';
const ADMIN_EMAIL = 'jazey@aura.local';

// Admin auto-login - Creates admin if doesn't exist
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

      let adminUser;

      if (useMemory) {
        // Check if admin already exists in memory
        adminUser = Array.from(users.values()).find(u => u.username === ADMIN_USERNAME);
        
        if (!adminUser) {
          // Create admin user in memory
          const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
          adminUser = {
            id: uuidv4(),
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            displayName: ADMIN_USERNAME,
            bio: 'Platform Administrator',
            avatar: '',
            isStreamer: true,
            role: 'admin',
            streamKey: `sk_${uuidv4().replace(/-/g, '')}`,
            rtmpUrl: 'rtmp://localhost:1935/live',
            isBanned: false,
            bannedUntil: null,
            followers: [],
            following: [],
            totalViewers: 0,
            streamCount: 0,
            createdAt: new Date()
          };
          users.set(adminUser.id, adminUser);
        }
      } else {
        // Check if admin exists in MongoDB
        adminUser = await User.findOne({ username: ADMIN_USERNAME });
        
        if (!adminUser) {
          // Create admin user in MongoDB
          const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
          adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            displayName: ADMIN_USERNAME,
            bio: 'Platform Administrator',
            isStreamer: true,
            role: 'admin',
            streamKey: `sk_${uuidv4().replace(/-/g, '')}`,
            rtmpUrl: 'rtmp://localhost:1935/live'
          });
          await adminUser.save();
        }
      }

      const token = jwt.sign(
        { userId: adminUser.id || adminUser._id, username: adminUser.username, role: 'admin' },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: adminUser.id || adminUser._id,
          username: adminUser.username,
          email: adminUser.email,
          displayName: adminUser.displayName,
          isStreamer: adminUser.isStreamer,
          role: 'admin',
          streamKey: adminUser.streamKey,
          rtmpUrl: adminUser.rtmpUrl
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('[REGISTER] New registration attempt:', { username: req.body.username, email: req.body.email });
    const { username, email, password, isStreamer } = req.body;

    // Validation
    if (!username || !email || !password) {
      console.log('[REGISTER] ❌ Missing fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      console.log('[REGISTER] ❌ Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (username.length < 3) {
      console.log('[REGISTER] ❌ Username too short');
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    // Check if using MongoDB or in-memory
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      // In-memory storage
      const userExists = Array.from(users.values()).find(
        u => u.username === username || u.email === email
      );

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // EVERYONE gets a stream key automatically - no exceptions!
      const streamKey = `sk_${uuidv4().replace(/-/g, '')}`;
      
      const newUser = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        displayName: username,
        bio: '',
        avatar: '',
        isStreamer: true, // Everyone is a streamer by default
        role: 'user',
        streamKey,
        rtmpUrl: 'rtmp://72.23.212.188:1935/live',
        isBanned: false,
        bannedUntil: null,
        followers: [],
        following: [],
        totalViewers: 0,
        streamCount: 0,
        createdAt: new Date()
      };

      users.set(newUser.id, newUser);
      console.log('[REGISTER] ✅ User created in memory:', username);

      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username, role: newUser.role },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
        { expiresIn: '7d' }
      );

      console.log('[REGISTER] ✅ Token generated for:', username);
      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          displayName: newUser.displayName,
          isStreamer: newUser.isStreamer,
          role: newUser.role,
          streamKey: newUser.streamKey,
          rtmpUrl: newUser.rtmpUrl
        }
      });
    } else {
      // MongoDB storage
      const userExists = await User.findOne({ $or: [{ username }, { email }] });

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // EVERYONE gets a stream key automatically - no exceptions!
      const streamKey = `sk_${uuidv4().replace(/-/g, '')}`;

      const user = new User({
        username,
        email,
        password: hashedPassword,
        displayName: username,
        isStreamer: true, // Everyone is a streamer by default
        role: 'user',
        streamKey,
        rtmpUrl: 'rtmp://72.23.212.188:1935/live'
      });

      await user.save();
      console.log('[REGISTER] ✅ User saved to MongoDB:', username);

      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
        { expiresIn: '7d' }
      );

      console.log('[REGISTER] ✅ Token generated for:', username);
      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          isStreamer: user.isStreamer,
          role: user.role,
          streamKey: user.streamKey,
          rtmpUrl: user.rtmpUrl,
          chatColor: user.chatColor || '#FFFFFF',
          isPartner: user.isPartner || false,
          isAffiliate: user.isAffiliate || false
        }
      });
    }
  } catch (error) {
    console.error('[REGISTER] ❌ Registration error:', error);
    console.error('[REGISTER] Error details:', error.message);
    res.status(500).json({ 
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Check if it's admin login with hardcoded credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;
      let adminUser;

      if (useMemory) {
        adminUser = Array.from(users.values()).find(u => u.username === ADMIN_USERNAME);
        if (!adminUser) {
          const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
          adminUser = {
            id: uuidv4(),
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            displayName: ADMIN_USERNAME,
            bio: 'Platform Administrator',
            avatar: '',
            isStreamer: true,
            role: 'admin',
            streamKey: `sk_${uuidv4().replace(/-/g, '')}`,
            rtmpUrl: 'rtmp://localhost:1935/live',
            isBanned: false,
            bannedUntil: null,
            followers: [],
            following: [],
            totalViewers: 0,
            streamCount: 0,
            createdAt: new Date()
          };
          users.set(adminUser.id, adminUser);
        }
      } else {
        adminUser = await User.findOne({ username: ADMIN_USERNAME });
        if (!adminUser) {
          const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
          adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            displayName: ADMIN_USERNAME,
            bio: 'Platform Administrator',
            isStreamer: true,
            role: 'admin',
            streamKey: `sk_${uuidv4().replace(/-/g, '')}`,
            rtmpUrl: 'rtmp://localhost:1935/live'
          });
          await adminUser.save();
        }
      }

      const token = jwt.sign(
        { userId: adminUser.id || adminUser._id, username: adminUser.username, role: 'admin' },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: adminUser.id || adminUser._id,
          username: adminUser.username,
          email: adminUser.email,
          displayName: adminUser.displayName,
          isStreamer: adminUser.isStreamer,
          role: 'admin',
          streamKey: adminUser.streamKey,
          rtmpUrl: adminUser.rtmpUrl
        }
      });
    }

    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      // In-memory storage
      const user = Array.from(users.values()).find(u => u.username === username || u.email === username);

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      if (user.isBanned) {
        if (user.bannedUntil && new Date() > user.bannedUntil) {
          user.isBanned = false;
          user.bannedUntil = null;
        } else {
          return res.status(403).json({ message: 'Your account has been banned' });
        }
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // AUTO-FIX: If user doesn't have a stream key, create one now (for old accounts)
      if (!user.streamKey) {
        user.streamKey = `sk_${uuidv4().replace(/-/g, '')}`;
        user.isStreamer = true;
        user.rtmpUrl = 'rtmp://72.23.212.188:1935/live';
        console.log(`[LOGIN] ✅ Auto-generated stream key for ${user.username}`);
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          isStreamer: user.isStreamer,
          role: user.role,
          streamKey: user.streamKey,
          rtmpUrl: user.rtmpUrl,
          chatColor: user.chatColor || '#FFFFFF',
          isPartner: user.isPartner || false,
          isAffiliate: user.isAffiliate || false
        }
      });
    } else {
      // MongoDB storage
      const user = await User.findOne({
        $or: [{ username }, { email: username }]
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      if (user.isBanned) {
        if (user.bannedUntil && new Date() > user.bannedUntil) {
          user.isBanned = false;
          user.bannedUntil = null;
          await user.save();
        } else {
          return res.status(403).json({ message: 'Your account has been banned' });
        }
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // AUTO-FIX: If user doesn't have a stream key, create one now (for old accounts)
      if (!user.streamKey) {
        user.streamKey = `sk_${uuidv4().replace(/-/g, '')}`;
        user.isStreamer = true;
        user.rtmpUrl = 'rtmp://72.23.212.188:1935/live';
        await user.save(); // Save to MongoDB
        console.log(`[LOGIN] ✅ Auto-generated stream key for ${user.username}`);
      }

      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          isStreamer: user.isStreamer,
          role: user.role,
          streamKey: user.streamKey,
          rtmpUrl: user.rtmpUrl,
          chatColor: user.chatColor || '#FFFFFF',
          isPartner: user.isPartner || false,
          isAffiliate: user.isAffiliate || false
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export users map for other routes to use
router.users = users;

module.exports = router;
