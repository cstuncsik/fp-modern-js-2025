#!/usr/bin/env tsx

/**
 * WebSocket Server for Live Dashboard
 *
 * Demonstrates:
 * - FP stream connected to real-time delivery
 * - Arrow functions throughout
 * - Basic error handling for production readiness
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Order } from './shared/types';
import { fetchOrderPages } from './shared/data';

console.log('🚀 Starting WebSocket server for live dashboard...\n');

const wss = new WebSocketServer({ port: 8080 });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws)); // Basic cleanup
  ws.send(JSON.stringify({ type: 'hello', msg: 'Connected. Waiting for updates…' }));
  console.log(`👋 Client connected (${clients.size} total)`);
});

const broadcast = (data: unknown) => {
  const json = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(json); } catch { clients.delete(ws); } // Remove failed clients
    }
  }
};

// --- FP Helper Functions (from Step 4) --------------------------------------
const topNFromMap = <K>(map: Map<K, number>, n: number): Array<readonly [K, number]> =>
  map.entries()
    .toArray()
    .toSorted((a, b) => b[1] - a[1])
    .values()                            // Array → Iterator
    .take(n)                             // Iterator Helper method
    .toArray();                          // final materialization

const processPageToSales = (page: Order[]): Map<string, number> =>
  page
    .filter(o => o.status === 'paid')
    .flatMap(o => o.items.map(it => ({
      category: it.category,
      total: it.qty * it.unitPrice
    })))
    .reduce(
      (acc, sale) => acc.set(
        sale.category,
        (acc.get(sale.category) ?? 0) + sale.total
      ),
      new Map<string, number>()
    );

const mergeCategoryTotals = (
  a: Map<string, number>,
  b: Map<string, number>
): Map<string, number> =>
  b.entries().reduce(
    (result, [category, total]) =>
      result.set(category, (result.get(category) ?? 0) + total),
    new Map(a)
  );

const streamTopCategories = async (
  pages: AsyncIterable<Order[]>,
  limit: number,
  onUpdate: (snapshot: ReadonlyArray<readonly [string, number]>, pageIndex: number) => void,
): Promise<Map<string, number>> => {
  let runningTotals = new Map<string, number>();
  let pageIndex = 0;

  for await (const page of pages) {
    const pageTotals = processPageToSales(page);
    runningTotals = mergeCategoryTotals(runningTotals, pageTotals);

    onUpdate(topNFromMap(runningTotals, limit), pageIndex++);
  }

  return runningTotals;
};

// --- Stream with basic retry and broadcasting -------------------------------
const safeStream = async (): Promise<void> => {
  try {
    console.log('📊 Starting FP data stream...\n');

    await streamTopCategories(fetchOrderPages(), 3, (snapshot, pageIndex) => {
      const update = {
        type: 'top-categories',
        at: new Date().toISOString(),
        pageIndex,
        items: snapshot.map(([category, sum]) => ({ category, sum })),
      };

      console.log(`📤 Broadcasting page ${pageIndex + 1} update to ${clients.size} clients`);
      broadcast(update);
    });

    console.log('✅ Stream completed successfully');

    // Start a new cycle after a delay for demo purposes
    setTimeout(() => {
      console.log('\n🔄 Restarting stream cycle...\n');
      safeStream();
    }, 5000);

  } catch (err) {
    console.error('❌ Stream failed:', err);
    setTimeout(safeStream, 5000); // Simple retry
  }
};

// --- Graceful shutdown ------------------------------------------------------
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// --- Start everything -------------------------------------------------------
void safeStream();

console.log('🌐 WebSocket server listening on ws://localhost:8080');
console.log('🎯 Connect your React client to see live updates');
console.log('💡 Press Ctrl+C to stop\n');
