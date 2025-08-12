# FP-Friendly Modern JavaScript You Can Use Today (2025)

## TL;DR
You can write clean, functional-style JavaScript in 2025 using only standard features, no Babel, no flags. With Iterator Helpers, change-by-copy, Set methods, groupBy, async pipelines, Promise.allSettled, structuredClone, and more, you can build lazy, immutable, declarative data flows straight in vanilla JS.

---

## Why "functional style" in JS?
Functional programming (FP) favors declarative transformations, immutability, and composability. In practice, that means: map/filter/reduce pipelines, avoiding in-place mutation, and writing code that reads like data flow instead of step-by-step instructions. Recent ECMAScript releases supercharged this style.
Here's what's ready and how to use it.

---

## Feature Lineup (widely adoptable)

### 1) [Iterator Helpers](https://github.com/tc39/proposal-iterator-helpers) (lazy pipelines)
Array-like methods on iterators: .map(), .filter(), .take(), .drop(), .flatMap(), .reduce(), .some(), .every(), .toArray() and friends. Laziness means you only realize the value of something when you actually need it.

> **Note:** [Async Iterator Helpers](https://github.com/tc39/proposal-async-iterator-helpers) (.map(), .filter(), etc. directly on async iterators) are still in TC39 proposal stage. This is why our async examples use practical workarounds like Array.fromAsync() first, then regular Iterator Helpers.

```typescript
function* range(n: number) {
  for (let i = 0; i < n; i++) yield i; // generator is lazy by design
}

const oddsSquared = range(1_000_000) // <-- no numbers generated yet
  .filter(n => n % 2) // lazy filter
  .map(n => n * n) // lazy map
  .take(5) // still lazy; stops after 5 when iterated
  .toArray(); // <-- iteration happens here, pipeline runs

// [1, 9, 25, 49, 81]
```

### 2) [Change Array by Copy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods) (immutable array ops)
Non-mutating alternatives to classic mutators: toSorted, toReversed, toSpliced, and with.

```typescript
const xs = [3, 1, 2];
const ys = xs.toSorted();  // creates new array, xs unchanged
const zs = xs.with(0, 99); // creates new array, replaces index 0 in the copy
// xs is still [3, 1, 2]
```

### 3) [Set Methods](https://github.com/tc39/proposal-set-methods) (pure set algebra)
Math-y, immutable-style set ops: union, intersection, difference, symmetricDifference plus relations like isSubsetOf.

```typescript
const a = new Set([1,2,3]);
const b = new Set([3,4]);
const out = a
  .union(b) // returns new Set, does not modify a or b
  .difference(new Set([2])); // subtract 2 from result
// out = Set {1,3,4}
```

### 4) [Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy) / [Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)
Declarative grouping without boilerplate loops.

```typescript
const users = [
  { id: 1, team: 'A' },
  { id: 2, team: 'B' },
  { id: 3, team: 'A' },
];
const byTeam = Object.groupBy(users, u => u.team);
// groups into a new object; input array remains unchanged
// { A: [{id:1...}, {id:3...}], B: [{id:2...}] }
```

### 5) [Array.fromAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync)
Pulls async iterables (streams, paginated APIs) into arrays without hand-rolled loops.

```typescript
// readLines(url) is async iterable; nothing fetched until awaited
const lines = await Array.fromAsync(readLines(url));
// <-- async iteration happens here, collects all values into array
```

### 6) [Promise.withResolvers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)
A small ergonomic primitive for orchestrating async flows cleanly.

```typescript
const { promise, resolve } = Promise.withResolvers<number>();
// promise stays pending until resolve() is called
setTimeout(() => resolve(42), 100); // triggers resolution
console.log(await promise); // awaits until resolved; logs 42
```

### 7) [Array.prototype.flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)
Map + flatten in one pass, perfect for pipelines that need expansion.

```typescript
const words = ['a b', 'c d'];
const chars = words.flatMap(w => w.split(''));
// flattens one level after mapping
// ['a',' ','b','c',' ','d']
```

### 8) [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
Aggregate success and failure without short-circuiting, great for parallel effects with safe collection.

```typescript
const results = await Promise.allSettled([
  fetch('/ok'),   // both fetches start immediately
  fetch('/fail')
]);
// resolves when *all* settle (fulfilled or rejected)
const errors = results.filter(r => r.status === 'rejected');
```

### 9) [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
Spec-defined deep clone for structured data.

```typescript
const original = { a: 1, b: { c: 2 } };
const copy = structuredClone(original); // deep copies structured data
copy.b.c = 99; // changes only the copy
// original.b.c is still 2
```

**TypeScript tip:** Add a modern lib target (e.g. "lib": ["ES2025", "DOM"]) so types for Iterator Helpers/Set Methods are available. Node 22+ and evergreen browsers ship these.

---

## A Real-World FP Pipeline (and its evolution)

Below are four incremental steps that solve the same problem: take orders → derive item-level sales → rank top categories. Each step includes a plain-language change note, a short "why it matters", and a fully annotated code snippet.

### Domain types used across examples

```typescript
type LineItem = {
  sku: string;
  qty: number;
  unitPrice: number; // minor units for simplicity
  category: 'food' | 'tools' | 'books' | (string & {});
};

type Order = {
  id: string;
  customerId: string;
  createdAt: string; // ISO
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  items: LineItem[];
};
```

---

## Step 1: Synchronous, lazy pipeline

Use Iterator Helpers + flatMap + groupBy + change-by-copy.

### What happens
Get paid orders only, expand them to item-level sales, group by category, and rank, all lazily. No work happens until a terminal operation runs.

### Why it matters
You get clear, declarative dataflow with no accidental mutation. Great for moderate datasets and in-memory sources.

```typescript
// TS 5.6+, Node 22+ or modern browser
// --- Domain types ------------------------------------------------------------
type LineItem = { sku: string; qty: number; unitPrice: number; category: 'food' | 'tools' | 'books' | (string & {}) };
type Order = { id: string; customerId: string; createdAt: string; status: 'paid' | 'pending' | 'cancelled' | 'refunded'; items: LineItem[] };
type ItemSale = { customerId: string; category: LineItem['category']; total: number };

// --- In-memory source: a lazy generator (no work until consumed) -------------
function* orders(): IterableIterator<Order> {
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
}

// --- Lazy pipeline: nothing executes until the terminal op ----------------
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

// Materialize groups -> rank top 3
const byCat: Map<LineItem['category'], ItemSale[]> =
  Map.groupBy(itemSales, s => s.category); // **terminal** for the iterator

const top3 = byCat
  .entries()
  .map(([category, arr]) => [category, arr.reduce((a, s) => a + s.total, 0)] as const)
  .toArray()                               // realize to rank
  .toSorted((a, b) => b[1] - a[1])         // change-by-copy sort (immutable)
  .values()                                // Array → Iterator
  .take(3)                                 // Iterator Helper method
  .toArray();                              // final materialization

console.log(top3); // e.g., [ ['tools', 9999], ['books', 4900], ['food', 1500] ]
```

---

## Step 2: Async source with Array.fromAsync (practical workaround)

Process paginated async data using Array.fromAsync + sync Iterator Helpers.

### What happens
We use Array.fromAsync() to collect async data first, then apply regular Iterator Helpers. This is the practical approach until Async Iterator Helpers ship.

### Why it matters
This adapts seamlessly to APIs/files/streams while keeping your code declarative. Still acceptable for moderate data sizes, and works in production today.

```typescript
// TS 5.6+, Node 22+
// --- Domain types reused from Step 1 ----------------------------------------
// type LineItem ...; type Order ...; type ItemSale ...

// --- Async paginated source (mock) ------------------------------------------
async function* fetchOrderPages(): AsyncIterable<Order[]> {
  await Promise.resolve();
  yield [ /* page 1 orders */ ];
  yield [ /* page 2 orders */ ];
}

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

// --- Single materialization point to rank -----------------------------------
const salesArr = itemSales.toArray();        // **terminal**: consumes the iterator
const byCat = Map.groupBy(salesArr, s => s.category); // groups in memory
const top3 = byCat.entries()
  .map(([category, arr]) => [category, arr.reduce((a, s) => a + s.total, 0)] as const)
  .toArray()
  .toSorted((a, b) => b[1] - a[1])
  .values()                                // Array → Iterator
  .take(3)                                 // Iterator Helper method
  .toArray();                              // final materialization
```

> **🔮 Future Syntax (when Async Iterator Helpers ship):**
> ```typescript
> // Direct async iterator helpers - no Array.fromAsync needed!
> const itemSales: AsyncIterator<ItemSale> =
>   fetchOrderPages()                         // async iterable source
>     .flatMap(page => page.values())         // flatten pages -> orders (lazy)
>     .filter(o => o.status === 'paid')       // lazy async filter
>     .map(o => structuredClone(o))           // lazy async map
>     .flatMap(o =>                           // lazy async expand
>       o.items.values().map<ItemSale>(it => ({
>         customerId: o.customerId,
>         category:   it.category,
>         total:      it.qty * it.unitPrice,
>       }))
>     );
>
> // Single materialization - directly on async iterator
> const salesArr = await itemSales.toArray(); // **terminal**: consumes async stream
> // ... rest stays the same
> ```
>
> **Why this matters:** Pure lazy async evaluation without the Array.fromAsync collection step. The entire pipeline remains lazy until `.toArray()`.

---

## Step 3: Streaming fold (constant memory)

Use streaming aggregation without intermediate arrays to achieve constant memory usage.

### What happens
We eliminate the Array.fromAsync() and instead stream directly through the pages. Memory becomes O(number of categories), not O(number of sales).

### Why it matters
Memory becomes O(number of categories), not O(number of sales). This scales to massive datasets and even infinite streams.

```typescript
// TS 5.6+, Node 22+
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

// --- Manual streaming fold: O(categories) memory instead of O(sales) -------
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

const top3 = totals.entries()                 // small structure → rank
  .toArray()
  .toSorted((a, b) => b[1] - a[1])           // immutable sort
  .values()                                  // Array → Iterator
  .take(3)                                   // Iterator Helper method
  .toArray();                                // final materialization
```

> **🔮 Future Syntax (when Async Iterator Helpers ship):**
> ```typescript
> // Direct .reduce() on async iterator - no manual for-await loop!
> const itemSales: AsyncIterator<ItemSale> =
>   fetchOrderPages()                         // async iterable source
>     .flatMap(page => page.values())         // flatten pages -> orders (lazy)
>     .filter(o => o.status === 'paid')       // lazy async filter
>     .map(o => structuredClone(o))           // lazy async map
>     .flatMap(o =>                           // lazy async expand
>       o.items.values().map<ItemSale>(it => ({
>         customerId: o.customerId,
>         category:   it.category,
>         total:      it.qty * it.unitPrice,
>       }))
>     );
>
> // Streaming fold directly on async iterator
> const totals = await itemSales.reduce(        // **terminal**: consumes async stream
>   (acc, s) => acc.set(                        // update per item as it arrives
>     s.category,
>     (acc.get(s.category) ?? 0) + s.total,
>   ),
>   new Map<LineItem['category'], number>(),
> );
> // ... rest stays the same
> ```
>
> **Why this matters:** Pure streaming aggregation with declarative `.reduce()` instead of imperative `for await` loops. The entire async pipeline becomes a single expression.

---

## Step 4: Rolling top-N snapshots (per page, for dashboards)

Maintain a small leaderboard updated after each page.

### What happens
Instead of waiting for the end, we emit a snapshot after each page. We keep a running Map<category, sum> and a tiny top‑N buffer.

### Why it matters
Ideal for live dashboards and long-running jobs: low latency and constant memory irrespective of item count.

```typescript
// TS 5.6+, Node 22+
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

// Example usage
void streamTopCategories(fetchOrderPages(), 3, (snap, i) => {
  console.log(`After page #${i}:`, snap);
});
```

---

## Bonus

### Node WebSocket server for live leaderboard

#### What happens
A minimal Node.js WebSocket server consumes the rolling leaderboard and pushes updates to connected clients.

#### Why it matters
You connect the FP-style stream directly to real-time delivery without manual state juggling.

```typescript
// server.ts - Node 22+, `npm i ws`
import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
  ws.on('error', () => clients.delete(ws)); // Basic cleanup
  ws.send(JSON.stringify({ type: 'hello', msg: 'Connected. Waiting for updates…' }));
});

