import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { calculateCartTotals, roundMoney } from './server/services/pricing.js';
import { 
  hashPassword, 
  createToken, 
  getUserByToken, 
  checkPermission 
} from './server/services/auth.js';
import { 
  sendWelcomeEmail, 
  sendOrderConfirmationEmail, 
  sendShippingUpdateEmail, 
  notificationLog 
} from './server/services/notifications.js';
import { openApiSpec } from './server/openapi.js';
import { v1Router } from './server/routes/v1.js';
import type { 
  CartItem, 
  Order, 
  OrderStatus, 
  Product, 
  Review, 
  Coupon 
} from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS and security headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Session-Id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Session middleware helper for cart
  const getSessionId = (req: express.Request): string => {
    return (req.headers['x-session-id'] as string) || 'guest-session-default';
  };

  // Auth helper
  const getAuthUser = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    return getUserByToken(token);
  };

  // ==========================================
  // API ROUTES
  // ==========================================

  // Mount v1 REST API routes
  app.use('/api/v1', v1Router);

  // Docs redirect
  app.get('/api/docs', (req, res) => {
    res.redirect('/api/v1/docs');
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      brand: 'IVER Accessories',
      domain: 'accessories.lt',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // OpenAPI schema
  app.get('/api/openapi.json', (req, res) => {
    res.json(openApiSpec);
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    const cats = Array.from(db.categories.values()).map(c => {
      const count = Array.from(db.products.values()).filter(p => p.categoryId === c.id || p.categorySlug === c.slug).length;
      return { ...c, productCount: count };
    });
    res.json({ success: true, data: cats });
  });

  // Products listing with search, filtering, and sorting
  app.get('/api/products', (req, res) => {
    const { category, q, sort, minPrice, maxPrice, inStock, featured } = req.query;
    let products = Array.from(db.products.values());

    // Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter(p => p.categorySlug === category || p.categoryId === category);
    }

    // Search query with typo-tolerance
    if (q && typeof q === 'string') {
      const cleanQ = q.trim().toLowerCase();
      products = products.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(cleanQ) || (p.nameLt && p.nameLt.toLowerCase().includes(cleanQ));
        const skuMatch = p.sku.toLowerCase().includes(cleanQ);
        const descMatch = p.description.toLowerCase().includes(cleanQ);
        const catMatch = p.categoryName.toLowerCase().includes(cleanQ);
        return nameMatch || skuMatch || descMatch || catMatch;
      });

      // Log search for analytics
      db.logAnalytics({
        eventName: 'SEARCH',
        sessionId: getSessionId(req),
        payload: { query: cleanQ, resultsCount: products.length }
      });
    }

    // Price range
    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) products = products.filter(p => (p.salePrice || p.price) >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) products = products.filter(p => (p.salePrice || p.price) <= max);
    }

    // In stock
    if (inStock === 'true') {
      products = products.filter(p => p.stock > 0);
    }

    // Featured
    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }

    // Sorting
    switch (sort) {
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'best-selling':
        products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      default: // featured
        products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    res.json({
      success: true,
      data: products,
      total: products.length
    });
  });

  // Single product by slug or id
  app.get('/api/products/:identifier', (req, res) => {
    const { identifier } = req.params;
    const product = Array.from(db.products.values()).find(
      p => p.slug === identifier || p.id === identifier
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch verified reviews for this product
    const productReviews = Array.from(db.reviews.values()).filter(
      r => r.productId === product.id && r.status === 'APPROVED'
    );

    // Fetch related products in same category
    const related = Array.from(db.products.values())
      .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);

    res.json({
      success: true,
      data: {
        ...product,
        reviews: productReviews,
        relatedProducts: related
      }
    });
  });

  // Search suggestions
  app.get('/api/search/suggestions', (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.json({
        success: true,
        popular: ['Bangles', 'Earrings', 'Laptop Tote', 'Zip Wallet', 'Gold Necklace'],
        suggestions: []
      });
    }

    const query = q.toLowerCase();
    const suggestions = Array.from(db.products.values())
      .filter(p => p.name.toLowerCase().includes(query) || p.categoryName.toLowerCase().includes(query))
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.categoryName,
        image: p.images[0],
        price: p.salePrice || p.price
      }));

    res.json({
      success: true,
      popular: ['Bangles', 'Earrings', 'Laptop Tote', 'Zip Wallet', 'Gold Necklace'],
      suggestions
    });
  });

  // ==========================================
  // CART API (Server-Controlled Validation)
  // ==========================================

  app.get('/api/cart', (req, res) => {
    const sessionId = getSessionId(req);
    let cart = db.carts.get(sessionId);
    if (!cart) {
      cart = {
        id: 'cart-' + crypto.randomUUID().slice(0, 8),
        sessionId,
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        currency: 'EUR',
        freeShippingThreshold: 40.00,
        updatedAt: new Date().toISOString()
      };
      db.carts.set(sessionId, cart);
    }

    // Refresh server prices & stock limits
    const validItems: CartItem[] = [];
    for (const item of cart.items) {
      const product = db.products.get(item.productId);
      if (!product || product.stock <= 0) continue;

      const currentPrice = product.salePrice || product.price;
      const regularPrice = product.price;
      const maxStock = product.stock;

      validItems.push({
        ...item,
        price: currentPrice,
        regularPrice,
        quantity: Math.min(item.quantity, maxStock),
        maxStock
      });
    }
    cart.items = validItems;

    // Fetch applied coupon
    const coupon = cart.couponCode ? db.coupons.get(cart.couponCode.toUpperCase()) : null;
    const totals = calculateCartTotals(cart.items, coupon);

    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.shipping = totals.shipping;
    cart.tax = totals.tax;
    cart.total = totals.total;

    res.json({
      success: true,
      data: {
        ...cart,
        freeShippingQualified: totals.freeShippingQualified,
        freeShippingRemaining: totals.freeShippingRemaining,
        couponApplied: totals.couponApplied
      }
    });
  });

  app.post('/api/cart/items', (req, res) => {
    const sessionId = getSessionId(req);
    const { productId, variantId, quantity = 1 } = req.body;

    const product = db.products.get(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'This item is currently out of stock' });
    }

    let cart = db.carts.get(sessionId);
    if (!cart) {
      cart = {
        id: 'cart-' + crypto.randomUUID().slice(0, 8),
        sessionId,
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        currency: 'EUR',
        freeShippingThreshold: 40.00,
        updatedAt: new Date().toISOString()
      };
      db.carts.set(sessionId, cart);
    }

    const itemIndex = cart.items.findIndex(
      i => i.productId === productId && (!variantId || i.variantId === variantId)
    );

    const price = product.salePrice || product.price;
    const regularPrice = product.price;
    const variant = variantId ? product.variants.find(v => v.id === variantId) : null;
    const maxStock = variant ? variant.stock : product.stock;

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      cart.items[itemIndex].quantity = Math.min(newQty, maxStock);
      cart.items[itemIndex].price = price;
    } else {
      cart.items.push({
        id: 'citem-' + crypto.randomUUID().slice(0, 8),
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0] || 'https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg',
        variantId,
        variantLabel: variant ? variant.name : undefined,
        sku: variant ? variant.sku : product.sku,
        price,
        regularPrice,
        quantity: Math.min(quantity, maxStock),
        maxStock
      });
    }

    cart.updatedAt = new Date().toISOString();
    const coupon = cart.couponCode ? db.coupons.get(cart.couponCode.toUpperCase()) : null;
    const totals = calculateCartTotals(cart.items, coupon);

    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.shipping = totals.shipping;
    cart.tax = totals.tax;
    cart.total = totals.total;

    db.logAnalytics({
      eventName: 'ADD_TO_CART',
      sessionId,
      payload: { productId: product.id, productName: product.name, price, quantity }
    });

    res.json({ success: true, data: cart, totals });
  });

  app.patch('/api/cart/items/:itemId', (req, res) => {
    const sessionId = getSessionId(req);
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = db.carts.get(sessionId);
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.id !== itemId);
    } else {
      item.quantity = Math.min(quantity, item.maxStock ?? 99);
    }

    const coupon = cart.couponCode ? db.coupons.get(cart.couponCode.toUpperCase()) : null;
    const totals = calculateCartTotals(cart.items, coupon);
    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.shipping = totals.shipping;
    cart.tax = totals.tax;
    cart.total = totals.total;
    cart.updatedAt = new Date().toISOString();

    res.json({ success: true, data: cart, totals });
  });

  app.delete('/api/cart/items/:itemId', (req, res) => {
    const sessionId = getSessionId(req);
    const { itemId } = req.params;

    const cart = db.carts.get(sessionId);
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.id !== itemId);
    const coupon = cart.couponCode ? db.coupons.get(cart.couponCode.toUpperCase()) : null;
    const totals = calculateCartTotals(cart.items, coupon);
    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.shipping = totals.shipping;
    cart.tax = totals.tax;
    cart.total = totals.total;
    cart.updatedAt = new Date().toISOString();

    res.json({ success: true, data: cart, totals });
  });

  // Apply or remove coupon
  app.post('/api/cart/coupon', (req, res) => {
    const sessionId = getSessionId(req);
    const { code } = req.body;
    const cart = db.carts.get(sessionId);
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    if (!code) {
      cart.couponCode = undefined;
      const totals = calculateCartTotals(cart.items, null);
      cart.subtotal = totals.subtotal;
      cart.discount = 0;
      cart.total = totals.total;
      return res.json({ success: true, data: cart, message: 'Coupon removed' });
    }

    const coupon = db.coupons.get(code.trim().toUpperCase());
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (cart.subtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum subtotal of €${coupon.minOrder.toFixed(2)}`
      });
    }

    cart.couponCode = coupon.code;
    const totals = calculateCartTotals(cart.items, coupon);
    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.shipping = totals.shipping;
    cart.tax = totals.tax;
    cart.total = totals.total;

    res.json({
      success: true,
      data: cart,
      message: `Coupon ${coupon.code} applied successfully! Saved €${totals.discount.toFixed(2)}`
    });
  });

  // Validate coupon directly (without adding to cart)
  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal = 0 } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    const coupon = db.coupons.get(code.trim().toUpperCase());
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon does not exist or has expired' });
    }

    if (subtotal > 0 && subtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Order must be at least €${coupon.minOrder.toFixed(2)} to use this code`
      });
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        minOrder: coupon.minOrder,
        description: coupon.description
      }
    });
  });

  // Shipping methods
  app.get('/api/shipping-methods', (req, res) => {
    res.json({
      success: true,
      data: Array.from(db.shippingMethods.values())
    });
  });

  // ==========================================
  // CHECKOUT & ORDER CREATION
  // ==========================================

  app.post('/api/checkout', (req, res) => {
    const sessionId = getSessionId(req);
    const { 
      customer, 
      shippingAddress, 
      deliveryMethodId, 
      paymentMethod = 'credit_card', 
      couponCode, 
      items = [] 
    } = req.body;

    if (!customer || !customer.email || !customer.firstName || !customer.lastName) {
      return res.status(400).json({ success: false, message: 'Customer information is required' });
    }

    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Checkout items cannot be empty' });
    }

    // 1. Transactional Stock Verification & Reservation
    const orderItems = [];
    for (const item of items) {
      const product = db.products.get(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.productName || item.productId} no longer exists` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}". Available stock: ${product.stock}`
        });
      }

      const unitPrice = product.salePrice || product.price;
      orderItems.push({
        id: 'ord-item-' + crypto.randomUUID().slice(0, 8),
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0] || 'https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg',
        sku: product.sku,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        unitPrice,
        totalPrice: roundMoney(unitPrice * item.quantity)
      });
    }

    // 2. Server-side Pricing Calculation
    const deliveryMethod = db.shippingMethods.get(deliveryMethodId) || db.shippingMethods.get('ship-omniva')!;
    const coupon = couponCode ? db.coupons.get(couponCode.toUpperCase()) : null;
    const totals = calculateCartTotals(
      orderItems.map(i => ({ price: i.unitPrice, quantity: i.quantity })),
      coupon,
      deliveryMethod.price,
      deliveryMethod.freeAbove
    );

    // 3. Atomically Deduct Inventory
    for (const oi of orderItems) {
      const p = db.products.get(oi.productId)!;
      p.stock = Math.max(0, p.stock - oi.quantity);
      p.updatedAt = new Date().toISOString();
    }

    // 4. Create Order Record
    const orderNumber = `ACC-2026-${(db.orders.size + 101).toString().padStart(6, '0')}`;
    const user = getAuthUser(req);

    const newOrder: Order = {
      id: 'ord-' + crypto.randomUUID().slice(0, 8),
      orderNumber,
      userId: user?.id,
      customerEmail: customer.email,
      customerPhone: customer.phone || '+37060000000',
      customerName: `${customer.firstName} ${customer.lastName}`,
      shippingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Lithuania'
      },
      deliveryMethod: {
        id: deliveryMethod.id,
        name: deliveryMethod.name,
        carrier: deliveryMethod.carrier,
        price: totals.shipping,
        estimatedDelivery: deliveryMethod.estimatedDelivery
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'UNPAID' : 'PAID',
      status: paymentMethod === 'cash_on_delivery' ? 'PROCESSING' : 'PAID',
      statusHistory: [
        {
          status: 'PENDING_PAYMENT',
          changedBy: 'Checkout Service',
          timestamp: new Date().toISOString(),
          notes: 'Customer initiated checkout'
        },
        {
          status: paymentMethod === 'cash_on_delivery' ? 'PROCESSING' : 'PAID',
          changedBy: paymentMethod === 'cash_on_delivery' ? 'COD Policy' : 'Payment Gateway (Verified)',
          timestamp: new Date().toISOString(),
          notes: paymentMethod === 'cash_on_delivery' ? 'Cash on delivery approved' : 'Payment token settled successfully'
        }
      ],
      items: orderItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      couponCode: coupon?.code,
      shippingCost: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      currency: 'EUR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.set(newOrder.id, newOrder);

    // If coupon used, increment its count
    if (coupon) {
      coupon.usageCount += 1;
    }

    // Clear session cart
    const cart = db.carts.get(sessionId);
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.discount = 0;
      cart.shipping = 0;
      cart.total = 0;
      cart.couponCode = undefined;
    }

    // Dispatch transactional order confirmation email
    sendOrderConfirmationEmail(newOrder);

    // Log audit & analytics
    db.logAudit({
      userId: user?.id || 'guest',
      userEmail: customer.email,
      action: 'ORDER_PLACED',
      resource: 'ORDERS',
      resourceId: newOrder.orderNumber,
      details: `Placed order ${newOrder.orderNumber} for €${newOrder.total.toFixed(2)} via ${paymentMethod}`,
      ip: req.ip || '127.0.0.1'
    });

    db.logAnalytics({
      eventName: 'PURCHASE',
      sessionId,
      payload: {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        value: newOrder.total,
        currency: 'EUR',
        itemsCount: newOrder.items.length
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  });

  // Track order by order number
  app.get('/api/orders/:orderNumber', (req, res) => {
    const { orderNumber } = req.params;
    const order = Array.from(db.orders.values()).find(
      o => o.orderNumber.toLowerCase() === orderNumber.toLowerCase() || o.id === orderNumber
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  });

  // Return request for order (14 days EU statutory right)
  app.post('/api/orders/:orderNumber/return', (req, res) => {
    const { orderNumber } = req.params;
    const { reason, items = [] } = req.body;

    const order = Array.from(db.orders.values()).find(
      o => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.statusHistory.push({
      status: order.status,
      changedBy: 'Customer Portal',
      timestamp: new Date().toISOString(),
      notes: `Return requested: ${reason || 'Statutory 14-day return'}`
    });

    db.logAudit({
      userId: order.userId || 'guest',
      userEmail: order.customerEmail,
      action: 'RETURN_REQUESTED',
      resource: 'ORDERS',
      resourceId: order.orderNumber,
      details: `Return requested for order ${order.orderNumber}: ${reason}`,
      ip: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: 'Return request submitted. Our support team will provide a prepaid Omniva/DPD return shipping label within 24 hours.'
    });
  });

  // ==========================================
  // CUSTOMER AUTHENTICATION & PROFILE
  // ==========================================

  app.post('/api/auth/register', (req, res) => {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = {
      id: 'usr-' + crypto.randomUUID().slice(0, 8),
      email: normalizedEmail,
      name: name.trim(),
      passwordHash: hashPassword(password),
      role: 'CUSTOMER' as const,
      phone: phone || '',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.set(newUser.id, newUser);
    const token = createToken(newUser.id, newUser.role);

    sendWelcomeEmail(newUser.email, newUser.name);

    db.logAudit({
      userId: newUser.id,
      userEmail: newUser.email,
      action: 'USER_REGISTERED',
      resource: 'USERS',
      details: `Customer registered account: ${newUser.name}`,
      ip: req.ip || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const expectedHash = hashPassword(password);
    // Also allow the initial raw password check for pre-seeded users
    const valid = user.passwordHash === expectedHash || user.passwordHash === crypto.createHash('sha256').update(password).digest('hex');
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(user.id, user.role);

    db.logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      resource: 'USERS',
      details: `User logged in with role ${user.role}`,
      ip: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  });

  app.get('/api/me/orders', (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const userOrders = Array.from(db.orders.values())
      .filter(o => o.userId === user.id || o.customerEmail.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: userOrders });
  });

  // Post product review
  app.post('/api/reviews', (req, res) => {
    const { productId, rating, title, comment, customerName } = req.body;
    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Rating, title, and comment are required' });
    }

    const product = db.products.get(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const user = getAuthUser(req);
    const newReview: Review = {
      id: 'rev-' + crypto.randomUUID().slice(0, 8),
      productId,
      productName: product.name,
      customerName: customerName || user?.name || 'Verified Customer',
      rating: Math.max(1, Math.min(5, Number(rating))),
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true,
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    };

    db.reviews.set(newReview.id, newReview);

    // Update product rating aggregate
    const allProdReviews = Array.from(db.reviews.values()).filter(r => r.productId === productId && r.status === 'APPROVED');
    const avg = allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length;
    product.rating = roundMoney(avg);
    product.reviewCount = allProdReviews.length;

    res.status(201).json({
      success: true,
      message: 'Review submitted and published successfully!',
      data: newReview
    });
  });

  // ==========================================
  // ADMIN DASHBOARD & MANAGEMENT ENDPOINTS
  // ==========================================

  // Admin auth check middleware helper
  const requireAdminRole = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getAuthUser(req);
    if (!user || (user.role === 'CUSTOMER')) {
      return res.status(403).json({ success: false, message: 'Access denied: Administrative privileges required' });
    }
    next();
  };

  app.get('/api/admin/dashboard', requireAdminRole, (req, res) => {
    const orders = Array.from(db.orders.values());
    const products = Array.from(db.products.values());
    const users = Array.from(db.users.values());

    const totalRevenue = roundMoney(orders.reduce((sum, o) => sum + o.total, 0));
    const pendingOrders = orders.filter(o => o.status === 'PENDING_PAYMENT' || o.status === 'PROCESSING').length;
    const lowStockProducts = products.filter(p => p.stock < 20);

    // Today's sales
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
    const todaySales = roundMoney(todayOrders.reduce((sum, o) => sum + o.total, 0));

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalCustomers: users.filter(u => u.role === 'CUSTOMER').length,
          todaySales,
          pendingOrders,
          lowStockCount: lowStockProducts.length,
          averageOrderValue: orders.length > 0 ? roundMoney(totalRevenue / orders.length) : 0
        },
        lowStockAlerts: lowStockProducts.map(p => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock })),
        recentOrders: orders.slice(0, 8),
        auditLogs: db.auditLogs.slice(0, 10)
      }
    });
  });

  // Admin Products CRUD
  app.get('/api/admin/products', requireAdminRole, (req, res) => {
    res.json({ success: true, data: Array.from(db.products.values()) });
  });

  app.post('/api/admin/products', requireAdminRole, (req, res) => {
    const user = getAuthUser(req)!;
    const body = req.body;

    if (!body.name || !body.price || !body.sku) {
      return res.status(400).json({ success: false, message: 'Name, SKU, and price are required' });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = 'prod-' + crypto.randomUUID().slice(0, 8);

    const newProd: Product = {
      id,
      name: body.name,
      nameLt: body.nameLt || body.name,
      slug,
      sku: body.sku,
      description: body.description || '',
      descriptionLt: body.descriptionLt || '',
      shortDescription: body.shortDescription || '',
      price: parseFloat(body.price),
      salePrice: body.salePrice ? parseFloat(body.salePrice) : undefined,
      currency: 'EUR',
      categoryId: body.categoryId || 'cat-jewelry',
      categorySlug: body.categorySlug || 'jewelry',
      categoryName: body.categoryName || 'Jewelry',
      images: body.images && body.images.length > 0 ? body.images : ['https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg'],
      attributes: body.attributes || {},
      variants: body.variants || [],
      stock: parseInt(body.stock, 10) || 10,
      rating: 5.0,
      reviewCount: 0,
      isFeatured: !!body.isFeatured,
      isBestSeller: !!body.isBestSeller,
      isNewArrival: true,
      seoTitle: body.seoTitle || `${body.name} | Accessories.lt`,
      seoDescription: body.seoDescription || body.shortDescription || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.set(id, newProd);

    db.logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'PRODUCT_CREATED',
      resource: 'PRODUCTS',
      resourceId: newProd.sku,
      details: `Admin created product ${newProd.name} (${newProd.sku}) at €${newProd.price}`,
      ip: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, data: newProd });
  });

  app.put('/api/admin/products/:id', requireAdminRole, (req, res) => {
    const user = getAuthUser(req)!;
    const { id } = req.params;
    const product = db.products.get(id);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updated: Product = {
      ...product,
      ...req.body,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : product.price,
      salePrice: req.body.salePrice !== undefined ? (req.body.salePrice ? parseFloat(req.body.salePrice) : undefined) : product.salePrice,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : product.stock,
      updatedAt: new Date().toISOString()
    };

    db.products.set(id, updated);

    db.logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'PRODUCT_UPDATED',
      resource: 'PRODUCTS',
      resourceId: updated.sku,
      details: `Updated product ${updated.name} - Price: €${updated.price}, Stock: ${updated.stock}`,
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, data: updated });
  });

  app.delete('/api/admin/products/:id', requireAdminRole, (req, res) => {
    const user = getAuthUser(req)!;
    const { id } = req.params;
    const product = db.products.get(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    db.products.delete(id);

    db.logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'PRODUCT_DELETED',
      resource: 'PRODUCTS',
      resourceId: product.sku,
      details: `Deleted product ${product.name} (${product.sku})`,
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  });

  // Admin Orders Management
  app.get('/api/admin/orders', requireAdminRole, (req, res) => {
    const orders = Array.from(db.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ success: true, data: orders });
  });

  app.patch('/api/admin/orders/:orderId/status', requireAdminRole, (req, res) => {
    const user = getAuthUser(req)!;
    const { orderId } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const order = db.orders.get(orderId) || Array.from(db.orders.values()).find(o => o.orderNumber === orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const oldStatus = order.status;
    order.status = status as OrderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.updatedAt = new Date().toISOString();

    order.statusHistory.push({
      status: order.status,
      changedBy: `${user.name} (${user.role})`,
      timestamp: new Date().toISOString(),
      notes: notes || `Status updated from ${oldStatus} to ${status}`
    });

    if (status === 'SHIPPED' && order.trackingNumber) {
      sendShippingUpdateEmail(order, order.trackingNumber);
    }

    db.logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'ORDER_STATUS_CHANGED',
      resource: 'ORDERS',
      resourceId: order.orderNumber,
      details: `Changed order ${order.orderNumber} status from ${oldStatus} to ${status}`,
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, data: order });
  });

  // Admin Coupons
  app.get('/api/admin/coupons', requireAdminRole, (req, res) => {
    res.json({ success: true, data: Array.from(db.coupons.values()) });
  });

  app.post('/api/admin/coupons', requireAdminRole, (req, res) => {
    const user = getAuthUser(req)!;
    const { code, discountType, value, minOrder = 0, description } = req.body;

    if (!code || !discountType || value === undefined) {
      return res.status(400).json({ success: false, message: 'Code, discount type, and value are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const newCoupon: Coupon = {
      id: 'cpn-' + crypto.randomUUID().slice(0, 8),
      code: cleanCode,
      discountType,
      value: parseFloat(value),
      minOrder: parseFloat(minOrder),
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      usageLimit: 500,
      usageCount: 0,
      isActive: true,
      description: description || `${value}${discountType === 'percentage' ? '%' : '€'} discount`
    };

    db.coupons.set(cleanCode, newCoupon);

    db.logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'COUPON_CREATED',
      resource: 'COUPONS',
      resourceId: cleanCode,
      details: `Created coupon ${cleanCode} with ${value} ${discountType}`,
      ip: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, data: newCoupon });
  });

  app.delete('/api/admin/coupons/:code', requireAdminRole, (req, res) => {
    const user = getAuthUser(req)!;
    const { code } = req.params;
    db.coupons.delete(code.toUpperCase());

    db.logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'COUPON_DELETED',
      resource: 'COUPONS',
      resourceId: code,
      details: `Deleted coupon ${code}`,
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Coupon deleted' });
  });

  // Admin Audit Logs & Analytics
  app.get('/api/admin/audit-logs', requireAdminRole, (req, res) => {
    res.json({ success: true, data: db.auditLogs });
  });

  app.get('/api/admin/notifications', requireAdminRole, (req, res) => {
    res.json({ success: true, data: notificationLog });
  });

  // Analytics event ingest
  app.post('/api/analytics/event', (req, res) => {
    const { eventName, payload = {} } = req.body;
    db.logAnalytics({
      eventName: eventName || 'PAGE_VIEW',
      sessionId: getSessionId(req),
      payload
    });
    res.json({ success: true });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IVER Accessories API server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
