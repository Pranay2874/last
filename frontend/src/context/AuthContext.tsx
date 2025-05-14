import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, gender: string, interests: string[], agreeToTerms: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

interface User {
  id: string;
  username: string;
  gender: string;
  interests: string[];
  friends: Friend[];
  friendRequests: FriendRequest[];
}

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
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

interface UpdateProfileData {
  username?: string;
  gender?: string;
  interests?: string[];
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Set token in axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
        setToken(null);
        toast.error('Session expired. Please log in again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', { username, password });
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (
    username: string, 
    password: string, 
    gender: string, 
    interests: string[],
    agreeToTerms: boolean
  ) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/register', { 
        username, 
        password, 
        gender, 
        interests,
        agreeToTerms
      });
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
      navigate('/signin');
    }
  };

  // Update profile function
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      const res = await api.put('/users/profile', data);
      setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, ...res.data.user };
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};