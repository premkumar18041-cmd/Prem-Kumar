export type RoleName = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'PRODUCT_MANAGER' 
  | 'ORDER_MANAGER' 
  | 'CUSTOMER_SUPPORT' 
  | 'MARKETING_MANAGER'
  | 'CUSTOMER'
  | 'super_admin'
  | 'admin'
  | 'product_manager'
  | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: RoleName;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Category {
  id: string;
  name: string;
  nameLt: string;
  slug: string;
  description: string;
  image: string;
  imageUrl?: string;
  productCount: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  nameLt?: string;
  attributes: Record<string, string>; // e.g. { color: "Gold", size: "M" }
  price: number; // in EUR
  salePrice?: number;
  stock: number;
  weightGrams?: number;
}

export interface Product {
  id: string;
  name: string;
  nameLt: string;
  slug: string;
  sku: string;
  description: string;
  descriptionLt: string;
  shortDescription?: string;
  price: number; // base price in EUR
  salePrice?: number;
  currency: string; // 'EUR'
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  images: string[];
  attributes: {
    material?: string;
    dimensions?: string;
    weight?: string;
    origin?: string;
    style?: string;
    colors?: string[];
    sizes?: string[];
  };
  variants: ProductVariant[];
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId?: string;
  variantLabel?: string;
  sku: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  quantity: number;
  maxStock?: number;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  freeShippingThreshold: number;
  freeShippingQualified?: boolean;
  freeShippingRemaining?: number;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  value: number; // e.g. 10 for 10% or 5 for €5
  discountValue?: number;
  minOrder: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  timesUsed?: number;
  isActive: boolean;
  description?: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'credit_card' | 'bank_link_sepa' | 'apple_pay' | 'cash_on_delivery';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  sku: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  changedBy: string;
  timestamp: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ACC-2026-000101
  userId?: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryMethod: {
    id: string;
    name: string;
    carrier: string;
    price: number;
    estimatedDelivery: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  performedBy?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
  ip?: string;
  timestamp: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId?: string;
  sessionId: string;
  payload: Record<string, any>;
  timestamp: string;
}

export interface ShippingMethod {
  id: string;
  carrier: string;
  name: string;
  nameLt: string;
  price: number;
  freeAbove: number;
  estimatedDelivery: string;
  countries: string[];
}
