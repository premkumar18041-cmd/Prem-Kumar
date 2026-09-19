import React, { useState, useEffect } from 'react';
import { CurrencyProvider } from './context/CurrencyContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider, useCart } from './context/CartContext.js';
import { WishlistProvider } from './context/WishlistContext.js';

import { AppHeader } from './components/AppHeader.js';
import { Navbar } from './components/Navbar.js';
import { MobileAppTabBar } from './components/MobileAppTabBar.js';
import { CategorySheet } from './components/CategorySheet.js';
import { QuickSearchModal } from './components/QuickSearchModal.js';
import { BackendConsoleModal } from './components/BackendConsoleModal.js';
import { OfflineIndicator } from './components/OfflineIndicator.js';
import { AppModeWrapper } from './components/AppModeWrapper.js';
import { Footer } from './components/Footer.js';
import { MiniCartDrawer } from './components/MiniCartDrawer.js';
import { AuthModal } from './components/AuthModal.js';
import { CookieBanner } from './components/CookieBanner.js';
import { PWAInstallPrompt } from './components/PWAInstallPrompt.js';

import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { CustomerAccountPage } from './pages/CustomerAccountPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { InfoPage } from './pages/InfoPages.js';

import type { Order } from './types.js';

export type ActiveView = 
  | 'home' 
  | 'shop' 
  | 'product' 
  | 'checkout' 
  | 'order-success' 
  | 'tracking' 
  | 'wishlist' 
  | 'account' 
  | 'admin'
  | 'shipping-info'
  | 'returns'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'contact';

function AppContent() {
  const { openCart, closeCart } = useCart();

  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [viewParam, setViewParam] = useState<string | undefined>();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // App-specific modal & frame states
  const [isAppFrameMode, setIsAppFrameMode] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [backendConsoleOpen, setBackendConsoleOpen] = useState(false);

  // Sync hash routing on popstate / initial load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setCurrentView('home');
        setViewParam(undefined);
        return;
      }
      const [view, ...rest] = hash.split('/');
      const param = rest.join('/');
      setCurrentView((view as ActiveView) || 'home');
      setViewParam(param || undefined);
    };

    window.addEventListener('popstate', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('popstate', handleHashChange);
  }, []);

  const navigate = (view: string, param?: string) => {
    setCurrentView(view as ActiveView);
    setViewParam(param);
    const hash = param ? `#/${view}/${param}` : `#/${view}`;
    window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setLastOrder(order);
    closeCart();
    navigate('order-success', order.orderNumber);
  };

  const appInnerLayout = (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 flex flex-col font-sans selection:bg-amber-200 selection:text-zinc-900">
      
      {/* 1. App Header with navigation, search, currency, app mode toggle & backend explorer */}
      <AppHeader
        currentView={currentView}
        onNavigate={navigate}
        isAppFrameMode={isAppFrameMode}
        onToggleAppFrameMode={() => setIsAppFrameMode(!isAppFrameMode)}
        onOpenBackendConsole={() => setBackendConsoleOpen(true)}
        onOpenSearch={() => setQuickSearchOpen(true)}
      />

      {/* 2. Main Page Content (with bottom padding for mobile tab bar) */}
      <main className="flex-1 pb-16 sm:pb-8">
        {currentView === 'home' && (
          <HomePage onNavigate={navigate} />
        )}

        {currentView === 'shop' && (
          <ShopPage 
            initialParam={viewParam} 
            onNavigate={navigate} 
          />
        )}

        {currentView === 'product' && (
          <ProductDetailPage
            slug={viewParam || 'kashmiri-bangles-for-women'}
            onNavigate={navigate}
            onInstantBuy={() => navigate('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={openCart}
            onNavigateToShop={() => navigate('shop')}
          />
        )}

        {currentView === 'order-success' && lastOrder && (
          <OrderSuccessPage
            order={lastOrder}
            onTrackOrder={(num) => navigate('tracking', num)}
            onContinueShopping={() => navigate('shop')}
          />
        )}

        {currentView === 'tracking' && (
          <OrderTrackingPage
            initialOrderNumber={viewParam}
            onNavigateToShop={() => navigate('shop')}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            onNavigateToProduct={(slug) => navigate('product', slug)}
            onNavigateToShop={() => navigate('shop')}
          />
        )}

        {currentView === 'account' && (
          <CustomerAccountPage
            onNavigateToShop={() => navigate('shop')}
            onTrackOrder={(num) => navigate('tracking', num)}
            onOpenAdmin={() => navigate('admin')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage
            onBackToStore={() => navigate('home')}
          />
        )}

        {(currentView === 'shipping-info' || 
          currentView === 'returns' || 
          currentView === 'faq' || 
          currentView === 'privacy' || 
          currentView === 'terms' || 
          currentView === 'contact') && (
          <InfoPage
            type={currentView === 'terms' ? 'privacy' : (currentView as any)}
            onNavigateToShop={() => navigate('shop')}
          />
        )}
      </main>

      {/* 3. Global Footer (Hidden in Phone Frame mode for compact native app feel) */}
      {!isAppFrameMode && (
        <Footer onNavigate={navigate} />
      )}

      {/* 4. Native Mobile Bottom Tab Bar */}
      <MobileAppTabBar
        currentView={currentView}
        onNavigate={navigate}
        onOpenCategories={() => setCategorySheetOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* 5. Mobile Category Sheet */}
      <CategorySheet
        isOpen={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
        onSelectCategory={(catId) => {
          navigate('shop', catId);
        }}
      />

      {/* 6. Quick Mobile Search Modal */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onSelectProduct={(slug) => navigate('product', slug)}
        onViewAllResults={(query) => navigate('shop', query)}
      />

      {/* 7. Backend Architecture & API Console */}
      <BackendConsoleModal
        isOpen={backendConsoleOpen}
        onClose={() => setBackendConsoleOpen(false)}
      />

      {/* 8. Mini Cart Drawer */}
      <MiniCartDrawer onCheckout={() => navigate('checkout')} />

      {/* 9. Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      {/* 10. PWA Offline Indicator & Install Prompt */}
      <OfflineIndicator />
      <CookieBanner />
      <PWAInstallPrompt />

    </div>
  );

  return (
    <AppModeWrapper
      isAppFrameMode={isAppFrameMode}
      onToggleAppFrameMode={() => setIsAppFrameMode(!isAppFrameMode)}
    >
      {appInnerLayout}
    </AppModeWrapper>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}
