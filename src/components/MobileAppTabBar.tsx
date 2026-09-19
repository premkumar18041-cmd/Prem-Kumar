import React from 'react';
import { Home, Compass, ShoppingBag, Heart, User, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import type { ActiveView } from '../App.js';

interface MobileAppTabBarProps {
  currentView: ActiveView;
  onNavigate: (view: string, param?: string) => void;
  onOpenCategories: () => void;
  onOpenAuth: () => void;
}

export const MobileAppTabBar: React.FC<MobileAppTabBarProps> = ({
  currentView,
  onNavigate,
  onOpenCategories,
  onOpenAuth
}) => {
  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const isHomeActive = currentView === 'home' || currentView === 'shop';
  const isWishlistActive = currentView === 'wishlist';
  const isAccountActive = currentView === 'account' || currentView === 'admin';

  return (
    <nav 
      aria-label="Mobile Bottom App Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        
        {/* 1. Shop / Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
            isHomeActive ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Shop</span>
        </button>

        {/* 2. Categories Drawer */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-zinc-400 hover:text-zinc-700 font-medium transition-colors"
        >
          <Compass className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>

        {/* 3. Cart with Badge */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-zinc-600 hover:text-zinc-950 font-medium transition-colors relative"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-zinc-950 text-amber-200 flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
            </div>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-[9px] font-black text-white flex items-center justify-center ring-2 ring-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-zinc-900 tracking-tight">Cart</span>
        </button>

        {/* 4. Wishlist with Badge */}
        <button
          onClick={() => onNavigate('wishlist')}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
            isWishlistActive ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 transition-transform ${isWishlistActive ? 'scale-110 fill-rose-500 text-rose-500 stroke-[2]' : 'stroke-[1.8]'}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 rounded-full bg-zinc-900 text-[8px] font-bold text-white flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Saved</span>
        </button>

        {/* 5. Account / Profile */}
        <button
          onClick={() => {
            if (isAuthenticated) {
              onNavigate('account');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
            isAccountActive ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-600 font-medium'
          }`}
        >
          <div className="relative">
            {isAdmin ? (
              <ShieldCheck className="w-5 h-5 text-amber-600 stroke-[2.2]" />
            ) : (
              <User className={`w-5 h-5 transition-transform ${isAccountActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
            )}
            {isAuthenticated && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">
            {isAdmin ? 'Admin' : isAuthenticated ? 'Account' : 'Sign In'}
          </span>
        </button>

      </div>
    </nav>
  );
};
