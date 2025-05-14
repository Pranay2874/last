import React, { useState, useEffect } from 'react';
import { UserX, MessageSquare } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { getFriends, removeFriend } from '../../services/friendService';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';

interface Friend {
  _id: string;
  username: string;
  gender: string;
  isOnline: boolean;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  // Fetch friends on mount
  useEffect(() => {
    const loadFriends = async () => {
      try {
        setIsLoading(true);
        const data = await getFriends();
        setFriends(data);
      } catch (error) {
        console.error('Failed to load friends:', error);
        toast.error('Failed to load friends');
      } finally {
        setIsLoading(false);
      }
    };

    loadFriends();
  }, []);

  // Listen for online status changes
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Get initial online status
    socket.emit('friend:getOnlineStatus', { 
      friendIds: friends.map(friend => friend._id) 
    });

    // Update online status when received
    socket.on('friend:onlineStatus', ({ friends: onlineStatuses }) => {
      setFriends(prev => 
        prev.map(friend => ({
          ...friend,
          isOnline: onlineStatuses[friend._id] || friend.isOnline
        }))
      );
    });

    // Listen for status changes
    socket.on('friend:statusChanged', ({ friendId, isOnline }) => {
      setFriends(prev => 
        prev.map(friend => 
          friend._id === friendId 
            ? { ...friend, isOnline } 
            : friend
        )
      );
    });

    return () => {
      socket.off('friend:onlineStatus');
      socket.off('friend:statusChanged');
    };
  }, [socket, isConnected, friends]);

  // Handle remove friend
  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      await removeFriend(friendId);
      setFriends(prev => prev.filter(friend => friend._id !== friendId));
      toast.success('Friend removed successfully');
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  if (isLoading) {
    return <Loader text="Loading friends..." />;
  }

  if (friends.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Friends Yet</h3>
        <p className="text-gray-400">
          Start chatting with people and send friend requests to add them to your list.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map((friend) => (
        <div 
          key={friend._id} 
          className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700"
        >
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {friend.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span 
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                  friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                } border-2 border-gray-800`}
              ></span>
            </div>
            <div className="ml-3">
              <h3 className="text-white font-medium">{friend.username}</h3>
              <p className="text-gray-400 text-sm">
                {friend.gender.charAt(0).toUpperCase() + friend.gender.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
              title="Message"
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => handleRemoveFriend(friend._id)}
              className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
              title="Remove Friend"
            >
              <UserX className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendsList;