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
│   ├── components/         # reusable Svelte components
│   ├── server/
│   │   ├── db.ts           # Drizzle client
│   │   └── schema.ts       # Drizzle table definitions
│   ├── supabase.ts         # browser Supabase client
│   ├── types/              # TypeScript types
│   └── utils/              # shared helpers
├── routes/
│   ├── +layout.svelte      # root layout + auth-aware nav
│   ├── +layout.server.ts   # pass session/user to all pages
│   ├── +page.svelte        # homepage
│   ├── auth/callback/      # email confirmation callback
│   ├── login/              # login page
│   ├── signup/             # signup page (creates profile in DB)
│   ├── logout/             # POST endpoint, signs out
│   ├── profile/            # view profile + my services list
│   │   └── edit/           # edit profile form
│   ├── services/           # browse all services (category filter)
│   │   ├── new/            # create service (provider only)
│   │   └── [id]/           # service detail (public)
│   │       └── edit/       # edit service (owner only)
│   ├── bookings/           # customer bookings list + mark complete
│   │   └── requests/       # provider booking requests (accept/decline)
│   ├── users/[id]/         # public user profile
│   └── api/                # REST endpoints (+server.ts)
├── hooks.server.ts         # Supabase SSR client per request
├── app.html
└── app.d.ts
drizzle.config.ts               # Drizzle Kit config
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
- DB migrations: `pnpm drizzle-kit generate` then `pnpm drizzle-kit migrate`
- `drizzle/` folder committed to git (migration history)
