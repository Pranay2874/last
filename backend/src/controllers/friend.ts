import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Send friend request
export const sendFriendRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user?.id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
      return;
    }

    // Check if sender and recipient are the same
    if (senderId === recipientId) {
      res.status(400).json({ 
        success: false, 
        message: 'You cannot send a friend request to yourself' 
      });
      return;
    }

    // Check if they are already friends
    if (recipient.friends.includes(new mongoose.Types.ObjectId(senderId))) {
      res.status(400).json({ 
        success: false, 
        message: 'You are already friends with this user' 
      });
      return;
    }

    // Check if there's a pending request already
    const existingRequest = recipient.friendRequests.find(
      request => request.sender.toString() === senderId && request.status === 'pending'
    );
    
    if (existingRequest) {
      res.status(400).json({ 
        success: false, 
        message: 'Friend request already sent' 
      });
      return;
    }

    // Add friend request to recipient
    recipient.friendRequests.push({
      sender: new mongoose.Types.ObjectId(senderId),
      status: 'pending',
      createdAt: new Date()
    });
    
    await recipient.save();

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Respond to friend request
export const respondToFriendRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user?.id;

    if (!['accept', 'reject'].includes(action)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid action. Must be "accept" or "reject"' 
      });
      return;
    }

    // Find user with the request
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    // Find the friend request
    const requestIndex = user.friendRequests.findIndex(
      request => request._id?.toString() === requestId
    );

    if (requestIndex === -1) {
      res.status(404).json({ 
        success: false, 
        message: 'Friend request not found' 
      });
      return;
    }

    const request = user.friendRequests[requestIndex];
    const senderId = request.sender.toString();

    // Update request status
    if (action === 'accept') {
      // Add to friends list (both users)
      user.friends.push(request.sender);
      user.friendRequests[requestIndex].status = 'accepted';
      
      // Add the user to sender's friends list as well
      await User.findByIdAndUpdate(senderId, {
        $push: { friends: userId }
      });
    } else {
      // Reject request
      user.friendRequests[requestIndex].status = 'rejected';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Friend request ${action === 'accept' ? 'accepted' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all friends
export const getFriends = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    const user = await User.findById(userId).populate('friends', 'username gender isOnline lastActive');
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      friends: user.friends
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all friend requests
export const getFriendRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    const user = await User.findById(userId)
      .populate('friendRequests.sender', 'username gender');
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    const pendingRequests = user.friendRequests.filter(
      request => request.status === 'pending'
    );

    res.status(200).json({
      success: true,
      requests: pendingRequests
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Remove friend
export const removeFriend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { friendId } = req.params;
    const userId = req.user?.id;

    // Remove from both users' friends lists
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};