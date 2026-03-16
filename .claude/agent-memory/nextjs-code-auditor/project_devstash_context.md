---
name: DevStash Project Context
description: Core architectural facts about DevStash relevant to auditing — auth state, hardcoded user IDs, data access patterns, and what is/isn't built yet
type: project
---

DevStash is a developer knowledge hub in early development. Auth.js v5 + Prisma + Neon PostgreSQL are configured in the schema and package.json but **NextAuth is not yet wired up** — there are no auth.ts, proxy.ts, or sign-in/out routes in the codebase as of 2026-03-16.

**Why:** The project is being built feature-by-feature; auth implementation comes later.

**How to apply:** Do not flag the absence of auth routes as a missing feature. DO flag the hardcoded DEMO_USER_ID that bypasses authentication in live routes.

## Known hardcoded demo user
- `DEMO_USER_ID = "user_demo"` is hardcoded in both `src/app/dashboard/layout.tsx` (line 10) and `src/app/dashboard/page.tsx` (line 14).
- The demo user `demo@devstash.io` / password `12345678` is plaintext in `prisma/seed.ts` (line 41) — this is seed-only, acceptable.
- `CURRENT_USER` object is hardcoded in `src/components/dashboard/Sidebar.tsx` (line 78-82) with the demo user's email.

## Data access layer
- All DB queries live in `src/lib/db/items.ts` and `src/lib/db/collections.ts`.
- Queries are properly scoped by `userId` in all `where` clauses — no cross-user data leakage risk in the query layer itself.
- `queryItems` uses `where: object` (broad type) and `orderBy: object` — weak TypeScript typing.
- `getRecentCollections` fetches ALL items per collection via `include` before doing in-memory type counting — potential performance issue at scale.
- `getSidebarCollections` fetches ALL collections for a user with ALL their items for color computation — no limit applied.

## Schema observations
- `Tag` model has no `userId` — tags are global/shared across all users. This is likely intentional but means users could see each other's tag names if a tag UI is ever exposed.
- `Item` has no `@@index([userId, createdAt])` composite index — the common `getRecentItems` query filters by userId AND orders by createdAt but uses separate indexes.
- `Collection` has no `@@index([userId, isFavorite])` composite index.
- `datasource db` in schema.prisma has no `url = env("DATABASE_URL")` line (omitted) — DATABASE_URL is accessed directly in `src/lib/prisma.ts`.

## Mock data file
- `src/lib/mock-data.ts` exists and is a large file (~400 lines) but is NOT currently imported by any page or component. It is dead code.
