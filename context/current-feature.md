# Current Feature

<!-- Feature Name -->

Dashboard Items: Replace Mock Data with Real DB Data

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

- Replace dummy item data in the dashboard main area (right side) with actual data from the Neon database using Prisma
- Create `src/lib/db/items.ts` with data fetching functions
- Fetch items directly in server components
- Item card icon/border derived from the item type
- Display item type tags and all existing UI elements
- Update collection stats display
- If there are no pinned items, hide the pinned section entirely

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard UI Phase 1: shadcn/ui init, /dashboard route, layout shell, dark mode, display-only top bar
- Dashboard UI Phase 2: collapsible sidebar with item types, favorites, recents, user avatar, mobile drawer
- Dashboard UI Phase 3: main content area with stats cards, recent collections, pinned items, recent items
- Database setup: Prisma 7 + Neon PostgreSQL, full schema, initial migration, seed data, db test script
- Seed data: demo user, 7 system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources)
- Dashboard collections: replace mock data with real DB data, derive card border color from dominant item type, show type icons per card
