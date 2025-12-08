import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, subMessage }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm fade-in">
      <div className="bg-surface p-8 rounded-lg border border-border shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin mb-4" />
        <h3 className="text-sm font-medium text-text-primary mb-1">{message}</h3>
        {subMessage && (
          <p className="text-xs text-text-tertiary">{subMessage}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;