# CLAUDE.md

## Project

SvelteKit app (TypeScript). Local services marketplace.
Package manager: pnpm (use `pnpm` not `npm`).

## Stack

- **Framework:** SvelteKit (SSR)
- **DB:** Supabase (Postgres)
- **ORM:** Drizzle (`drizzle-orm`, `drizzle-kit`)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **DB driver:** `postgres` (node-postgres)

## Structure

```
src/
├── lib/
│   ├── components/             # reusable Svelte components
│   ├── server/
│   │   ├── db.ts               # Drizzle client
│   │   ├── schema.ts           # Drizzle table definitions
│   │   └── repositories/       # entity-scoped DB query helpers (profiles, services, bookings, reviews)
│   ├── supabase.ts             # browser Supabase client
│   ├── types/                  # TypeScript types
│   └── utils/                  # shared helpers (uuid validator, etc.)
├── routes/
│   ├── +layout.svelte          # root layout + auth-aware nav with active-route highlight
│   ├── +layout.server.ts       # pass session/user/role to all pages
│   ├── +page.svelte            # homepage
│   ├── auth/callback/          # email confirmation callback
│   ├── login/                  # login page
│   ├── signup/                 # signup page (creates profile in DB)
│   ├── logout/                 # POST endpoint, signs out
│   ├── profile/                # view profile + my services list (owner)
│   │   └── edit/               # edit profile form
│   ├── services/               # browse active services (category filter)
│   │   ├── new/                # create service (provider only)
│   │   └── [id]/               # service detail (public)
│   │       └── edit/           # edit service (owner only, including status)
│   ├── bookings/               # customer bookings list
│   │   ├── [id]/               # booking detail: status actions, gated phones, customer review form
│   │   └── requests/           # provider booking requests
│   ├── users/[id]/             # public user profile (own id redirects to /profile)
│   └── api/                    # REST endpoints (+server.ts)
├── hooks.server.ts             # Supabase SSR client per request (cookies.set wrapped in try/catch for late refresh)
├── app.html
└── app.d.ts
drizzle.config.ts               # Drizzle Kit config
drizzle/                        # generated migrations + meta (committed)
supabase/config.toml            # Supabase local dev config
```

## Linting & Formatting

- **Prettier** + **ESLint** via `pnpm lint` (check) / `pnpm lint:fix` (auto-fix)
- **Husky** + **lint-staged** run prettier + eslint on pre-commit
- Prettier config: tabs, single quotes, no trailing commas, printWidth 120

## Conventions

- `+server.ts` for API endpoints (GET, POST, etc.)
- `+page.server.ts` for page data loading (prefer over API for page data)
- `$lib` alias for imports from `src/lib/`
- `src/lib/server/` for server-only code (DB, secrets) — SvelteKit blocks client import
- API endpoints go under `src/routes/api/`
- Env vars in `.env` (not `.env.local`) — works with both SvelteKit and Drizzle Kit
- DB migrations: `pnpm drizzle-kit generate` then `pnpm db:migrate`
- `drizzle/` folder committed to git (migration history)

## Data access pattern

- All Drizzle queries live in `$lib/server/repositories/<entity>.ts` — page servers call named repo functions, never `db.select()` directly. Joins, aggregates and writes belong in the repo.
- One source of truth: derived values (e.g. service/provider ratings) aggregate over `reviews` at read time. Do not denormalize to cached columns until indexable sort/filter or measured slowness demands it; if added later, prefer a Postgres trigger over app-level updates.

## Domain rules

- **Service status** (`active` | `paused` | `archived`): soft-delete only. `listServices` filters to `active`. The book action rejects non-active. Detail page stays accessible (with banner) so existing customers can find the entry.
- **Booking status** (`pending` | `confirmed` | `completed` | `cancelled`): provider accepts/declines pending; customer marks confirmed → completed. Phones on the booking detail page are nulled server-side while status is `pending` to avoid leaking on the wire.
- **Reviews**: 1:1 with bookings (DB unique constraint on `reviews.booking_id`). Only the customer of a completed booking can post one. Edits/deletes not yet implemented.
- **Booking detail authorization**: returns 404 (not 403) for non-participants to avoid leaking existence.
