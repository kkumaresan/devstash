# Current Feature

Dashboard Collections - Real Data

## Status

Completed

## Goals

- Create `src/lib/db/collections.ts` with data fetching functions
- Fetch collections directly in server component (replace mock data)
- Collection card border color derived from most-used content type in that collection
- Show small icons of all types in that collection
- Keep the current design (reference: context/screenshots/dashboard-ui-main.png)
- Update collection stats display

## Notes

- Reference: context/features/dashboard-collections-spec.md
- Replace data from `src/lib/mock-data.ts` with real Neon DB data via Prisma
- Do not add items underneath the collections yet

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard UI Phase 1: shadcn/ui init, /dashboard route, layout shell, dark mode, display-only top bar
- Dashboard UI Phase 2: collapsible sidebar with item types, favorites, recents, user avatar, mobile drawer
- Dashboard UI Phase 3: main content area with stats cards, recent collections, pinned items, recent items
- Database setup: Prisma 7 + Neon PostgreSQL, full schema, initial migration, seed data, db test script
- Seed data: demo user, 7 system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources)
- Dashboard collections: replace mock data with real DB data, derive card border color from dominant item type, show type icons per card
