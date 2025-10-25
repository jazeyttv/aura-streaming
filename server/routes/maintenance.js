const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const SystemSettings = require('../models/SystemSettings');
const maintenanceMiddleware = require('../middleware/maintenanceMode');

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get maintenance mode status
router.get('/status', authMiddleware, isAdmin, async (req, res) => {
  try {
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      return res.json(maintenanceMiddleware.memory);
    }

    const settings = await SystemSettings.getSettings();
    res.json({
      enabled: settings.maintenanceMode.enabled,
      message: settings.maintenanceMode.message,
      enabledAt: settings.maintenanceMode.enabledAt,
      enabledBy: settings.maintenanceMode.enabledBy
    });
  } catch (error) {
    console.error('Error fetching maintenance status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle maintenance mode
router.post('/toggle', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { enabled, message } = req.body;
    const useMemory = !global.mongoose || !global.mongoose.connection || global.mongoose.connection.readyState !== 1;

    if (useMemory) {
      maintenanceMiddleware.memory.enabled = enabled;
      if (message) maintenanceMiddleware.memory.message = message;
      
      console.log(`[MAINTENANCE] Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'} by ${req.user.username}`);
      
      return res.json(maintenanceMiddleware.memory);
    }

    const settings = await SystemSettings.getSettings();
    settings.maintenanceMode.enabled = enabled;
    if (message) settings.maintenanceMode.message = message;
    settings.maintenanceMode.enabledAt = enabled ? new Date() : null;
    settings.maintenanceMode.enabledBy = enabled ? req.user.userId : null;
    settings.updatedAt = new Date();
    
    await settings.save();

    console.log(`[MAINTENANCE] Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'} by ${req.user.username}`);

    res.json({
      enabled: settings.maintenanceMode.enabled,
      message: settings.maintenanceMode.message,
      enabledAt: settings.maintenanceMode.enabledAt,
      enabledBy: settings.maintenanceMode.enabledBy
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

