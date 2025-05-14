import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, gender, interests, agreeToTerms } = req.body;

    // Check if user agreed to terms and conditions
    if (!agreeToTerms) {
      res.status(400).json({ 
        success: false, 
        message: 'You must agree to the Terms and Conditions and Privacy Policy' 
      });
      return;
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        message: 'Username already taken' 
      });
      return;
    }

    // Create new user
    const user = await User.create({
      username,
      password,
      gender: gender || 'other',
      interests: interests || []
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        gender: user.gender,
        interests: user.interests,
        friends: user.friends,
        friendRequests: user.friendRequests
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
      return;
    }

    // Update user status to online
    user.isOnline = true;
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        gender: user.gender,
        interests: user.interests,
        friends: user.friends,
        friendRequests: user.friendRequests
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id)
      .populate('friends', 'username gender isOnline')
      .populate('friendRequests.sender', 'username');
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        gender: user.gender,
        interests: user.interests,
        friends: user.friends,
        friendRequests: user.friendRequests,
        isOnline: user.isOnline
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Update user status to offline
    await User.findByIdAndUpdate(req.user?.id, {
      isOnline: false,
      lastActive: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
};