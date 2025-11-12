import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import argon2 from "argon2";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import admin from "../firebase/firebaseAdmin.js";
import mongoose from "mongoose";

// Token expiry times
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const PASSWORD_RESET_TOKEN_EXPIRY = 3600000; // 1 hour

// Generate secure tokens
const generateTokens = (userId, isAdmin) => {
  const accessToken = jwt.sign(
    { id: userId, isAdmin, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  return { accessToken, refreshToken };
};

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return next(errorHandler(409, "Email already registered"));
      }
      return next(errorHandler(409, "Username already taken"));
    }

    // Use Argon2 for password hashing (more secure than bcrypt)
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
      verified: false,
      loginAttempts: 0,
      lockUntil: null,
    });

    await newUser.save();

    // Send verification email
    try {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/api/auth/verify/${verificationToken}`;
      
      await transporter.sendMail({
        to: email,
        subject: 'Verify your email - Aman\'s Blog',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Welcome to Aman's Blog!</h2>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="margin: 30px 0; border: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue with signup even if email fails
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account."
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+loginAttempts +lockUntil');
    
    if (!user) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return next(errorHandler(423, `Account is locked. Please try again in ${remainingTime} minutes`));
    }

    // Verify password using Argon2 (fallback to bcrypt for old passwords)
    let isValidPassword = false;
    
    if (user.password.startsWith('$argon2')) {
      isValidPassword = await argon2.verify(user.password, password);
    } else {
      // Fallback for bcrypt passwords
      isValidPassword = bcryptjs.compareSync(password, user.password);
      
      // Migrate to Argon2
      if (isValidPassword) {
        user.password = await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16,
          timeCost: 3,
          parallelism: 1,
        });
        await user.save();
      }
    }

    if (!isValidPassword) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        await user.save();
        return next(errorHandler(423, "Account locked due to too many failed login attempts. Please try again in 30 minutes"));
      }
      
      await user.save();
      return next(errorHandler(401, `Invalid email or password. ${5 - user.loginAttempts} attempts remaining`));
    }

    // Check if email is verified
    if (!user.verified && !user.profilePicture) { // Allow Google users (they have profilePicture)
      return next(errorHandler(403, "Please verify your email before logging in"));
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.isAdmin);

    // Remove sensitive data
    const { password: pass, loginAttempts, lockUntil, verificationToken, ...userData } = user._doc;

    // Set secure cookies
    res
      .status(200)
      .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        success: true,
        user: userData
      });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  const { refresh_token } = req.cookies;
  
  if (!refresh_token) {
    return next(errorHandler(401, "Refresh token not provided"));
  }
  
  try {
    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    
    if (decoded.type !== 'refresh') {
      return next(errorHandler(401, "Invalid token type"));
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.isAdmin);
    
    res
      .status(200)
      .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Token refreshed successfully"
      });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(errorHandler(401, "Refresh token expired. Please login again"));
    }
    return next(errorHandler(401, "Invalid refresh token"));
  }
};

export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;
  
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return next(errorHandler(400, "Invalid or expired verification token"));
    }
    
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login."
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    // Don't reveal if user exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpiry = Date.now() + PASSWORD_RESET_TOKEN_EXPIRY;
    
    await user.save();
    
    // Send reset email
    try {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      
      await transporter.sendMail({
        to: email,
        subject: 'Password Reset Request - Aman\'s Blog',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Password Reset Request</h2>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <hr style="margin: 30px 0; border: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
    }
    
    res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent."
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  
  try {
    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return next(errorHandler(400, "Invalid or expired reset token"));
    }
    
    // Hash new password with Argon2
    user.password = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
    
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.loginAttempts = 0;
    user.lockUntil = null;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now login with your new password."
    });
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    res
      .clearCookie('access_token')
      .clearCookie('refresh_token')
      .status(200)
      .json({
        success: true,
        message: "Signed out successfully"
      });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  
  try {
    if (mongoose.connection.readyState !== 1) {
      return next(errorHandler(503, "Database service unavailable. Please try again later."));
    }

    let user = await User.findOne({ email }).timeout(5000);
    
    if (!user) {
      // Create new user for Google auth
      const generatedPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await argon2.hash(generatedPassword, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });
      
      user = new User({
        username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
        verified: true, // Google users are pre-verified
        loginAttempts: 0,
      });
      
      await user.save();
    }
    
    // Update last login
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.isAdmin);
    
    const { password, loginAttempts, lockUntil, verificationToken, ...userData } = user._doc;
    
    res
      .status(200)
      .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        user: userData
      });
  } catch (error) {
    if (error.name === 'MongoTimeoutError' || error.message.includes('buffering timed out')) {
      return next(errorHandler(503, "Database connection timeout. Please try again later."));
    }
    next(error);
  }
};