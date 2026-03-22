# Current Feature: Rate Limiting for Auth

## Status

In Progress

## Goals

- Add rate limiting to auth-related API routes using Upstash Redis + `@upstash/ratelimit`
- Protect login (5/15min), register (3/1hr), forgot-password (3/1hr), reset-password (5/15min), resend-verification (3/15min)
- Create reusable `src/lib/rate-limit.ts` utility with sliding window algorithm
- Key by IP or IP + email depending on endpoint
- Return 429 responses with `Retry-After` header and user-friendly error messages
- Display rate limit errors via toast notifications on the frontend
- Fail open if Upstash is unavailable

## Notes

- Upstash free tier: 10k requests/day (sufficient for auth limiting)
- Env vars needed: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Login limiting with NextAuth credentials may need custom sign-in handler
- Extract IP from `x-forwarded-for` header (Vercel) or request

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
- Auth Phase 3: Custom sign-in/register pages, reusable UserAvatar component, sidebar user menu with session data and sign-out dropdown
- Toast Notifications: Sonner toast for registration success/error, global Toaster in root layout
- Email Verification: Resend email on register, verification token with 1-hour expiry, /verify-email page, block unverified sign-in
- Email Verification Toggle: EMAIL_VERIFICATION_ENABLED env var to enable/disable email verification, defaults to disabled for development
- Forgot Password: forgot password flow with reset email via Resend, reuse VerificationToken with reset: prefix, /forgot-password and /reset-password pages, color-coded Sonner toasts with richColors
- Profile Page: user info with avatar, usage stats with per-type breakdown, change password (credentials users only), delete account with confirmation dialog, AlertDialog component
