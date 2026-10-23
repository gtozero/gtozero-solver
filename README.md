# GTOZero Solver

**App: https://app.gtozero.com** · **About: https://gtozero.com**

A free GTO solver and trainer for Texas Hold'em that runs entirely in your browser — no install, no account required.
Pick ranges, a board and bet sizes, and it computes postflop strategy on your own device (multithreaded WebAssembly).

This project is a fork of [WASM Postflop](https://github.com/b-inary/wasm-postflop) (Copyright © Wataru Inariba)
and is released under the same **AGPL-3.0-or-later** license. See [LICENSE](LICENSE) for the full text.

## Build

Requirements: Node.js 20+, and for the solver engine Rust nightly + [wasm-pack](https://rustwasm.github.io/wasm-pack/).

```sh
npm install
npm run wasm     # builds rust/ into pkg/
npm run build    # outputs dist/
```

Optional: create `.env.local` with `SUPABASE_URL=...` and `SUPABASE_ANON_KEY=...` to enable sign-in and cloud sync.
Without it, the app runs fully on-device and hides account features.

The site must be served with `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`
(needed for multithreading via SharedArrayBuffer).
