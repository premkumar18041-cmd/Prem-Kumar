import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag, 
  Lock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useCurrency } from '../context/CurrencyContext.js';

interface MiniCartDrawerProps {
  onNavigateToCheckout?: () => void;
  onNavigateToShop?: () => void;
  onCheckout?: () => void;
}

export const MiniCartDrawer: React.FC<MiniCartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToShop,
  onCheckout
}) => {
  const handleCheckout = onCheckout || onNavigateToCheckout || (() => {});
  const { 
    cart, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    updateQuantity, 
    removeItem, 
    applyCoupon,
    freeShippingQualified,
    freeShippingRemaining
  } = useCart();
  const { formatPrice, t } = useCurrency();

  const [couponInput, setCouponInput] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isDrawerOpen) return null;

  const items = cart?.items || [];
  const threshold = 40.0;
  const progressPercent = Math.min(100, Math.round(((cart?.subtotal || 0) / threshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      setCouponSubmitting(true);
      const res = await applyCoupon(couponInput.trim());
      setCouponMessage({ text: res.message, isError: !res.success });
      if (res.success) setCouponInput('');
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await applyCoupon('');
    setCouponMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-950" />
                <h2 className="font-serif text-lg font-bold text-zinc-950">
                  Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1 text-zinc-800">
                  <Truck className="w-3.5 h-3.5 text-amber-700" />
                  {freeShippingQualified 
                    ? t('freeShippingNotice') 
                    : t('freeShippingRemaining').replace('{amount}', formatPrice(freeShippingRemaining))}
                </span>
                <span className="text-[11px] font-semibold text-zinc-500">{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${freeShippingQualified ? 'bg-emerald-600' : 'bg-amber-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">Your bag is currently empty</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Discover our handcrafted Kashmiri bangles, earrings, and structured bags.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigateToShop?.();
                  }}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-full transition-colors"
                >
                  Explore The Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-3 bg-white border border-zinc-100 rounded-xl hover:border-zinc-200 transition-colors"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg bg-zinc-50 shrink-0 border border-zinc-100"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-zinc-900 line-clamp-2 leading-tight">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.variantLabel && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">{item.variantLabel}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-zinc-200 rounded-md bg-zinc-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-200 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-zinc-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-200 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-zinc-950">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-zinc-400 block">
                            {formatPrice(item.price)} each
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with totals and checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-4">
              
              {/* Coupon Form */}
              <div>
                {cart?.couponCode ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Coupon: <strong>{cart.couponCode}</strong> (-{formatPrice(cart.discount)})
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code (e.g. WELCOME10)"
                      className="flex-1 px-3 py-2 bg-white text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950 uppercase placeholder:normal-case"
                    />
                    <button
                      type="submit"
                      disabled={couponSubmitting || !couponInput.trim()}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <div className={`flex items-center gap-1 text-[11px] mt-1.5 ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {couponMessage.isError ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{couponMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-600 pt-2 border-t border-zinc-200">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(cart?.subtotal || 0)}</span>
                </div>
                {(cart?.discount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{t('discount')}</span>
                    <span>-{formatPrice(cart?.discount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-zinc-900">
                    {freeShippingQualified ? 'FREE' : formatPrice(2.99)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>Includes 21% Lithuanian VAT</span>
                  <span>{formatPrice(cart?.tax || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>{t('total')}</span>
                  <span>{formatPrice(cart?.total || 0)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  handleCheckout();
                }}
                className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-900 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>{t('checkout')} &bull; {formatPrice(cart?.total || 0)}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400 text-center">
                <span>SEPA Banklink</span>
                <span>&bull;</span>
                <span>Visa / Mastercard</span>
                <span>&bull;</span>
                <span>Apple Pay</span>
                <span>&bull;</span>
                <span>COD</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
