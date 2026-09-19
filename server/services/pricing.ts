// Central Pricing Service with decimal-safe calculations
export interface CartCalculationResult {
  subtotal: number;
  discount: number;
  couponApplied?: {
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    value: number;
    amountSaved: number;
  };
  shipping: number;
  freeShippingQualified: boolean;
  freeShippingRemaining: number;
  tax: number; // 21% VAT standard EU included
  total: number;
  currency: string;
}

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateCartTotals(
  items: Array<{ price: number; quantity: number }>,
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    value: number;
    minOrder: number;
    maxDiscount?: number;
    isActive: boolean;
  } | null,
  shippingCost: number = 2.99,
  freeShippingThreshold: number = 40.00
): CartCalculationResult {
  const subtotal = roundMoney(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

  let discount = 0;
  let couponApplied: CartCalculationResult['couponApplied'] = undefined;

  if (coupon && coupon.isActive && subtotal >= coupon.minOrder) {
    if (coupon.discountType === 'percentage') {
      let calcDiscount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && calcDiscount > coupon.maxDiscount) {
        calcDiscount = coupon.maxDiscount;
      }
      discount = roundMoney(calcDiscount);
    } else if (coupon.discountType === 'fixed_amount') {
      discount = roundMoney(Math.min(coupon.value, subtotal));
    }

    couponApplied = {
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      amountSaved: discount
    };
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const freeShippingQualified = subtotal >= freeShippingThreshold;
  const effectiveShipping = items.length === 0 ? 0 : freeShippingQualified ? 0 : shippingCost;
  const freeShippingRemaining = Math.max(0, roundMoney(freeShippingThreshold - subtotal));

  // European VAT (21% Lithuania rate calculated within standard consumer prices)
  const total = roundMoney(discountedSubtotal + effectiveShipping);
  const tax = roundMoney(total - total / 1.21);

  return {
    subtotal,
    discount,
    couponApplied,
    shipping: effectiveShipping,
    freeShippingQualified,
    freeShippingRemaining,
    tax,
    total,
    currency: 'EUR'
  };
}
