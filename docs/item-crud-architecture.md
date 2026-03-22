# Item CRUD Architecture

> Auto-generated research document. Source: `context/research/item-crud-research.md`

---

## Design Principles

1. **One action file** — all item mutations (create, update, delete) live in `src/actions/items.ts`
2. **Queries in lib/db** — data fetching stays in `src/lib/db/items.ts`, called directly from server components
3. **One dynamic route** — `/items/[type]` handles all 7 item types
4. **Type-specific logic in components** — actions and queries are type-agnostic; components adapt per type

---

## File Structure

```
src/
├── actions/
│   ├── auth.ts                    # (existing) GitHub sign-in
│   └── items.ts                   # NEW — all item mutations
│
├── lib/
│   └── db/
│       ├── items.ts               # (existing) dashboard queries + NEW CRUD queries
│       ├── collections.ts         # (existing)
│       └── profile.ts             # (existing)
│
├── app/
│   └── items/
│       └── [type]/
│           ├── page.tsx           # Server component — fetches items by type
│           └── loading.tsx        # Skeleton loader
│
└── components/
    └── items/
        ├── ItemPageHeader.tsx     # Title, icon, color, "New" button — adapts by type
        ├── ItemList.tsx           # Grid/list of items with empty state
        ├── ItemCard.tsx           # Individual item card (extends existing ItemRow)
        ├── ItemDrawer.tsx         # Slide-over for create/edit/view
        ├── ItemForm.tsx           # Unified form — renders fields based on contentType
        ├── TextEditor.tsx         # Markdown/code editor (text types)
        ├── UrlInput.tsx           # URL field with validation (link type)
        ├── FileUpload.tsx         # R2 upload widget (file/image types)
        └── ItemActions.tsx        # Favorite, pin, delete, copy actions
```

---

## Dynamic Route: `/items/[type]`

### How It Works

The `[type]` param is the singular item type name from the database: `snippet`, `prompt`, `command`, `note`, `link`, `file`, `image`.

```
/items/snippet  → shows all snippets
/items/prompt   → shows all prompts
/items/command  → shows all commands
...
```

### Route File: `src/app/items/[type]/page.tsx`

```tsx
// Server component — no "use client"
import { notFound } from "next/navigation";
import { getItemsByType, getItemTypeByName } from "@/lib/db/items";
import { auth } from "@/lib/auth";
import ItemPageHeader from "@/components/items/ItemPageHeader";
import ItemList from "@/components/items/ItemList";

const VALID_TYPES = ["snippet", "prompt", "command", "note", "link", "file", "image"];

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();

  const session = await auth();
  const userId = session!.user!.id!;

  const [itemType, items] = await Promise.all([
    getItemTypeByName(type),
    getItemsByType(userId, type),
  ]);

  if (!itemType) notFound();

  return (
    <div>
      <ItemPageHeader itemType={itemType} />
      <ItemList items={items} itemType={itemType} />
    </div>
  );
}
```

### Sidebar Links (Already Wired)

The existing `Sidebar.tsx` already links to `/items/{type.name}`:
```tsx
<Link href={`/items/${type.name}`} ...>
```
This matches the `[type]` param directly — no URL mapping needed.

---

## Mutations: `src/actions/items.ts`

All write operations in one file using Next.js Server Actions.

### Actions

| Action            | Purpose                              | Key Fields                                    |
| ----------------- | ------------------------------------ | --------------------------------------------- |
| `createItem`      | Create any item type                 | `title`, `contentType`, type-specific fields   |
| `updateItem`      | Update any item                      | `id` + partial fields                          |
| `deleteItem`      | Soft or hard delete                  | `id`                                           |
| `toggleFavorite`  | Toggle `isFavorite`                  | `id`                                           |
| `togglePin`       | Toggle `isPinned`                    | `id`                                           |

### Shape

```tsx
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── Create ──────────────────────────────────────────────

export async function createItem(formData: FormData) {
  const session = await auth();
  const userId = session!.user!.id!;

  const title = formData.get("title") as string;
  const itemTypeId = formData.get("itemTypeId") as string;
  const contentType = formData.get("contentType") as "text" | "url" | "file";

  // Type-specific fields
  const content = formData.get("content") as string | null;       // text types
  const url = formData.get("url") as string | null;               // link type
  const fileUrl = formData.get("fileUrl") as string | null;       // file types
  const fileName = formData.get("fileName") as string | null;
  const fileSize = formData.get("fileSize") as string | null;

  const description = formData.get("description") as string | null;
  const language = formData.get("language") as string | null;

  const item = await prisma.item.create({
    data: {
      title,
      contentType,
      content,
      url,
      fileUrl,
      fileName,
      fileSize: fileSize ? parseInt(fileSize, 10) : null,
      description,
      language,
      userId,
      itemTypeId,
    },
  });

  revalidatePath("/items");
  revalidatePath("/dashboard");
  return { id: item.id };
}

// ─── Update ──────────────────────────────────────────────

export async function updateItem(id: string, formData: FormData) {
  // Verify ownership, update fields, revalidate
}

// ─── Delete ──────────────────────────────────────────────

export async function deleteItem(id: string) {
  // Verify ownership, delete, revalidate
}

// ─── Toggle Favorite / Pin ───────────────────────────────

export async function toggleFavorite(id: string) {
  // Fetch current value, flip it, revalidate
}

export async function togglePin(id: string) {
  // Fetch current value, flip it, revalidate
}
```

### Key Decisions

