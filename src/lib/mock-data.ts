// ─── Types ──────────────────────────────────────────────────────────────────

export type ContentType = "text" | "url" | "file";

export interface ItemType {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string;
  isSystem: boolean;
  slug: string; // for URL routing e.g. "snippets"
}

export interface Tag {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  title: string;
  contentType: ContentType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  description?: string;
  language?: string;
  isFavorite: boolean;
  isPinned: boolean;
  itemTypeId: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  itemCount: number;
  dominantTypeId: string; // used for card background color
  items: Item[];
  createdAt: string;
  updatedAt: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  isPro: boolean;
}

// ─── Item Types ──────────────────────────────────────────────────────────────

export const ITEM_TYPES: ItemType[] = [
  { id: "type_snippet",  name: "Snippet",  icon: "Code",       color: "#3b82f6", isSystem: true, slug: "snippets"  },
  { id: "type_prompt",   name: "Prompt",   icon: "Sparkles",   color: "#8b5cf6", isSystem: true, slug: "prompts"   },
  { id: "type_command",  name: "Command",  icon: "Terminal",   color: "#f97316", isSystem: true, slug: "commands"  },
  { id: "type_note",     name: "Note",     icon: "StickyNote", color: "#fde047", isSystem: true, slug: "notes"     },
  { id: "type_link",     name: "Link",     icon: "Link",       color: "#10b981", isSystem: true, slug: "links"     },
  { id: "type_file",     name: "File",     icon: "File",       color: "#6b7280", isSystem: true, slug: "files"     },
  { id: "type_image",    name: "Image",    icon: "Image",      color: "#ec4899", isSystem: true, slug: "images"    },
];

// ─── Tags ────────────────────────────────────────────────────────────────────

export const TAGS: Tag[] = [
  { id: "tag_react",      name: "react"      },
  { id: "tag_auth",       name: "auth"       },
  { id: "tag_hooks",      name: "hooks"      },
  { id: "tag_python",     name: "python"     },
  { id: "tag_git",        name: "git"        },
  { id: "tag_typescript", name: "typescript" },
  { id: "tag_ai",         name: "ai"         },
  { id: "tag_api",        name: "api"        },
  { id: "tag_patterns",   name: "patterns"   },
  { id: "tag_interview",  name: "interview"  },
];

// ─── Items ───────────────────────────────────────────────────────────────────

