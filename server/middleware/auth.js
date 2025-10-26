const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    req.user = decoded;
    req.userId = decoded.userId || decoded.id; // Support both formats
    
    console.log(`[AUTH] ✅ User authenticated: ${req.userId}`);
    next();
  } catch (error) {
    console.error('[AUTH] ❌ Token validation failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional auth - doesn't block if no token
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
      req.user = decoded;
      req.userId = decoded.userId || decoded.id;
      console.log(`[OPTIONAL-AUTH] ✅ User authenticated: ${req.userId}`);
    } else {
      console.log(`[OPTIONAL-AUTH] ⏭️ No token provided, continuing without auth`);
    }
    
    next();
  } catch (error) {
    console.log(`[OPTIONAL-AUTH] ⚠️ Token invalid, continuing without auth:`, error.message);
    // Continue without auth
    next();
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;

