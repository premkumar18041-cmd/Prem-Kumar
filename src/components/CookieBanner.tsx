import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('iver_cookie_consent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('iver_cookie_consent', 'accepted');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          <p className="font-semibold text-white">European Privacy & Cookie Notice</p>
          <p className="text-zinc-400 mt-1 leading-relaxed">
            Accessories.lt uses cookies and local storage to guarantee secure session cart checkout, currency preferences, and anonymous analytics under EU GDPR.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAccept}
              className="px-3.5 py-1.5 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Accept All
            </button>
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors cursor-pointer"
            >
              Essential Only
            </button>
          </div>
        </div>
        <button
          onClick={handleAccept}
          className="text-zinc-500 hover:text-white transition-colors"
          aria-label="Dismiss cookie banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
