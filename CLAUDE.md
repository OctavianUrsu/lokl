# CLAUDE.md

## Project

SvelteKit app (TypeScript). Bare project, early stage.
Package manager: pnpm (use `pnpm` not `npm`).

## Structure

```
src/
├── lib/                    # shared code, import as $lib
│   ├── components/         # reusable Svelte components
│   ├── server/             # server-only utils (DB, auth)
│   ├── types/              # TypeScript types
│   └── utils/              # shared helpers
├── routes/
│   ├── +layout.svelte      # root layout
│   ├── +page.svelte        # homepage
│   ├── api/                # REST endpoints (+server.ts)
│   └── [feature]/          # page routes
│       ├── +page.svelte
│       └── +page.server.ts # server-side data loading
├── app.html
└── app.d.ts
```

## Conventions

- `+server.ts` for API endpoints (GET, POST, etc.)
- `+page.server.ts` for page data loading (prefer over API for page data)
- `$lib` alias for imports from `src/lib/`
- `src/lib/server/` for server-only code (DB, secrets) — SvelteKit blocks client import
- API endpoints go under `src/routes/api/`
