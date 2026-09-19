import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { calculateCartTotals } from '../services/pricing.js';
import { hashPassword, createToken, getUserByToken, checkPermission } from '../services/auth.js';
import { sendWelcomeEmail, sendOrderConfirmationEmail, sendShippingUpdateEmail } from '../services/notifications.js';
import { redisCache } from '../services/cache.js';
import { backgroundQueue } from '../services/queue.js';
import { paymentService } from '../services/payment.js';
import { shippingService } from '../services/shipping.js';
import { inventoryService } from '../services/inventory.js';
import { GdprService } from '../services/gdpr.js';
import { openApiSpec } from '../openapi.js';
import type { CartItem, Order, OrderStatus, Product, Review } from '../../src/types.js';

export const v1Router = Router();

// Session helper
const getSessionId = (req: Request): string => {
  return (req.headers['x-session-id'] as string) || 'guest-session-default';
};

// Auth helper
const getAuthUser = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return getUserByToken(token);
};

// Admin RBAC middleware
const requireAdmin = (req: Request, res: Response, next: () => void) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  const allowed = ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'MARKETING_MANAGER'];
  if (!checkPermission(user.role, allowed as any)) {
    return res.status(403).json({ success: false, error: 'Insufficient permissions' });
  }
  (req as any).user = user;
  next();
};

// ==========================================
// 1. PRODUCTS & CATEGORIES
// ==========================================

v1Router.get('/products', (req: Request, res: Response) => {
  const { category, q, sort, minPrice, maxPrice, inStock, limit = '50', offset = '0' } = req.query;
  const cacheKey = `products:${category || 'all'}:${q || ''}:${sort || 'default'}:${minPrice || '0'}:${maxPrice || 'max'}:${inStock || 'all'}`;

  const cached = redisCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let results = Array.from(db.products.values());

  if (category && category !== 'all') {
    results = results.filter(p => p.categoryId === category || p.categoryName.toLowerCase() === (category as string).toLowerCase());
  }

  if (q) {
    const query = (q as string).toLowerCase().trim();
    results = results.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.categoryName.toLowerCase().includes(query)
    );
  }

  if (minPrice) {
    results = results.filter(p => (p.salePrice ?? p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter(p => (p.salePrice ?? p.price) <= Number(maxPrice));
  }
  if (inStock === 'true') {
    results = results.filter(p => p.stock > 0);
  }

  // Sorting
  if (sort === 'price-low') {
    results.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (sort === 'price-high') {
    results.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    results.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
  } else if (sort === 'best-selling') {
    results.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
  }

  const total = results.length;
  const paged = results.slice(Number(offset), Number(offset) + Number(limit));

  const responsePayload = {
    success: true,
    data: paged,
    total,
    limit: Number(limit),
    offset: Number(offset)
  };

  // Cache for 60 seconds
  redisCache.set(cacheKey, responsePayload, 60);

  res.json(responsePayload);
});

v1Router.get('/products/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const cacheKey = `product:${slug}`;

  const cached = redisCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const product = Array.from(db.products.values()).find(
    p => p.slug === slug || p.id === slug
  );

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  const reviews = Array.from(db.reviews.values()).filter(r => r.productId === product.id);
  const related = Array.from(db.products.values())
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const responsePayload = {
    success: true,
    data: {
      ...product,
      reviews,
      related
    }
  };

  redisCache.set(cacheKey, responsePayload, 120);
  res.json(responsePayload);
});

v1Router.get('/categories', (req: Request, res: Response) => {
  const categoriesWithCounts = Array.from(db.categories.values()).map(c => ({
    ...c,
    productCount: Array.from(db.products.values()).filter(p => p.categoryId === c.id).length
  }));
  res.json({ success: true, data: categoriesWithCounts });
});

v1Router.get('/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const results = Array.from(db.products.values()).filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.sku.toLowerCase().includes(q) ||
    p.categoryName.toLowerCase().includes(q)
  );

  res.json({ success: true, query: q, count: results.length, data: results });
});

// ==========================================
// 2. CART & WISHLIST
// ==========================================

