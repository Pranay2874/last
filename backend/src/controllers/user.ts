import { Request, Response } from 'express';
import User from '../models/User.js';

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, gender, interests } = req.body;
    const userId = req.user?.id;

    // Check if username is already taken
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        res.status(400).json({ 
          success: false, 
          message: 'Username already taken' 
        });
        return;
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          ...(username && { username }),
          ...(gender && { gender }),
          ...(interests && { interests })
        } 
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        gender: updatedUser.gender,
        interests: updatedUser.interests
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during profile update' 
    });
  }
};

// Get user stats
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    const friendsCount = user.friends.length;
    const pendingRequestsCount = user.friendRequests.filter(
      request => request.status === 'pending'
    ).length;

    res.status(200).json({
      success: true,
      stats: {
        friendsCount,
        pendingRequestsCount
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};