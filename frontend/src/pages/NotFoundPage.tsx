import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Logo from '../components/common/Logo';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found - MakeAFrnd</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4">
        <Logo size="lg" />
        
        <h1 className="mt-8 text-6xl font-extrabold text-white">404</h1>
        <p className="mt-2 text-2xl font-medium text-gray-300">Page Not Found</p>
        <p className="mt-4 text-gray-400 text-center max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Link 
            to="/"
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;