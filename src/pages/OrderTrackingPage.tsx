import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { api } from '../lib/api.js';
import type { Order, OrderStatus } from '../types.js';
import { useCurrency } from '../context/CurrencyContext.js';

interface OrderTrackingPageProps {
  initialOrderNumber?: string;
  onNavigateToShop: () => void;
}

const statusSteps: Array<{ key: OrderStatus; label: string }> = [
  { key: 'PENDING_PAYMENT', label: 'Order Placed' },
  { key: 'PAID', label: 'Payment Confirmed' },
  { key: 'PROCESSING', label: 'In Preparation' },
  { key: 'PACKED', label: 'Packed & Inspected' },
  { key: 'SHIPPED', label: 'Dispatched' },
  { key: 'DELIVERED', label: 'Delivered' }
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderNumber,
  onNavigateToShop
}) => {
  const { formatPrice } = useCurrency();
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber || 'ACC-2026-000101');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return request modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Change of mind / fit');
  const [returnSuccessMsg, setReturnSuccessMsg] = useState<string | null>(null);
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  const fetchOrder = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOrder(orderNum.trim());
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError('Order not found. Please check your order number.');
      }
    } catch (err: any) {
      setError(err.message || 'Order could not be located.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    } else {
      fetchOrder('ACC-2026-000101');
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      setReturnSubmitting(true);
      const res = await api.requestReturn(order.orderNumber, returnReason);
      if (res.success) {
        setReturnSuccessMsg(res.message);
        setTimeout(() => {
          setReturnModalOpen(false);
          fetchOrder(order.orderNumber);
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit return');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const currentStepIndex = order 
    ? statusSteps.findIndex(s => s.key === order.status)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* 1. Header & Lookup Bar */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="font-serif text-3xl font-bold text-zinc-950">
          Track Your Package
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Enter your order number to view real-time courier milestones and tracking credentials.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            type="text"
            required
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="e.g. ACC-2026-000101"
            className="flex-1 px-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-950"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 mb-8 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Order Status Ribbon */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-zinc-950">#{order.orderNumber}</span>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full uppercase">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} &bull; Carrier: {order.deliveryMethod.carrier}
              </p>
            </div>

            {order.trackingNumber ? (
              <div className="flex items-center gap-2">
                <div className="text-right text-xs">
                  <span className="text-zinc-500 block text-[11px]">Tracking Number:</span>
                  <span className="font-mono font-bold text-zinc-900">{order.trackingNumber}</span>
                </div>
                <a
                  href={`https://accessories.lt/track/${order.trackingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <span>Omniva Live</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <span className="text-xs text-zinc-500 italic">
                Tracking number generated upon courier handover
              </span>
            )}
          </div>

          {/* Visual Step Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-zinc-950 mb-8">
              Fulfillment Journey
            </h3>

            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-zinc-200 -z-0" />
              <div 
                className="hidden sm:block absolute top-5 left-8 h-0.5 bg-zinc-950 transition-all duration-500 -z-0" 
                style={{ width: `${Math.max(0, Math.min(100, (currentStepIndex / (statusSteps.length - 1)) * 100))}%` }}
              />

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 sm:gap-2">
                {statusSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isDone 
                          ? 'bg-zinc-950 text-white shadow-sm' 
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                      } ${isCurrent ? 'ring-4 ring-amber-300' : ''}`}>
                        {isDone ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>

                      <span className={`text-xs font-semibold mt-2.5 ${isDone ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tracking Log History */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
            <h4 className="font-serif text-base font-bold text-zinc-950 mb-4">
              Status Event History
            </h4>
            <div className="space-y-4">
              {order.statusHistory.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-xs border-l-2 border-zinc-950 pl-3 py-0.5">
                  <div className="flex-1">
                    <p className="font-bold text-zinc-900">{item.status}</p>
                    <p className="text-zinc-600 mt-0.5">{item.notes || 'Status updated by fulfillment system'}</p>
                    <span className="text-[11px] text-zinc-400 block mt-1">
                      {new Date(item.timestamp).toLocaleString()} &bull; By: {item.changedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory 14-Day EU Return Section */}
          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
                14-Day EU Statutory Right of Return
              </h4>
              <p className="text-xs text-zinc-500 mt-0.5">
                Need to return or exchange any items? We provide prepaid Omniva locker return labels.
              </p>
            </div>

            <button
              onClick={() => setReturnModalOpen(true)}
              className="px-5 py-2.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Return</span>
            </button>
          </div>

        </div>
      )}

      {/* Return Request Modal */}
      {returnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-900">
              Request Return for #{order?.orderNumber}
            </h3>

            {returnSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{returnSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Under EU consumer protection rules, you have 14 days to return unworn accessories in original packaging for a full refund.
                </p>

                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Reason for Return</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  >
                    <option value="Change of mind / styling">Change of mind / styling</option>
                    <option value="Different size / color wanted">Different size / color wanted</option>
                    <option value="Arrived damaged / defective">Arrived damaged / defective</option>
                    <option value="Incorrect item sent">Incorrect item sent</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setReturnModalOpen(false)}
                    className="px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={returnSubmitting}
                    className="px-5 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg"
                  >
                    {returnSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
