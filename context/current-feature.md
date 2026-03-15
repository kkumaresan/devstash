# Current Feature

Seed Data for Demo

## Status

Completed

## Goals

- Create demo user (demo@devstash.io) with bcryptjs-hashed password
- Seed all 7 system item types with correct names, icons, and colors
- Seed 5 collections with realistic content per spec:
  - React Patterns: 3 TypeScript snippets
  - AI Workflows: 3 prompts
  - DevOps: 1 snippet + 1 command + 2 links
  - Terminal Commands: 4 commands
  - Design Resources: 4 links

## Notes

- Reference: context/features/seed-spec.md
- Hash password with bcryptjs, 12 rounds
- Use stable IDs so seed is idempotent (safe to re-run)
- Type names are lowercase per spec (snippet, prompt, command...)

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Dashboard UI Phase 1: shadcn/ui init, /dashboard route, layout shell, dark mode, display-only top bar
- Dashboard UI Phase 2: collapsible sidebar with item types, favorites, recents, user avatar, mobile drawer
- Dashboard UI Phase 3: main content area with stats cards, recent collections, pinned items, recent items
- Database setup: Prisma 7 + Neon PostgreSQL, full schema, initial migration, seed data, db test script
- Seed data: demo user, 7 system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources)