v1Router.get('/cart', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const cart = db.getCart(sessionId);
  const totals = calculateCartTotals(cart.items);
  cart.subtotal = totals.subtotal;
  cart.discount = totals.discount;
  cart.shipping = totals.shipping;
  cart.total = totals.total;
  cart.freeShippingQualified = totals.freeShippingQualified;
  cart.freeShippingRemaining = totals.freeShippingRemaining;
  res.json({ success: true, data: cart });
});

v1Router.post('/cart/items', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const { productId, variantId, quantity = 1 } = req.body;

  const product = db.products.get(productId);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ success: false, error: `Only ${product.stock} units available in stock.` });
  }

  const cart = db.getCart(sessionId);
  const currentItems = cart.items;
  const existingIdx = currentItems.findIndex((i: any) => i.productId === productId && i.variantId === variantId);

  if (existingIdx > -1) {
    currentItems[existingIdx].quantity += quantity;
  } else {
    currentItems.push({
      id: 'item-' + crypto.randomUUID().slice(0, 8),
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0] || '',
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      quantity,
      variantId
    });
  }

  const totals = calculateCartTotals(currentItems);
  cart.subtotal = totals.subtotal;
  cart.discount = totals.discount;
  cart.shipping = totals.shipping;
  cart.total = totals.total;
  cart.freeShippingQualified = totals.freeShippingQualified;
  cart.freeShippingRemaining = totals.freeShippingRemaining;
  db.saveCart(sessionId, cart);

  res.json({ success: true, data: cart });
});

v1Router.patch('/cart/items/:id', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const { id } = req.params;
  const { quantity } = req.body;

  const cart = db.getCart(sessionId);
  if (quantity <= 0) {
    cart.items = cart.items.filter((i: any) => i.id !== id);
  } else {
    const item = cart.items.find((i: any) => i.id === id);
    if (item) item.quantity = quantity;
  }

  const totals = calculateCartTotals(cart.items);
  cart.subtotal = totals.subtotal;
  cart.discount = totals.discount;
  cart.shipping = totals.shipping;
  cart.total = totals.total;
  cart.freeShippingQualified = totals.freeShippingQualified;
  cart.freeShippingRemaining = totals.freeShippingRemaining;
  db.saveCart(sessionId, cart);

  res.json({ success: true, data: cart });
});

v1Router.delete('/cart/items/:id', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const { id } = req.params;
  const cart = db.getCart(sessionId);
  cart.items = cart.items.filter((i: any) => i.id !== id);

  const totals = calculateCartTotals(cart.items);
  cart.subtotal = totals.subtotal;
  cart.discount = totals.discount;
  cart.shipping = totals.shipping;
  cart.total = totals.total;
  cart.freeShippingQualified = totals.freeShippingQualified;
  cart.freeShippingRemaining = totals.freeShippingRemaining;
  db.saveCart(sessionId, cart);

  res.json({ success: true, data: cart });
});

v1Router.delete('/cart', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const cart = db.getCart(sessionId);
  cart.items = [];
  cart.subtotal = 0;
  cart.discount = 0;
  cart.shipping = 0;
  cart.total = 0;
  cart.couponCode = undefined;
  db.saveCart(sessionId, cart);
  res.json({ success: true, message: 'Cart cleared', data: cart });
});

v1Router.post('/cart/merge', (req: Request, res: Response) => {
  const guestSessionId = (req.body.guestSessionId as string) || getSessionId(req);
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Must be authenticated to merge cart' });
  }

  const userSessionId = `user-${user.id}`;
  const guestCart = db.getCart(guestSessionId);
  const userCart = db.getCart(userSessionId);

  // Merge items
  for (const gItem of guestCart.items) {
    const existing = userCart.items.find((u: any) => u.productId === gItem.productId && u.variantId === gItem.variantId);
    if (existing) {
      existing.quantity += gItem.quantity;
    } else {
      userCart.items.push(gItem);
    }
  }

  guestCart.items = [];
  db.saveCart(guestSessionId, guestCart);

  const totals = calculateCartTotals(userCart.items);
  userCart.subtotal = totals.subtotal;
  userCart.discount = totals.discount;
  userCart.shipping = totals.shipping;
  userCart.total = totals.total;
  userCart.freeShippingQualified = totals.freeShippingQualified;
  userCart.freeShippingRemaining = totals.freeShippingRemaining;
  db.saveCart(userSessionId, userCart);

  res.json({ success: true, data: userCart });
});

