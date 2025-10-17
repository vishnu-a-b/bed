import React from 'react';

interface FlagIconProps {
  className?: string;
}

// Australia Flag Icon
export const AustraliaFlag: React.FC<FlagIconProps> = ({ className = "w-5 h-5" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} title="Australia">
      <span style={{ fontSize: '1.2em' }}>🇦🇺</span>
    </div>
  );
};

// India Flag Icon
export const IndiaFlag: React.FC<FlagIconProps> = ({ className = "w-5 h-5" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} title="India">
      <span style={{ fontSize: '1.2em' }}>🇮🇳</span>
    </div>
  );
};

// Generic wrapper for consistency with lucide icons
export const createFlagIcon = (FlagComponent: React.FC<FlagIconProps>) => {
  return FlagComponent;
};
