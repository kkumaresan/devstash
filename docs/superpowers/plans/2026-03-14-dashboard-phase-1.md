# Dashboard UI Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the `/dashboard` route with a layout shell, display-only top bar, and shadcn/ui initialized on Tailwind v4.

**Architecture:** Initialize shadcn/ui via `npx shadcn@latest init` (supports Tailwind v4 natively), add `Button` and `Input` components, then build the dashboard route as a server-component layout with a client-component top bar and placeholder sidebar/main columns.

**Tech Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (latest)

---

## Chunk 1: Setup, shadcn init, layout scaffolding

### Task 1: Create feature branch

**Files:** none

- [ ] **Step 1: Create and switch to the feature branch**

  ```bash
  git checkout -b feature/dashboard-phase-1
  ```

- [ ] **Step 2: Verify you are on the correct branch**

  ```bash
  git branch --show-current
  ```

  Expected output: `feature/dashboard-phase-1`

---

### Task 2: Initialize shadcn/ui

**Files:**
- Modify: `src/app/globals.css`
- Create: `components.json` (shadcn config, project root)
- Create: `src/lib/utils.ts` (shadcn utility — `cn()` helper)
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`

> **Note:** `npx shadcn@latest init` is interactive. The CLI auto-detects Tailwind v4 and adjusts accordingly. Answer the prompts as documented in Step 1 below.

- [ ] **Step 1: Run shadcn init**

  ```bash
  npx shadcn@latest init
  ```

  When prompted, answer:
  | Prompt | Answer |
  |--------|--------|
  | Which style would you like to use? | **Default** |
  | Which color would you like to use as base color? | **Slate** |
  | Would you like to use CSS variables for colors? | **Yes** |

  The CLI will update `src/app/globals.css` with CSS custom property vars and create `components.json`.

- [ ] **Step 2: Verify `globals.css` still contains `@import "tailwindcss"`**

  Open `src/app/globals.css`. It should begin with `@import "tailwindcss";` followed by shadcn CSS vars (`:root { --background: ...; ... }`). If the `@import` line is missing, add it back at the top of the file.

- [ ] **Step 3: Verify no `tailwind.config.js` or `tailwind.config.ts` was created**

  ```bash
  ls tailwind.config* 2>/dev/null && echo "EXISTS - DELETE IT" || echo "OK - not present"
  ```

  Expected output: `OK - not present`
  If it exists, delete it — this project uses Tailwind v4 CSS-based config only.

- [ ] **Step 4: Add the Button component**

  ```bash
  npx shadcn@latest add button
  ```

  Expected: Creates `src/components/ui/button.tsx`

- [ ] **Step 5: Add the Input component**

  ```bash
  npx shadcn@latest add input
  ```

  Expected: Creates `src/components/ui/input.tsx`

- [ ] **Step 6: Verify the project still builds**

  ```bash
  npm run build
  ```

  Expected: Build completes with no errors. Fix any TypeScript or import errors before proceeding.

- [ ] **Step 7: Commit shadcn setup**

  ```bash
  git add src/app/globals.css components.json src/lib/utils.ts src/components/ui/button.tsx src/components/ui/input.tsx
  git commit -m "chore: initialize shadcn/ui with button and input components"
  ```

---

### Task 3: Update root layout for dark mode and metadata

**Files:**
- Modify: `src/app/layout.tsx` (lines 15–34)

- [ ] **Step 1: Update `src/app/layout.tsx`**

  Replace the entire file content with:

  ```tsx
  import type { Metadata } from "next";
  import { Geist, Geist_Mono } from "next/font/google";
  import "./globals.css";

  const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

  export const metadata: Metadata = {
    title: "DevStash",
    description: "Your developer knowledge hub",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    );
  }
  ```

- [ ] **Step 2: Verify build still passes**

  ```bash
  npm run build
  ```

  Expected: No errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/layout.tsx
  git commit -m "chore: enable dark mode and update metadata"
  ```

---

### Task 4: Create the TopBar component

**Files:**
- Create: `src/components/dashboard/TopBar.tsx`

- [ ] **Step 1: Create the directory**

  ```bash
  mkdir -p src/components/dashboard
  ```

- [ ] **Step 2: Create `src/components/dashboard/TopBar.tsx`**

  ```tsx
  "use client";

  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";

  export default function TopBar() {
    return (
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
        <span className="text-lg font-semibold text-foreground">DevStash</span>
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

- [ ] **Step 3: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: No errors. Fix any import path issues if shadcn components live at a different path (check `components.json` → `aliases.components` for the correct base path).

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/dashboard/TopBar.tsx
  git commit -m "feat: add TopBar component with search and new item button"
  ```

---

### Task 5: Create the dashboard layout

**Files:**
- Create: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create the directory**

  ```bash
  mkdir -p src/app/dashboard
  ```

- [ ] **Step 2: Create `src/app/dashboard/layout.tsx`**

  ```tsx
  import TopBar from "@/components/dashboard/TopBar";

  export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <div className="flex">
          <aside className="w-64 border-r border-border p-4">
            <h2 className="text-lg font-semibold">Sidebar</h2>
          </aside>
          <main className="flex-1 p-4">
            <h2 className="text-lg font-semibold">Main</h2>
            {children}
          </main>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: No errors.

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/dashboard/layout.tsx
  git commit -m "feat: add dashboard layout with sidebar and main placeholders"
  ```

---

### Task 6: Create the dashboard page

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create `src/app/dashboard/page.tsx`**

  ```tsx
  export default function DashboardPage() {
    return <></>;
  }
  ```

- [ ] **Step 2: Run final build**

  ```bash
  npm run build
  ```

  Expected: Build completes with no errors or warnings.

- [ ] **Step 3: Start dev server and visually verify**

  ```bash
  npm run dev
  ```

  Open `http://localhost:3000/dashboard` in a browser. Verify:
  - Dark background renders
  - Top bar shows "DevStash" on the left, search input and "New Item" button on the right
  - "Sidebar" h2 appears on the left column
  - "Main" h2 appears in the main area
  - No console errors

- [ ] **Step 4: Commit**

  ```bash
  git add src/app/dashboard/page.tsx
  git commit -m "feat: add dashboard route"
  ```

---

### Task 7: Run lint and final verification

**Files:** none

- [ ] **Step 1: Run lint**

  ```bash
  npm run lint
  ```

  Expected: No errors. Fix any lint issues before proceeding.

- [ ] **Step 2: Run final build**

  ```bash
  npm run build
  ```

  Expected: Clean build with no errors.
