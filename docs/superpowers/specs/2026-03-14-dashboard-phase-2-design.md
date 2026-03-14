# Dashboard UI Phase 2 — Design Spec

## Overview

Implement the collapsible sidebar for the DevStash dashboard. This is phase 2 of 3. Phase 1 delivered the layout shell and top bar. Phase 2 delivers the full sidebar with item type navigation, favorite/recent collections, user avatar, and mobile drawer behavior.

## Approach

Use a thin `SidebarContext` (client component) to own **all** sidebar state — both desktop open/closed and mobile Sheet open/closed. `layout.tsx` stays a server component and wraps the layout shell in `SidebarProvider`. `Sidebar` reads context for desktop collapse state and mobile Sheet state. `TopBar` calls `openMobile()` from context to open the Sheet on mobile without prop drilling.

## Component Structure

### New files

| File | Type | Purpose |
|------|------|---------|
| `src/components/dashboard/SidebarContext.tsx` | `'use client'` | All sidebar state: `isOpen`, `toggle()`, `isMobileOpen`, `openMobile()`, `closeMobile()`, and `useSidebar()` hook |
| `src/components/dashboard/Sidebar.tsx` | `'use client'` | Full sidebar UI — reads context for both desktop and mobile state |

### Updated files

| File | Change |
|------|--------|
| `src/app/dashboard/layout.tsx` | Remains a **server component**. Replace `<aside>` placeholder: wrap `TopBar` + the flex row in `<SidebarProvider>`. `<Sidebar>` replaces `<aside>`. `<main>` stays as a direct sibling of `<Sidebar>` inside the flex row. |
| `src/components/dashboard/TopBar.tsx` | Add mobile hamburger button (`md:hidden`) that calls `useSidebar().openMobile()` |

### Component tree

```
DashboardLayout (server)
└── SidebarProvider (client — owns all sidebar state)
    ├── TopBar (client — mobile hamburger, md:hidden)
    └── flex row
        ├── Sidebar (client)
        │   ├── SidebarHeader (toggle button, desktop only)
        │   ├── TypesList (item type nav links)
        │   ├── CollectionsSection (shadcn Collapsible)
        │   └── UserAvatar (bottom)
        └── main (server children pass-through)
```

## SidebarContext API

```ts
interface SidebarContextValue {
  isOpen: boolean;          // desktop: expanded (true) or collapsed/icon-only (false)
  toggle: () => void;       // flip desktop isOpen
  isMobileOpen: boolean;    // mobile Sheet open (true) or closed (false)
  openMobile: () => void;
  closeMobile: () => void;
}
```

## Sidebar Content

### Sections (top to bottom)

1. **Header** — logo/brand text "DevStash" (visible when expanded, hidden when collapsed), plus the desktop toggle button aligned right. Use Lucide `PanelLeftClose` icon when expanded, `PanelLeftOpen` when collapsed. `aria-label="Toggle sidebar"`.
2. **Types** — all 7 item types from `ITEM_TYPES`. Each row: Lucide icon (colored) + label + count. Each is a `next/link` `<Link href={/items/${type.slug}}>`. Links navigate to routes that do not exist yet (out of scope).
3. **Collections** — a `shadcn Collapsible` section. Trigger button has `aria-label="Toggle collections"`. Two subsections:
   - **Favorites** — from `FAVORITE_COLLECTIONS`. Each is a `<Link>` with a filled star icon.
   - **Recent** — from `ALL_COLLECTIONS` sorted by `updatedAt` descending, capped at 5 items. Note: despite the name, `ALL_COLLECTIONS` from mock-data is already filtered to non-favorites only (`COLLECTIONS.filter(col => !col.isFavorite)`) — use it directly without additional filtering.
4. **User avatar** — pinned to bottom with `mt-auto`. Uses shadcn `Avatar` with `AvatarImage` (src: `CURRENT_USER.image`) and `AvatarFallback` (initials derived from `CURRENT_USER.name`, e.g. "JD"). Data from `CURRENT_USER` mock export. Settings icon (`Lucide Settings`) aligned right.

### Lucide icon resolution

`ItemType.icon` is a string name (e.g. `"Code"`, `"StickyNote"`). Resolve via a static map — do **not** use dynamic imports:

```ts
import { Code, Sparkles, Terminal, StickyNote, Link2, File, Image } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,   // Note: the mock uses "StickyNote", not "Note"
  Link: Link2,  // "Link" in mock maps to Link2 to avoid conflict with next/link
  File,
  Image,
};
```

Apply type color via `style={{ color: type.color }}` — hex values are not in the Tailwind theme.

### Desktop collapsed state (icon-only, `w-16`)

- Sidebar width: `w-16`, transition: `transition-[width] duration-200 ease-in-out`
- Type item labels and counts: `opacity-0 w-0 overflow-hidden` (animated out)
- Collections section: `hidden` when sidebar is collapsed. The Collapsible open/closed state **resets to open** whenever the sidebar re-expands (do not preserve collapsed state).
- User area: Avatar circle only, name/email `hidden`
- Toggle button: `PanelLeftOpen` icon, `aria-label="Toggle sidebar"`

### Desktop expanded state (`w-64`)

- Full labels, counts, and section headers visible
- Sidebar is `overflow-y-auto` to handle short viewports
- Toggle button: `PanelLeftClose` icon

### Mobile (always drawer)

- On `< md` breakpoints, sidebar element is `hidden md:flex`
- `TopBar` shows a hamburger icon button (`md:hidden`, `aria-label="Open sidebar"`) that calls `openMobile()` from `useSidebar()`
- `Sidebar` renders a `shadcn Sheet` (side="left") controlled by `isMobileOpen` / `closeMobile()`
- Sheet always renders full expanded content regardless of desktop `isOpen`
- Sheet width matches expanded sidebar (`w-64`)

## Data

All data imported directly from `src/lib/mock-data.ts`:

```ts
import {
  ITEM_TYPES,
  ITEM_TYPE_COUNTS,
  FAVORITE_COLLECTIONS,
  ALL_COLLECTIONS,  // non-favorites only despite the name; sort by updatedAt desc, cap at 5
  CURRENT_USER,
} from "@/lib/mock-data";
```

## Dependencies

- `shadcn Sheet` — `npx shadcn add sheet` (mobile drawer)
- `shadcn Collapsible` — `npx shadcn add collapsible` (collections section)
- `shadcn Avatar` — `npx shadcn add avatar` (user area)
- All Lucide icons available via `lucide-react`

## Styling Notes

- Tailwind CSS v4 — no `tailwind.config.ts`; all theme in `globals.css`
- Sidebar collapse: `transition-[width] duration-200 ease-in-out`
- Type icon colors: `style={{ color: type.color }}` (hex, not Tailwind class)
- Dark mode first (established in Phase 1)
- Sidebar: `overflow-y-auto` for short viewports

## Accessibility

- Desktop toggle: `aria-label="Toggle sidebar"`
- Mobile hamburger: `aria-label="Open sidebar"`
- Collections trigger: `aria-label="Toggle collections"`
- Nav links wrapped in semantic `<nav>`
- Avatar image: `alt={CURRENT_USER.name}`

## Out of Scope

- Active/selected state on nav links (Phase 3)
- Main content area (Phase 3)
- Actual route pages for `/items/[type]` (future)
- Pro gating on File/Image types (future)
