const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

const authenticate = asyncHandler(async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    const decoded = verifyAccessToken(token);
    
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`));
    }

    next();
  };
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = extractTokenFromHeader(req.headers.authorization);
      const decoded = verifyAccessToken(token);
      
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // For optional auth, we don't throw errors if token is invalid
    // Just continue without setting req.user
  }
  
  next();
});

const requireOwnership = (resourceField = 'author') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resource = req.resource || req.body;
    if (!resource) {
      return next(new AuthorizationError('Resource not found'));
    }

    const resourceOwnerId = resource[resourceField]?.toString() || resource[resourceField];
    if (resourceOwnerId !== req.user._id.toString()) {
      return next(new AuthorizationError('Access denied. You can only access your own resources'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireOwnership,
};