import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import FriendsList from '../components/friends/FriendsList';
import FriendRequests from '../components/friends/FriendRequests';

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  return (
    <>
      <Helmet>
        <title>Friends - MakeAFrnd</title>
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              {activeTab === 'friends' ? 'My Friends' : 'Friend Requests'}
            </h1>
            <p className="text-gray-400 mt-2">
              {activeTab === 'friends' 
                ? 'Manage your friends and chat with them anytime' 
                : 'Accept or reject pending friend requests'}
            </p>
          </div>

          <div className="mb-6 border-b border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('friends')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'friends'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                Friend Requests
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'friends' ? <FriendsList /> : <FriendRequests />}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default FriendsPage;