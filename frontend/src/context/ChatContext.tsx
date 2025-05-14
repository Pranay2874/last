import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface ChatContextProps {
  isInChat: boolean;
  isSearching: boolean;
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  commonInterests: string[];
  otherUser: OtherUser | null;
  isTyping: boolean;
  joinRandomChat: () => void;
  joinGenderChat: (gender: string, preferredGender: string) => void;
  joinInterestChat: (interests: string[]) => void;
  sendMessage: (message: string) => void;
  skipChat: () => void;
  endChat: () => void;
  sendFriendRequest: () => Promise<void>;
  setTypingStatus: (isTyping: boolean) => void;
}

interface ChatSession {
  sessionId: string;
  sessionType: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn?: boolean;
}

interface OtherUser {
  id: string;
  username: string;
  gender: string;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isInChat, setIsInChat] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [commonInterests, setCommonInterests] = useState<string[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Queue joined event
    socket.on('chat:queueJoined', ({ type }) => {
      setIsSearching(true);
      toast.success(`Searching for ${type} chat partner...`);
    });

    // Queue switched event
    socket.on('chat:queueSwitched', ({ from, to, message }) => {
      toast.info(message);
    });

    // Matched event
    socket.on('chat:matched', ({ sessionId, sessionType, otherUser: matchedUser, commonInterests: interests }) => {
      setIsSearching(false);
      setIsInChat(true);
      setCurrentSession({ sessionId, sessionType });
      setOtherUser(matchedUser);
      setCommonInterests(interests || []);
      setMessages([]);
      
      // Clear search timeout if it exists
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }

      // Navigate to chat page
      navigate('/chat');

      toast.success(`Connected with ${matchedUser.username}!`);
    });

    // Message received event
    socket.on('chat:messageReceived', ({ message }) => {
      const newMessage: ChatMessage = {
        id: message.id,
        sender: message.sender,
        content: message.content,
        timestamp: new Date(message.timestamp),
        isOwn: message.sender === user?.id
      };

      setMessages(prev => [...prev, newMessage]);
    });

    // User typing event
    socket.on('chat:userTyping', ({ userId, isTyping }) => {
      if (userId !== user?.id) {
        setIsTyping(isTyping);
      }
    });

    // Chat ended event
    socket.on('chat:ended', ({ message }) => {
      setIsInChat(false);
      setCurrentSession(null);
      setOtherUser(null);
      setCommonInterests([]);
      setMessages([]);
      setIsTyping(false);
      
      toast.info(message || 'Chat ended');
      
      // Navigate to home if on chat page
      if (window.location.pathname === '/chat') {
        navigate('/');
      }
    });

    // Chat skipped event
    socket.on('chat:skipped', () => {
      setIsInChat(false);
      setCurrentSession(null);
      setOtherUser(null);
      setCommonInterests([]);
      setMessages([]);
      setIsTyping(false);
      
      setIsSearching(true);
      toast.info('Looking for a new chat partner...');
    });

    // Friend request sent event
    socket.on('chat:friendRequestSent', () => {
      toast.success('Friend request sent!');
    });

    // Chat error event
    socket.on('chat:error', ({ message }) => {
      toast.error(message);
    });

    // Cleanup
    return () => {
      socket.off('chat:queueJoined');
      socket.off('chat:queueSwitched');
      socket.off('chat:matched');
      socket.off('chat:messageReceived');
      socket.off('chat:userTyping');
      socket.off('chat:ended');
      socket.off('chat:skipped');
      socket.off('chat:friendRequestSent');
      socket.off('chat:error');
    };
  }, [socket, isConnected, user, navigate, searchTimeout]);

  // Join random chat
  const joinRandomChat = () => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    if (isInChat) {
      toast.error('You are already in a chat');
      return;
    }

    socket.emit('chat:joinRandomQueue');
  };

  // Join gender-based chat
  const joinGenderChat = (gender: string, preferredGender: string) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    if (isInChat) {
      toast.error('You are already in a chat');
      return;
    }

    socket.emit('chat:joinGenderQueue', { gender, preferredGender });
  };

  // Join interest-based chat
  const joinInterestChat = (interests: string[]) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    if (isInChat) {
      toast.error('You are already in a chat');
      return;
    }

    socket.emit('chat:joinInterestQueue', { interests });
  };

  // Send message
  const sendMessage = (message: string) => {
    if (!socket || !isConnected || !currentSession) {
      toast.error('Not connected to chat');
      return;
    }

    socket.emit('chat:sendMessage', { 
      sessionId: currentSession.sessionId, 
      message 
    });
  };

  // Skip chat
  const skipChat = () => {
    if (!socket || !isConnected || !isInChat) {
      toast.error('Not in a chat');
      return;
    }

    socket.emit('chat:skip');
  };

  // End chat
  const endChat = () => {
    if (!socket || !isConnected || !isInChat) {
      toast.error('Not in a chat');
      return;
    }

    socket.emit('chat:end');
  };

  // Send friend request
  const sendFriendRequest = async () => {
    if (!socket || !isConnected || !isInChat || !currentSession) {
      toast.error('Not in a chat');
      return;
    }

    socket.emit('chat:sendFriendRequest', { 
      sessionId: currentSession.sessionId 
    });
  };

  // Set typing status
  const setTypingStatus = (isTyping: boolean) => {
    if (!socket || !isConnected || !currentSession) return;

    socket.emit('chat:typing', {
      sessionId: currentSession.sessionId,
      isTyping
    });
  };

  return (
    <ChatContext.Provider
      value={{
        isInChat,
        isSearching,
        currentSession,
        messages,
        commonInterests,
        otherUser,
        isTyping,
        joinRandomChat,
        joinGenderChat,
        joinInterestChat,
        sendMessage,
        skipChat,
        endChat,
        sendFriendRequest,
        setTypingStatus
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};