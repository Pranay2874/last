import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';

const NavigationGuard: React.FC = () => {
  const { isInChat, endChat } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [prevPath, setPrevPath] = React.useState<string>(location.pathname);
  const [showConfirmation, setShowConfirmation] = React.useState<boolean>(false);
  const [intendedPath, setIntendedPath] = React.useState<string>('');

  // Listen for navigation events
  useEffect(() => {
    // If we're in a chat and trying to navigate away from chat page
    if (isInChat && location.pathname !== '/chat' && prevPath === '/chat') {
      // Don't allow navigation, show confirmation dialog
      navigate('/chat', { replace: true });
      setIntendedPath(location.pathname);
      setShowConfirmation(true);
    } else {
      // Update previous path
      setPrevPath(location.pathname);
    }
  }, [location.pathname, isInChat, navigate, prevPath]);

  // Handle confirmation
  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      // End the chat and navigate to intended path
      endChat();
      setShowConfirmation(false);
      navigate(intendedPath);
    } else {
      // Stay on chat page
      setShowConfirmation(false);
    }
  };

  if (!showConfirmation) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">End Current Chat?</h3>
        <p className="text-gray-300 mb-6">
          You are currently in an active chat. Navigating away will end the conversation. Are you sure you want to leave?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => handleConfirmation(false)}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Stay in Chat
          </button>
          <button
            onClick={() => handleConfirmation(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            End Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationGuard;