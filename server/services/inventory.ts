// Inventory Service for Accessories.lt
import crypto from 'crypto';
import { db } from '../db.js';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'PURCHASE_RECEIPT' | 'ORDER_DEDUCTION' | 'CUSTOMER_RETURN' | 'MANUAL_ADJUSTMENT';
  quantityChange: number;
  resultingStock: number;
  actor: string;
  notes?: string;
  timestamp: string;
}

class InventoryService {
  private movements: InventoryMovement[] = [];

  constructor() {
    // Seed initial movements
    this.movements.push(
      {
        id: 'mov-1',
        productId: 'prod-1870',
        productName: 'Kashmiri Bangles for Women (16 Pcs Set)',
        sku: 'IVR-JWL-1870',
        type: 'PURCHASE_RECEIPT',
        quantityChange: 40,
        resultingStock: 40,
        actor: 'Supplier Inbound',
        notes: 'Stock received from artisan workshop',
        timestamp: '2026-09-12T10:00:00Z'
      },
      {
        id: 'mov-2',
        productId: 'prod-1870',
        productName: 'Kashmiri Bangles for Women (16 Pcs Set)',
        sku: 'IVR-JWL-1870',
        type: 'ORDER_DEDUCTION',
        quantityChange: -5,
        resultingStock: 35,
        actor: 'Order ACC-2026-000101',
        notes: 'Shipped to customer',
        timestamp: '2026-09-17T10:15:00Z'
      }
    );
  }

  /**
   * Adjust stock manually with audit and movement recording.
   */
  public adjustStock(
    productId: string, 
    newStock: number, 
    actorName: string, 
    notes?: string
  ): { success: boolean; message: string; stock: number } {
    const product = db.products.get(productId);
    if (!product) {
      return { success: false, message: 'Product not found', stock: 0 };
    }

    const previousStock = product.stock;
    const diff = newStock - previousStock;
    product.stock = Math.max(0, newStock);
    product.updatedAt = new Date().toISOString();

    const mov: InventoryMovement = {
      id: 'mov-' + crypto.randomUUID().slice(0, 8),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: 'MANUAL_ADJUSTMENT',
      quantityChange: diff,
      resultingStock: product.stock,
      actor: actorName,
      notes: notes || 'Admin manual inventory correction',
      timestamp: new Date().toISOString()
    };
    this.movements.unshift(mov);

    db.logAudit({
      userId: 'admin',
      userEmail: actorName,
      action: 'INVENTORY_CHANGED',
      resource: 'INVENTORY',
      resourceId: product.sku,
      details: `Stock changed from ${previousStock} to ${product.stock} (change: ${diff > 0 ? '+' + diff : diff})`,
      ip: '127.0.0.1'
    });

    return {
      success: true,
      message: `Inventory updated for ${product.name}`,
      stock: product.stock
    };
  }

  /**
   * Return recent movements log.
   */
  public getMovements(limit = 20): InventoryMovement[] {
    return this.movements.slice(0, limit);
  }

  /**
   * Return low stock items (< 20 units).
   */
  public getLowStockAlerts() {
    return Array.from(db.products.values())
      .filter(p => p.stock < 20)
      .map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.categoryName,
        stock: p.stock,
        threshold: 20
      }));
  }
}

export const inventoryService = new InventoryService();
