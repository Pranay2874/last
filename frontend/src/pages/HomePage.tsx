import React, { useState } from 'react';
import { MessageCircle, Users, UserPlus } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Loader from '../components/common/Loader';

const HomePage: React.FC = () => {
  const { joinRandomChat, joinGenderChat, joinInterestChat, isSearching } = useChat();
  const { user } = useAuth();
  
  const [interests, setInterests] = useState('');
  const [gender, setGender] = useState(user?.gender || 'other');
  const [preferredGender, setPreferredGender] = useState('other');

  // Handle random chat
  const handleRandomChat = () => {
    joinRandomChat();
  };

  // Handle gender-based chat
  const handleGenderChat = () => {
    joinGenderChat(gender, preferredGender);
  };

  // Handle interest-based chat
  const handleInterestChat = () => {
    // Parse interests string into array
    const interestsArray = interests
      .split(',')
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
    
    if (interestsArray.length === 0) {
      alert('Please enter at least one interest');
      return;
    }
    
    joinInterestChat(interestsArray);
  };

  if (isSearching) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-900 py-12 px-4">
          <div className="container mx-auto flex flex-col items-center justify-center h-[70vh]">
            <Loader text="Searching for a chat partner..." />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>MakeAFrnd - Connect with Strangers</title>
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Welcome, <span className="text-purple-400">{user?.username}</span>!
            </h1>
            <p className="text-xl text-gray-300">
              Choose how you want to connect with others
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Interest-based Chat */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 transition-transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">
                Chat with Common Interest
              </h2>
              <p className="text-gray-400 text-center mb-4">
                Find people who share your interests and connect with them
              </p>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Enter interests (e.g., football, movies)"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple interests with commas</p>
              </div>
              
              <button
                onClick={handleInterestChat}
                className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Find Match
              </button>
            </div>

            {/* Gender-based Chat */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 transition-transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">
                Chat with Specific Gender
              </h2>
              <p className="text-gray-400 text-center mb-4">
                Connect with people of a specific gender
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-4 rounded-md ${
                      gender === 'male'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-4 rounded-md ${
                      gender === 'female'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('other')}
                    className={`py-2 px-4 rounded-md ${
                      gender === 'other'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Other
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferredGender('male')}
                    className={`py-2 px-4 rounded-md ${
                      preferredGender === 'male'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredGender('female')}
                    className={`py-2 px-4 rounded-md ${
                      preferredGender === 'female'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredGender('other')}
                    className={`py-2 px-4 rounded-md ${
                      preferredGender === 'other'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Other
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleGenderChat}
                className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Find Match
              </button>
            </div>

            {/* Random Chat */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 transition-transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">
                Random Chat
              </h2>
              <p className="text-gray-400 text-center mb-4">
                Connect with a random online user instantly
              </p>
              
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="text-purple-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M50 15 L85 50 L50 85 L15 50 Z" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      className="animate-pulse" 
                    />
                    <path 
                      d="M35 35 L65 65 M35 65 L65 35" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      className="animate-pulse" 
                    />
                  </svg>
                </div>
              </div>
              
              <button
                onClick={handleRandomChat}
                className="w-full py-2 px-4 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Start Random Chat
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default HomePage;