# WALLPAPER.MINIMAL

A curated aesthetic iPhone wallpaper e-commerce shop. Tagline: "Dress your screen, softly."

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/wallpaper-minimal run dev` — run the frontend (port 19491)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Framer Motion, wouter
- Fonts: Cormorant Garamond (headings), DM Sans (body) via Google Fonts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (`wallpapers`, `newsletter_subscribers` tables)
- Payments: Stripe Checkout (server-side session creation)
- Data from: Supabase (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY) for future direct storage
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/wallpapers.ts`
- API spec: `lib/api-spec/openapi.yaml`
- API routes: `artifacts/api-server/src/routes/`
  - `wallpapers.ts` — CRUD + featured + categories + newsletter
  - `checkout.ts` — Stripe checkout session creation
- Frontend pages: `artifacts/wallpaper-minimal/src/pages/`
- Theme/CSS: `artifacts/wallpaper-minimal/src/index.css`

## Architecture decisions

- Stripe checkout is server-side only — secret key never exposed to frontend
- Wallpaper `price` is stored as `numeric` in DB, converted to `number` on API response
- Featured wallpapers feed the iPhone mockup carousel on the hero + showcase sections
- Admin page is password-gated client-side via `VITE_ADMIN_PASSWORD` env var (default: `minimal2025`)

## Product

- Landing page with hero, featured drops, mood collections (filterable), iPhone showcase, bundles, pricing, newsletter
- Shop page with category filtering
- Admin panel at `/admin` for uploading/managing wallpapers
- Stripe checkout for single ($4), pack ($22), and full access ($45) purchases
- Success page after payment

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Google Fonts `@import url(...)` must be the FIRST line in `index.css` — before `@import "tailwindcss"` — or PostCSS fails silently
- The CSS shadow variables block must stay inside a `:root` or `.dark` selector; orphaned CSS custom properties outside a block cause a "Missing opening {" parse error in Tailwind v4

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
