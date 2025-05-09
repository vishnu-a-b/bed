// components/SplashScreen.js
import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 transition-opacity duration-500">
      <div className="flex items-center justify-center space-x-2">
        <div className="loader"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
