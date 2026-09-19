import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Truck, 
  CheckCircle, 
  Tag, 
  ShieldAlert, 
  Mail, 
  Clock, 
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useCurrency } from '../context/CurrencyContext.js';
import type { Order, Product, Coupon, AuditLog, OrderStatus } from '../types.js';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { user, quickLogin } = useAuth();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'coupons' | 'logs' | 'notifications'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status update modal / inline
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PROCESSING');
  const [statusNotes, setStatusNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // New Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('jewelry');
  const [newProdPrice, setNewProdPrice] = useState(25);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdImage, setNewProdImage] = useState('https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg');

  // New Coupon Modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(30);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [ordRes, prodRes, coupRes, logRes, notifRes] = await Promise.all([
        api.getAllOrders(),
        api.getProducts(),
        api.getCoupons(),
        api.getAuditLogs(),
        api.getSentNotifications()
      ]);

      if (ordRes.success) setOrders(ordRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (coupRes.success) setCoupons(coupRes.data);
      if (logRes.success) setAuditLogs(logRes.data);
      if (notifRes.success) setNotifications(notifRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [user]);

  // If not admin, provide 1-click elevation button
  const roleStr = String(user?.role || '').toLowerCase();
  const isAdmin = Boolean(user && (roleStr.includes('admin') || roleStr.includes('manager')));

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-zinc-900">Admin Permissions Required</h2>
        <p className="text-xs text-zinc-500">
          The administrative control panel is restricted to Accessories.lt store managers and administrators.
        </p>
        <div className="pt-2">
          <button
            onClick={() => quickLogin('super_admin')}
            className="px-6 py-2.5 bg-zinc-950 text-amber-300 text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-md cursor-pointer"
          >
            Switch to Super Admin (1-Click Demo)
          </button>
        </div>
      </div>
    );
  }

  // KPIs
  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED' && o.status !== 'PENDING_PAYMENT')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const lowStockCount = products.filter(p => p.stock < 20).length;

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await api.updateOrderStatus(selectedOrder.orderNumber, newStatus, statusNotes, trackingNumber || undefined);
      setSelectedOrder(null);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProduct({
        name: newProdName,
        categorySlug: newProdCategory,
        categoryName: newProdCategory === 'jewelry' ? 'Jewelry & Bangles' : 'Bags & Totes',
        price: Number(newProdPrice),
        stock: Number(newProdStock),
        images: [newProdImage],
        description: `${newProdName} - Artisanal accessory stocked at Accessories.lt Vilnius hub.`
      });
      setProductModalOpen(false);
      setNewProdName('');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this product from the live catalog?')) {
      try {
        await api.deleteProduct(id);
        loadAllAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code: newCouponCode.toUpperCase().trim(),
        discountType: newCouponType,
        discountValue: Number(newCouponValue),
        minOrderAmount: Number(newCouponMinOrder)
      });
      setCouponModalOpen(false);
      setNewCouponCode('');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await api.deleteCoupon(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Header Bar */}
      <div className="pb-6 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-zinc-950">
              Accessories.lt Operations Hub
            </h1>
            <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-900 rounded-full text-[10px] font-mono font-bold uppercase">
              Admin &bull; {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllAdminData}
            className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold rounded-lg text-zinc-800 transition-colors cursor-pointer"
          >
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Gross Revenue</span>
          <p className="font-serif text-2xl font-bold text-zinc-950 mt-1">{formatPrice(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Includes 21% Lithuanian VAT</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Orders</span>
          <p className="font-serif text-2xl font-bold text-zinc-950 mt-1">{totalOrders}</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Live across Baltics & EU</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Catalog SKUs</span>
          <p className="font-serif text-2xl font-bold text-zinc-950 mt-1">{products.length}</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Bangles, Totes & Jewelry</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Low Stock SKUs (&lt;20)</span>
          <p className="font-serif text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
          <span className="text-[11px] text-amber-700 mt-1 block">Requires supplier reorder</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'orders' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Orders & Fulfillment ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'products' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Products Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'coupons' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Promotional Coupons ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'notifications' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Email Queue Log ({notifications.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
            activeTab === 'logs' ? 'border-zinc-950 text-zinc-950' : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* 4. Tab Panels */}
      
      {/* Orders Panel */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-zinc-900">
              Customer Orders
            </h3>
            <span className="text-xs text-zinc-500">Live order processing</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-200">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Carrier</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tracking</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50/50">
                    <td className="p-4 font-mono font-bold text-zinc-900">#{ord.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-zinc-900">{ord.customerName}</p>
                      <p className="text-[11px] text-zinc-400">{ord.customerEmail}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-zinc-800">{ord.deliveryMethod.carrier}</span>
                      <span className="text-[11px] text-zinc-400 block">{ord.shippingAddress.city}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full uppercase">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      {ord.trackingNumber || <span className="text-zinc-400 italic">None</span>}
                    </td>
                    <td className="p-4 font-bold text-zinc-900">{formatPrice(ord.total)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.status);
                          setTrackingNumber(ord.trackingNumber || '');
                        }}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold rounded-lg cursor-pointer"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Panel */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-zinc-900">Products Catalog</h3>
            <button
              onClick={() => setProductModalOpen(true)}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Accessory</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-200">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg bg-zinc-100" />
                      <span className="font-semibold text-zinc-900 line-clamp-1">{p.name}</span>
                    </td>
                    <td className="p-4 font-mono text-[11px]">{p.sku}</td>
                    <td className="p-4 capitalize">{p.categoryName}</td>
                    <td className="p-4 font-bold text-zinc-900">{formatPrice(p.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        p.stock < 20 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Coupons Panel */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-zinc-900">Discount Coupons</h3>
            <button
              onClick={() => setCouponModalOpen(true)}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="p-5 bg-white border border-zinc-200 rounded-2xl flex justify-between items-start shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-zinc-950">{c.code}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    {c.discountType === 'percentage' 
                      ? `${c.discountValue ?? c.value}% Off` 
                      : `${formatPrice(c.discountValue ?? c.value)} Off`}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Min. order: {formatPrice(c.minOrderAmount ?? c.minOrder ?? 0)} &bull; Used {c.timesUsed ?? c.usageCount ?? 0} times
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCoupon(c.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Queue Panel */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-100">
            <h3 className="font-serif text-lg font-bold text-zinc-900">
              Outgoing Email Notification Queue
            </h3>
            <p className="text-xs text-zinc-500">
              Mock transactional email engine with templates for orders, shipments, and registrations
            </p>
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">{n.subject}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {new Date(n.sentAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-zinc-600">To: <strong>{n.to}</strong> ({n.type})</p>
                <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-700 text-[11px] font-mono whitespace-pre-line mt-2">
                  {n.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Panel */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-100">
            <h3 className="font-serif text-lg font-bold text-zinc-900">Administrative Audit Trail</h3>
            <p className="text-xs text-zinc-500">Immutable logging of operational events</p>
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-zinc-900 uppercase font-mono text-[11px] tracking-wider">
                    [{log.action}]
                  </span>
                  <span className="text-zinc-600 ml-2 font-medium">
                    {log.details ? JSON.stringify(log.details) : 'No details'}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">By: {log.performedBy || log.userEmail || log.userId || 'System'}</p>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-900">
              Update Order #{selectedOrder.orderNumber}
            </h3>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                >
                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                  <option value="PAID">PAID</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Carrier Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. CE123456789LT (Omniva)"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Status Notes</label>
                <input
                  type="text"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Handed over to Omniva courier"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg"
                >
                  Save & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-900">
              Add New Accessory SKU
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Bohemian Enamel Choker"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  >
                    <option value="jewelry">Jewelry & Bangles</option>
                    <option value="bags">Bags & Totes</option>
                    <option value="wallets-belts">Wallets & Belts</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Initial Stock</label>
                <input
                  type="number"
                  required
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-900">
              Create Promotional Coupon
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="e.g. SUMMER20"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Minimum Order (€)</label>
                <input
                  type="number"
                  value={newCouponMinOrder}
                  onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
