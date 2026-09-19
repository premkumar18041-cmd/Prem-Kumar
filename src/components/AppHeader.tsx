import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Smartphone, 
  Monitor, 
  Server, 
  Download, 
  ShoppingBag,
  Sparkles,
  Globe
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext.js';
import { useCart } from '../context/CartContext.js';
import type { ActiveView } from '../App.js';

interface AppHeaderProps {
  currentView: ActiveView;
  onNavigate: (view: string, param?: string) => void;
  isAppFrameMode: boolean;
  onToggleAppFrameMode: () => void;
  onOpenBackendConsole: () => void;
  onOpenSearch: () => void;
  onInstallApp?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  onNavigate,
  isAppFrameMode,
  onToggleAppFrameMode,
  onOpenBackendConsole,
  onOpenSearch,
  onInstallApp
}) => {
  const { currency, setCurrency } = useCurrency();
  const { itemCount, openCart } = useCart();

  const isSubPage = currentView !== 'home';

  const getPageTitle = () => {
    switch (currentView) {
      case 'shop': return 'Catalog';
      case 'product': return 'Product Detail';
      case 'checkout': return 'Secure Checkout';
      case 'order-success': return 'Order Placed';
      case 'tracking': return 'Order Tracking';
      case 'wishlist': return 'My Wishlist';
      case 'account': return 'My Account';
      case 'admin': return 'Admin Portal';
      case 'shipping-info': return 'Delivery Info';
      case 'returns': return 'EU 14-Day Returns';
      case 'faq': return 'Help & FAQ';
      case 'privacy': return 'Privacy Policy';
      default: return 'IVER';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Side: Back button or Brand Monogram */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {isSubPage ? (
            <button
              onClick={() => onNavigate('home')}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors shrink-0"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('home')}
              className="w-8 h-8 rounded-xl bg-zinc-950 text-amber-200 flex items-center justify-center font-serif font-bold text-sm shrink-0 shadow-xs"
            >
              I
            </button>
          )}

          <button
            onClick={() => onNavigate('home')}
            className="text-left truncate"
          >
            <span className="font-serif font-black tracking-tight text-zinc-950 text-base sm:text-lg block leading-tight truncate">
              {isSubPage ? getPageTitle() : 'IVER'}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase block -mt-0.5">
              Accessories.lt
            </span>
          </button>
        </div>

        {/* Center: Search trigger on larger screens */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 bg-zinc-100/80 hover:bg-zinc-100 border border-zinc-200 rounded-full text-xs text-zinc-500 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Search jewelry, bags, accessories...</span>
            </div>
            <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded-sm border border-zinc-200 font-mono text-zinc-400">
              /
            </kbd>
          </button>
        </div>

        {/* Right Side Controls: Currency, Backend Explorer, App Frame Toggle, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Currency Switcher */}
          <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-2 py-1 rounded-md transition-all ${
                currency === 'EUR' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              € EUR
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2 py-1 rounded-md transition-all ${
                currency === 'INR' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              ₹ INR
            </button>
          </div>

          {/* Backend & Architecture Inspector Button */}
          <button
            onClick={onOpenBackendConsole}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-200 text-[11px] font-bold rounded-lg transition-colors border border-amber-500/20"
            title="Inspect Node.js REST API, PostgreSQL schema, Redis cache and BullMQ queue"
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Backend</span>
          </button>

          {/* App Frame Mode Toggle (Desktop only) */}
          <button
            onClick={onToggleAppFrameMode}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold rounded-lg transition-colors"
            title={isAppFrameMode ? 'Switch to responsive full-screen' : 'View in mobile phone app frame'}
          >
            {isAppFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-zinc-600" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-zinc-600" />
                <span>App Mode</span>
              </>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={openCart}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-950 text-amber-200 flex items-center justify-center shadow-xs hover:bg-zinc-800 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
