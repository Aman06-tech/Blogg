import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

// Verify JWT token and get user
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    
    if (!token) {
      return next(errorHandler(401, 'Access token not provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'access') {
      return next(errorHandler(401, 'Invalid token type'));
    }

    const user = await User.findById(decoded.id).select('-password -loginAttempts -lockUntil -verificationToken -passwordResetToken');
    
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Check if user is still verified
    if (!user.verified && !user.profilePicture) {
      return next(errorHandler(403, 'Email not verified'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(errorHandler(401, 'Access token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(errorHandler(401, 'Invalid access token'));
    }
    return next(errorHandler(500, 'Token verification failed'));
  }
};

// Verify user owns resource or is admin
export const verifyUserOrAdmin = (req, res, next) => {
  const { userId } = req.params;
  
  if (req.user.id !== userId && !req.user.isAdmin) {
    return next(errorHandler(403, 'You can only access your own resources'));
  }
  
  next();
};

// Admin only middleware
export const verifyAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'Access denied. Admin privileges required'));
  }
  
  next();
};

// Optional authentication (user may or may not be logged in)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type === 'access') {
        const user = await User.findById(decoded.id).select('-password -loginAttempts -lockUntil -verificationToken -passwordResetToken');
        
        if (user && (user.verified || user.profilePicture)) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid or expired
    next();
  }
};

// Session validation middleware
export const validateSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    // Check if user still exists and is active
    const user = await User.findById(req.user.id).select('verified isAdmin lockUntil');
    
    if (!user) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return next(errorHandler(401, 'User session invalid'));
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return next(errorHandler(423, 'Account is locked'));
    }

    // Update user data in request
    req.user.verified = user.verified;
    req.user.isAdmin = user.isAdmin;
    
    next();
  } catch (error) {
    return next(errorHandler(500, 'Session validation failed'));
  }
};

// Rate limiting for authenticated users (higher limits)
export const authenticatedRateLimit = (req, res, next) => {
  // This is a placeholder for custom rate limiting based on user status
  // Authenticated users get higher rate limits
  req.rateLimit = {
    authenticated: !!req.user,
    isAdmin: req.user?.isAdmin || false,
  };
  next();
};

// Two-factor authentication middleware (for future enhancement)
export const verify2FA = async (req, res, next) => {
  try {
    if (!req.user.twoFactorEnabled) {
      return next();
    }

    const { twoFactorCode } = req.body;
    
    if (!twoFactorCode) {
      return next(errorHandler(400, '2FA code required'));
    }

    // Here you would verify the 2FA code
    // This is a placeholder for future 2FA implementation
    
    next();
  } catch (error) {
    return next(errorHandler(500, '2FA verification failed'));
  }
};

export default {
  verifyToken,
  verifyUserOrAdmin,
  verifyAdmin,
  optionalAuth,
  validateSession,
  authenticatedRateLimit,
  verify2FA
};