// Wishlist
v1Router.get('/wishlist', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const items = db.getWishlist(sessionId);
  res.json({ success: true, data: items });
});

v1Router.post('/wishlist/:productId', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const { productId } = req.params;
  const product = db.products.get(productId);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

  const current = db.getWishlist(sessionId);
  if (!current.includes(productId)) {
    current.push(productId);
    db.saveWishlist(sessionId, current);
  }
  res.json({ success: true, data: current });
});

v1Router.delete('/wishlist/:productId', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const { productId } = req.params;
  let current = db.getWishlist(sessionId);
  current = current.filter(id => id !== productId);
  db.saveWishlist(sessionId, current);
  res.json({ success: true, data: current });
});

// ==========================================
// 3. COUPONS & CHECKOUT
// ==========================================

v1Router.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal = 0 } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'Coupon code required' });

  const coupon = db.coupons.get(code.toUpperCase().trim());
  if (!coupon || !coupon.isActive) {
    return res.status(400).json({ success: false, error: 'Invalid or expired coupon code' });
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return res.status(400).json({
      success: false,
      error: `Coupon requires minimum order of €${coupon.minOrder.toFixed(2)}`
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }
  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      discount: Math.min(discount, subtotal),
      description: coupon.description
    }
  });
});

v1Router.post('/checkout/session', (req: Request, res: Response) => {
  const { orderNumber, amount, provider = 'stripe' } = req.body;
  const dummyOrder = {
    id: 'ord-' + crypto.randomUUID().slice(0, 8),
    orderNumber: orderNumber || 'ACC-2026-TMP',
    total: amount || 49.99,
    currency: 'EUR'
  } as Order;

  const session = paymentService.createSession(dummyOrder, provider);
  res.json({ success: true, data: session });
});

