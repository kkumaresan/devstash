# Dashboard UI Phase 1 — Design Spec

**Date:** 2026-03-14
**Status:** Approved
**Branch:** feature/dashboard-phase-1

---

## Overview

Phase 1 of 3 for the DevStash dashboard UI. This phase establishes the shadcn/ui foundation, the `/dashboard` route, the main layout shell, and a display-only top bar. No data, auth, or interactivity is implemented yet.

---

## Approach

Use `npx shadcn@latest init` for Tailwind v4 compatibility (stable release supports v4). Install only the components required for Phase 1 (`button`, `input`). Build the dashboard as a server component shell.

---

## shadcn/ui Setup

- Run `npx shadcn@latest init`
  - Base color: `slate`
  - Dark mode strategy: `class`
  - CSS vars output into `src/app/globals.css`
- Install components: `button`, `input`

---

## File Structure

```
src/
  app/
    globals.css                  ← shadcn CSS vars added; @import "tailwindcss" retained
    layout.tsx                   ← updated: add class="dark" to <html>
    dashboard/
      layout.tsx                 ← dashboard layout shell (server component)
      page.tsx                   ← /dashboard route (server component)
  components/
    dashboard/
      TopBar.tsx                 ← search input + New Item button (display only, client component)
```

---

## Component Specs

### `src/app/layout.tsx` (update)

- Add `className="dark"` to the `<html>` element to enable dark mode globally
- No other changes

### `src/app/dashboard/layout.tsx`

- Server component
- Imports: `import TopBar from "@/components/dashboard/TopBar"`
- Full viewport height (`min-h-screen`)
- Dark background using shadcn/Tailwind CSS vars
- Structure: `<TopBar />` above a flex-row container with two columns:
  - Left column: `<h2>Sidebar</h2>` placeholder
  - Right column: `<h2>Main</h2>` placeholder + `{children}`

### `src/app/dashboard/page.tsx`

- Server component
- Returns an empty fragment — no placeholder markup

### `src/components/dashboard/TopBar.tsx`

- **Client component** (`'use client'`) — Phase 2 will add event handlers and state; establishing the client boundary now avoids structural rework later
- Left: DevStash logo/name text
- Right: shadcn `Input` (search placeholder, display only) + shadcn `Button` ("New Item", display only)
- Full-width, border-bottom separator

---

## Global Styles

- Dark mode is default (applied via `className="dark"` on `<html>` in root `layout.tsx`)
- `globals.css` currently contains only `@import "tailwindcss"` — the shadcn CLI will append CSS custom property vars. The `@import` directive must be retained. No `tailwind.config.js` is introduced.
- Phase 1 does not add a `@theme` block; custom theme tokens are deferred to later phases

---

## Out of Scope (Phase 1)

- Sidebar navigation links
- Functional search
- New Item button handler
- Authentication
- Data fetching
- Mobile responsiveness
