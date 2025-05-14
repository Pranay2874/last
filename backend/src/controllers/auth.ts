import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

// Define JWT payload interface
interface JwtPayload {
  id: string;
}

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

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

    const userResponse: Partial<IUser> = {
      _id: user._id,
      username: user.username,
      gender: user.gender,
      interests: user.interests,
      friends: user.friends,
      friendRequests: user.friendRequests
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse
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

    const userResponse: Partial<IUser> = {
      _id: user._id,
      username: user.username,
      gender: user.gender,
      interests: user.interests,
      friends: user.friends,
      friendRequests: user.friendRequests
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse
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
    if (!req.user?.id) {
      res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
      return;
    }

    const user = await User.findById(req.user.id)
      .populate('friends', 'username gender isOnline')
      .populate('friendRequests.sender', 'username');
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    const userResponse: Partial<IUser> = {
      _id: user._id,
      username: user.username,
      gender: user.gender,
      interests: user.interests,
      friends: user.friends,
      friendRequests: user.friendRequests,
      isOnline: user.isOnline
    };

    res.status(200).json({
      success: true,
      user: userResponse
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
    if (!req.user?.id) {
      res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
      return;
    }

    // Update user status to offline
    await User.findByIdAndUpdate(req.user.id, {
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