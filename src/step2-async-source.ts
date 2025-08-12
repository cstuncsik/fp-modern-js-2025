#!/usr/bin/env tsx

/**
 * Step 2: Async Source with Async Iterator Helpers
 *
 * Demonstrates:
 * - Async Iterator Helpers for paginated data
 * - Lazy async processing until materialization
 * - Array.fromAsync for collecting async iterables
 */

import type { ItemSale } from './shared/types';
import { fetchOrderPages } from './shared/data';

console.log('🚀 Step 2: Async Source with Async Iterator Helpers\n');

// --- Using Array.fromAsync to collect async iterable -------------------------
console.log('🔄 Using Array.fromAsync to collect paginated data...\n');

// First, let's collect all orders using Array.fromAsync
const allOrderPages = await Array.fromAsync(fetchOrderPages());
console.log(`\n📦 Collected ${allOrderPages.length} pages`);

// Now we can use regular Iterator Helpers on the flattened data
const itemSales = allOrderPages
  .flatMap(page => page)                    // flatten pages to orders
  .values()                                 // convert to iterator
  .filter(o => o.status === 'paid')        // lazy filter
  .map(o => structuredClone(o))             // lazy map; defensive immutability
  .flatMap(o =>                             // lazy expand order -> item sales
    o.items.flatMap<ItemSale>(it => [{
      customerId: o.customerId,
      category: it.category,
      total: it.qty * it.unitPrice,
    }])
  );

console.log('📝 Created Iterator Helper pipeline from Array.fromAsync result');

// --- Single materialization point to rank -----------------------------------
console.log('🎯 Materializing Iterator Helper pipeline...\n');

const salesArr = itemSales.toArray();        // **terminal**: consumes the iterator
console.log(`📊 Processed ${salesArr.length} item sales from paid orders`);

const byCat = Map.groupBy(salesArr, s => s.category); // groups in memory

console.log('📈 Sales by category:');
for (const [category, sales] of byCat) {
  const total = sales.reduce((sum, sale) => sum + sale.total, 0);
  console.log(`  ${category}: ${sales.length} sales, $${total.toLocaleString()}`);
}

const top3 = byCat.entries()
  .map(([category, arr]) => [category, arr.reduce((a, s) => a + s.total, 0)] as const)
  .toArray()
  .toSorted((a, b) => b[1] - a[1])
  .values()                                // Array → Iterator
  .take(3)                                 // Iterator Helper method
  .toArray();                              // final materialization

console.log('\n🏆 Top 3 Categories:');
top3.forEach(([category, total], i) => {
  console.log(`  ${i + 1}. ${category}: $${total.toLocaleString()}`);
});

console.log('\n✅ Step 2 Complete - Array.fromAsync + Iterator Helpers');
console.log('💡 Key: Array.fromAsync collects async data, then use sync Iterator Helpers');
console.log('🎯 Best of both worlds: async collection + lazy processing');
