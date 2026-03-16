# Current Feature

Code Scanner Quick Wins

## Status

In Progress

## Goals

Quick wins from code scan (2026-03-16):

### High

- [x] Use `Prisma.ItemWhereInput` / `Prisma.ItemOrderByWithRelationInput` types in `queryItems` (`src/lib/db/items.ts`) instead of bare `object`

### Medium

- [x] Add `take` limit on items relation in `getRecentCollections` (`src/lib/db/collections.ts`) to prevent unbounded fetches
- [x] Add `take` limit and move slicing to Prisma query in `getSidebarCollections` (`src/lib/db/collections.ts`)
- [x] Add composite database indexes: `[userId, createdAt]` on Item, `[userId, updatedAt]` and `[userId, isFavorite]` on Collection
- ~~Add `url = env("DATABASE_URL")` to datasource block~~ — Not supported in Prisma 7; adapter pattern is correct
- [x] Add `userId` to `Tag` model to scope tags per user instead of global sharing

### Low

- [x] Deduplicate `ICON_MAP` in `Sidebar.tsx` — import from `@/components/dashboard/icon-map` instead of local copy
- [x] Replace non-null assertion on `DATABASE_URL` in `src/lib/prisma.ts` with a proper guard and error message

## Notes

Auth-related items (CRITICAL #1, HIGH #2) will be addressed when we implement authentication.

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard UI Phase 1: shadcn/ui init, /dashboard route, layout shell, dark mode, display-only top bar
- Dashboard UI Phase 2: collapsible sidebar with item types, favorites, recents, user avatar, mobile drawer
- Dashboard UI Phase 3: main content area with stats cards, recent collections, pinned items, recent items
- Database setup: Prisma 7 + Neon PostgreSQL, full schema, initial migration, seed data, db test script
- Seed data: demo user, 7 system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources)
- Dashboard collections: replace mock data with real DB data, derive card border color from dominant item type, show type icons per card
- Dashboard items: replace mock item data with real DB queries, split page components into individual files
- Stats & Sidebar: replace mock sidebar data with real DB queries, item types with counts, favorite/recent collections, colored circles for recents, "View all collections" link
- Add Pro Badge: added subtle PRO badge to Files and Images types in sidebar using shadcn Badge component