const broadcast = (data: unknown) => {
  const json = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      try { ws.send(json); } catch { clients.delete(ws); } // Remove failed clients
    }
  }
};

// Stream with basic retry
const safeStream = async (): Promise<void> => {
  try {
    await streamTopCategories(fetchOrderPages(), 3, (snapshot, pageIndex) => {
      broadcast({
        type: 'top-categories',
        at: new Date().toISOString(),
        pageIndex,
        items: snapshot.map(([category, sum]) => ({ category, sum })),
      });
    });
  } catch (err) {
    console.error('Stream failed:', err);
    setTimeout(safeStream, 5000); // Simple retry
  }
};

void safeStream();
console.log('WS listening on ws://localhost:8080');
```

### React client (live leaderboard)

#### What happens
A React component connects to the WebSocket server and renders the top‑N snapshot on each update, with tiny visual hints when values change.

#### Why it matters
Shows how the FP streaming pipeline plugs into a declarative UI with no mutable shared state.

```tsx
// LiveTopCategories.tsx with React 18+
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Entry = { category: string; sum: number };

export default function LiveTopCategories() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [connected, setConnected] = useState(false);
  const prev = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'top-categories' && msg.items) {
          setRows(msg.items);
        }
      } catch {} // Ignore invalid messages
    };

    return () => ws.close();
  }, []);

  const withDelta = useMemo(() => rows.map(r => ({
    ...r,
    prev: prev.current.get(r.category),
  })), [rows]);

  useEffect(() => {
    const next = new Map<string, number>();
    for (const r of rows) next.set(r.category, r.sum);
    prev.current = next;
  }, [rows]);

  return (
    <div>
      <div style={{ marginBottom: '10px', color: connected ? 'green' : 'red' }}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 640 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px' }}>#</th>
            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Category</th>
            <th style={{ textAlign: 'right', padding: '6px 8px' }}>Sum</th>
            <th style={{ textAlign: 'right', padding: '6px 8px' }}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {withDelta.map((r, i) => {
            const delta = r.prev === undefined ? 0 : r.sum - r.prev;
            return (
              <tr key={r.category}>
                <td style={{ padding: '6px 8px' }}>{i + 1}</td>
                <td style={{ padding: '6px 8px' }}>{r.category}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.sum.toLocaleString()}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', opacity: r.prev === undefined ? 0.6 : 1 }}>
                  {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Wrap-up

You can write functional, immutable, lazy JavaScript today, no experimental flags or Babel needed. The current standard gives you everything to build clean, declarative pipelines:

- **Iterator Helpers + groupBy + change-by-copy** → lazy, readable, and mutation-free data flows.
- **Set methods** → pure set algebra without side effects.
- **Async Iterator Helpers + Array.fromAsync** → end-to-end async laziness for streams, paginated APIs, or files.
- **Promise.allSettled** → safe parallelism that never short-circuits.
- **structuredClone** → deep defensive copies without libraries.
- **Streaming folds (reduce)** → constant-memory aggregation for massive datasets.
- **Incremental snapshots** → rolling top-N dashboards or live push updates.

In other words: the tools are here, the syntax is standard, and the FP-style pipelines you've been writing in libraries can now be just JavaScript/Typescript.

## Full Working Examples

All the code examples from this post are available as runnable TypeScript files in the [companion repository](https://github.com/cstuncsik/fp-modern-js-2025). You can clone it, run the examples, and experiment with the patterns yourself.
