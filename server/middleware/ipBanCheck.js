const User = require('../models/User');

// Global IP ban list (in-memory for fast checking)
const bannedIPs = new Set();

// Initialize banned IPs from database
const initBannedIPs = async () => {
  try {
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;
    
    if (!useMemory) {
      const bannedUsers = await User.find({ isIpBanned: true });
      bannedUsers.forEach(user => {
        if (user.ipAddress) bannedIPs.add(user.ipAddress);
        if (user.lastIpAddress) bannedIPs.add(user.lastIpAddress);
      });
      console.log(`🚫 Loaded ${bannedIPs.size} banned IPs from database`);
    }
  } catch (error) {
    console.error('Error loading banned IPs:', error);
  }
};

// Get client IP address
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket?.remoteAddress ||
         'unknown';
};

// Middleware to check if IP is banned
const checkIPBan = (req, res, next) => {
  const clientIP = getClientIP(req);
  
  // Store IP on request for later use
  req.clientIP = clientIP;
  
  // Check if IP is banned
  if (bannedIPs.has(clientIP)) {
    return res.status(403).json({ 
      message: 'Your IP address has been banned from this platform. Please contact support if you believe this is an error.',
      banned: true,
      ipBanned: true
    });
  }
  
  next();
};

// Add IP to ban list
const banIP = (ip) => {
  bannedIPs.add(ip);
  console.log(`🚫 IP banned: ${ip} (Total: ${bannedIPs.size})`);
};

// Remove IP from ban list
const unbanIP = (ip) => {
  bannedIPs.delete(ip);
  console.log(`✅ IP unbanned: ${ip} (Total: ${bannedIPs.size})`);
};

// Check if IP is banned (without middleware)
const isIPBanned = (ip) => {
  return bannedIPs.has(ip);
};

module.exports = {
  checkIPBan,
  getClientIP,
  banIP,
  unbanIP,
  isIPBanned,
  initBannedIPs,
  bannedIPs
};