export const ITEMS: Item[] = [
  // Snippets
  {
    id: "item_1",
    title: "useAuth Hook",
    contentType: "text",
    content: `import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}`,
    description: "Custom authentication hook for React applications",
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    itemTypeId: "type_snippet",
    tags: [TAGS[0], TAGS[1], TAGS[2]],
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "item_2",
    title: "API Error Handling Pattern",
    contentType: "text",
    content: `async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
  throw new Error("Max retries exceeded");
}`,
    description: "Fetch wrapper with exponential backoff retry logic",
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    itemTypeId: "type_snippet",
    tags: [TAGS[7], TAGS[8]],
    createdAt: "2025-01-12T14:00:00Z",
    updatedAt: "2025-01-12T14:00:00Z",
  },
  {
    id: "item_3",
    title: "useDebouncedValue",
    contentType: "text",
    content: `import { useState, useEffect } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}`,
    description: "Debounce any rapidly changing value",
    language: "typescript",
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: [TAGS[0], TAGS[2]],
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-10T09:00:00Z",
  },
  {
    id: "item_4",
    title: "Python List Comprehension Patterns",
    contentType: "text",
    content: `# Filter and transform
evens_squared = [x**2 for x in range(20) if x % 2 == 0]

# Flatten nested list
flat = [item for sublist in nested for item in sublist]

# Dict comprehension
word_lengths = {word: len(word) for word in words}`,
    description: "Common Python list and dict comprehension patterns",
    language: "python",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    tags: [TAGS[3]],
    createdAt: "2025-01-08T11:00:00Z",
    updatedAt: "2025-01-08T11:00:00Z",
  },
  // Prompts
  {
    id: "item_5",
    title: "Code Review Prompt",
    contentType: "text",
    content: `Review the following code for:
1. Bugs and logical errors
2. Security vulnerabilities
3. Performance issues
4. Readability and maintainability

Provide specific suggestions with examples where relevant.

\`\`\`
{{code}}
\`\`\``,
    description: "General-purpose code review prompt",
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_prompt",
    tags: [TAGS[6]],
    createdAt: "2025-01-14T08:00:00Z",
    updatedAt: "2025-01-14T08:00:00Z",
  },
  {
    id: "item_6",
    title: "Explain Code to Junior Dev",
    contentType: "text",
    content: `Explain the following code to a junior developer. Use simple language, avoid jargon, and include an analogy where helpful.

Code:
\`\`\`
{{code}}
\`\`\``,
    description: "Prompt to get beginner-friendly code explanations",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_prompt",
    tags: [TAGS[6]],
    createdAt: "2025-01-11T16:00:00Z",
    updatedAt: "2025-01-11T16:00:00Z",
  },
  // Commands
  {
    id: "item_7",
    title: "Git Undo Last Commit",
    contentType: "text",
    content: "git reset --soft HEAD~1",
    description: "Undo the last commit but keep changes staged",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: [TAGS[4]],
    createdAt: "2025-01-09T10:00:00Z",
    updatedAt: "2025-01-09T10:00:00Z",
  },
  {
    id: "item_8",
    title: "Git Interactive Rebase Last 5",
    contentType: "text",
    content: "git rebase -i HEAD~5",
    description: "Interactively rebase the last 5 commits",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tags: [TAGS[4]],
    createdAt: "2025-01-07T13:00:00Z",
    updatedAt: "2025-01-07T13:00:00Z",
  },
  // Notes
  {
    id: "item_9",
    title: "React 19 Key Changes",
    contentType: "text",
    content: `## React 19 Key Changes

- **Actions**: async functions in transitions, replacing manual \`isPending\` state
- **useOptimistic**: built-in optimistic UI updates
- **use()**: read promises and context in render
- **Server Components**: stable in Next.js App Router
- **ref as prop**: no more \`forwardRef\` wrapper needed`,
    description: "Quick reference for React 19 new features",
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_note",
    tags: [TAGS[0]],
    createdAt: "2025-01-13T15:00:00Z",
    updatedAt: "2025-01-13T15:00:00Z",
  },
  // Links
  {
    id: "item_10",
    title: "Tailwind CSS v4 Docs",
    contentType: "url",
    url: "https://tailwindcss.com/docs",
    description: "Official Tailwind CSS v4 documentation",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_link",
    tags: [],
    createdAt: "2025-01-06T09:00:00Z",
    updatedAt: "2025-01-06T09:00:00Z",
  },
  {
    id: "item_11",
    title: "shadcn/ui Components",
    contentType: "url",
    url: "https://ui.shadcn.com",
    description: "Accessible component library built on Radix UI",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_link",
    tags: [TAGS[0]],
    createdAt: "2025-01-06T09:30:00Z",
    updatedAt: "2025-01-06T09:30:00Z",
  },
];

// ─── Collections ─────────────────────────────────────────────────────────────

export const COLLECTIONS: Collection[] = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    dominantTypeId: "type_snippet",
    items: [ITEMS[0], ITEMS[1], ITEMS[2]],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "col_2",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    dominantTypeId: "type_snippet",
    items: [ITEMS[3]],
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-08T11:00:00Z",
  },
  {
    id: "col_3",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
    dominantTypeId: "type_file",
    items: [],
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
  },
  {
    id: "col_4",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
    dominantTypeId: "type_note",
    items: [ITEMS[8]],
    createdAt: "2025-01-04T00:00:00Z",
    updatedAt: "2025-01-13T15:00:00Z",
  },
  {
    id: "col_5",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    dominantTypeId: "type_command",
    items: [ITEMS[6], ITEMS[7]],
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-09T10:00:00Z",
  },
  {
    id: "col_6",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    dominantTypeId: "type_prompt",
    items: [ITEMS[4], ITEMS[5]],
    createdAt: "2025-01-06T00:00:00Z",
    updatedAt: "2025-01-14T08:00:00Z",
  },
];

// ─── Current User ─────────────────────────────────────────────────────────────

export const CURRENT_USER: MockUser = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  isPro: false,
};

// ─── Derived / Helper Data ────────────────────────────────────────────────────

/** Item counts per type (for sidebar badges) */
export const ITEM_TYPE_COUNTS: Record<string, number> = {
  type_snippet: 24,
  type_prompt:  18,
  type_command: 15,
  type_note:    12,
  type_link:     8,
  type_file:     5,
  type_image:    3,
};

export const PINNED_ITEMS = ITEMS.filter((item) => item.isPinned);
export const FAVORITE_COLLECTIONS = COLLECTIONS.filter((col) => col.isFavorite);
export const ALL_COLLECTIONS = COLLECTIONS.filter((col) => !col.isFavorite);
