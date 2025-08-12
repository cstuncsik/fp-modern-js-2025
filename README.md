# FP-Friendly Modern JavaScript (2025)

Working examples from the blog post: **"FP-Friendly Modern JavaScript You Can Use Today (2025)"**

This repository demonstrates how to write clean, functional-style JavaScript using only standard ES2024+ features - no Babel, no flags, no external FP libraries.

## Features Demonstrated

- ✨ **Iterator Helpers** - lazy pipelines with `.map()`, `.filter()`, `.take()`
- 🔄 **Change Array by Copy** - immutable operations with `toSorted`, `toReversed`, `with`
- 🧮 **Set Methods** - pure set algebra with `union`, `intersection`, `difference`
- 📊 **Object/Map.groupBy** - declarative grouping without loops
- 🌊 **Array.fromAsync** - async iterable collection
- 🎯 **Promise.withResolvers** - ergonomic async control
- 🔄 **structuredClone** - spec-defined deep copying
- 📈 **Streaming aggregation** - constant-memory processing
- 🚀 **Live dashboards** - WebSocket + React integration

## Requirements

- **Node.js 22+** (for Iterator Helpers and latest features)
- **Modern browser** (Chrome 117+, Safari 17+, Firefox 119+)

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-username/fp-modern-js-2025.git
cd fp-modern-js-2025
npm install

# Run individual examples
npm run step1  # Sync lazy pipeline
npm run step2  # Async source processing
npm run step3  # Streaming fold (constant memory)
npm run step4  # Rolling snapshots

# Run live dashboard (server + client)
npm run dev    # Starts WebSocket server + React client
```

## Examples Structure

### Step 1: Synchronous Lazy Pipeline
```bash
npm run step1
```
Demonstrates Iterator Helpers, `Map.groupBy`, and change-by-copy methods for in-memory data processing.

### Step 2: Async Source Processing
```bash
npm run step2
```
Shows async Iterator Helpers for processing paginated APIs while maintaining laziness.

### Step 3: Streaming Fold
```bash
npm run step3
```
Constant-memory aggregation using `.reduce()` directly on async iterators.

### Step 4: Rolling Snapshots
```bash
npm run step4
```
Live dashboard updates with incremental top-N processing.

### Live Dashboard
```bash
npm run dev
```
Full-stack example: WebSocket server streams live data to React client with real-time leaderboard updates.

- **Server**: http://localhost:8080 (WebSocket)
- **Client**: http://localhost:5173 (React app)

## Key Files

```
src/
├── step1-sync-lazy.ts          # In-memory FP pipeline
├── step2-async-source.ts       # Async iterator processing
├── step3-streaming-fold.ts     # Constant memory aggregation
├── step4-rolling-snapshots.ts  # Live dashboard snapshots
├── server.ts                   # WebSocket server
├── client/
│   ├── index.html             # Client entry point
│   ├── main.tsx               # React app setup
│   └── LiveTopCategories.tsx  # Dashboard component
└── shared/
    └── types.ts               # Domain types
```

## Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Iterator Helpers | 117+ | 17+ | 119+ | 117+ |
| Set Methods | 122+ | 17+ | 127+ | 122+ |
| Change Array by Copy | 110+ | 16+ | 115+ | 110+ |
| Object.groupBy | 117+ | 17.4+ | 119+ | 117+ |

## TypeScript Configuration

The project uses TypeScript 5.6+ with:
- `"lib": ["ES2025", "DOM"]` for latest features
- `"target": "ES2025"` for native compilation
- Strict type checking enabled

## Learning Path

1. **Read the blog post** - understand the concepts and patterns
2. **Run Step 1** - see basic FP pipeline with Iterator Helpers
3. **Run Step 2** - understand async iterator processing
4. **Run Step 3** - learn streaming aggregation patterns
5. **Run Step 4** - see rolling updates for dashboards
6. **Run full demo** - experience real-time FP data flow

## Contributing

Found an issue or want to improve an example? PRs welcome!

## License

MIT - Feel free to use these patterns in your projects.

---

📖 **Blog Post**: [FP-Friendly Modern JavaScript You Can Use Today (2025)](https://medium.com/@cstuncsik/fp-friendly-modern-javascript-you-can-use-today-2025-0a9471ef9df6)
