# Current Feature

None

## Status

Completed

## Goals

- Install and configure Prisma 7 with the `prisma-client` provider (not `prisma-client-js`)
- Connect to Neon PostgreSQL (serverless) via `DATABASE_URL`
- Create initial schema based on data models in project-overview.md:
  - `User` (with Pro/Stripe fields)
  - `Account`, `Session`, `VerificationToken` (NextAuth/Auth.js v5 adapter models)
  - `ItemType` (system + user-created types)
  - `Item` (with `ContentType` enum: text, url, file)
  - `Collection`
  - `ItemCollection` (join table)
  - `Tag` and `ItemTag` (join table)
- Add appropriate indexes and cascade deletes
- Generate initial migration (never `db push`)
- Configure `prisma.config.ts` (Prisma 7 requires this)
- Output generated client to `src/generated/prisma`

## Notes

- Use Prisma 7 — read the upgrade guide before implementing (breaking changes from v6)
- Generator provider must be `"prisma-client"` not `"prisma-client-js"`
- Generated client outputs into project source (`src/generated/prisma`), not `node_modules`
- Config lives in `prisma.config.ts`, not just `schema.prisma`
- `prisma migrate dev` no longer auto-runs seed or generate — run them explicitly
- Always use migrations, never `db push` (except when explicitly told to)
- Development DB uses `DATABASE_URL` (Neon dev branch); production will be a separate branch

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard UI Phase 1: shadcn/ui init, /dashboard route, layout shell, dark mode, display-only top bar
- Dashboard UI Phase 2: collapsible sidebar with item types, favorites, recents, user avatar, mobile drawer
- Dashboard UI Phase 3: main content area with stats cards, recent collections, pinned items, recent items
- Database setup: Prisma 7 + Neon PostgreSQL, full schema, initial migration, seed data, db test script
