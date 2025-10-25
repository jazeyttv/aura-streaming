const SystemSettings = require('../models/SystemSettings');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory fallback for when MongoDB is not available
let maintenanceModeMemory = {
  enabled: false,
  message: '🔧 Website is currently under maintenance. Please check back soon!'
};

const maintenanceMode = async (req, res, next) => {
  // Allow health checks
  if (req.path === '/api/health') {
    return next();
  }

  // Allow ONLY admin login during maintenance
  if (req.path === '/api/auth/admin-login') {
    return next();
  }

  // Allow maintenance route itself (so admins can toggle it)
  if (req.path.startsWith('/api/maintenance')) {
    return next();
  }

  // Check if user is admin by verifying token
  const token = req.header('x-auth-token');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;
      
      let user;
      if (useMemory) {
        // Check in-memory users (if using memory storage)
        const users = global.users || [];
        user = users.find(u => (u.id || u._id).toString() === decoded.userId);
      } else {
        user = await User.findById(decoded.userId);
      }
      
      if (user && user.role === 'admin') {
        return next(); // Admin can access everything
      }
    } catch (err) {
      // Token invalid or expired, continue to maintenance check
    }
  }

  try {
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    let maintenanceEnabled = false;
    let maintenanceMessage = '🔧 Website is currently under maintenance. Please check back soon!';

    if (useMemory) {
      maintenanceEnabled = maintenanceModeMemory.enabled;
      maintenanceMessage = maintenanceModeMemory.message;
    } else {
      const settings = await SystemSettings.getSettings();
      maintenanceEnabled = settings.maintenanceMode.enabled;
      maintenanceMessage = settings.maintenanceMode.message;
    }

    if (maintenanceEnabled) {
      // For API requests, return JSON
      if (req.path.startsWith('/api/')) {
        return res.status(503).json({
          maintenance: true,
          message: maintenanceMessage
        });
      }
      
      // For page requests, could return maintenance HTML
      // (Frontend will handle display)
      return res.status(503).json({
        maintenance: true,
        message: maintenanceMessage
      });
    }

    next();
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    next();
  }
};

// Export memory store for admin routes to update
maintenanceMode.memory = maintenanceModeMemory;

module.exports = maintenanceMode;

