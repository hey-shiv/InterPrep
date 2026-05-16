# web

Unified server — serves both the Hono API under `/api` and the React frontend from a single Bun.serve process.

## Run

```bash
bun run dev
```

The server port is configured automatically.

## Typecheck and build

```bash
bun run build
```

## Deploy on Vercel

Use `packages/web` as the Vercel root directory.

```txt
Framework Preset: Vite
Install Command: bun install
Build Command: bun run build
Output Directory: dist
```

`api/index.ts` exports the Hono app through the Vercel adapter. `vercel.json` rewrites `/api/*` to that function and all non-API routes to the Vite SPA.
