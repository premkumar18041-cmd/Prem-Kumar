import React from 'react';
import { CheckCircle2, Package, Truck, ArrowRight, Printer, ShieldCheck } from 'lucide-react';
import type { Order } from '../types.js';
import { useCurrency } from '../context/CurrencyContext.js';

interface OrderSuccessPageProps {
  order: Order;
  onTrackOrder: (orderNumber: string) => void;
  onContinueShopping: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  onTrackOrder,
  onContinueShopping
}) => {
  const { formatPrice } = useCurrency();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* 1. Header Banner */}
      <div className="text-center mb-10 space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-950">
          Thank you for your order!
        </h1>
        <p className="text-sm text-zinc-600 max-w-md mx-auto">
          We have received order <strong className="text-zinc-950 font-mono">#{order.orderNumber}</strong>. 
          A confirmation and tracking invoice have been sent to <strong>{order.customerEmail}</strong>.
        </p>
      </div>

      {/* 2. Order Summary Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
        
        {/* Status ribbon */}
        <div className="bg-zinc-950 text-white p-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
              Order Status: {order.status}
            </span>
            <p className="font-mono text-xl font-bold mt-0.5">#{order.orderNumber}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={() => onTrackOrder(order.orderNumber)}
              className="px-4 py-2 bg-amber-300 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Delivery</span>
            </button>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-600 border-b border-zinc-100 pb-6">
            <div>
              <span className="font-bold text-zinc-900 block mb-1">Customer:</span>
              <p>{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block mb-1">Shipping To:</span>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block mb-1">Delivery & Payment:</span>
              <p>{order.deliveryMethod.name} ({order.deliveryMethod.carrier})</p>
              <p className="text-zinc-500">Est. delivery: {order.deliveryMethod.estimatedDelivery}</p>
              <p className="capitalize mt-1">Payment: {order.paymentMethod.replace(/_/g, ' ')}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider mb-4">
              Items Ordered
            </h4>
            <div className="divide-y divide-zinc-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded-lg bg-zinc-50 border border-zinc-100"
                    />
                    <div>
                      <h5 className="text-xs font-semibold text-zinc-900">{item.productName}</h5>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        SKU: {item.sku} {item.variantLabel ? `| ${item.variantLabel}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-zinc-900">{formatPrice(item.totalPrice)}</span>
                    <span className="text-[11px] text-zinc-400 block">
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-zinc-200 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-zinc-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({order.deliveryMethod.carrier}):</span>
                <span className="font-semibold text-zinc-900">{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Includes 21% Lithuanian VAT:</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                <span>Total Paid:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onContinueShopping}
          className="px-8 py-3 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-full flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
