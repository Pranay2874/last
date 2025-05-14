import React from 'react';
import { MessageCircle } from 'lucide-react';

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text = 'Loading...' }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <MessageCircle className="w-10 h-10 text-purple-500 animate-spin" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-5 h-5 bg-purple-100 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-200">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95 z-50">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {loaderContent}
    </div>
  );
};

export default Loader;