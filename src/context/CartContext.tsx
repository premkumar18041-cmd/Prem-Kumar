import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';
import type { Cart, CartItem } from '../types.js';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  refreshCart: () => Promise<void>;
  freeShippingQualified: boolean;
  freeShippingRemaining: number;
  toastMessage: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [freeShippingQualified, setFreeShippingQualified] = useState(false);
  const [freeShippingRemaining, setFreeShippingRemaining] = useState(40.0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.data) {
        setCart(res.data);
        setFreeShippingQualified(res.data.freeShippingQualified ?? false);
        setFreeShippingRemaining(res.data.freeShippingRemaining ?? 0);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1, variantId?: string) => {
    try {
      setLoading(true);
      const res = await api.addToCart(productId, quantity, variantId);
      if (res.success && res.data) {
        setCart(res.data);
        const item = res.data.items.find(i => i.productId === productId);
        showToast(`Added "${item ? item.productName : 'Item'}" to your bag`);
        setIsDrawerOpen(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not add item to bag');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await api.updateCartItem(itemId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not update item quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await api.removeCartItem(itemId);
      if (res.success && res.data) {
        setCart(res.data);
        showToast('Item removed from your bag');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not remove item');
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.applyCoupon(code);
      if (res.success && res.data) {
        setCart(res.data);
        showToast(res.message);
        return { success: true, message: res.message };
      }
      return { success: false, message: 'Could not apply coupon' };
    } catch (err: any) {
      const msg = err.message || 'Invalid coupon code';
      showToast(msg);
      return { success: false, message: msg };
    }
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        isDrawerOpen,
        setIsDrawerOpen,
        openCart: () => setIsDrawerOpen(true),
        closeCart: () => setIsDrawerOpen(false),
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        refreshCart,
        freeShippingQualified,
        freeShippingRemaining,
        toastMessage,
        clearToast: () => setToastMessage(null)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
