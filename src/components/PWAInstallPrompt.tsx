import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 right-4 z-50 p-4 bg-white border border-zinc-200 rounded-xl shadow-xl max-w-xs animate-in slide-in-from-top-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-amber-200 flex items-center justify-center font-serif font-bold text-sm">
            I
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900">Install Accessories.lt</p>
            <p className="text-[11px] text-zinc-500">Fast offline access & deals</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPrompt(false)} 
          className="text-zinc-400 hover:text-zinc-600 p-1"
          aria-label="Dismiss app install"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleInstall}
        className="w-full mt-3 py-2 px-3 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install Web App</span>
      </button>
    </div>
  );
};
