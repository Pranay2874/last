import React, { useState, useEffect, useRef } from 'react';
import { Send, Shuffle, UserPlus, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import Loader from '../common/Loader';

const ChatBox: React.FC = () => {
  const { 
    isInChat, 
    otherUser, 
    messages, 
    commonInterests,
    isTyping,
    sendMessage, 
    skipChat, 
    endChat, 
    sendFriendRequest,
    setTypingStatus
  } = useChat();
  
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    // Set typing status
    setTypingStatus(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing status after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(false);
    }, 2000);
  };

  // Handle message submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput.trim());
      setMessageInput('');
      setTypingStatus(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Handle skip chat
  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip this chat?')) {
      skipChat();
    }
  };

  // Handle end chat
  const handleEnd = () => {
    if (window.confirm('Are you sure you want to end this chat?')) {
      endChat();
    }
  };

  // Handle send friend request
  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest();
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  if (!isInChat) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader text="Connecting to a chat..." />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-white">
              Chatting with <span className="text-purple-400">{otherUser?.username}</span>
            </h3>
            <p className="text-sm text-gray-400">
              {otherUser?.gender.charAt(0).toUpperCase() + otherUser?.gender.slice(1)}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSendFriendRequest}
              className="p-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors"
              title="Add Friend"
            >
              <UserPlus className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleSkip}
              className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
              title="Skip"
            >
              <Shuffle className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleEnd}
              className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
              title="End Chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Common interests */}
        {commonInterests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {commonInterests.map((interest, index) => (
              <span 
                key={index} 
                className="px-2 py-1 text-xs bg-purple-700 text-white rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center p-4 text-gray-400">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    message.isOwn
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-gray-700 text-gray-100 rounded-tl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[75%] p-3 rounded-lg bg-gray-700 text-gray-100 rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={handleMessageChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;