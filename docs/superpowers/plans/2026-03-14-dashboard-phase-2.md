# Dashboard UI Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a collapsible sidebar with item type navigation, favorite/recent collections, user avatar, and a mobile Sheet drawer.

**Architecture:** A thin `SidebarContext` (client) owns all sidebar state (desktop open/closed + mobile Sheet open/closed). `layout.tsx` stays a server component and wraps the shell in `SidebarProvider`. `Sidebar.tsx` reads context for both desktop collapse and mobile Sheet behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui (Sheet + Collapsible + Avatar), Lucide React, mock data from `src/lib/mock-data.ts`

**Spec:** `docs/superpowers/specs/2026-03-14-dashboard-phase-2-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/dashboard/SidebarContext.tsx` | Create | All sidebar state: `isOpen`, `toggle`, `isMobileOpen`, `openMobile`, `closeMobile` |
| `src/components/dashboard/Sidebar.tsx` | Create | Full sidebar UI — desktop collapse + mobile Sheet |
| `src/app/dashboard/layout.tsx` | Modify | Wrap with `SidebarProvider`, replace `<aside>` with `<Sidebar>` |
| `src/components/dashboard/TopBar.tsx` | Modify | Add mobile hamburger button |

---

## Chunk 1: Branch + shadcn Dependencies + SidebarContext

### Task 1: Create feature branch

- [ ] **Step 1: Create and switch to feature branch**

```bash
git checkout -b feature/dashboard-phase-2
```

Expected: `Switched to a new branch 'feature/dashboard-phase-2'`

---

### Task 2: Install shadcn components

- [ ] **Step 1: Install Sheet**

```bash
npx shadcn@latest add sheet
```

Expected: Sheet files created in `src/components/ui/sheet.tsx`

- [ ] **Step 2: Install Collapsible**

```bash
npx shadcn@latest add collapsible
```

Expected: Collapsible files created in `src/components/ui/collapsible.tsx`

- [ ] **Step 3: Install Avatar**

```bash
npx shadcn@latest add avatar
```

Expected: Avatar files created in `src/components/ui/avatar.tsx`

- [ ] **Step 4: Verify all three exist**

```bash
ls src/components/ui/
```

Expected output includes: `avatar.tsx  button.tsx  collapsible.tsx  input.tsx  sheet.tsx`

- [ ] **Step 5: Run build to confirm no breakage from new components**

```bash
npm run build
```

Expected: Build succeeds (0 errors)

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "chore: install shadcn sheet, collapsible, and avatar components"
```

---

### Task 3: Create SidebarContext

- [ ] **Step 1: Create `src/components/dashboard/SidebarContext.tsx`**

```tsx
"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((prev) => !prev),
        isMobileOpen,
        openMobile: () => setIsMobileOpen(true),
        closeMobile: () => setIsMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
```

- [ ] **Step 2: Run build to verify context compiles clean**

```bash
npm run build
```

Expected: Build succeeds (0 errors)

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/SidebarContext.tsx
git commit -m "feat: add SidebarContext with desktop and mobile state"
```

---

## Chunk 2: Sidebar Component

### Task 4: Create Sidebar.tsx

- [ ] **Step 1: Create `src/components/dashboard/Sidebar.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link2,
  File,
  Image,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Star,
  Settings,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./SidebarContext";
import {
  ITEM_TYPES,
  ITEM_TYPE_COUNTS,
  FAVORITE_COLLECTIONS,
  COLLECTIONS,
  CURRENT_USER,
} from "@/lib/mock-data";
import type { ItemType } from "@/lib/mock-data";

// ─── Icon Map ────────────────────────────────────────────────────────────────

type IconComponent = ComponentType<{
  size?: number;
  className?: string;
  style?: CSSProperties;
}>;

const ICON_MAP: Record<string, IconComponent> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: Link2, // mock uses "Link"; Link2 avoids conflict with next/link
  File,
  Image,
};

// ─── Derived data ─────────────────────────────────────────────────────────────

// Sort all collections by recency (favorites included) — recency is independent of favorite status
const RECENT_COLLECTIONS = [...COLLECTIONS]
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .slice(0, 5);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeItem({ type, isOpen }: { type: ItemType; isOpen: boolean }) {
  const Icon = ICON_MAP[type.icon];
  const count = ITEM_TYPE_COUNTS[type.id] ?? 0;

  return (
    <Link
      href={`/items/${type.slug}`}
      className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {Icon && <Icon size={16} style={{ color: type.color }} className="shrink-0" />}
      <span
        className={`flex-1 transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${
          isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
        }`}
      >
        {type.name}
      </span>
      {isOpen && (
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      )}
    </Link>
  );
}

function SidebarContent({ isOpen }: { isOpen: boolean }) {
  const { toggle } = useSidebar();
  // Controlled open state for collections. Resets to open when sidebar re-expands.
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  useEffect(() => {
    if (isOpen) setCollectionsOpen(true);
  }, [isOpen]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <span
          className={`font-semibold text-sm transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${
            isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
          }`}
        >
          DevStash
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="h-7 w-7 shrink-0"
        >
          {isOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </Button>
      </div>

      {/* Types */}
      <nav className="px-2 py-3 space-y-0.5">
        {ITEM_TYPES.map((type) => (
          <TypeItem key={type.id} type={type} isOpen={isOpen} />
        ))}
      </nav>

      {/* Collections — only visible when expanded */}
      {isOpen && (
        <div className="px-2 pb-3">
          <Collapsible open={collectionsOpen} onOpenChange={setCollectionsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                aria-label="Toggle collections"
              >
                Collections
                <ChevronDown size={12} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {/* Favorites */}
              {FAVORITE_COLLECTIONS.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {FAVORITE_COLLECTIONS.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Star size={12} className="shrink-0 text-yellow-400 fill-yellow-400" />
                      <span className="truncate">{col.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Recent */}
              {RECENT_COLLECTIONS.length > 0 && (
                <div className="mt-2">
                  <p className="px-2 py-1 text-xs text-muted-foreground">Recent</p>
                  <div className="space-y-0.5">
                    {RECENT_COLLECTIONS.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors truncate"
                      >
                        <span className="truncate">{col.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Avatar */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={CURRENT_USER.image ?? ""} alt={CURRENT_USER.name} />
            <AvatarFallback className="text-xs">
              {getInitials(CURRENT_USER.name)}
            </AvatarFallback>
          </Avatar>
          {isOpen && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{CURRENT_USER.name}</p>
                <p className="text-xs text-muted-foreground truncate">{CURRENT_USER.email}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label="Settings">
                <Settings size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { isOpen, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <SidebarContent isOpen={isOpen} />
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={(open) => !open && closeMobile()}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          {/* SheetTitle required by Radix for a11y; visually hidden */}
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent isOpen={true} />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

- [ ] **Step 2: Run build to verify Sidebar compiles**

```bash
npm run build
```

Expected: Build succeeds. If `SidebarContext` is not yet imported by `layout.tsx`, there may be a warning but no error — that's fine at this stage.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/Sidebar.tsx
git commit -m "feat: add Sidebar component with collapse, collections, and mobile Sheet"
```

