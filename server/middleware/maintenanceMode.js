const SystemSettings = require('../models/SystemSettings');

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

  // Allow admin login
  if (req.path === '/api/auth/admin-login' || req.path === '/api/auth/login') {
    return next();
  }

  // Check if user is admin
  if (req.user && req.user.role === 'admin') {
    return next();
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

