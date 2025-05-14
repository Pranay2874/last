import { Server, Socket } from 'socket.io';
import { ISocketUser } from '../types/socket.js';

interface AuthenticatedSocket extends Socket {
  user?: ISocketUser;
}

export const setupUserHandlers = (
  io: Server,
  socket: AuthenticatedSocket,
  activeUsers: Map<string, AuthenticatedSocket>
) => {
  if (!socket.user) {
    socket.disconnect();
    return;
  }

  const userId = socket.user.id;

  // Get online friends
  socket.on('friend:getOnlineStatus', ({ friendIds }) => {
    if (!Array.isArray(friendIds)) {
      socket.emit('friend:error', { message: 'Invalid friendIds parameter' });
      return;
    }

    const onlineStatusMap: Record<string, boolean> = {};
    
    friendIds.forEach(friendId => {
      onlineStatusMap[friendId] = activeUsers.has(friendId);
    });

    socket.emit('friend:onlineStatus', { friends: onlineStatusMap });
  });

  // Typing indicator
  socket.on('chat:typing', ({ sessionId, isTyping }) => {
    // Find the chat session participants
    const session = Array.from(activeUsers.entries())
      .find(([id, s]) => {
        // If this user has an active session with the given ID
        return id !== userId && s.handshake.auth.activeSessionId === sessionId;
      });

    if (session) {
      const [otherUserId, otherSocket] = session;
      otherSocket.emit('chat:userTyping', { 
        sessionId, 
        userId, 
        isTyping 
      });
    }
  });
};