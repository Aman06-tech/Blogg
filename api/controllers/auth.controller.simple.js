import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import argon2 from "argon2";
import crypto from "crypto";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password || username === "" || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(errorHandler(400, existingUser.email === email ? "Email already exists" : "Username already exists"));
    }

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verified: true, // Skip email verification for now
      isAdmin: false, // Regular users are not admins
    });

    await newUser.save();
    
    res.status(201).json({
      success: true,
      message: "User created successfully!"
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    // Support both Argon2 and bcrypt for backward compatibility
    let validPassword = false;
    if (validUser.password.startsWith('$argon2')) {
      validPassword = await argon2.verify(validUser.password, password);
    } else {
      validPassword = bcryptjs.compareSync(password, validUser.password);
    }

    if (!validPassword) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: pass, ...rest } = validUser._doc;

    res.status(200).cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }).json({
      success: true,
      user: rest
    });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // Update profile picture and username from Google if provided
      if (googlePhotoUrl && googlePhotoUrl !== user.profilePicture) {
        user.profilePicture = googlePhotoUrl;
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      const { password, ...rest } = user._doc;
      res.status(200).cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }).json({
        success: true,
        user: rest
      });
    } else {
      const generatedPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await argon2.hash(generatedPassword, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });

      const newUser = new User({
        username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
        verified: true,
        isAdmin: false, // Regular users are not admins
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      const { password, ...rest } = newUser._doc;
      res.status(200).cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      }).json({
        success: true,
        user: rest
      });
    }
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    res.clearCookie('access_token').status(200).json({
      success: true,
      message: "User has been signed out"
    });
  } catch (error) {
    next(error);
  }
};