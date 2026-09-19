import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle,
  Tag,
  Building2,
  Banknote
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useCurrency } from '../context/CurrencyContext.js';
import { api } from '../lib/api.js';
import type { ShippingMethod, Order } from '../types.js';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onBackToCart: () => void;
  onNavigateToShop: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onBackToCart,
  onNavigateToShop
}) => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { formatPrice, t } = useCurrency();

  // Form Fields
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user?.name ? user.name.split(' ').slice(1).join(' ') : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+370 600 00000');

  const [addressLine1, setAddressLine1] = useState('Gedimino pr. 12');
  const [addressLine2, setAddressLine2] = useState('Apt 4B');
  const [city, setCity] = useState('Vilnius');
  const [postalCode, setPostalCode] = useState('LT-01103');
  const [country, setCountry] = useState('Lithuania');

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('ship-omniva');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [selectedBank, setSelectedBank] = useState<string>('swedbank');

  // Credit Card Fields
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('321');

  // Coupon
  const [couponCode, setCouponCode] = useState(cart?.couponCode || '');
  const [couponError, setCouponError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getShippingMethods().then(res => {
      if (res.success && res.data.length > 0) {
        setShippingMethods(res.data);
      }
    }).catch(console.error);
  }, []);

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-zinc-900">Your bag is empty</h2>
        <p className="text-xs text-zinc-500">Please add items from the catalog before proceeding to checkout.</p>
        <button
          onClick={onNavigateToShop}
          className="px-6 py-2.5 bg-zinc-950 text-white text-xs font-semibold rounded-full hover:bg-zinc-800"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  // Calculate live shipping cost
  const selectedShipping = shippingMethods.find(s => s.id === selectedShippingId) || shippingMethods[0];
  const isFreeShipping = (cart?.subtotal || 0) >= (selectedShipping?.freeAbove || 40.0);
  const currentShippingCost = isFreeShipping ? 0 : (selectedShipping?.price || 2.99);
  const finalTotal = Math.max(0, (cart?.subtotal || 0) - (cart?.discount || 0) + currentShippingCost);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage('Please fill in all required shipping and contact details.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.checkout({
        customer: { firstName, lastName, email, phone },
        shippingAddress: { addressLine1, addressLine2, city, postalCode, country },
        deliveryMethodId: selectedShippingId,
        paymentMethod,
        couponCode: cart?.couponCode || undefined,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, variantLabel: i.variantLabel }))
      });

      if (res.success && res.data) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        await refreshCart();
        onOrderSuccess(res.data);
      } else {
        setErrorMessage(res.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment or checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToCart}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Bag</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Form: Customer Details, Address, Shipping, Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Contact Information */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-950">
              1. Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Phone Number (For SMS Tracking) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-950">
              2. Delivery Address
            </h3>

            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Gedimino pr. 12"
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="LT-01103"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Country *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
                >
                  <option value="Lithuania">Lithuania</option>
                  <option value="Latvia">Latvia</option>
                  <option value="Estonia">Estonia</option>
                  <option value="Poland">Poland</option>
                  <option value="Germany">Germany</option>
                  <option value="Other EU">Other EU Country</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Shipping Method */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-950">
              3. Delivery Carrier
            </h3>

            <div className="space-y-2.5">
              {shippingMethods.map((method) => {
                const methodFree = (cart?.subtotal || 0) >= method.freeAbove;
                const cost = methodFree ? 0 : method.price;

                return (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedShippingId === method.id
                        ? 'border-zinc-950 bg-zinc-50/70 shadow-xs ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={selectedShippingId === method.id}
                        onChange={() => setSelectedShippingId(method.id)}
                        className="text-zinc-950 focus:ring-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{method.name}</p>
                        <p className="text-[11px] text-zinc-500">{method.estimatedDelivery} &bull; {method.carrier}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold ${methodFree ? 'text-emerald-700' : 'text-zinc-900'}`}>
                        {methodFree ? 'FREE' : formatPrice(cost)}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-950">
              4. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-zinc-950 bg-zinc-50 font-bold ring-1 ring-zinc-950'
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  className="sr-only"
                  checked={paymentMethod === 'credit_card'}
                  onChange={() => setPaymentMethod('credit_card')}
                />
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-zinc-800" />
                <span className="text-xs block">Card (Visa/MC)</span>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'sepa_banklink'
                    ? 'border-zinc-950 bg-zinc-50 font-bold ring-1 ring-zinc-950'
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  className="sr-only"
                  checked={paymentMethod === 'sepa_banklink'}
                  onChange={() => setPaymentMethod('sepa_banklink')}
                />
                <Building2 className="w-5 h-5 mx-auto mb-1 text-zinc-800" />
                <span className="text-xs block">SEPA Banklink</span>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer text-center transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-zinc-950 bg-zinc-50 font-bold ring-1 ring-zinc-950'
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  className="sr-only"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                />
                <Banknote className="w-5 h-5 mx-auto mb-1 text-zinc-800" />
                <span className="text-xs block">Pay on Delivery</span>
              </label>
            </div>

            {/* SEPA Bank Selection */}
            {paymentMethod === 'sepa_banklink' && (
              <div className="pt-3 border-t border-zinc-100">
                <span className="text-xs font-semibold text-zinc-700 block mb-2">Select Your Bank:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['swedbank', 'seb', 'luminor', 'revolut'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 rounded-lg border text-xs font-bold capitalize transition-all ${
                        selectedBank === bank
                          ? 'border-zinc-950 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Credit Card Simulation */}
            {paymentMethod === 'credit_card' && (
              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm sticky top-24 space-y-6">
            <h3 className="font-serif text-lg font-bold text-zinc-950 pb-3 border-b border-zinc-100">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            {/* Item List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 items-center">
                  <img
                    src={i.productImage}
                    alt={i.productName}
                    className="w-14 h-14 object-cover rounded-lg bg-zinc-50 border border-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 truncate">{i.productName}</p>
                    <p className="text-[11px] text-zinc-500">Qty: {i.quantity} &bull; {formatPrice(i.price)} each</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-900 shrink-0">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Ribbon */}
            <div className="pt-4 border-t border-zinc-100">
              {cart?.couponCode ? (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Coupon: <strong>{cart.couponCode}</strong>
                  </span>
                  <span className="text-emerald-700 font-bold">-{formatPrice(cart.discount)}</span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 italic">
                  Have a promo code? (e.g. <strong>WELCOME10</strong> for 10% off)
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-zinc-600 pt-4 border-t border-zinc-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900">{formatPrice(cart?.subtotal || 0)}</span>
              </div>

              {(cart?.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(cart?.discount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery ({selectedShipping?.name || 'Standard'})</span>
                <span className={`font-semibold ${isFreeShipping ? 'text-emerald-700' : 'text-zinc-900'}`}>
                  {isFreeShipping ? 'FREE' : formatPrice(currentShippingCost)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Includes 21% Lithuanian VAT</span>
                <span>{formatPrice(cart?.tax || 0)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-zinc-950 pt-3 border-t border-zinc-200">
                <span>Total Amount Due</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Order Submission CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-900 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{submitting ? 'Confirming Order...' : `Pay ${formatPrice(finalTotal)}`}</span>
            </button>

            <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
              By confirming, you agree to Accessories.lt Terms & Conditions and 14-day statutory return rights.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
};
