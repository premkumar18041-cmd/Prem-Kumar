import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showToast) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div 
        className={`px-3.5 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 border transition-all ${
          isOnline 
            ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700' 
            : 'bg-amber-900/90 text-amber-100 border-amber-700'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-300" />
            <span>Back Online &bull; Accessories.lt Synchronized</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Offline Mode &bull; Browsing PWA Cached Catalog</span>
          </>
        )}
      </div>
    </div>
  );
};
