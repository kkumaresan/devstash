# Current Feature

<!-- Feature Name -->

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

## Goals

<!-- Goals & requirements -->

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
- Dashboard items: replace mock item data with real DB queries, split page components into individual files
- Stats & Sidebar: replace mock sidebar data with real DB queries, item types with counts, favorite/recent collections, colored circles for recents, "View all collections" link
- Add Pro Badge: added subtle PRO badge to Files and Images types in sidebar using shadcn Badge component
- Code Scanner Quick Wins: type safety for queryItems, take limits on collection queries, composite indexes, Tag userId scoping, deduplicated ICON_MAP, DATABASE_URL guard
