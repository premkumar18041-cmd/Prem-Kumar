import React from 'react';
import { Wifi, Battery, Signal, Smartphone, Monitor } from 'lucide-react';

interface AppModeWrapperProps {
  isAppFrameMode: boolean;
  onToggleAppFrameMode: () => void;
  children: React.ReactNode;
}

export const AppModeWrapper: React.FC<AppModeWrapperProps> = ({
  isAppFrameMode,
  onToggleAppFrameMode,
  children
}) => {
  if (!isAppFrameMode) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-2 sm:p-6 select-none">
      
      {/* Top control bar for App Mode */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-zinc-400 text-[11px]">PWA Mobile App Mode</span>
        </div>
        <button
          onClick={onToggleAppFrameMode}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-zinc-800"
        >
          <Monitor className="w-3 h-3" />
          <span>Exit to Full View</span>
        </button>
      </div>

      {/* Smartphone Device Frame */}
      <div className="relative w-full max-w-[420px] h-[850px] max-h-[92vh] bg-white text-zinc-900 rounded-[48px] shadow-[0_25px_70px_rgba(0,0,0,0.8)] border-[10px] border-zinc-800 ring-1 ring-zinc-700/60 flex flex-col overflow-hidden">
        
        {/* Device Top Bar & Dynamic Island / Notch */}
        <div className="relative bg-white text-zinc-900 pt-2 px-6 pb-1 flex items-center justify-between text-xs font-semibold shrink-0 z-50 select-none border-b border-zinc-100/60">
          {/* Time */}
          <span className="text-[11px] font-bold tracking-tight">9:41</span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-4 bg-zinc-950 rounded-full flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-900/50" />
          </div>

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 text-zinc-800">
            <Signal className="w-3 h-3 stroke-[2.5]" />
            <Wifi className="w-3 h-3 stroke-[2.5]" />
            <Battery className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        {/* Inner App Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative select-text">
          {children}
        </div>

        {/* Device Home Indicator Bar */}
        <div className="w-full bg-white py-2 flex items-center justify-center shrink-0 z-50 select-none border-t border-zinc-100/60">
          <div className="w-32 h-1 bg-zinc-900 rounded-full" />
        </div>

      </div>

      <p className="text-zinc-500 text-[11px] mt-3">
        Accessories.lt PWA &bull; Fast Touch Navigation &bull; Offline Service Worker
      </p>
    </div>
  );
};
