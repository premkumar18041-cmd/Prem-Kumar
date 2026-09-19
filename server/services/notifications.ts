import type { Order } from '../../src/types.js';

export interface NotificationRecord {
  id: string;
  recipientEmail: string;
  subject: string;
  template: 'WELCOME' | 'ORDER_CONFIRMATION' | 'ORDER_SHIPPED' | 'REFUND_ISSUED' | 'PASSWORD_RESET';
  contentHtml: string;
  sentAt: string;
  status: 'SENT' | 'QUEUED';
}

export const notificationLog: NotificationRecord[] = [];

export function sendWelcomeEmail(email: string, name: string) {
  const record: NotificationRecord = {
    id: 'notif-' + Math.random().toString(36).substring(2, 9),
    recipientEmail: email,
    subject: 'Welcome to IVER Accessories – Small Pieces, Personal Style',
    template: 'WELCOME',
    contentHtml: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="letter-spacing: -0.5px; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px;">IVER Accessories</h2>
        <p>Dear ${name},</p>
        <p>Thank you for joining <strong>Accessories.lt</strong>. We bring together thoughtful, easy-to-wear jewelry, structured bags, and modern essentials designed to elevate your personal style.</p>
        <p>Enjoy 10% off your first purchase using coupon code <strong>WELCOME10</strong> at checkout.</p>
        <p style="margin-top: 24px; font-size: 13px; color: #666;">Accessories.lt &bull; Vilnius, Lithuania &bull; Contact: support@accessories.lt</p>
      </div>
    `,
    sentAt: new Date().toISOString(),
    status: 'SENT'
  };
  notificationLog.unshift(record);
  return record;
}

export function sendOrderConfirmationEmail(order: Order) {
  const itemsHtml = order.items.map(i => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
        <strong>${i.productName}</strong><br/>
        <span style="font-size: 12px; color: #666;">SKU: ${i.sku} ${i.variantLabel ? `| ${i.variantLabel}` : ''}</span>
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">&euro;${i.totalPrice.toFixed(2)}</td>
    </tr>
  `).join('');

  const record: NotificationRecord = {
    id: 'notif-' + Math.random().toString(36).substring(2, 9),
    recipientEmail: order.customerEmail,
    subject: `Order Confirmation #${order.orderNumber} - IVER Accessories`,
    template: 'ORDER_CONFIRMATION',
    contentHtml: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="letter-spacing: -0.5px; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px;">IVER Accessories</h2>
        <p>Hello ${order.customerName},</p>
        <p>Thank you for shopping at Accessories.lt! We have received your order <strong>#${order.orderNumber}</strong> and our team is preparing it for dispatch.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #333; text-align: left; font-size: 13px; color: #555;">
              <th style="padding-bottom: 6px;">Item</th>
              <th style="padding-bottom: 6px; text-align: center;">Qty</th>
              <th style="padding-bottom: 6px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 10px;">
          <p style="margin: 4px 0;">Subtotal: &euro;${order.subtotal.toFixed(2)}</p>
          ${order.discount > 0 ? `<p style="margin: 4px 0; color: #16a34a;">Discount (${order.couponCode || 'Promo'}): -&euro;${order.discount.toFixed(2)}</p>` : ''}
          <p style="margin: 4px 0;">Shipping (${order.deliveryMethod.name}): &euro;${order.shippingCost.toFixed(2)}</p>
          <p style="margin: 4px 0; font-size: 11px; color: #777;">Includes 21% VAT: &euro;${order.tax.toFixed(2)}</p>
          <h3 style="margin: 8px 0; border-top: 1px solid #333; padding-top: 8px;">Total: &euro;${order.total.toFixed(2)}</h3>
        </div>

        <div style="background: #f9f9f9; padding: 14px; border-radius: 6px; margin: 20px 0; font-size: 14px;">
          <strong>Shipping to:</strong><br/>
          ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br/>
          ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}<br/>
          ${order.shippingAddress.postalCode} ${order.shippingAddress.city}, ${order.shippingAddress.country}
        </div>

        <p style="font-size: 13px; color: #666;">Need help with your order? Reply to this email or visit <a href="https://accessories.lt">accessories.lt</a>.</p>
      </div>
    `,
    sentAt: new Date().toISOString(),
    status: 'SENT'
  };
  notificationLog.unshift(record);
  return record;
}

export function sendShippingUpdateEmail(order: Order, trackingNumber: string) {
  const record: NotificationRecord = {
    id: 'notif-' + Math.random().toString(36).substring(2, 9),
    recipientEmail: order.customerEmail,
    subject: `Your order #${order.orderNumber} has shipped! - IVER Accessories`,
    template: 'ORDER_SHIPPED',
    contentHtml: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="border-bottom: 2px solid #1a1a1a; padding-bottom: 12px;">IVER Accessories</h2>
        <p>Great news! Your package for order <strong>#${order.orderNumber}</strong> has been shipped via ${order.deliveryMethod.carrier}.</p>
        <p>Tracking Number: <strong>${trackingNumber}</strong></p>
        <p>Estimated Delivery: ${order.deliveryMethod.estimatedDelivery}</p>
      </div>
    `,
    sentAt: new Date().toISOString(),
    status: 'SENT'
  };
  notificationLog.unshift(record);
  return record;
}
