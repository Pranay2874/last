import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { User, UserCircle, Edit, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    gender: user?.gender || 'other',
    interests: user?.interests?.join(', ') || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse interests string into array
      const interestsArray = formData.interests
        ? formData.interests.split(',').map(interest => interest.trim())
        : [];
      
      await updateProfile({
        username: formData.username,
        gender: formData.gender as 'male' | 'female' | 'other',
        interests: interestsArray
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      gender: user?.gender || 'other',
      interests: user?.interests?.join(', ') || ''
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  return (
    <>
      <Helmet>
        <title>Profile - MakeAFrnd</title>
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 sm:p-10 bg-purple-600 bg-opacity-20">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="bg-gray-700 rounded-full p-3">
                    <UserCircle className="w-16 h-16 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
                    <p className="text-purple-300">
                      {user?.friends?.length || 0} {user?.friends?.length === 1 ? 'Friend' : 'Friends'}
                    </p>
                  </div>
                </div>
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6 sm:p-10">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="interests" className="block text-sm font-medium text-gray-300">
                        Interests (comma separated)
                      </label>
                      <input
                        type="text"
                        id="interests"
                        name="interests"
                        value={formData.interests}
                        onChange={handleChange}
                        placeholder="e.g., music, sports, movies"
                        className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-300">Profile Information</h3>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center space-x-3 rounded-md border border-gray-700 bg-gray-800 p-3">
                        <User className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Username</p>
                          <p className="text-sm font-medium text-white">{user?.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 rounded-md border border-gray-700 bg-gray-800 p-3">
                        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-400">Gender</p>
                          <p className="text-sm font-medium text-white">
                            {user?.gender.charAt(0).toUpperCase() + user?.gender.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-300">Interests</h3>
                    <div className="mt-3">
                      {user?.interests && user.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-purple-900 bg-opacity-50 px-3 py-1 text-sm font-medium text-purple-200"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">No interests specified</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-5">
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <LogOut className="mr-2 -ml-1 h-5 w-5" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

// Fix: Add missing LogOut component
const LogOut: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
};

export default ProfilePage;