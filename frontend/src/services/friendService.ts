import api from './api';

interface Friend {
  _id: string;
  username: string;
  gender: string;
  isOnline: boolean;
}

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

// Get all friends
export const getFriends = async (): Promise<Friend[]> => {
  const response = await api.get('/friends');
  return response.data.friends;
};

// Get friend requests
export const getFriendRequests = async (): Promise<FriendRequest[]> => {
  const response = await api.get('/friends/requests');
  return response.data.requests;
};

// Send friend request
export const sendFriendRequest = async (recipientId: string): Promise<void> => {
  await api.post('/friends/request', { recipientId });
};

// Respond to friend request
export const respondToFriendRequest = async (requestId: string, action: 'accept' | 'reject'): Promise<void> => {
  await api.post('/friends/respond', { requestId, action });
};

// Remove friend
export const removeFriend = async (friendId: string): Promise<void> => {
  await api.delete(`/friends/${friendId}`);
};