- **FormData over plain objects** — works natively with `<form action={...}>` and progressive enhancement.
- **Auth check in every action** — never trust the client; always verify `session.user.id` matches item ownership.
- **`revalidatePath`** — invalidates the items list and dashboard after mutations.
- **No type-specific branching** — the action accepts all possible fields; only the relevant ones are populated based on `contentType`. The form (component layer) decides which fields to show.

---

## Queries: `src/lib/db/items.ts`

New functions to add alongside existing dashboard queries.

### New Functions

| Function           | Purpose                                   | Called From                    |
| ------------------ | ----------------------------------------- | ------------------------------ |
| `getItemTypeByName`| Fetch a single ItemType by name           | `[type]/page.tsx`              |
| `getItemsByType`   | Fetch all items for a user filtered by type name | `[type]/page.tsx`       |
| `getItemById`      | Fetch a single item with all fields       | ItemDrawer (detail view)       |

### Shape

```tsx
// ─── New query: get items by type name ───────────────────

export async function getItemsByType(
  userId: string,
  typeName: string,
): Promise<ItemListItem[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: { name: typeName },
    },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
    select: itemListSelect,       // extended select with content fields
  });
  return items.map(mapItemListItem);
}

export async function getItemTypeByName(name: string) {
  return prisma.itemType.findFirst({
    where: { name, isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
  });
}

export async function getItemById(id: string, userId: string) {
  return prisma.item.findFirst({
    where: { id, userId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: true } },
      collections: { include: { collection: true } },
    },
  });
}
```

### Existing Functions (Unchanged)

| Function                | Purpose                     |
| ----------------------- | --------------------------- |
| `getRecentItems`        | Dashboard recent items      |
| `getPinnedItems`        | Dashboard pinned items      |
| `getItemStats`          | Dashboard stats cards       |
| `getItemTypesWithCounts`| Sidebar type list           |

---

## Component Responsibilities

### ItemPageHeader

- Displays the type's icon (colored), plural name, and item count
- Contains the "New Item" button that opens the drawer
- Reads from `ItemTypeInfo` — no type-specific logic needed

### ItemList

- Renders a grid of `ItemCard` components
- Shows an empty state when no items exist
- Handles search/filter UI (future)

### ItemCard

- Extends the existing `ItemRow` pattern from the dashboard
- Shows: title, description preview, tags, favorite/pin indicators
- Click opens `ItemDrawer` for detail view
- Type color applied as left border accent

### ItemDrawer

- Slide-over panel (already planned in UI/UX guidelines)
- Three modes: **view**, **create**, **edit**
- Renders `ItemForm` inside the drawer body
- Handles save (calls `createItem` or `updateItem` action)

### ItemForm

- **Unified form** — one component for all 7 types
- Switches rendered fields based on `contentType`:

| contentType | Fields Rendered                                    |
| ----------- | -------------------------------------------------- |
| `text`      | `TextEditor` (content), language selector          |
| `url`       | `UrlInput` (url)                                   |
| `file`      | `FileUpload` (fileUrl, fileName, fileSize)         |

- Common fields always rendered: title, description, tags

### TextEditor

- Markdown editor for notes
- Code editor with syntax highlighting for snippets/commands
- Switches mode based on item type name (snippet/command → code mode, note/prompt → markdown mode)

### UrlInput

- URL text field with basic validation
- Optional: fetch page title/favicon for preview

### FileUpload

- Drag-and-drop or click-to-upload
- Uploads to Cloudflare R2 via a separate `/api/upload` route
- Returns `fileUrl`, `fileName`, `fileSize` to the form
- Image type shows image preview; File type shows file icon

### ItemActions

- Reusable action buttons: favorite toggle, pin toggle, copy, delete
- Each calls the corresponding server action
- Used in both `ItemCard` and `ItemDrawer`

---

## Where Type-Specific Logic Lives

| Layer          | Type-Specific? | Details                                                  |
| -------------- | -------------- | -------------------------------------------------------- |
| **Actions**    | No             | Accept all fields; type is implicit via `contentType`    |
| **Queries**    | No             | Filter by `itemType.name`; return all fields             |
| **Route**      | No             | `[type]` param maps directly to DB name                  |
| **Components** | **Yes**        | `ItemForm` switches fields; `TextEditor` switches mode   |

Type-specific rendering decisions are **pushed to the component layer**. This keeps the data layer clean and makes adding custom types (future Pro feature) straightforward — just add a new `ItemType` row in the database.

---

## Data Flow Summary

```
User clicks "Snippets" in sidebar
  → navigates to /items/snippet
  → [type]/page.tsx (server component)
    → getItemTypeByName("snippet")  →  { id, name, icon, color }
    → getItemsByType(userId, "snippet")  →  ItemListItem[]
    → renders <ItemPageHeader> + <ItemList>

User clicks "New"
  → ItemDrawer opens in create mode
  → ItemForm renders fields for contentType="text"
  → User fills form, submits
  → createItem(formData) server action
  → revalidatePath → page re-renders with new item

User clicks an item card
  → ItemDrawer opens in view mode
  → getItemById(id, userId) fetched client-side or via drawer route
  → Shows full content with edit/delete actions
```

---

## Notes

- `src/lib/constants.tsx` does not exist yet. Type display metadata (plural names, sort order) currently lives in `Sidebar.tsx` as `TYPE_DISPLAY`. This could be extracted to a shared constants file when the items page is built.
- `docs/content-types.md` was referenced in the research prompt but does not exist. See `docs/item-types.md` for type reference.
- The existing `ICON_MAP` in `src/components/dashboard/icon-map.ts` should be shared with the new items components.
- The existing `DashboardItem` type is a subset; the new `ItemListItem` type will include content fields needed for the item page.
