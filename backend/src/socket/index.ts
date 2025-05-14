import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ChatSession from '../models/ChatSession.js';
import { setupChatHandlers } from './chatHandlers.js';
import { setupUserHandlers } from './userHandlers.js';
import { ISocketUser } from '../types/socket.js';

interface AuthenticatedSocket extends Socket {
  user?: ISocketUser;
}

// Middleware to authenticate socket connections
const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    
    // Get user from database
    const user = await User.findById(decoded.id).select('_id username gender interests isOnline');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Update user online status
    await User.findByIdAndUpdate(decoded.id, {
      isOnline: true,
      lastActive: new Date()
    });

    // Attach user to socket
    socket.user = {
      id: user._id.toString(),
      username: user.username,
      gender: user.gender,
      interests: user.interests
    };

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
};

// Setup Socket.IO server
export const setupSocketIO = (io: Server) => {
  // Use authentication middleware
  io.use(authenticateSocket);

  // Active users and waiting queues
  const activeUsers = new Map<string, AuthenticatedSocket>();
  const randomQueue: string[] = [];
  const genderQueue: { userId: string; gender: string; preferredGender: string }[] = [];
  const interestQueue: { userId: string; interests: string[] }[] = [];
  const activeSessions = new Map<string, string>();  // userId -> sessionId

  // Handle connection
  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) {
      socket.disconnect();
      return;
    }

    const userId = socket.user.id;
    
    console.log(`User connected: ${socket.user.username} (${userId})`);
    
    // Add user to active users
    activeUsers.set(userId, socket);

    // Join personal room
    socket.join(userId);

    // Notify friends about status change
    notifyFriendsStatusChange(userId, true);

    // Set up event handlers
    setupChatHandlers(io, socket, {
      activeUsers,
      randomQueue,
      genderQueue,
      interestQueue,
      activeSessions
    });
    setupUserHandlers(io, socket, activeUsers);

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user?.username} (${userId})`);
      
      // Remove from active users
      activeUsers.delete(userId);
      
      // Remove from queues
      removeFromQueues(userId);
      
      // End active chat session
      const sessionId = activeSessions.get(userId);
      if (sessionId) {
        await endChatSession(sessionId, userId);
        activeSessions.delete(userId);
      }

      // Update user online status in database
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastActive: new Date()
      });

      // Notify friends about status change
      notifyFriendsStatusChange(userId, false);
    });
  });

  // Helper function to remove user from all queues
  const removeFromQueues = (userId: string) => {
    // Remove from random queue
    const randomIndex = randomQueue.indexOf(userId);
    if (randomIndex > -1) {
      randomQueue.splice(randomIndex, 1);
    }

    // Remove from gender queue
    const genderIndex = genderQueue.findIndex(entry => entry.userId === userId);
    if (genderIndex > -1) {
      genderQueue.splice(genderIndex, 1);
    }

    // Remove from interest queue
    const interestIndex = interestQueue.findIndex(entry => entry.userId === userId);
    if (interestIndex > -1) {
      interestQueue.splice(interestIndex, 1);
    }
  };

  // Helper function to end chat session
  const endChatSession = async (sessionId: string, userId: string) => {
    try {
      const session = await ChatSession.findById(sessionId);
      if (session) {
        // Update session status
        session.active = false;
        session.endTime = new Date();
        await session.save();

        // Notify other participant
        const otherParticipantId = session.participants.find(
          p => p.toString() !== userId
        )?.toString();

        if (otherParticipantId) {
          activeSessions.delete(otherParticipantId);
          const otherSocket = activeUsers.get(otherParticipantId);
          if (otherSocket) {
            otherSocket.emit('chat:ended', { 
              sessionId,
              message: 'The other user has disconnected' 
            });
          }
        }
      }
    } catch (error) {
      console.error('Error ending chat session:', error);
    }
  };

  // Helper function to notify friends about status change
  const notifyFriendsStatusChange = async (userId: string, isOnline: boolean) => {
    try {
      const user = await User.findById(userId).populate('friends', '_id');
      
      if (user && user.friends.length > 0) {
        user.friends.forEach(friend => {
          const friendId = friend._id.toString();
          const friendSocket = activeUsers.get(friendId);
          
          if (friendSocket) {
            friendSocket.emit('friend:statusChanged', {
              friendId: userId,
              isOnline
            });
          }
        });
      }
    } catch (error) {
      console.error('Error notifying friends about status change:', error);
    }
  };
};