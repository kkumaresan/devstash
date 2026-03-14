# DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all your developer knowledge & resources.**

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Target Users](#target-users)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Data Model (Draft)](#data-model-draft)
- [Prisma Schema (Draft)](#prisma-schema-draft)
- [Item Types Reference](#item-types-reference)
- [Features](#features)
- [Monetization](#monetization)
- [UI/UX Guidelines](#uiux-guidelines)
- [Key Links & Resources](#key-links--resources)

---

## Problem Statement

Developers keep their essentials scattered across too many tools:

| What                 | Where it ends up                  |
| -------------------- | --------------------------------- |
| Code snippets        | VS Code, Notion, Gists           |
| AI prompts           | Chat histories                    |
| Context files        | Buried in project directories     |
| Useful links         | Browser bookmarks                 |
| Docs & notes         | Random folders                    |
| Terminal commands     | `.txt` files, bash history        |
| Project templates    | GitHub Gists, boilerplate repos   |

This creates **context switching**, **lost knowledge**, and **inconsistent workflows**.

DevStash solves this by providing a single, fast, searchable, AI-enhanced hub for all developer knowledge and resources.

---

## Target Users

| Persona                          | Core Need                                                     |
| -------------------------------- | ------------------------------------------------------------- |
| **Everyday Developer**           | Fast access to snippets, prompts, commands, and links         |
| **AI-first Developer**           | Save and organize prompts, contexts, workflows, system messages |
| **Content Creator / Educator**   | Store code blocks, explanations, and course notes             |
| **Full-stack Builder**           | Collect patterns, boilerplates, and API examples              |

---

## Tech Stack

| Layer              | Technology                          | Notes                                                                   |
| ------------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| **Framework**      | Next.js 16 / React 19              | App Router, SSR pages with dynamic components, Turbopack (stable default) |
| **Language**       | TypeScript                          | Strict mode for type safety                                             |
| **Database**       | Neon (PostgreSQL)                   | Serverless Postgres in the cloud                                        |
| **ORM**            | Prisma 7                            | Rust-free TypeScript client, `prisma-client` provider                   |
| **Auth**           | Auth.js v5 (NextAuth v5)            | Email/password + GitHub OAuth, Prisma adapter                           |
| **File Storage**   | Cloudflare R2                       | S3-compatible object storage for file/image uploads                     |
| **AI**             | OpenAI `gpt-5-nano`                 | Auto-tagging, summaries, code explanation, prompt optimizer             |
| **CSS**            | Tailwind CSS v4 + shadcn/ui        | Utility-first styling with accessible component primitives              |
| **Payments**       | Stripe                              | Subscriptions for Pro tier                                              |
| **Caching**        | Redis *(optional, future)*          | For hot paths and rate limiting                                         |

### Key Stack Decisions

- **Single codebase/repo** — frontend + API routes in one Next.js project for less overhead.
- **Prisma migrations only** — never use `db push` or directly update DB structure. All changes go through migrations that run in dev first, then prod.
- **Prisma 7** uses the new `prisma-client` generator (not `prisma-client-js`) and outputs generated code into the project source, not `node_modules`.
- **Next.js 16** replaces `middleware.ts` with `proxy.ts` and uses Cache Components (`use cache`) instead of the old PPR flag.

### Relevant Docs

- 📘 [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- 📘 [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- 📘 [Prisma 7 Announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- 📘 [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions)
- 📘 [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- 📘 [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- 📘 [shadcn/ui Docs](https://ui.shadcn.com)
- 📘 [Neon Serverless Postgres](https://neon.tech/docs)
- 📘 [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- 📘 [Stripe Subscriptions](https://docs.stripe.com/billing/subscriptions/overview)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                        Client                            │
│              (React 19 / Next.js 16 App Router)          │
│          Tailwind CSS v4 + shadcn/ui + Dark Mode         │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   Next.js 16 Server                      │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  proxy.ts   │  │ Server       │  │ API Routes     │  │
│  │  (auth      │  │ Components   │  │ /api/items     │  │
│  │   guard)    │  │ (SSR pages)  │  │ /api/ai        │  │
│  └─────────────┘  └──────────────┘  │ /api/upload    │  │
│                                     │ /api/stripe     │  │
│                                     └────────────────┘  │
└──────┬──────────────────┬──────────────────┬─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐  ┌──────────────┐   ┌──────────────────┐
│  Auth.js v5 │  │  Prisma 7    │   │  Cloudflare R2   │
│  (sessions, │  │  (ORM layer) │   │  (file storage)  │
│   OAuth)    │  └──────┬───────┘   └──────────────────┘
└─────────────┘         │
                        ▼
              ┌──────────────────┐       ┌──────────────┐
              │   Neon Postgres  │       │  OpenAI API  │
              │   (database)     │       │  gpt-5-nano  │
              └──────────────────┘       └──────────────┘
```

---

## Data Model (Draft)

> ⚠️ **This is a rough draft.** Field names, types, and relations are subject to change during development.

```
┌──────────┐       ┌───────────┐       ┌──────────────┐
│   User   │──1:N──│   Item    │──N:M──│  Collection  │
│          │       │           │       │              │
│          │──1:N──│           │       │              │
│          │       └─────┬─────┘       └──────────────┘
│          │             │
│          │──1:N──┌─────┴─────┐
│          │       │ ItemType  │
└──────────┘       └───────────┘

                   ┌───────────┐
          Item ──N:M──  Tag    │
                   └───────────┘

Join Tables:
  - ItemCollection (Item ↔ Collection)
  - ItemTag (Item ↔ Tag)
```

### Entity Descriptions

| Entity             | Purpose                                                           |
| ------------------ | ----------------------------------------------------------------- |
| **User**           | Extends Auth.js user; holds Pro status and Stripe IDs             |
| **Item**           | Core content unit — can be text (snippet, prompt, note, command), a URL (link), or a file (file, image) |
| **ItemType**       | Categorizes items. System types are immutable; users can create custom types (Pro) |
| **Collection**     | Named grouping of items. An item can belong to multiple collections |
| **ItemCollection** | Join table tracking when an item was added to a collection        |
| **Tag**            | Flat tags for cross-cutting organization and search               |
| **ItemTag**        | Join table for Item ↔ Tag many-to-many relation                  |

---

## Prisma Schema (Draft)

> ⚠️ **Draft schema** — expect changes as development progresses. This is meant to give a starting point for discussion and initial migration planning.

```prisma
// schema.prisma
// Prisma 7 — uses "prisma-client" provider

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── User (extends Auth.js) ────────────────────────────

model User {
  id                   String    @id @default(cuid())
  name                 String?
  email                String?   @unique
  emailVerified        DateTime?
  image                String?
  hashedPassword       String?

  // Pro / Stripe
  isPro                Boolean   @default(false)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique

  // Relations
  accounts             Account[]
  sessions             Session[]
  items                Item[]
  itemTypes            ItemType[]
  collections          Collection[]

  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Item Types ────────────────────────────────────────

model ItemType {
  id       String  @id @default(cuid())
  name     String                        // e.g. "snippet", "prompt"
  icon     String                        // Lucide icon name
  color    String                        // Hex color code
  isSystem Boolean @default(false)       // true = immutable system type

  // null for system types, set for user-created custom types
  userId   String?
  user     User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items    Item[]

  @@unique([name, userId])               // unique type name per user (null userId = system)
}

// ─── Items ─────────────────────────────────────────────

enum ContentType {
  text
  url
  file
}

model Item {
  id          String      @id @default(cuid())
  title       String
  contentType ContentType

  // Text content (snippets, prompts, notes, commands)
  content     String?     @db.Text

  // File content (file, image types)
  fileUrl     String?                    // Cloudflare R2 URL
  fileName    String?                    // Original filename
  fileSize    Int?                       // Bytes

  // URL content (link type)
  url         String?

  description String?     @db.Text
  language    String?                    // Programming language (optional, for code)

  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)

  // Relations
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  itemTypeId  String
  itemType    ItemType    @relation(fields: [itemTypeId], references: [id])

  collections ItemCollection[]
  tags        ItemTag[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
  @@index([itemTypeId])
  @@index([isFavorite])
  @@index([isPinned])
}

// ─── Collections ───────────────────────────────────────

model Collection {
  id            String  @id @default(cuid())
  name          String                   // e.g. "React Hooks", "Context Files"
  description   String? @db.Text

  isFavorite    Boolean @default(false)

  // Default type for new items added to this collection
  defaultTypeId String?

  // Relations
  userId        String
  user          User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  items         ItemCollection[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
}

// ─── Join Tables ───────────────────────────────────────

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item         Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  items ItemTag[]
}

model ItemTag {
  itemId String
  tagId  String

  item   Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

### Schema Notes

- **Auth.js models** (`Account`, `Session`, `VerificationToken`) follow the [Prisma adapter schema](https://authjs.dev/getting-started/adapters/prisma) required by Auth.js v5.
- The `User` model extends the Auth.js base with `isPro`, `stripeCustomerId`, and `stripeSubscriptionId` for payment integration.
- `ContentType` is an enum (`text`, `url`, `file`) that determines which fields on `Item` are populated.
- `ItemType` uses a `@@unique([name, userId])` constraint so system types (where `userId` is `null`) have globally unique names, while user-created custom types are scoped per user.
- Indexes on `userId`, `itemTypeId`, `isFavorite`, and `isPinned` are included for common query patterns.

---

## Item Types Reference

System item types ship by default and cannot be modified or deleted.

| Type        | Content Type | Color                         | Icon (Lucide)  | Pro Only |
| ----------- | ------------ | ----------------------------- | -------------- | -------- |
| **Snippet** | `text`       | 🔵 `#3b82f6` (Blue)          | `Code`         | No       |
| **Prompt**  | `text`       | 🟣 `#8b5cf6` (Purple)        | `Sparkles`     | No       |
| **Command** | `text`       | 🟠 `#f97316` (Orange)        | `Terminal`     | No       |
| **Note**    | `text`       | 🟡 `#fde047` (Yellow)        | `StickyNote`   | No       |
| **Link**    | `url`        | 🟢 `#10b981` (Emerald)       | `Link`         | No       |
| **File**    | `file`       | ⚪ `#6b7280` (Gray)           | `File`         | **Yes**  |
| **Image**   | `file`       | 🩷 `#ec4899` (Pink)          | `Image`        | **Yes**  |

### URL Routing by Type

Item type pages should follow the pattern `/items/{type-plural}`:

- `/items/snippets`
- `/items/prompts`
- `/items/commands`
- `/items/notes`
- `/items/links`
- `/items/files`
- `/items/images`

---

## Features

### A. Items & Item Types

- Items are the core content unit — quick to access and create within a **drawer** (slide-over panel).
- Each item has a type that determines its behavior (text editor, URL input, or file upload).
- System types are built-in and immutable. Custom types are a future Pro feature.

### B. Collections

- Named groupings like *"React Patterns"*, *"Interview Prep"*, *"Context Files"*.
- An item can belong to **multiple collections** (many-to-many).
- Collections display which types of items they contain.

### C. Search

Powerful search across content, tags, titles, and types. Basic search is available on Free; advanced/AI search is Pro.

### D. Authentication

- **Email/password** sign-up and sign-in.
- **GitHub OAuth** for one-click developer sign-in.
- Powered by Auth.js v5 with Prisma adapter.

### E. Core Features

- ⭐ Favorite collections and items
- 📌 Pin items to top
- 🕐 Recently used items
- 📥 Import code from a file
- ✍️ Markdown editor for text-type items
- 📤 File upload for file-type items (R2)
- 📦 Export data (JSON/ZIP — Pro)
- 🌙 Dark mode (default), light mode optional
- 🗂️ Add/remove items to/from multiple collections
- 👁️ View which collections an item belongs to

### F. AI Features (Pro Only)

| Feature                | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| **AI Auto-Tag**        | Suggest tags based on item content                    |
| **AI Summaries**       | Generate concise summaries of notes and snippets      |
| **AI Explain Code**    | Plain-English explanation of code snippets             |
| **Prompt Optimizer**   | Improve and refine AI prompts for better results      |

All AI features use OpenAI `gpt-5-nano` via API routes.

---

## Monetization

Freemium model with a Pro subscription tier.

> **Development note:** During development, all users can access everything. Pro gating will be enabled before launch.

### Free Tier

- 50 items total
- 3 collections
- All system types **except** File and Image
- Basic search
- No file/image uploads
- No AI features

### Pro Tier — **$8/month** or **$72/year**

- Unlimited items
- Unlimited collections
- File & Image uploads (Cloudflare R2)
- Custom types *(future)*
- AI auto-tagging, code explanation, prompt optimizer
- Export data (JSON/ZIP)
- Priority support

### Stripe Integration

| User Field               | Purpose                          |
| ------------------------ | -------------------------------- |
| `isPro`                  | Gate Pro features in the app     |
| `stripeCustomerId`       | Link user to Stripe customer     |
| `stripeSubscriptionId`   | Manage subscription lifecycle    |

Webhook events from Stripe (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`) will update `isPro` status in the database.

---

## UI/UX Guidelines

### Design Principles

- Modern, minimal, **developer-focused**
- Dark mode by **default**, light mode optional
- Clean typography, generous whitespace
- Subtle borders and shadows
- Syntax highlighting for code blocks (e.g. using [Shiki](https://shiki.style/) or [Prism](https://prismjs.com/))

### Design References

- [Notion](https://notion.so) — clean layout, quick editing
- [Linear](https://linear.app) — minimal UI, keyboard-first
- [Raycast](https://raycast.com) — fast access, developer aesthetic

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Logo / DevStash                              🔍  👤  ⚙️   │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │  MAIN CONTENT                               │
│              │                                              │
│  ── Types    │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  Snippets    │  │Collection│ │Collection│ │Collection│      │
│  Prompts     │  │  Card    │ │  Card    │ │  Card    │      │
│  Commands    │  │ (colored │ │ (colored │ │ (colored │      │
│  Notes       │  │   bg)    │ │   bg)    │ │   bg)    │      │
│  Links       │  └─────────┘ └─────────┘ └─────────┘       │
│  Files ⭐    │                                              │
│  Images ⭐   │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│              │  │  Item    │ │  Item    │ │  Item    │      │
│  ── Recent   │  │  Card    │ │  Card    │ │  Card    │      │
│  Collections │  │ (colored │ │ (colored │ │ (colored │      │
│  React Pat.. │  │  border) │ │  border) │ │  border) │      │
│  Python Sn.. │  └─────────┘ └─────────┘ └─────────┘       │
│  Context F.. │                                              │
│              │         ┌──────────────────┐                 │
│              │         │  ITEM DRAWER     │ ◀── Quick view  │
│              │         │  (slide-over)    │                 │
│              │         └──────────────────┘                 │
└──────────────┴──────────────────────────────────────────────┘
```

- **Sidebar** — collapsible; shows item types with nav links and recent collections. Becomes a mobile drawer on small screens.
- **Main area** — grid of color-coded collection cards (background color based on dominant item type) and item cards (border color matches type).
- **Item drawer** — slide-over panel for quick view/edit without leaving the current page.

### Color System

The type colors defined in the [Item Types Reference](#item-types-reference) are used throughout the UI:

- **Collection cards** — background tinted with the color of the most common item type in the collection.
- **Item cards** — left border or accent colored by item type.
- **Sidebar icons** — colored to match their type.

### Responsive Behavior

- **Desktop-first** but mobile usable.
- Sidebar collapses to a hamburger/drawer on mobile.
- Item grid adjusts from multi-column to single-column.

### Micro-interactions

- Smooth transitions on navigation and drawer open/close
- Hover states on cards (subtle lift/glow)
- Toast notifications for CRUD actions (create, copy, delete, etc.)
- Loading skeletons while data fetches

---

## Key Links & Resources

### Official Docs

| Resource                          | Link                                                                 |
| --------------------------------- | -------------------------------------------------------------------- |
| Next.js 16 Docs                   | https://nextjs.org/docs                                              |
| Prisma 7 Docs                     | https://www.prisma.io/docs                                           |
| Auth.js v5 Docs                   | https://authjs.dev                                                   |
| Tailwind CSS v4                   | https://tailwindcss.com/docs                                         |
| shadcn/ui                         | https://ui.shadcn.com                                                |
| Lucide Icons                      | https://lucide.dev/icons                                             |
| Neon Postgres                     | https://neon.tech/docs                                               |
| Cloudflare R2                     | https://developers.cloudflare.com/r2                                 |
| Stripe Billing                    | https://docs.stripe.com/billing                                      |
| OpenAI API                        | https://platform.openai.com/docs                                     |

### Key Prisma 7 Changes to Remember

- Generator provider is now `"prisma-client"` (not `"prisma-client-js"`).
- Generated client outputs into your project source (not `node_modules`).
- Configuration lives in `prisma.config.ts` (not just `schema.prisma`).
- `prisma migrate dev` no longer auto-runs seed or generate — run them explicitly.
- Ships as ESM by default.
- No MongoDB support yet in v7 (not relevant for this project).

### Key Next.js 16 Changes to Remember

- Turbopack is the default bundler (no `--turbopack` flag needed).
- `middleware.ts` → renamed to `proxy.ts` with `proxy` export.
- PPR replaced by Cache Components with `'use cache'` directive.
- React Compiler integration is stable (opt-in via `reactCompiler` config).
- React 19.2 with View Transitions, `useEffectEvent`, and Activity API.
