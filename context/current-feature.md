# Current Feature: Auth UI - Sign In, Register & Sign Out

## Status

In Progress

## Goals

- Custom Sign In page (`/sign-in`) with email/password fields, GitHub OAuth button, and link to register
- Custom Register page (`/register`) with name, email, password, confirm password fields and validation
- User avatar in sidebar bottom (GitHub image or initials fallback)
- Dropdown menu on avatar click with "Sign out" option
- Avatar click navigates to `/profile`
- Form validation and error display on both pages

## Notes

- Avatar logic: use GitHub `image` if available, otherwise generate initials from name (e.g., "John Doe" → "JD")
- Create a reusable avatar component that handles both image and initials cases
- Register form submits to existing `/api/auth/register` endpoint
- Redirect to sign-in on successful registration

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
- Auth Phase 1: NextAuth v5 with GitHub OAuth, split config for edge compatibility, Prisma adapter with JWT strategy, proxy-based dashboard route protection, session type extensions
- Auth Phase 2: Credentials provider with email/password registration, bcrypt validation, POST /api/auth/register endpoint
