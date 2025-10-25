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

// Middleware to check if IP is banned - BLOCKS EVERYTHING
const checkIPBan = (req, res, next) => {
  const clientIP = getClientIP(req);
  
  // Store IP on request for later use
  req.clientIP = clientIP;
  
  // Check if IP is banned
  if (bannedIPs.has(clientIP)) {
    console.warn(`🚫 BLOCKED IP BAN ATTEMPT: ${clientIP} tried to access ${req.method} ${req.originalUrl}`);
    
    // If it's an API request, return JSON
    if (req.originalUrl.startsWith('/api')) {
      return res.status(403).json({ 
        message: '🚫 YOUR IP HAS BEEN PERMANENTLY BANNED FROM THIS PLATFORM',
        banned: true,
        ipBanned: true,
        contact: 'Contact the platform administrator if you believe this is an error'
      });
    }
    
    // Otherwise, serve the ban page HTML
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Denied - IP Banned</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0E0E12 0%, #1a1a2e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            padding: 20px;
          }
          .container {
            background: #111;
            border: 3px solid #ff0000;
            border-radius: 16px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 0 60px rgba(255, 0, 0, 0.5);
            text-align: center;
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 40px rgba(255, 0, 0, 0.4); }
            50% { box-shadow: 0 0 80px rgba(255, 0, 0, 0.7); }
          }
          .ban-icon {
            font-size: 100px;
            margin-bottom: 20px;
            animation: shake 0.5s ease-in-out infinite;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          h1 {
            color: #ff0000;
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
          }
          p {
            font-size: 1.2em;
            line-height: 1.6;
            color: #cccccc;
            margin-bottom: 15px;
          }
          .ip-info {
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid #ff0000;
            border-radius: 8px;
            padding: 15px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
            font-size: 1.1em;
            color: #ff6b6b;
          }
          .warning {
            background: rgba(255, 255, 0, 0.1);
            border: 1px solid #ffaa00;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
            color: #ffaa00;
            font-size: 0.95em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="ban-icon">🚫</div>
          <h1>ACCESS DENIED</h1>
          <p><strong>Your IP address has been permanently banned from AURA Streaming Platform.</strong></p>
          <p>You violated the platform's Terms of Service and your access has been revoked.</p>
          
          <div class="ip-info">
            <strong>Banned IP:</strong> ${clientIP}
          </div>
          
          <p>All attempts to access this platform from your IP address are being logged.</p>
          
          <div class="warning">
            ⚠️ If you believe this is an error, please contact the platform administrator with your IP address.
          </div>
        </div>
      </body>
      </html>
    `);
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

