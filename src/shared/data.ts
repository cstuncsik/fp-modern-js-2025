import type { Order } from './types';

// --- Mock Data Generators ---------------------------------------------------

/**
 * Synchronous order generator for Step 1
 * Returns a lazy iterator that yields orders on demand
 */
export function* orders(): IterableIterator<Order> {
  yield {
    id: 'o1', customerId: 'c1', createdAt: '2025-08-01T10:00:00Z', status: 'paid',
    items: [
      { sku: 'A1', qty: 2, unitPrice: 1200, category: 'books' },
      { sku: 'F4', qty: 3, unitPrice: 500,  category: 'food'  },
    ],
  };
  yield {
    id: 'o2', customerId: 'c2', createdAt: '2025-08-02T09:00:00Z', status: 'paid',
    items: [
      { sku: 'T9', qty: 1, unitPrice: 9999, category: 'tools' },
      { sku: 'B2', qty: 1, unitPrice: 2500, category: 'books' },
    ],
  };
  yield {
    id: 'o3', customerId: 'c3', createdAt: '2025-08-03T12:00:00Z', status: 'pending',
    items: [ { sku: 'X', qty: 10, unitPrice: 100, category: 'food' } ],
  };
  yield {
    id: 'o4', customerId: 'c4', createdAt: '2025-08-04T14:00:00Z', status: 'paid',
    items: [
      { sku: 'H1', qty: 1, unitPrice: 5000, category: 'tools' },
      { sku: 'F5', qty: 2, unitPrice: 800, category: 'food' },
    ],
  };
  yield {
    id: 'o5', customerId: 'c5', createdAt: '2025-08-05T16:00:00Z', status: 'paid',
    items: [
      { sku: 'B3', qty: 3, unitPrice: 1800, category: 'books' },
      { sku: 'T2', qty: 1, unitPrice: 15000, category: 'tools' },
    ],
  };
}

/**
 * Async paginated order generator for Steps 2-4
 * Simulates fetching data from a paginated API
 */
export async function* fetchOrderPages(): AsyncIterable<Order[]> {
  console.log('📄 Fetching page 1...');
  await new Promise(resolve => setTimeout(resolve, 100));
  yield [
    {
      id: 'o1', customerId: 'c1', createdAt: '2025-08-01T10:00:00Z', status: 'paid',
      items: [
        { sku: 'A1', qty: 2, unitPrice: 1200, category: 'books' },
        { sku: 'F4', qty: 3, unitPrice: 500,  category: 'food'  },
      ],
    },
    {
      id: 'o2', customerId: 'c2', createdAt: '2025-08-02T09:00:00Z', status: 'paid',
      items: [
        { sku: 'T9', qty: 1, unitPrice: 9999, category: 'tools' },
        { sku: 'B2', qty: 1, unitPrice: 2500, category: 'books' },
      ],
    },
  ];

  console.log('📄 Fetching page 2...');
  await new Promise(resolve => setTimeout(resolve, 100));
  yield [
    {
      id: 'o3', customerId: 'c3', createdAt: '2025-08-03T12:00:00Z', status: 'pending',
      items: [ { sku: 'X', qty: 10, unitPrice: 100, category: 'food' } ],
    },
    {
      id: 'o4', customerId: 'c4', createdAt: '2025-08-04T14:00:00Z', status: 'paid',
      items: [
        { sku: 'H1', qty: 1, unitPrice: 5000, category: 'tools' },
        { sku: 'F5', qty: 2, unitPrice: 800, category: 'food' },
      ],
    },
  ];

  console.log('📄 Fetching page 3...');
  await new Promise(resolve => setTimeout(resolve, 100));
  yield [
    {
      id: 'o5', customerId: 'c5', createdAt: '2025-08-05T16:00:00Z', status: 'paid',
      items: [
        { sku: 'B3', qty: 3, unitPrice: 1800, category: 'books' },
        { sku: 'T2', qty: 1, unitPrice: 15000, category: 'tools' },
      ],
    },
  ];
}
