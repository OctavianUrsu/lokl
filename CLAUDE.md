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
│   ├── types/              # TypeScript types
│   └── utils/              # shared helpers
├── routes/
│   ├── +layout.svelte      # root layout
│   ├── +layout.server.ts   # pass session/user to all pages
│   ├── +page.svelte        # homepage
│   ├── api/                # REST endpoints (+server.ts)
│   └── [feature]/          # page routes
│       ├── +page.svelte
│       └── +page.server.ts # server-side data loading
├── hooks.server.ts         # Supabase SSR client per request
├── app.html
└── app.d.ts
drizzle.config.ts               # Drizzle Kit config
```

## Conventions

- `+server.ts` for API endpoints (GET, POST, etc.)
- `+page.server.ts` for page data loading (prefer over API for page data)
- `$lib` alias for imports from `src/lib/`
- `src/lib/server/` for server-only code (DB, secrets) — SvelteKit blocks client import
- API endpoints go under `src/routes/api/`
- Env vars in `.env` (not `.env.local`) — works with both SvelteKit and Drizzle Kit
- DB migrations: `pnpm drizzle-kit generate` then `pnpm drizzle-kit migrate`
- `drizzle/` folder committed to git (migration history)
