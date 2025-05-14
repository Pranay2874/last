import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { getFriendRequests, respondToFriendRequest } from '../../services/friendService';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import Loader from '../common/Loader';

interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    username: string;
    gender: string;
  };
  status: string;
  createdAt: string;
}

const FriendRequests: React.FC = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  // Fetch friend requests on mount
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        const data = await getFriendRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to load friend requests:', error);
        toast.error('Failed to load friend requests');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  // Listen for new friend requests
  useEffect(() => {
    if (!socket) return;

    socket.on('friend:requestReceived', ({ request }) => {
      setRequests(prev => [...prev, request]);
      toast.success(`New friend request from ${request.sender.username}`);
    });

    return () => {
      socket.off('friend:requestReceived');
    };
  }, [socket]);

  // Handle respond to friend request
  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await respondToFriendRequest(requestId, action);
      setRequests(prev => prev.filter(req => req._id !== requestId));
      toast.success(`Friend request ${action === 'accept' ? 'accepted' : 'rejected'}`);
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
      toast.error(`Failed to ${action} friend request`);
    }
  };

  if (isLoading) {
    return <Loader text="Loading friend requests..." />;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Friend Requests</h3>
        <p className="text-gray-400">
          When someone sends you a friend request, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((request) => (
        <div 
          key={request._id} 
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {request.sender.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-white font-medium">{request.sender.username}</h3>
              <p className="text-gray-400 text-sm">
                {request.sender.gender.charAt(0).toUpperCase() + request.sender.gender.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            <button 
              onClick={() => handleRespondToRequest(request._id, 'accept')}
              className="flex-1 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors text-white font-medium flex items-center justify-center"
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </button>
            <button 
              onClick={() => handleRespondToRequest(request._id, 'reject')}
              className="flex-1 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors text-white font-medium flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;