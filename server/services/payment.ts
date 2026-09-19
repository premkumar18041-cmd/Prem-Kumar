// Payment Service & Webhook Handler for Accessories.lt
import crypto from 'crypto';
import { db } from '../db.js';
import { backgroundQueue } from './queue.js';
import { sendOrderConfirmationEmail } from './notifications.js';
import type { Order } from '../../src/types.js';

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_accessories_lt_production_key_2026';

export interface PaymentSession {
  sessionId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  provider: 'stripe' | 'paysera' | 'apple_pay' | 'cod';
  clientSecret: string;
  status: 'REQUIRES_PAYMENT_METHOD' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  type: 'payment_intent.succeeded' | 'payment_intent.payment_failed' | 'charge.refunded';
  data: {
    orderNumber: string;
    amount: number;
    currency: string;
    transactionId: string;
  };
}

class PaymentService {
  private sessions: Map<string, PaymentSession> = new Map();
  private processedWebhookIds: Set<string> = new Set(); // Idempotency guard

  /**
   * Create a secure payment session for an order.
   */
  public createSession(order: Order, provider: 'stripe' | 'paysera' | 'apple_pay' | 'cod' = 'stripe'): PaymentSession {
    const sessionId = 'cs_' + crypto.randomUUID().replace(/-/g, '');
    const clientSecret = 'seti_' + crypto.randomUUID().replace(/-/g, '') + '_secret';

    const session: PaymentSession = {
      sessionId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      currency: order.currency,
      provider,
      clientSecret,
      status: provider === 'cod' ? 'SUCCEEDED' : 'REQUIRES_PAYMENT_METHOD',
      createdAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Compute HMAC signature for webhook payload verification.
   */
  public generateWebhookSignature(payload: string, secret: string = WEBHOOK_SECRET): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify incoming webhook signature (prevents forged webhook calls).
   */
  public verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature) return false;
    try {
      const expected = this.generateWebhookSignature(payload);
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Process a verified payment webhook with strict idempotency and order transition.
   */
  public processWebhook(event: WebhookEvent): { success: boolean; message: string; duplicate?: boolean } {
    // 1. Check idempotency
    if (this.processedWebhookIds.has(event.id)) {
      return {
        success: true,
        message: `Webhook ${event.id} already processed (idempotency key matched)`,
        duplicate: true
      };
    }

    // 2. Mark idempotency key immediately
    this.processedWebhookIds.add(event.id);

    // 3. Find matching order
    const order = Array.from(db.orders.values()).find(
      o => o.orderNumber.toLowerCase() === event.data.orderNumber.toLowerCase()
    );

    if (!order) {
      return { success: false, message: `Order ${event.data.orderNumber} not found` };
    }

    // 4. State transition
    if (event.type === 'payment_intent.succeeded') {
      order.paymentStatus = 'PAID';
      order.status = 'PAID';
      order.statusHistory.push({
        status: 'PAID',
        changedBy: 'Payment Gateway Webhook (Verified HMAC)',
        timestamp: new Date().toISOString(),
        notes: `Transaction ${event.data.transactionId} settled for €${event.data.amount.toFixed(2)}`
      });

      // Dispatch async confirmation job
      backgroundQueue.addJob('SEND_ORDER_CONFIRMATION', { orderNumber: order.orderNumber });
      sendOrderConfirmationEmail(order);
    } else if (event.type === 'payment_intent.payment_failed') {
      order.paymentStatus = 'UNPAID';
      order.statusHistory.push({
        status: order.status,
        changedBy: 'Payment Gateway Webhook',
        timestamp: new Date().toISOString(),
        notes: `Payment attempt failed for transaction ${event.data.transactionId}`
      });
    }

    return {
      success: true,
      message: `Webhook ${event.id} applied to order ${order.orderNumber}`
    };
  }

  /**
   * Helper for admin dashboard to test webhook simulator.
   */
  public simulateWebhook(orderNumber: string, amount: number) {
    const eventId = 'evt_' + crypto.randomUUID().slice(0, 12);
    const event: WebhookEvent = {
      id: eventId,
      type: 'payment_intent.succeeded',
      data: {
        orderNumber,
        amount,
        currency: 'EUR',
        transactionId: 'txn_' + crypto.randomUUID().slice(0, 12)
      }
    };
    const payload = JSON.stringify(event);
    const signature = this.generateWebhookSignature(payload);
    return { event, payload, signature };
  }
}

export const paymentService = new PaymentService();
