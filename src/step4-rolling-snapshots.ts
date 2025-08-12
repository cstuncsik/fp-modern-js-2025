#!/usr/bin/env tsx

/**
 * Step 4: Rolling Top-N Snapshots (Live Dashboard)
 *
 * Demonstrates:
 * - FP-style helper functions with arrow syntax
 * - Rolling aggregation with live snapshots
 * - Constant memory top-N maintenance
 * - for-await boundary (where FP currently ends)
 */

import type { Order } from './shared/types';
import { fetchOrderPages } from './shared/data';

console.log('🚀 Step 4: Rolling Top-N Snapshots\n');

// --- Helper: keep only the top N entries (FP style) -------------------------
const topNFromMap = <K>(map: Map<K, number>, n: number): Array<readonly [K, number]> =>
  map.entries()
    .toArray()
    .toSorted((a, b) => b[1] - a[1])     // sort descending (immutable)
    .values()                            // Array → Iterator
    .take(n)                             // Iterator Helper method
    .toArray();                          // final materialization

// --- Page processing ---------------------------------------------------------
const processPageToSales = (page: Order[]): Map<string, number> =>
  page
    .filter(o => o.status === 'paid')                    // declarative filter
    .flatMap(o => o.items.map(it => ({                   // expand to item sales
      category: it.category,
      total: it.qty * it.unitPrice
    })))
    .reduce(                                             // aggregate by category
      (acc, sale) => acc.set(
        sale.category,
        (acc.get(sale.category) ?? 0) + sale.total
      ),
      new Map<string, number>()
    );

// --- Combine two category total maps (pure function) ------------------------
const mergeCategoryTotals = (
  a: Map<string, number>,
  b: Map<string, number>
): Map<string, number> =>
  b.entries().reduce(
    (result, [category, total]) =>
      result.set(category, (result.get(category) ?? 0) + total),
    new Map(a) // defensive copy as initial value
  );

// --- Rolling stream ----------------------------------------------------------
const streamTopCategories = async (
  pages: AsyncIterable<Order[]>,
  limit: number,
  onUpdate: (snapshot: ReadonlyArray<readonly [string, number]>, pageIndex: number) => void,
): Promise<Map<string, number>> => {
  let runningTotals = new Map<string, number>();
  let pageIndex = 0;

  for await (const page of pages) {                      // still need async iteration
    const pageTotals = processPageToSales(page);         // pure function
    runningTotals = mergeCategoryTotals(runningTotals, pageTotals); // pure function

    onUpdate(topNFromMap(runningTotals, limit), pageIndex++); // emit snapshot
  }

  return runningTotals;
};

// --- Demo: Live snapshots ---------------------------------------------------
console.log('📊 Starting rolling top-3 leaderboard...\n');

const finalTotals = await streamTopCategories(
  fetchOrderPages(),
  3,
  (snapshot, pageIndex) => {
    console.log(`📈 After page ${pageIndex + 1}:`);
    snapshot.forEach(([category, total], rank) => {
      console.log(`  ${rank + 1}. ${category}: $${total.toLocaleString()}`);
    });
    console.log('');
  }
);

console.log('🎯 Final leaderboard:');
const finalTop3 = topNFromMap(finalTotals, 3);
finalTop3.forEach(([category, total], i) => {
  console.log(`  🏆 ${i + 1}. ${category}: $${total.toLocaleString()}`);
});

console.log('\n✅ Step 4 Complete - Rolling snapshots with constant memory');
console.log('💡 Key: Each page update maintains only top-N + running totals');
console.log('🔄 Perfect for live dashboards and long-running data streams');
console.log('⚠️  Note: for-await loop represents current FP boundary in JS');
