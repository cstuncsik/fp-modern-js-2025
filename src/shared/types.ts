/**
 * Shared domain types and mock data for all examples
 */

export type LineItem = {
  sku: string;
  qty: number;
  unitPrice: number; // minor units for simplicity
  category: 'food' | 'tools' | 'books' | (string & {});
};

export type Order = {
  id: string;
  customerId: string;
  createdAt: string; // ISO
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  items: LineItem[];
};

export type ItemSale = {
  customerId: string;
  category: LineItem['category'];
  total: number;
};

// --- Utility Types -----------------------------------------------------------

/**
 * Extract union of category strings from LineItem
 */
export type Category = LineItem['category'];

/**
 * Snapshot data structure for live dashboard updates
 */
export type CategorySnapshot = ReadonlyArray<readonly [string, number]>;

/**
 * WebSocket message types for client-server communication
 */
export type WebSocketMessage =
  | { type: 'hello'; msg: string }
  | {
      type: 'top-categories';
      at: string;
      pageIndex: number;
      items: Array<{ category: string; sum: number }>
    }
  | { type: 'error'; message: string; at: string };
