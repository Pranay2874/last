import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Logo />
            <p className="mt-2 text-gray-400 max-w-md">
              Connect with strangers worldwide based on your preferences and interests.
              Make new friends in a safe, fun environment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-center md:text-left">
            <Link to="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
              Privacy Policy
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              GitHub
            </a>
            <a 
              href="mailto:contact@makeafrnd.com" 
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} MakeAFrnd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;