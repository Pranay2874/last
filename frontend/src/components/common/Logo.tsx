import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <Link to="/" className="flex items-center">
      <div className="relative">
        <MessageCircle 
          className={`${sizeClasses[size]} text-purple-500 transition-transform duration-300 hover:scale-110`} 
        />
        <Sparkles 
          className={`absolute -top-1 -right-1 ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-7 h-7'} text-green-400 animate-pulse`} 
        />
      </div>
      {withText && (
        <span className={`ml-2 font-bold ${textSizeClasses[size]} bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-green-400`}>
          MakeAFrnd
        </span>
      )}
    </Link>
  );
};

export default Logo;