---

## Chunk 3: Integration + Verification

### Task 5: Update layout.tsx

- [ ] **Step 1: Replace the contents of `src/app/dashboard/layout.tsx`**

```tsx
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <TopBar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
```

Note: `layout.tsx` stays a server component — it imports client components (`SidebarProvider`, `Sidebar`, `TopBar`) but does not use hooks itself.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds (0 errors)

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/layout.tsx
git commit -m "feat: integrate Sidebar and SidebarProvider into dashboard layout"
```

---

### Task 6: Update TopBar with mobile hamburger

- [ ] **Step 1: Replace the contents of `src/components/dashboard/TopBar.tsx`**

```tsx
"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "./SidebarContext";

export default function TopBar() {
  const { openMobile } = useSidebar();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — hidden on md+ */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={openMobile}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </Button>
        <span className="text-lg font-semibold text-foreground">DevStash</span>
      </div>
      <div className="flex items-center gap-3">
        <Input
          type="search"
          placeholder="Search items..."
          className="w-64"
        />
        <Button>New Item</Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds (0 errors)

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/TopBar.tsx
git commit -m "feat: add mobile hamburger to TopBar"
```

---

### Task 7: Browser verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open `http://localhost:3000/dashboard` and verify desktop behavior**

Checklist:
- [ ] Sidebar visible on left with 7 item types (Snippet, Prompt, Command, Note, Link, File, Image)
- [ ] Each type has correct icon (colored) + label + count
- [ ] Collections section visible with Favorites (React Patterns, Context Files, Git Commands — each with a filled star) and Recent (React Patterns, AI Prompts, Interview Prep, Context Files, Git Commands — top 5 by updatedAt desc)
- [ ] User avatar area at bottom shows "JD" initials, "John Doe", "john@example.com", settings icon
- [ ] PanelLeftClose icon in sidebar header — clicking it collapses sidebar to icon-only (`w-16`)
- [ ] Collapsed state: only icons visible, no labels, no collections section, only avatar circle
- [ ] PanelLeftOpen icon in collapsed sidebar — clicking re-expands to full width
- [ ] Width transition is smooth

- [ ] **Step 3: Verify mobile behavior**

Resize browser to `< 768px` (mobile width):
- [ ] Desktop sidebar is hidden
- [ ] Hamburger icon appears in TopBar (left of "DevStash")
- [ ] Clicking hamburger opens Sheet drawer from left
- [ ] Sheet shows full expanded sidebar content
- [ ] Clicking outside Sheet or close button dismisses it

- [ ] **Step 4: Final production build**

```bash
npm run build
```

Expected: Build succeeds with 0 errors and 0 TypeScript errors.

---

### Task 8: Final commit + PR prep

- [ ] **Step 1: Verify git log looks clean**

```bash
git log --oneline feature/dashboard-phase-2 ^main
```

Expected output (5 commits):
```
feat: add mobile hamburger to TopBar
feat: integrate Sidebar and SidebarProvider into dashboard layout
feat: add Sidebar component with collapse, collections, and mobile Sheet
feat: add SidebarContext with desktop and mobile state
chore: install shadcn sheet, collapsible, and avatar components
```

- [ ] **Step 2: Update `context/current-feature.md`**

The feature is now complete. Mark status as `Completed` in `context/current-feature.md`.
