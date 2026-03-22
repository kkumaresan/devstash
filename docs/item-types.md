# Item Types Reference

> Auto-generated research document. Source: `context/research/item-types-research.md`

---

## System Item Types

DevStash ships with 7 immutable system item types. They cannot be modified or deleted. Custom types are a future Pro feature.

### 1. Snippet

| Property     | Value                |
| ------------ | -------------------- |
| **Name**     | `snippet`            |
| **Icon**     | `Code` (Lucide)      |
| **Color**    | `#3b82f6` (Blue)     |
| **Content**  | `text`               |
| **Pro Only** | No                   |

**Purpose:** Store reusable code snippets — hooks, utility functions, patterns, boilerplate blocks.

**Key fields:** `content` (the code), `language` (programming language for syntax highlighting), `description`.

---

### 2. Prompt

| Property     | Value                |
| ------------ | -------------------- |
| **Name**     | `prompt`             |
| **Icon**     | `Sparkles` (Lucide)  |
| **Color**    | `#8b5cf6` (Purple)   |
| **Content**  | `text`               |
| **Pro Only** | No                   |

**Purpose:** Save and organize AI prompts — system messages, workflow templates, prompt chains.

**Key fields:** `content` (the prompt text), `description`.

---

### 3. Command

| Property     | Value                |
| ------------ | -------------------- |
| **Name**     | `command`            |
| **Icon**     | `Terminal` (Lucide)  |
| **Color**    | `#f97316` (Orange)   |
| **Content**  | `text`               |
| **Pro Only** | No                   |

**Purpose:** Store terminal/shell commands — deploy scripts, git aliases, Docker commands, one-liners.

**Key fields:** `content` (the command), `language` (typically `bash`), `description`.

---

### 4. Note

| Property     | Value                |
| ------------ | -------------------- |
| **Name**     | `note`               |
| **Icon**     | `StickyNote` (Lucide)|
| **Color**    | `#fde047` (Yellow)   |
| **Content**  | `text`               |
| **Pro Only** | No                   |

**Purpose:** Free-form text notes — documentation, explanations, meeting notes, TILs.

**Key fields:** `content` (markdown text), `description`.

---

### 5. Link

| Property     | Value                |
| ------------ | -------------------- |
| **Name**     | `link`               |
| **Icon**     | `Link` (Lucide)      |
| **Color**    | `#10b981` (Emerald)  |
| **Content**  | `url`                |
| **Pro Only** | No                   |

**Purpose:** Bookmark useful URLs — documentation, tools, APIs, articles, dashboards.

**Key fields:** `url` (the link), `description`.

---

### 6. File

| Property     | Value                |
| ------------ | -------------------- |
| **Name**     | `file`               |
| **Icon**     | `File` (Lucide)      |
| **Color**    | `#6b7280` (Gray)     |
| **Content**  | `file`               |
| **Pro Only** | **Yes**              |

**Purpose:** Upload and store files — configs, documents, context files, templates.

**Key fields:** `fileUrl` (Cloudflare R2 URL), `fileName` (original name), `fileSize` (bytes), `description`.

---

### 7. Image

| Property     | Value                |
| ------------ | -------------------- |
| **Name**     | `image`              |
| **Icon**     | `Image` (Lucide)     |
| **Color**    | `#ec4899` (Pink)     |
| **Content**  | `file`               |
| **Pro Only** | **Yes**              |

**Purpose:** Upload and store images — screenshots, diagrams, wireframes, design references.

**Key fields:** `fileUrl` (Cloudflare R2 URL), `fileName` (original name), `fileSize` (bytes), `description`.

---

## Classification by Content Type

The `ContentType` enum determines which Item fields are populated:

| Content Type | Item Types                          | Primary Field | Storage        |
| ------------ | ----------------------------------- | ------------- | -------------- |
| `text`       | Snippet, Prompt, Command, Note      | `content`     | Database (Text)|
| `url`        | Link                                | `url`         | Database       |
| `file`       | File, Image                         | `fileUrl`     | Cloudflare R2  |

---

## Shared Properties (All Item Types)

Every item, regardless of type, has these fields:

| Field         | Type       | Description                              |
| ------------- | ---------- | ---------------------------------------- |
| `id`          | `String`   | CUID primary key                         |
| `title`       | `String`   | Display name                             |
| `contentType` | `Enum`     | `text`, `url`, or `file`                 |
| `description` | `String?`  | Optional summary/notes                   |
| `language`    | `String?`  | Programming language (optional)          |
| `isFavorite`  | `Boolean`  | Star for quick access                    |
| `isPinned`    | `Boolean`  | Pin to top of lists                      |
| `userId`      | `String`   | Owner reference                          |
| `itemTypeId`  | `String`   | References the ItemType                  |
| `createdAt`   | `DateTime` | Auto-set on creation                     |
| `updatedAt`   | `DateTime` | Auto-updated on changes                  |

Plus relations: `collections` (many-to-many via ItemCollection), `tags` (many-to-many via ItemTag).

---

## Display Differences by Type

| Aspect              | Text Types                    | URL Type (Link)         | File Types (File, Image)    |
| ------------------- | ----------------------------- | ----------------------- | --------------------------- |
| **Editor**          | Markdown/code editor          | URL input field         | File upload (R2)            |
| **Card accent**     | Left border in type color     | Left border in emerald  | Left border in type color   |
| **Syntax highlight**| Yes (if `language` set)       | No                      | No                          |
| **Preview**         | Code/text preview             | Clickable link          | File icon / image thumbnail |
| **Copy action**     | Copy content to clipboard     | Copy URL                | Download file               |

---

## Seed Data IDs

System types use deterministic IDs for referencing in code:

| Type    | Seed ID         |
| ------- | --------------- |
| Snippet | `type_snippet`  |
| Prompt  | `type_prompt`   |
| Command | `type_command`  |
| Note    | `type_note`     |
| File    | `type_file`     |
| Image   | `type_image`    |
| Link    | `type_link`     |

---

## URL Routing

Each type has a dedicated page at `/items/{type-plural}`:

`/items/snippets` · `/items/prompts` · `/items/commands` · `/items/notes` · `/items/links` · `/items/files` · `/items/images`

---

## Notes

- `src/lib/constants.tsx` does not exist yet — type definitions currently live only in [prisma/seed.ts](prisma/seed.ts) and [context/project-overview.md](../context/project-overview.md).
- The `@@unique([name, userId])` constraint on `ItemType` ensures system types (where `userId` is `null`) have globally unique names, while user-created custom types are scoped per user.
- File and Image types require Cloudflare R2 integration and are gated behind the Pro tier.
