import type { 
  Product, 
  Category, 
  Cart, 
  Order, 
  Coupon, 
  ShippingMethod, 
  AuditLog 
} from '../types.js';

// Get or create persistent session ID for guest carts
export function getSessionId(): string {
  let sid = localStorage.getItem('iver_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
    localStorage.setItem('iver_session_id', sid);
  }
  return sid;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('iver_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('iver_auth_token', token);
  } else {
    localStorage.removeItem('iver_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('x-session-id', getSessionId());
  
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}

export const api = {
  // Products
  async getProducts(params: {
    category?: string;
    q?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
  } = {}): Promise<{ success: boolean; data: Product[]; total: number }> {
    const qry = new URLSearchParams();
    if (params.category) qry.set('category', params.category);
    if (params.q) qry.set('q', params.q);
    if (params.sort) qry.set('sort', params.sort);
    if (params.minPrice !== undefined) qry.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) qry.set('maxPrice', params.maxPrice.toString());
    if (params.inStock) qry.set('inStock', 'true');
    if (params.featured) qry.set('featured', 'true');

    return request(`/api/products?${qry.toString()}`);
  },

  async getProduct(identifier: string): Promise<{ success: boolean; data: Product & { reviews: any[]; relatedProducts: Product[] } }> {
    return request(`/api/products/${encodeURIComponent(identifier)}`);
  },

  async getSearchSuggestions(q: string): Promise<{ success: boolean; popular: string[]; suggestions: any[] }> {
    return request(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
  },

  // Categories
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return request('/api/categories');
  },

  // Cart
  async getCart(): Promise<{ success: boolean; data: Cart & { freeShippingQualified: boolean; freeShippingRemaining: number; couponApplied?: any } }> {
    return request('/api/cart');
  },

  async addToCart(productId: string, quantity = 1, variantId?: string): Promise<{ success: boolean; data: Cart }> {
    return request('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity })
    });
  },

  async updateCartItem(itemId: string, quantity: number): Promise<{ success: boolean; data: Cart }> {
    return request(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    });
  },

  async removeCartItem(itemId: string): Promise<{ success: boolean; data: Cart }> {
    return request(`/api/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  },

  async applyCoupon(code: string): Promise<{ success: boolean; data: Cart; message: string }> {
    return request('/api/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },

  async validateCoupon(code: string, subtotal = 0): Promise<{ success: boolean; data: Coupon }> {
    return request('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });
  },

  // Shipping
  async getShippingMethods(): Promise<{ success: boolean; data: ShippingMethod[] }> {
    return request('/api/shipping-methods');
  },

  // Checkout
  async checkout(payload: {
    customer: { firstName: string; lastName: string; email: string; phone?: string };
    shippingAddress: { addressLine1: string; addressLine2?: string; city: string; postalCode: string; country: string };
    deliveryMethodId: string;
    paymentMethod: string;
    couponCode?: string;
    items: Array<{ productId: string; quantity: number; variantLabel?: string }>;
  }): Promise<{ success: boolean; data: Order; message: string }> {
    return request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Order tracking
  async getOrder(orderNumber: string): Promise<{ success: boolean; data: Order }> {
    return request(`/api/orders/${encodeURIComponent(orderNumber)}`);
  },

  async requestReturn(orderNumber: string, reason: string): Promise<{ success: boolean; message: string }> {
    return request(`/api/orders/${encodeURIComponent(orderNumber)}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Reviews
  async submitReview(payload: { productId: string; rating: number; title: string; comment: string; customerName?: string }): Promise<{ success: boolean; data?: any }> {
    return request<{ success: boolean; data?: any }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Auth
  async register(body: { email: string; password: string; name: string; phone?: string }) {
    return request<{ success: boolean; token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async login(body: { email: string; password: string }) {
    return request<{ success: boolean; token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async getMe() {
    return request<{ success: boolean; user: any }>('/api/auth/me');
  },

  async getMyOrders() {
    return request<{ success: boolean; data: Order[] }>('/api/me/orders');
  },

  // Admin
  async getAdminDashboard() {
    return request<{ success: boolean; data: any }>('/api/admin/dashboard');
  },

  async getAdminProducts() {
    return request<{ success: boolean; data: Product[] }>('/api/admin/products');
  },

  async createAdminProduct(product: Partial<Product>) {
    return request<{ success: boolean; data: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  },

  async updateAdminProduct(id: string, product: Partial<Product>) {
    return request<{ success: boolean; data: Product }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  },

  async deleteAdminProduct(id: string) {
    return request<{ success: boolean; message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminOrders() {
    return request<{ success: boolean; data: Order[] }>('/api/admin/orders');
  },

  async updateAdminOrderStatus(orderId: string, status: string, trackingNumber?: string, notes?: string) {
    return request<{ success: boolean; data: Order }>(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, trackingNumber, notes })
    });
  },

  async getAdminCoupons() {
    return request<{ success: boolean; data: Coupon[] }>('/api/admin/coupons');
  },

  async createAdminCoupon(coupon: any) {
    return request<{ success: boolean; data: Coupon }>('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon)
    });
  },

  async deleteAdminCoupon(code: string) {
    return request<{ success: boolean; message: string }>(`/api/admin/coupons/${code}`, {
      method: 'DELETE'
    });
  },

  async getAdminAuditLogs() {
    return request<{ success: boolean; data: AuditLog[] }>('/api/admin/audit-logs');
  },

  async getAdminNotifications() {
    return request<{ success: boolean; data: any[] }>('/api/admin/notifications');
  },

  // Convenience Aliases for Admin Panel
  async getAllOrders() {
    return this.getAdminOrders();
  },

  async getCoupons() {
    return this.getAdminCoupons();
  },

  async getAuditLogs() {
    return this.getAdminAuditLogs();
  },

  async getSentNotifications() {
    return this.getAdminNotifications();
  },

  async updateOrderStatus(orderNumber: string, status: string, notes?: string, trackingNumber?: string) {
    return this.updateAdminOrderStatus(orderNumber, status, trackingNumber, notes);
  },

  async createProduct(product: Partial<Product>) {
    return this.createAdminProduct(product);
  },

  async deleteProduct(id: string) {
    return this.deleteAdminProduct(id);
  },

  async createCoupon(coupon: any) {
    return this.createAdminCoupon(coupon);
  },

  async deleteCoupon(idOrCode: string) {
    return this.deleteAdminCoupon(idOrCode);
  },

  // Analytics event tracker
  logEvent(eventName: string, payload: Record<string, any> = {}) {
    try {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId()
        },
        body: JSON.stringify({ eventName, payload })
      }).catch(() => {});
    } catch {}
  }
};
