import { Server, Socket } from 'socket.io';
import ChatSession from '../models/ChatSession.js';
import User from '../models/User.js';
import { ISocketUser } from '../types/socket.js';

interface AuthenticatedSocket extends Socket {
  user?: ISocketUser;
}

interface QueueOptions {
  activeUsers: Map<string, AuthenticatedSocket>;
  randomQueue: string[];
  genderQueue: { userId: string; gender: string; preferredGender: string }[];
  interestQueue: { userId: string; interests: string[] }[];
  activeSessions: Map<string, string>;
}

export const setupChatHandlers = (
  io: Server,
  socket: AuthenticatedSocket,
  options: QueueOptions
) => {
  const { activeUsers, randomQueue, genderQueue, interestQueue, activeSessions } = options;

  if (!socket.user) {
    socket.disconnect();
    return;
  }

  const userId = socket.user.id;

  // Join random chat queue
  socket.on('chat:joinRandomQueue', () => {
    // Check if user is already in a chat
    if (activeSessions.has(userId)) {
      socket.emit('chat:error', { message: 'You are already in a chat session' });
      return;
    }

    // Remove from other queues first
    removeFromQueues(userId, options);

    // Add to random queue
    randomQueue.push(userId);
    socket.emit('chat:queueJoined', { type: 'random' });

    // Try to find a match
    findRandomMatch();
  });

  // Join gender-based chat queue
  socket.on('chat:joinGenderQueue', ({ gender, preferredGender }) => {
    // Check if user is already in a chat
    if (activeSessions.has(userId)) {
      socket.emit('chat:error', { message: 'You are already in a chat session' });
      return;
    }

    // Validate input
    if (!['male', 'female', 'other'].includes(gender) || 
        !['male', 'female', 'other'].includes(preferredGender)) {
      socket.emit('chat:error', { message: 'Invalid gender parameters' });
      return;
    }

    // Remove from other queues first
    removeFromQueues(userId, options);

    // Add to gender queue
    genderQueue.push({ userId, gender, preferredGender });
    socket.emit('chat:queueJoined', { type: 'gender' });

    // Set timeout to switch to random if no match found
    setTimeout(() => {
      const stillInQueue = genderQueue.some(entry => entry.userId === userId);
      
      if (stillInQueue) {
        // Remove from gender queue
        const index = genderQueue.findIndex(entry => entry.userId === userId);
        if (index > -1) {
          genderQueue.splice(index, 1);
        }

        // If user is still connected and not in a chat
        if (activeUsers.has(userId) && !activeSessions.has(userId)) {
          // Notify user about switching to random
          socket.emit('chat:queueSwitched', { 
            from: 'gender', 
            to: 'random',
            message: 'No gender match found, switching to random chat'
          });

          // Add to random queue
          randomQueue.push(userId);

          // Try to find a random match
          findRandomMatch();
        }
      }
    }, 45000); // 45 seconds timeout

    // Try to find a match
    findGenderMatch();
  });

  // Join interest-based chat queue
  socket.on('chat:joinInterestQueue', ({ interests }) => {
    // Check if user is already in a chat
    if (activeSessions.has(userId)) {
      socket.emit('chat:error', { message: 'You are already in a chat session' });
      return;
    }

    // Validate input
    if (!Array.isArray(interests) || interests.length === 0) {
      socket.emit('chat:error', { message: 'Invalid interests parameter' });
      return;
    }

    // Remove from other queues first
    removeFromQueues(userId, options);

    // Add to interest queue
    interestQueue.push({ userId, interests });
    socket.emit('chat:queueJoined', { type: 'interest' });

    // Set timeout to switch to random if no match found
    setTimeout(() => {
      const stillInQueue = interestQueue.some(entry => entry.userId === userId);
      
      if (stillInQueue) {
        // Remove from interest queue
        const index = interestQueue.findIndex(entry => entry.userId === userId);
        if (index > -1) {
          interestQueue.splice(index, 1);
        }

        // If user is still connected and not in a chat
        if (activeUsers.has(userId) && !activeSessions.has(userId)) {
          // Notify user about switching to random
          socket.emit('chat:queueSwitched', { 
            from: 'interest', 
            to: 'random',
            message: 'No interest match found, switching to random chat'
          });

          // Add to random queue
          randomQueue.push(userId);

          // Try to find a random match
          findRandomMatch();
        }
      }
    }, 45000); // 45 seconds timeout

    // Try to find a match
    findInterestMatch();
  });

  // Send message
  socket.on('chat:sendMessage', async ({ sessionId, message }) => {
    try {
      // Check if session exists and user is a participant
      const session = await ChatSession.findById(sessionId);
      
      if (!session) {
        socket.emit('chat:error', { message: 'Chat session not found' });
        return;
      }

      if (!session.participants.some(p => p.toString() === userId)) {
        socket.emit('chat:error', { message: 'You are not a participant in this chat' });
        return;
      }

      if (!session.active) {
        socket.emit('chat:error', { message: 'Chat session has ended' });
        return;
      }

      // Add message to session
      session.messages.push({
        sender: userId,
        content: message,
        timestamp: new Date()
      });

      await session.save();

      // Send message to both participants
      session.participants.forEach(participantId => {
        io.to(participantId.toString()).emit('chat:messageReceived', {
          sessionId,
          message: {
            id: session.messages[session.messages.length - 1]._id,
            sender: userId,
            content: message,
            timestamp: new Date()
          }
        });
      });
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('chat:error', { message: 'Error sending message' });
    }
  });

  // Skip current chat
  socket.on('chat:skip', async () => {
    try {
      const sessionId = activeSessions.get(userId);
      
      if (!sessionId) {
        socket.emit('chat:error', { message: 'You are not in an active chat' });
        return;
      }

      // End the current session
      await endChatSession(sessionId, userId);
      
      // Remove session from active sessions
      activeSessions.delete(userId);

      // Emit event to user
      socket.emit('chat:skipped');

      // Join random queue again
      randomQueue.push(userId);
      socket.emit('chat:queueJoined', { type: 'random' });

      // Try to find a new match
      findRandomMatch();
    } catch (error) {
      console.error('Skip chat error:', error);
      socket.emit('chat:error', { message: 'Error skipping chat' });
    }
  });

  // End chat
  socket.on('chat:end', async () => {
    try {
      const sessionId = activeSessions.get(userId);
      
      if (!sessionId) {
        socket.emit('chat:error', { message: 'You are not in an active chat' });
        return;
      }

      // End the current session
      await endChatSession(sessionId, userId);
      
      // Remove session from active sessions
      activeSessions.delete(userId);

      // Emit event to user
      socket.emit('chat:ended', { sessionId, message: 'Chat ended' });
    } catch (error) {
      console.error('End chat error:', error);
      socket.emit('chat:error', { message: 'Error ending chat' });
    }
  });

  // Send friend request from chat
  socket.on('chat:sendFriendRequest', async ({ sessionId }) => {
    try {
      const session = await ChatSession.findById(sessionId);
      
      if (!session) {
        socket.emit('chat:error', { message: 'Chat session not found' });
        return;
      }

      if (!session.participants.some(p => p.toString() === userId)) {
        socket.emit('chat:error', { message: 'You are not a participant in this chat' });
        return;
      }

      // Get other user ID
      const recipientId = session.participants.find(
        p => p.toString() !== userId
      )?.toString();

      if (!recipientId) {
        socket.emit('chat:error', { message: 'Recipient not found' });
        return;
      }

      // Check if they are already friends
      const user = await User.findById(userId);
      const recipient = await User.findById(recipientId);

      if (!user || !recipient) {
        socket.emit('chat:error', { message: 'User not found' });
        return;
      }

      if (user.friends.includes(recipientId)) {
        socket.emit('chat:error', { message: 'You are already friends with this user' });
        return;
      }

      // Check if there's a pending request already
      const existingRequest = recipient.friendRequests.find(
        request => request.sender.toString() === userId && request.status === 'pending'
      );
      
      if (existingRequest) {
        socket.emit('chat:error', { message: 'Friend request already sent' });
        return;
      }

      // Add friend request to recipient
      recipient.friendRequests.push({
        sender: userId,
        status: 'pending',
        createdAt: new Date()
      });
      
      await recipient.save();

      // Notify sender
      socket.emit('chat:friendRequestSent', { recipientId });

      // Notify recipient if online
      const recipientSocket = activeUsers.get(recipientId);
      if (recipientSocket) {
        recipientSocket.emit('friend:requestReceived', {
          request: {
            sender: {
              _id: user._id,
              username: user.username,
              gender: user.gender
            },
            status: 'pending',
            createdAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Send friend request error:', error);
      socket.emit('chat:error', { message: 'Error sending friend request' });
    }
  });

  // Helper function to find a random match
  function findRandomMatch() {
    if (randomQueue.length < 2) return;

    // Get the first two users in the queue
    const user1Id = randomQueue.shift();
    const user2Id = randomQueue.shift();

    if (!user1Id || !user2Id) return;

    // Create a chat session
    createChatSession([user1Id, user2Id], 'random');
  }

  // Helper function to find a gender match
  function findGenderMatch() {
    if (genderQueue.length < 2) return;

    const userIndex = genderQueue.findIndex(entry => entry.userId === userId);
    if (userIndex === -1) return;

    const user = genderQueue[userIndex];
    const matchIndex = genderQueue.findIndex(entry => 
      entry.userId !== user.userId && 
      entry.gender === user.preferredGender && 
      entry.preferredGender === user.gender
    );

    if (matchIndex === -1) return;

    const match = genderQueue[matchIndex];

    // Remove both users from the queue
    genderQueue.splice(Math.max(userIndex, matchIndex), 1);
    genderQueue.splice(Math.min(userIndex, matchIndex), 1);

    // Create a chat session
    createChatSession([user.userId, match.userId], 'gender');
  }

  // Helper function to find an interest match
  function findInterestMatch() {
    if (interestQueue.length < 2) return;

    const userIndex = interestQueue.findIndex(entry => entry.userId === userId);
    if (userIndex === -1) return;

    const user = interestQueue[userIndex];
    let bestMatchIndex = -1;
    let bestMatchCount = 0;

    // Find the best match (most common interests)
    for (let i = 0; i < interestQueue.length; i++) {
      if (i === userIndex) continue;
      
      const potentialMatch = interestQueue[i];
      const commonInterests = user.interests.filter(interest => 
        potentialMatch.interests.includes(interest)
      );
      
      if (commonInterests.length > 0 && commonInterests.length > bestMatchCount) {
        bestMatchCount = commonInterests.length;
        bestMatchIndex = i;
      }
    }

    if (bestMatchIndex === -1) return;

    const match = interestQueue[bestMatchIndex];
    const commonInterests = user.interests.filter(interest => 
      match.interests.includes(interest)
    );

    // Remove both users from the queue
    interestQueue.splice(Math.max(userIndex, bestMatchIndex), 1);
    interestQueue.splice(Math.min(userIndex, bestMatchIndex), 1);

    // Create a chat session
    createChatSession([user.userId, match.userId], 'interest', commonInterests);
  }

  // Helper function to create a chat session
  async function createChatSession(
    participantIds: string[], 
    sessionType: 'random' | 'gender' | 'interest',
    commonInterests?: string[]
  ) {
    try {
      // Get user objects for participants
      const participants = await User.find({ _id: { $in: participantIds } })
        .select('username gender interests');

      if (participants.length !== 2) {
        throw new Error('Could not find both participants');
      }

      // Create a new chat session
      const session = await ChatSession.create({
        participants: participantIds,
        sessionType,
        commonInterests: commonInterests || [],
        active: true,
        startTime: new Date()
      });

      // Add session to active sessions
      participantIds.forEach(id => {
        activeSessions.set(id, session._id.toString());
      });

      // Notify participants
      participantIds.forEach(participantId => {
        const participantSocket = activeUsers.get(participantId);
        
        if (participantSocket) {
          const otherParticipant = participants.find(p => 
            p._id.toString() !== participantId
          );

          participantSocket.emit('chat:matched', {
            sessionId: session._id,
            sessionType,
            otherUser: {
              id: otherParticipant?._id,
              username: otherParticipant?.username,
              gender: otherParticipant?.gender
            },
            commonInterests: commonInterests || []
          });
        }
      });
    } catch (error) {
      console.error('Create chat session error:', error);
      
      // Put users back in their respective queues
      participantIds.forEach(id => {
        const userSocket = activeUsers.get(id);
        if (!userSocket) return;
        
        userSocket.emit('chat:error', { 
          message: 'Failed to create chat session, please try again' 
        });

        // Add back to random queue as fallback
        if (id !== userId) {
          randomQueue.push(id);
        }
      });
    }
  }

  // Helper function to end chat session
  async function endChatSession(sessionId: string, initiatorId: string) {
    try {
      const session = await ChatSession.findById(sessionId);
      if (!session) return;

      // Update session status
      session.active = false;
      session.endTime = new Date();
      await session.save();

      // Notify other participant
      const otherParticipantId = session.participants.find(
        p => p.toString() !== initiatorId
      )?.toString();

      if (otherParticipantId) {
        activeSessions.delete(otherParticipantId);
        const otherSocket = activeUsers.get(otherParticipantId);
        if (otherSocket) {
          otherSocket.emit('chat:ended', { 
            sessionId,
            message: 'The other user has ended the chat' 
          });
        }
      }
    } catch (error) {
      console.error('End chat session error:', error);
    }
  }
};

// Helper function to remove a user from all queues
function removeFromQueues(userId: string, options: QueueOptions) {
  const { randomQueue, genderQueue, interestQueue } = options;

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
}