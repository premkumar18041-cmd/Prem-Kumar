// Shipping Service & Carrier Provider Integration for Accessories.lt
export interface ShippingRateCalculation {
  methodId: string;
  carrier: string;
  name: string;
  price: number;
  freeShippingQualified: boolean;
  estimatedDelivery: string;
}

export interface TrackingCheckpoint {
  eventCode: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

class ShippingService {
  /**
   * Calculate carrier rates for order items and destination.
   */
  public calculateRates(subtotal: number, countryCode: string = 'LT'): ShippingRateCalculation[] {
    const isBaltic = ['LT', 'LV', 'EE'].includes(countryCode.toUpperCase());

    return [
      {
        methodId: 'ship-omniva',
        carrier: 'Omniva',
        name: 'Omniva Parcel Locker (Paštomatas)',
        price: subtotal >= 40.00 ? 0.00 : 2.99,
        freeShippingQualified: subtotal >= 40.00,
        estimatedDelivery: isBaltic ? '1-2 business days' : '3-4 business days'
      },
      {
        methodId: 'ship-dpd',
        carrier: 'DPD',
        name: 'DPD Courier Delivery to Door',
        price: subtotal >= 60.00 ? 0.00 : 4.50,
        freeShippingQualified: subtotal >= 60.00,
        estimatedDelivery: '1-2 business days'
      },
      {
        methodId: 'ship-post',
        carrier: 'Lietuvos Paštas',
        name: 'Registered Postal Delivery (EU)',
        price: subtotal >= 50.00 ? 0.00 : 3.50,
        freeShippingQualified: subtotal >= 50.00,
        estimatedDelivery: '3-5 business days'
      },
      {
        methodId: 'ship-dhl',
        carrier: 'DHL Express',
        name: 'DHL Express European Air Cargo',
        price: subtotal >= 120.00 ? 0.00 : 12.90,
        freeShippingQualified: subtotal >= 120.00,
        estimatedDelivery: 'Next business day'
      }
    ];
  }

  /**
   * Generate realistic tracking milestones based on tracking number and order status.
   */
  public getTrackingTimeline(trackingNumber: string, status: string): TrackingCheckpoint[] {
    const now = new Date();
    const t0 = new Date(now.getTime() - 1000 * 60 * 60 * 28).toISOString();
    const t1 = new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString();
    const t2 = new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString();
    const t3 = new Date(now.getTime() - 1000 * 60 * 30).toISOString();

    return [
      {
        eventCode: 'ELECTRONIC_INFO_RECEIVED',
        title: 'Electronic Shipping Data Created',
        description: `Omniva/DPD shipping label printed. Tracking #${trackingNumber}`,
        location: 'Vilnius Warehouse Hub, Lithuania',
        timestamp: t0,
        completed: true
      },
      {
        eventCode: 'PICKED_UP',
        title: 'Package Handed Over to Courier',
        description: 'Carrier has collected parcel from Accessories.lt fulfillment depot',
        location: 'Vilnius Parcel Center',
        timestamp: t1,
        completed: status !== 'PENDING_PAYMENT' && status !== 'PROCESSING'
      },
      {
        eventCode: 'SORTED_AT_HUB',
        title: 'Sorted at Central Regional Logistics Hub',
        description: 'Item routed to local distribution route',
        location: 'Kaunas Logistics Terminal',
        timestamp: t2,
        completed: status === 'SHIPPED' || status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED'
      },
      {
        eventCode: 'OUT_FOR_DELIVERY',
        title: 'Out for Courier Delivery / Locker Transfer',
        description: 'Courier is en route to designated recipient address or locker terminal',
        location: 'Destination Terminal',
        timestamp: t3,
        completed: status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED'
      },
      {
        eventCode: 'DELIVERED',
        title: 'Successfully Delivered',
        description: 'Parcel collected with SMS PIN code verification',
        location: 'Customer Locker / Doorstep',
        timestamp: now.toISOString(),
        completed: status === 'DELIVERED'
      }
    ];
  }
}

export const shippingService = new ShippingService();
