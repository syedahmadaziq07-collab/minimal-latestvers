---
name: Supabase direct frontend data fetching
description: Why wallpaper-minimal fetches data from Supabase instead of the api-server, and how checkout still works.
---

## Rule
The wallpaper-minimal Vite frontend fetches ALL data directly from Supabase
(not from the api-server) because on Vercel the api-server is unreachable.

## How to apply
- Data reads/writes: use hooks from `src/lib/queries.ts` (Supabase-backed)
- Never re-introduce `@workspace/api-client-react` imports to any page
- Checkout sessions still POST to the api-server via `VITE_API_URL` env var

## Env vars required on Vercel
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key
- `VITE_API_URL` (optional) — base URL for checkout API

## Why
Vercel only serves the static Vite build. The api-server runs on Replit and
is only reachable internally. Fetches to /api/* from Vercel would fail.
