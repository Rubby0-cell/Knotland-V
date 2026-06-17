# Knotland Vault

A premium 18+ membership platform with Supabase auth, age verification, tier-based content access, payment proof submissions, and a luxury black & gold mobile-first design.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/knotland-vault run dev` — run the frontend (port via PORT env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SUPABASE_URL`, `SUPABASE_ANON_KEY` — for API server auth (already set)
- Required env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — for frontend auth (must be set by user)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui
- API: Express 5 + Zod validation
- DB: PostgreSQL + Drizzle ORM
- Auth: Supabase (JWT-based, email/password)
- Storage: Supabase Storage (buckets: `Payments-proofs`, `member-content`)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/knotland-vault/src/` — React frontend
  - `pages/` — all route pages (landing, login, register, dashboard, plans, submit-payment, content, profile, testimonials, admin/*)
  - `components/auth-provider.tsx` — Supabase auth context + `useAuth` hook
  - `components/layout/protected-layout.tsx` — sidebar layout with auth guard
  - `components/layout/public-layout.tsx` — public nav + footer
  - `lib/supabase.ts` — Supabase client (needs VITE_ env vars)
  - `index.css` — luxury black/gold theme (Google Fonts import MUST be line 1)
- `artifacts/api-server/src/` — Express API
  - `routes/` — all API route handlers
  - `middlewares/auth.ts` — lazy Supabase JWT verification
- `lib/db/` — Drizzle schema (members, plans, payment_proofs, announcements, testimonials, content_items)
- `lib/api-client-react/` — generated React Query hooks (run codegen to regenerate)
- `lib/api-spec/openapi.yaml` — source of truth for API contract

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → React Query hooks + Zod schemas. Never hand-write fetch calls.
- **Supabase auth lazy init**: API server creates Supabase client lazily to avoid crash when env vars aren't set at module load time.
- **CSS import order**: `@import url(...)` Google Fonts MUST be literally line 1 before Tailwind imports — PostCSS fails silently otherwise.
- **Auth token injection**: `setAuthTokenGetter()` from `@workspace/api-client-react` is called in `App.tsx` to inject the Supabase JWT into every API call automatically.
- **RBAC**: Three roles — `member`, `vip`, `admin`. Content access gated by tier (`standard` < `vip` < `lifetime`). Admin routes guarded by `requireAdmin` middleware.

## Product

- **Landing page** with age gate (persisted to localStorage), hero, feature highlights, plan cards, testimonials
- **Auth** — email/password signup + login via Supabase
- **Age verification gate** — overlay on first visit
- **Member dashboard** — stats, announcements, quick actions
- **Content library** — tier-gated content with Supabase signed URL access
- **Plans page** — 3 tiers: Standard ($29.99/mo), VIP ($79.99/mo), Lifetime ($299.99 once)
- **Payment proof submission** — 3-step wizard, uploads screenshot to Supabase Storage `Payments-proofs` bucket
- **Profile** — display name/bio editing, testimonial submission with star rating
- **Testimonials** — public page showing approved testimonials
- **Admin panel** — member management, payment queue approval, announcement CRUD, testimonial moderation

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- CSS: `@import url(...)` must be literally line 1 before all other imports — PostCSS fails silently otherwise.
- Frontend Supabase client uses `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (VITE_ prefix required for Vite to expose to browser). Falls back to placeholder values — auth won't work until these are set.
- API server Supabase client uses `SUPABASE_URL` / `SUPABASE_ANON_KEY` (no VITE_ prefix, already set as secrets).
- After any DB schema change: run `pnpm --filter @workspace/db run push` to sync, then restart API server workflow.
- After any OpenAPI spec change: run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
