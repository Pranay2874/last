import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Pages
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import NavigationGuard from './components/chat/NavigationGuard';
import SEOProvider from './components/seo/SEOProvider';

// Context providers
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { SocketProvider } from './context/SocketContext';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <SEOProvider>
        <Router>
          <AuthProvider>
            <SocketProvider>
              <ChatProvider>
                <NavigationGuard />
                <Routes>
                  <Route path="/signin" element={<SigninPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
                <Toaster position="top-center" />
              </ChatProvider>
            </SocketProvider>
          </AuthProvider>
        </Router>
      </SEOProvider>
    </HelmetProvider>
  );
};


export default App;