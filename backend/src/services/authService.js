const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AuthenticationError, ConflictError, NotFoundError } = require('../utils/errors');
const logger = require('../config/logger');

class AuthService {
  async register(userData) {
    const { username, email, password, firstName, lastName, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email already registered');
      }
      throw new ConflictError('Username already taken');
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'user',
    });

    logger.info(`New user registered: ${user.email}`);

    return this.generateTokens(user);
  }

  async login(email, password) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password +refreshTokens');

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      // If token doesn't exist, clear all tokens (security measure)
      await user.clearRefreshTokens();
      throw new AuthenticationError('Invalid refresh token');
    }

    // Remove old refresh token and generate new tokens
    await user.removeRefreshToken(refreshToken);

    return this.generateTokens(user);
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId).select('+refreshTokens');
    if (user && refreshToken) {
      await user.removeRefreshToken(refreshToken);
    }

    logger.info(`User logged out: ${userId}`);
  }

  async logoutAll(userId) {
    const user = await User.findById(userId).select('+refreshTokens');
    if (user) {
      await user.clearRefreshTokens();
    }

    logger.info(`User logged out from all devices: ${userId}`);
  }

  async generateTokens(user) {
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Store refresh token in database
    await user.addRefreshToken(refreshToken);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clear all refresh tokens (force re-login on all devices)
    await user.clearRefreshTokens();

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Password changed successfully' };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'avatar'];
    const updates = {};

    // Filter allowed updates
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info(`Profile updated for user: ${user.email}`);

    return user;
  }
}

module.exports = new AuthService();