v1Router.post('/checkout', (req: Request, res: Response) => {
  const {
    customer,
    shippingAddress,
    deliveryMethodId,
    paymentMethod,
    couponCode,
    items
  } = req.body;

  if (!customer || !customer.email || !customer.name) {
    return res.status(400).json({ success: false, error: 'Customer name and email required' });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart is empty' });
  }

  // Stock verification & deduction
  for (const item of items) {
    const prod = db.products.get(item.productId);
    if (!prod) {
      return res.status(400).json({ success: false, error: `Product ${item.productName} no longer available` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ success: false, error: `Insufficient stock for ${prod.name}. Only ${prod.stock} left.` });
    }
  }

  // Deduct stock
  for (const item of items) {
    const prod = db.products.get(item.productId)!;
    prod.stock -= item.quantity;
  }
  // Invalidate product cache
  redisCache.del('products:');

  const shippingList = Array.from(db.shippingMethods.values());
  const deliveryMethod = shippingList.find(s => s.id === deliveryMethodId) || shippingList[0];
  const subtotal = items.reduce((acc: number, i: any) => acc + (i.salePrice ?? i.price) * i.quantity, 0);

  let discount = 0;
  if (couponCode) {
    const c = db.coupons.get(couponCode.toUpperCase().trim());
    if (c && c.isActive) {
      discount = c.discountType === 'percentage' ? (subtotal * c.value) / 100 : c.value;
      c.usageCount += 1;
    }
  }

  const shippingCost = subtotal >= deliveryMethod.freeAbove ? 0 : deliveryMethod.price;
  const taxableTotal = Math.max(0, subtotal - discount + shippingCost);
  const tax = Number((taxableTotal * 0.21).toFixed(2));
  const total = Number(taxableTotal.toFixed(2));

  const orderNumber = `ACC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = 'ord-' + crypto.randomUUID().slice(0, 8);
  const trackingNumber = 'LT' + Math.floor(100000000 + Math.random() * 900000000) + 'EE';

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    customerEmail: customer.email,
    customerPhone: customer.phone || '+37060000000',
    customerName: customer.name,
    shippingAddress,
    deliveryMethod: {
      id: deliveryMethod.id,
      carrier: deliveryMethod.carrier,
      name: deliveryMethod.name,
      price: shippingCost,
      estimatedDelivery: deliveryMethod.estimatedDelivery
    },
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'UNPAID' : 'PAID',
    status: paymentMethod === 'cod' ? 'PENDING_PAYMENT' : 'PAID',
    subtotal,
    discount,
    couponCode,
    shippingCost,
    tax,
    total,
    currency: 'EUR',
    items,
    trackingNumber,
    statusHistory: [
      {
        status: 'PAID',
        changedBy: 'Checkout API',
        timestamp: new Date().toISOString(),
        notes: `Order placed via ${paymentMethod.toUpperCase()}`
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.set(orderId, newOrder);

  // Clear session cart
  const sessionId = getSessionId(req);
  const checkoutCart = db.getCart(sessionId);
  checkoutCart.items = [];
  checkoutCart.subtotal = 0;
  checkoutCart.discount = 0;
  checkoutCart.shipping = 0;
  checkoutCart.total = 0;
  checkoutCart.couponCode = undefined;
  db.saveCart(sessionId, checkoutCart);

  // Dispatch background job & send confirmation email
  backgroundQueue.addJob('SEND_ORDER_CONFIRMATION', { orderNumber });
  sendOrderConfirmationEmail(newOrder);

  // Log audit
  db.logAudit({
    userId: customer.email,
    userEmail: customer.email,
    action: 'ORDER_PLACED',
    resource: 'ORDERS',
    resourceId: orderNumber,
    details: `Order placed for €${total.toFixed(2)}`,
    ip: req.ip || '127.0.0.1'
  });

  res.status(201).json({
    success: true,
    data: newOrder,
    message: 'Order created successfully'
  });
});

// ==========================================
// 4. PAYMENTS & WEBHOOKS
// ==========================================

v1Router.post('/webhooks/payment', (req: Request, res: Response) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payloadStr = JSON.stringify(req.body);

  if (!paymentService.verifyWebhookSignature(payloadStr, signature)) {
    return res.status(401).json({ success: false, error: 'Invalid HMAC signature' });
  }

  const result = paymentService.processWebhook(req.body);
  res.json(result);
});

// ==========================================
// 5. ORDERS & SHIPPING
// ==========================================

v1Router.get('/orders/:orderNumber', (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const order = Array.from(db.orders.values()).find(
    o => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  );

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  const timeline = shippingService.getTrackingTimeline(order.trackingNumber || 'LT000000000', order.status);

  res.json({
    success: true,
    data: {
      ...order,
      trackingTimeline: timeline
    }
  });
});

v1Router.post('/orders/:orderNumber/return', (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const { reason, itemsToReturn } = req.body;

  const order = Array.from(db.orders.values()).find(
    o => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  );

  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

  // 14 day check
  const orderDate = new Date(order.createdAt).getTime();
  const diffDays = (Date.now() - orderDate) / (1000 * 3600 * 24);
  if (diffDays > 14) {
    return res.status(400).json({
      success: false,
      error: 'Return window expired. EU statutory right applies within 14 days of receipt.'
    });
  }

  order.statusHistory.push({
    status: order.status,
    changedBy: 'Customer Return Request',
    timestamp: new Date().toISOString(),
    notes: `Return requested: ${reason || 'Customer preference'}`
  });

  res.json({
    success: true,
    returnId: 'RET-' + Math.floor(100000 + Math.random() * 900000),
    status: 'RETURN_LABEL_GENERATED',
    carrier: 'Omniva Free Return',
    instructions: 'Pack the unworn item with original tags and drop off at any Omniva or DPD locker in Lithuania with PIN code sent to your email.'
  });
});

v1Router.get('/shipping/rates', (req: Request, res: Response) => {
  const subtotal = Number(req.query.subtotal || 0);
  const country = (req.query.country as string) || 'LT';
  const rates = shippingService.calculateRates(subtotal, country);
  res.json({ success: true, data: rates });
});

v1Router.get('/shipping/track/:trackingNumber', (req: Request, res: Response) => {
  const { trackingNumber } = req.params;
  const order = Array.from(db.orders.values()).find(o => o.trackingNumber === trackingNumber);
  const status = order ? order.status : 'SHIPPED';
  const checkpoints = shippingService.getTrackingTimeline(trackingNumber, status);
  res.json({ success: true, trackingNumber, checkpoints });
});

// ==========================================
// 6. CUSTOMER AUTH & PROFILE
// ==========================================

v1Router.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'Email, password, and name required' });
  }

  const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists' });
  }

  const newUser = {
    id: 'usr-' + crypto.randomUUID().slice(0, 8),
    email: email.toLowerCase().trim(),
    name,
    passwordHash: hashPassword(password),
    role: 'CUSTOMER' as const,
    phone: phone || '',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.set(newUser.id, newUser);
  sendWelcomeEmail(newUser.email, newUser.name);

  const token = createToken(newUser.id, newUser.role);
  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }
  });
});

v1Router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  const user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const token = createToken(user.id, user.role);
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  });
});

v1Router.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified
    }
  });
});

v1Router.get('/me/orders', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const orders = Array.from(db.orders.values())
    .filter(o => o.customerEmail.toLowerCase() === user.email.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, data: orders });
});

v1Router.get('/me/gdpr-export', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const exportData = GdprService.exportUserData(user);
  res.setHeader('Content-Disposition', `attachment; filename=accessories-lt-gdpr-${user.id}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(exportData, null, 2));
});

