# Current Feature: Forgot Password

## Status

In Progress

## Goals

- Add "Forgot password?" link on the sign-in page
- Create `/forgot-password` page with email input form
- Create `POST /api/auth/forgot-password` endpoint that generates a reset token (reusing `VerificationToken` model) and sends a reset email via Resend
- Create `sendPasswordResetEmail()` in `src/lib/email.ts`
- Add `generatePasswordResetToken()` and `getPasswordResetTokenByToken()` in `src/lib/tokens.ts` (reuse same pattern as verification tokens)
- Create `/reset-password` page that validates the token and allows setting a new password
- Create `POST /api/auth/reset-password` endpoint that validates token, hashes new password, updates user, and deletes token
- Show appropriate success/error messages with toast notifications
- Don't reveal whether an email exists in the system (security best practice)

## Notes

- Reuse existing `VerificationToken` model — differentiate reset tokens by using a prefix or separate identifier pattern (e.g., `reset:email` as identifier)
- Reuse existing Resend integration from `src/lib/email.ts`
- Token expiry: 1 hour (same as email verification)
- Follow existing auth page patterns from sign-in/register pages
- Password requirements: same as registration (match existing validation)

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
