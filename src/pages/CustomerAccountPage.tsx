import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  Clock, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  ExternalLink,
  Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCurrency } from '../context/CurrencyContext.js';
import { api } from '../lib/api.js';
import type { Order } from '../types.js';

interface CustomerAccountPageProps {
  onNavigateToShop: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onOpenAdmin: () => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({
  onNavigateToShop,
  onTrackOrder,
  onOpenAdmin
}) => {
  const { user, logout } = useAuth();
  const { formatPrice } = useCurrency();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  useEffect(() => {
    async function loadMyOrders() {
      try {
        setLoading(true);
        const res = await api.getMyOrders();
        if (res.success) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMyOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-zinc-900">Sign in to your account</h2>
        <p className="text-xs text-zinc-500">Please sign in to view your order history and saved preferences.</p>
        <button
          onClick={onNavigateToShop}
          className="px-6 py-2.5 bg-zinc-950 text-white text-xs font-semibold rounded-full hover:bg-zinc-800"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const roleStr = String(user.role).toLowerCase();
  const isAdminOrManager = roleStr.includes('admin') || roleStr.includes('manager');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* 1. Header with Role & Sign Out */}
      <div className="pb-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-zinc-950">
              My Account
            </h1>
            <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 rounded-full text-[11px] font-bold uppercase tracking-wider">
              {user.role.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Welcome back, {user.name} ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdminOrManager && (
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Enter Admin Portal &rarr;
            </button>
          )}

          <button
            onClick={logout}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex gap-2 border-b border-zinc-100 my-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'orders' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Orders History ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'addresses' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Saved Addresses
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-100 rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
              <Package className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-zinc-900">No Orders Found</h3>
              <p className="text-xs text-zinc-500">You haven't placed any orders with this account yet.</p>
              <button
                onClick={onNavigateToShop}
                className="mt-2 px-5 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-full hover:bg-zinc-800 cursor-pointer"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-zinc-950">
                      #{order.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full uppercase">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} &bull; {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                  <p className="text-xs font-semibold text-zinc-900">
                    Total: {formatPrice(order.total)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTrackOrder(order.orderNumber)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track & Milestones</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 max-w-xl space-y-4">
          <h3 className="font-serif text-lg font-bold text-zinc-900">Profile Details</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-zinc-500 block">Full Name:</span>
              <span className="font-medium text-zinc-900 text-sm">{user.name}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Email Address:</span>
              <span className="font-medium text-zinc-900 text-sm">{user.email}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Role & Permissions:</span>
              <span className="font-medium text-zinc-900 capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 max-w-xl space-y-4">
          <h3 className="font-serif text-lg font-bold text-zinc-900">Primary Baltic Delivery Address</h3>
          <div className="p-4 bg-zinc-50 rounded-xl text-xs space-y-1 text-zinc-700">
            <p className="font-bold text-zinc-900">{user.name}</p>
            <p>Gedimino pr. 12, Apt 4B</p>
            <p>LT-01103 Vilnius, Lithuania</p>
            <p className="text-zinc-500 pt-1">Phone: {user.phone || '+370 600 00000'}</p>
          </div>
        </div>
      )}

    </div>
  );
};
