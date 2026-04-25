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
│   │   ├── supabaseAdmin.ts    # service-role Supabase client (bypasses RLS) — server-only
│   │   └── repositories/       # entity-scoped DB query helpers (profiles, services, bookings, reviews, serviceImages)
│   ├── supabase.ts             # browser Supabase client
│   ├── types/                  # TypeScript types
│   └── utils/                  # shared helpers (uuid validator, storage URL builder, etc.)
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
- DB migrations: `pnpm db:generate` then `pnpm db:migrate`
- `drizzle/` folder committed to git (migration history)

## Env vars

- `PUBLIC_*` (e.g. `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`): bundled into the browser. Imported via `$env/static/public`. Anything safe to expose to anyone visiting the site.
- No prefix (e.g. `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`): server-only. Imported via `$env/static/private`. SvelteKit refuses to expose them to client bundles. Use for any value that grants more power than a regular logged-in user has (admin keys, DB credentials, secrets).

## Data access pattern

- All Drizzle queries live in `$lib/server/repositories/<entity>.ts` — page servers call named repo functions, never `db.select()` directly. Joins, aggregates and writes belong in the repo.
- One source of truth: derived values (e.g. service/provider ratings) aggregate over `reviews` at read time. Do not denormalize to cached columns until indexable sort/filter or measured slowness demands it; if added later, prefer a Postgres trigger over app-level updates.

## Domain rules

- **Service status** (`active` | `paused` | `archived`): soft-delete only. `listServices` filters to `active`. The book action rejects non-active. Detail page stays accessible (with banner) so existing customers can find the entry.
- **Booking status** (`pending` | `confirmed` | `completed` | `cancelled`): provider accepts/declines pending; customer marks confirmed → completed. Phones on the booking detail page are nulled server-side while status is `pending` to avoid leaking on the wire.
- **Reviews**: 1:1 with bookings (DB unique constraint on `reviews.booking_id`). Only the customer of a completed booking can post one. Edits/deletes not yet implemented.
- **Booking detail authorization**: returns 404 (not 403) for non-participants to avoid leaking existence.
- **Service images**: up to 5 per service, stored in the public `service-images` Supabase Storage bucket at `<serviceId>/<uuid>.<ext>`. Allowed mime types: `image/jpeg`, `image/png`, `image/webp`. Max size 5 MB each. The DB (`service_images` table) stores only the storage path; public URLs are built by `serviceImageUrl()` in `$lib/utils/storage.ts`. Foreign key cascades so deleting a service drops its image rows; storage objects are removed in the `removeImage` action.
  - **Bucket policies**: bucket is public (direct GETs work without RLS). No SELECT policy — leaving one would let any client list every file path. Writes/deletes go through `supabaseAdmin` (service role), so INSERT/DELETE policies are not required.
  - **Upload action**: `requireOwner` check first; then validate every selected file (size + mime); then verify total ≤ 5 capacity; then upload sequentially. On any single failure the action removes already-uploaded objects from storage and returns an error so the DB and bucket stay consistent. DB inserts use `createImages` (bulk insert) so the row write is atomic.

## Storage admin pattern

- Server-side admin actions (currently service-image upload + delete) go through `supabaseAdmin` from `$lib/server/supabaseAdmin.ts`. The client uses `SUPABASE_SERVICE_ROLE_KEY` and bypasses RLS.
- Authorization is enforced in the form action _before_ `supabaseAdmin` is touched (e.g. `requireOwner` validates the caller owns the resource). Treat the auth check as the only thing standing between a logged-in user and admin powers — never call `supabaseAdmin.<anything>` without one.
- Never echo or log the service role client. Never import `supabaseAdmin` outside `$lib/server/`. Both file location and `$env/static/private` import together prevent the key from reaching the browser.
