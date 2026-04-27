const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

/**
 * Verify JWT access token and attach user info to request
 */
const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Optional auth — does not reject if no token, just sets req.user if valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.userType = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.id;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    req.user = null;
    req.userType = null;
    next();
  }
};

/**
 * Require User role
 */
const requireUser = (req, res, next) => {
  if (req.userType !== 'User') {
    return res.status(403).json({ message: 'Access denied. Users only.' });
  }
  next();
};

/**
 * Require FoodPartner role
 */
const requireFoodPartner = (req, res, next) => {
  if (req.userType !== 'FoodPartner') {
    return res.status(403).json({ message: 'Access denied. Food Partners only.' });
  }
  next();
};

module.exports = {
  verifyAccessToken,
  optionalAuth,
  requireUser,
  requireFoodPartner,
};
