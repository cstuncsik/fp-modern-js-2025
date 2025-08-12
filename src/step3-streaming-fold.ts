#!/usr/bin/env tsx

/**
 * Step 3: Streaming Fold (Constant Memory)
 *
 * Demonstrates:
 * - .reduce() directly on async iterator
 * - Constant memory usage O(categories), not O(sales)
 * - Streaming aggregation without intermediate arrays
 */

import type { LineItem, ItemSale } from './shared/types';
import { fetchOrderPages } from './shared/data';

console.log('🚀 Step 3: Streaming Fold (Constant Memory)\n');

// --- Manual streaming fold (constant memory, no Array.fromAsync) -----------
// Note: We DON'T use Array.fromAsync here because we want constant memory
async function* createItemSales() {
  for await (const page of fetchOrderPages()) {
    for (const order of page) {
      if (order.status === 'paid') {
        const clonedOrder = structuredClone(order);
        for (const item of clonedOrder.items) {
          yield {
            customerId: clonedOrder.customerId,
            category: item.category,
            total: item.qty * item.unitPrice,
          } as ItemSale;
        }
      }
    }
  }
}

const itemSales = createItemSales();

console.log('📝 Created streaming generator pipeline (constant memory)');
console.log('🔄 Starting streaming fold (constant memory)...\n');

// --- Manual streaming fold: O(categories) memory instead of O(sales) -------
const startTime = Date.now();
let itemCount = 0;
const totals = new Map<LineItem['category'], number>();

for await (const sale of itemSales) {
  itemCount++;
  if (itemCount % 2 === 0) {
    process.stdout.write(`\r📊 Processed ${itemCount} items...`);
  }
  totals.set(                              // update per item as it arrives
    sale.category,
    (totals.get(sale.category) ?? 0) + sale.total,
  );
}

const elapsed = Date.now() - startTime;
console.log(`\n\n✅ Streaming complete: ${itemCount} items in ${elapsed}ms`);

console.log(`💾 Memory usage: ${totals.size} categories (constant regardless of item count)`);

console.log('\n📈 Final category totals:');
for (const [category, total] of totals) {
  console.log(`  ${category}: $${total.toLocaleString()}`);
}

const top3 = totals.entries()                 // small structure → rank
  .toArray()
  .toSorted((a, b) => b[1] - a[1])           // immutable sort
  .values()                                  // Array → Iterator
  .take(3)                                   // Iterator Helper method
  .toArray();                                // final materialization

console.log('\n🏆 Top 3 Categories:');
top3.forEach(([category, total], i) => {
  console.log(`  ${i + 1}. ${category}: $${total.toLocaleString()}`);
});

console.log('\n✅ Step 3 Complete - True streaming without Array.fromAsync');
console.log('💡 Key: Skip Array.fromAsync when you need constant memory');
console.log('🚀 This pattern scales to millions of items or infinite streams');