v1Router.post('/me/gdpr-delete-request', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const result = GdprService.requestErasure(user, req.body.reason || 'User requested erasure');
  res.json(result);
});

// ==========================================
// 7. ADMIN ENDPOINTS
// ==========================================

v1Router.get('/admin/dashboard', requireAdmin, (req: Request, res: Response) => {
  const orders = Array.from(db.orders.values());
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const products = Array.from(db.products.values());
  const lowStock = products.filter(p => p.stock < 15);
  const queueStats = backgroundQueue.getQueueStats();
  const cacheStats = redisCache.getStats();

  res.json({
    success: true,
    data: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      productsCount: products.length,
      customersCount: db.users.size,
      lowStockAlerts: lowStock.length,
      queueStats,
      cacheStats,
      recentOrders: orders.slice(-10).reverse()
    }
  });
});

v1Router.get('/admin/inventory', requireAdmin, (req: Request, res: Response) => {
  const items = Array.from(db.products.values()).map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.categoryName,
    price: p.price,
    stock: p.stock,
    isLowStock: p.stock < 20
  }));

  const movements = inventoryService.getMovements();
  res.json({ success: true, data: { inventory: items, movements } });
});

v1Router.post('/admin/inventory/adjust', requireAdmin, (req: Request, res: Response) => {
  const { productId, newStock, notes } = req.body;
  const user = (req as any).user;
  const result = inventoryService.adjustStock(productId, Number(newStock), user.name, notes);
  redisCache.del('products:');
  res.json(result);
});

v1Router.get('/admin/jobs', requireAdmin, (req: Request, res: Response) => {
  const stats = backgroundQueue.getQueueStats();
  res.json({ success: true, data: stats });
});

v1Router.post('/admin/jobs/trigger', requireAdmin, (req: Request, res: Response) => {
  const { type, payload } = req.body;
  const job = backgroundQueue.addJob(type || 'CHECK_LOW_STOCK_ALERTS', payload || {});
  res.json({ success: true, data: job });
});

v1Router.get('/admin/cache', requireAdmin, (req: Request, res: Response) => {
  const stats = redisCache.getStats();
  const keys = redisCache.listKeys();
  res.json({ success: true, data: { stats, keys } });
});

v1Router.post('/admin/cache/flush', requireAdmin, (req: Request, res: Response) => {
  redisCache.flush();
  res.json({ success: true, message: 'Redis cache flushed' });
});

v1Router.get('/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, data: db.auditLogs });
});

v1Router.post('/admin/payment-webhook-simulate', requireAdmin, (req: Request, res: Response) => {
  const { orderNumber, amount = 49.99 } = req.body;
  const simulated = paymentService.simulateWebhook(orderNumber, amount);
  res.json({ success: true, data: simulated });
});

// ==========================================
// 8. OPENAPI & SWAGGER DOCS
// ==========================================

v1Router.get('/openapi.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

v1Router.get('/docs', (req: Request, res: Response) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Accessories.lt API Reference & Swagger</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      <style>
        body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .topbar-header { background: #18181b; color: #fff; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
        .topbar-header a { color: #e4d5b7; text-decoration: none; font-size: 13px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="topbar-header">
        <div><strong>Accessories.lt</strong> &bull; Production REST API Explorer (v1)</div>
        <a href="/">&larr; Return to Store</a>
      </div>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/v1/openapi.json',
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `;
  res.send(html);
});
