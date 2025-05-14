import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { Helmet } from 'react-helmet-async';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ChatBox from '../components/chat/ChatBox';

const ChatPage: React.FC = () => {
  const { isInChat, otherUser } = useChat();
  const navigate = useNavigate();

  // Redirect if not in a chat
  useEffect(() => {
    if (!isInChat) {
      navigate('/');
    }
  }, [isInChat, navigate]);

  return (
    <>
      <Helmet>
        <title>
          {otherUser ? `Chat with ${otherUser.username} - MakeAFrnd` : 'Chat - MakeAFrnd'}
        </title>
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="container mx-auto max-w-4xl h-[calc(100vh-16rem)]">
          <ChatBox />
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ChatPage;