import React from 'react';
import { Plane } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-blue-900 flex items-center justify-center z-50">
      <div className="text-center">
        <Plane className="w-16 h-16 text-purple-500 mx-auto animate-float" />
        <div className="mt-4 w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full w-full bg-purple-500 animate-loading-bar" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;