import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  ArrowRight,
  LogOut,
  Settings
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useCurrency, type CurrencyCode, type LanguageCode } from '../context/CurrencyContext.js';
import { api } from '../lib/api.js';

interface NavbarProps {
  currentView?: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuthModal?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView = 'home', onNavigate, onOpenAuthModal, onOpenAuth }) => {
  const triggerAuthModal = onOpenAuth || onOpenAuthModal || (() => {});
  const { itemCount, setIsDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currency, setCurrency, language, setLanguage, t, formatPrice } = useCurrency();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getSearchSuggestions(searchQuery);
        if (res.success) {
          setSuggestions(res.suggestions);
          setPopularSearches(res.popular);
        }
      } catch {}
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', `q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      {/* 1. Announcement Bar */}
      <div className="bg-zinc-950 text-zinc-300 text-xs px-4 py-2 flex flex-col sm:flex-row items-center justify-between font-medium">
        <div className="flex items-center gap-2 tracking-wide mx-auto sm:mx-0 text-center sm:text-left">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 hidden sm:inline" />
          <span>{t('announcement')}</span>
        </div>

        <div className="flex items-center gap-4 mt-1 sm:mt-0 self-center sm:self-auto text-xs">
          {/* Language selector */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setLanguage('en')} 
              className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'text-white font-bold underline' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              EN
            </button>
            <span className="text-zinc-600">|</span>
            <button 
              onClick={() => setLanguage('lt')} 
              className={`px-1.5 py-0.5 rounded ${language === 'lt' ? 'text-white font-bold underline' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              LT
            </button>
          </div>

          {/* Currency selector */}
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs rounded px-1.5 py-0.5 focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="PLN">PLN (zł)</option>
          </select>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-zinc-950 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Authentic Brand Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center text-amber-200 font-serif font-bold text-xl shadow-xs group-hover:bg-zinc-900 transition-colors">
                I
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-zinc-950 uppercase leading-none">
                  IVER
                </span>
                <span className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase font-medium">
                  accessories.lt
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-zinc-950 border-b-2 border-zinc-950 pb-1' : 'text-zinc-600 hover:text-zinc-950'}`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`text-sm font-medium transition-colors ${currentView === 'shop' ? 'text-zinc-950 border-b-2 border-zinc-950 pb-1' : 'text-zinc-600 hover:text-zinc-950'}`}
            >
              {t('shop')}
            </button>
            <button
              onClick={() => onNavigate('shop', 'category=jewelry')}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              {language === 'lt' ? 'Papuošalai' : 'Jewelry'}
            </button>
            <button
              onClick={() => onNavigate('shop', 'category=bags')}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              {language === 'lt' ? 'Rankinės' : 'Bags & Totes'}
            </button>
            <button
              onClick={() => onNavigate('shop', 'sort=newest')}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              {t('newArrivals')}
            </button>
            <button
              onClick={() => onNavigate('shop', 'sale=true')}
              className="text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors"
            >
              {t('deals')}
            </button>
          </nav>

          {/* Right Action Icons: Search, Wishlist, Account, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Search Trigger / Input Box */}
            <div className="relative" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder={t('searchPlaceholder')}
                  className="hidden md:block w-48 lg:w-64 pl-9 pr-4 py-2 bg-zinc-100 hover:bg-zinc-200/70 focus:bg-white text-xs rounded-full border border-zinc-200 focus:border-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  className="md:absolute md:left-3 p-2 md:p-0 text-zinc-600 hover:text-zinc-950 focus:outline-none"
                  aria-label="Search accessories"
                >
                  <Search className="w-5 h-5 md:w-4 md:h-4 text-zinc-500" />
                </button>
              </form>

              {/* Live Search Autocomplete Dropdown */}
              {searchOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-3">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {suggestions.length > 0 ? 'Suggested Products' : 'Popular Searches'}
                    </span>
                    <button 
                      onClick={() => setSearchOpen(false)}
                      className="text-zinc-400 hover:text-zinc-600 text-xs"
                    >
                      Close
                    </button>
                  </div>

                  {suggestions.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onNavigate('product', item.slug);
                            setSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer transition-colors"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 object-cover rounded-md bg-zinc-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-zinc-900 truncate">{item.name}</p>
                            <p className="text-[11px] text-zinc-500">{item.category}</p>
                          </div>
                          <span className="text-xs font-semibold text-zinc-900 shrink-0">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full mt-2 text-center text-xs font-medium text-zinc-900 hover:underline py-1 flex items-center justify-center gap-1"
                      >
                        View all results <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {['Kashmiri Bangles', 'Gold Drop Earrings', 'Dakota Laptop Tote', 'RFID Zip Wallet', 'Mesh Watch'].map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => {
                            setSearchQuery(kw);
                            onNavigate('shop', `q=${encodeURIComponent(kw)}`);
                            setSearchOpen(false);
                          }}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-xs text-zinc-700 rounded-full transition-colors"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-zinc-700 hover:text-zinc-950 transition-colors"
              aria-label="View Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account / Admin Menu */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    triggerAuthModal();
                  } else {
                    setAccountDropdownOpen(!accountDropdownOpen);
                  }
                }}
                className="flex items-center gap-1.5 p-2 text-zinc-700 hover:text-zinc-950 transition-colors"
                aria-label="User Account"
              >
                <UserIcon className="w-5 h-5" />
                {isAuthenticated && (
                  <span className="hidden xl:inline text-xs font-medium truncate max-w-[90px]">
                    {user?.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Account Dropdown for Logged-In User */}
              {isAuthenticated && accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-xs font-semibold text-zinc-900">{user?.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-zinc-100 text-zinc-700 text-[10px] font-mono rounded">
                      Role: {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('account');
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    My Orders & Profile
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setAccountDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-amber-700 font-semibold hover:bg-amber-50 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setAccountDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-zinc-100 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Button (Mini-Cart Trigger) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full transition-all text-xs font-medium"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold">{itemCount}</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-4 pr-4 py-2.5 bg-zinc-100 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-900"
            />
          </form>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-medium text-zinc-900 border-b border-zinc-100"
            >
              {t('home')}
            </button>
            <button
              onClick={() => {
                onNavigate('shop');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-medium text-zinc-900 border-b border-zinc-100"
            >
              {t('shop')}
            </button>
            <button
              onClick={() => {
                onNavigate('shop', 'category=jewelry');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-medium text-zinc-900 border-b border-zinc-100"
            >
              {language === 'lt' ? 'Papuošalai' : 'Jewelry'}
            </button>
            <button
              onClick={() => {
                onNavigate('shop', 'category=bags');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-medium text-zinc-900 border-b border-zinc-100"
            >
              {language === 'lt' ? 'Rankinės' : 'Bags & Totes'}
            </button>
            <button
              onClick={() => {
                onNavigate('shop', 'sort=newest');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-medium text-zinc-900 border-b border-zinc-100"
            >
              {t('newArrivals')}
            </button>
            <button
              onClick={() => {
                onNavigate('account');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-sm font-medium text-zinc-900 border-b border-zinc-100"
            >
              {t('account')}
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-sm font-semibold text-amber-700 border-b border-zinc-100"
              >
                {t('adminDashboard')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
