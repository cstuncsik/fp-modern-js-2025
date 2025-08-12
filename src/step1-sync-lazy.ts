#!/usr/bin/env tsx

/**
 * Step 1: Synchronous Lazy Pipeline
 *
 * Demonstrates:
 * - Iterator Helpers for lazy evaluation
 * - Map.groupBy for declarative grouping
 * - Change-by-copy methods (toSorted, toArray)
 * - structuredClone for defensive immutability
 */

import type {  LineItem, ItemSale } from './shared/types';
import { orders } from './shared/data';

console.log('🚀 Step 1: Synchronous Lazy Pipeline\n');

// --- Lazy FP pipeline: nothing executes until the terminal op ----------------
const itemSales: Iterator<ItemSale> =
  orders()                                 // lazy source (generator)
    .filter(o => o.status === 'paid')      // lazy filter
    .map(o => structuredClone(o))          // lazy map; defensive immutability
    .flatMap(o =>                          // lazy expand order -> item sales
      o.items.flatMap<ItemSale>(it => [{
        customerId: o.customerId,
        category: it.category,
        total: it.qty * it.unitPrice,
      }])
    );

console.log('📝 Created lazy pipeline (no work done yet)');

// Materialize groups -> rank top 3
const byCat: Map<LineItem['category'], ItemSale[]> =
  Map.groupBy(itemSales, s => s.category); // **terminal** for the iterator

console.log('📊 Grouped sales by category:');
for (const [category, sales] of byCat) {
  const total = sales.reduce((sum, sale) => sum + sale.total, 0);
  console.log(`  ${category}: ${sales.length} sales, $${total.toLocaleString()}`);
}

const top3 = byCat
  .entries()
  .map(([category, arr]) => [category, arr.reduce((a, s) => a + s.total, 0)] as const)
  .toArray()                               // realize to rank
  .toSorted((a, b) => b[1] - a[1])         // change-by-copy sort (immutable)
  .values()                                // Array → Iterator
  .take(3)                                 // Iterator Helper method
  .toArray();                              // final materialization

console.log('\n🏆 Top 3 Categories:');
top3.forEach(([category, total], i) => {
  console.log(`  ${i + 1}. ${category}: $${total.toLocaleString()}`);
});

console.log('\n✅ Step 1 Complete - Lazy evaluation with Iterator Helpers');
console.log('💡 Key: No work happened until Map.groupBy() triggered the pipeline');
