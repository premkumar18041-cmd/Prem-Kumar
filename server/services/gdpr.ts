// GDPR Privacy & Data Export Service for Accessories.lt
import { db } from '../db.js';
import type { User } from '../../src/types.js';

export class GdprService {
  /**
   * Export all customer records for GDPR Art. 15 Right of Access.
   */
  public static exportUserData(user: User) {
    const orders = Array.from(db.orders.values()).filter(
      o => o.userId === user.id || o.customerEmail.toLowerCase() === user.email.toLowerCase()
    );

    const reviews = Array.from(db.reviews.values()).filter(
      r => r.customerName.toLowerCase() === user.name.toLowerCase()
    );

    return {
      store: 'IVER Accessories (Accessories.lt)',
      exportDate: new Date().toISOString(),
      gdprCompliance: 'Regulation (EU) 2016/679',
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      orders: orders.map(o => ({
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        status: o.status,
        total: o.total,
        currency: o.currency,
        shippingAddress: o.shippingAddress,
        items: o.items.map(i => ({
          product: i.productName,
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      })),
      reviews: reviews.map(r => ({
        product: r.productName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: r.createdAt
      }))
    };
  }

  /**
   * Record an account erasure request under GDPR Art. 17 Right to Erasure.
   */
  public static requestErasure(user: User, reason: string) {
    db.logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'GDPR_ERASURE_REQUESTED',
      resource: 'USERS',
      resourceId: user.id,
      details: `Customer requested complete account erasure: ${reason}`,
      ip: '127.0.0.1'
    });

    return {
      success: true,
      ticketNumber: 'GDPR-LT-' + Math.floor(100000 + Math.random() * 900000),
      status: 'UNDER_REVIEW',
      message: 'Your data erasure request has been logged. Under EU legal accounting standards, tax invoice records will be retained in encrypted archive for the statutory period (10 years) and all marketing/profile data will be permanently purged within 30 days.'
    };
  }
}
