import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// ─── System Item Types ────────────────────────────────────────────────────────

const SYSTEM_TYPES = [
  { id: "type_snippet", name: "Snippet", icon: "Code",       color: "#3b82f6" },
  { id: "type_prompt",  name: "Prompt",  icon: "Sparkles",   color: "#8b5cf6" },
  { id: "type_command", name: "Command", icon: "Terminal",   color: "#f97316" },
  { id: "type_note",    name: "Note",    icon: "StickyNote", color: "#fde047" },
  { id: "type_link",    name: "Link",    icon: "Link",       color: "#10b981" },
  { id: "type_file",    name: "File",    icon: "File",       color: "#6b7280" },
  { id: "type_image",   name: "Image",   icon: "Image",      color: "#ec4899" },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // 1. System item types (global, no userId)
  console.log("  → Upserting system item types...");
  for (const type of SYSTEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: { name: type.name, icon: type.icon, color: type.color },
      create: { id: type.id, name: type.name, icon: type.icon, color: type.color, isSystem: true, userId: null },
    });
  }

  // 2. Test user
  console.log("  → Upserting test user...");
  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      id: "user_seed_1",
      name: "John Doe",
      email: "john@example.com",
      hashedPassword: null,
      isPro: false,
    },
  });

  // 3. Tags
  console.log("  → Upserting tags...");
  const tagNames = ["react", "auth", "hooks", "python", "git", "typescript", "ai", "api", "patterns", "interview"];
  const tagIds: Record<string, string> = {};

  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tagIds[name] = tag.id;
  }

  // 4. Items
  console.log("  → Upserting items...");

  const items = [
    {
      id: "item_seed_1",
      title: "useAuth Hook",
      contentType: "text" as const,
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
      tags: ["react", "auth", "hooks"],
    },
    {
      id: "item_seed_2",
      title: "API Error Handling Pattern",
      contentType: "text" as const,
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
      tags: ["api", "patterns"],
    },
    {
      id: "item_seed_3",
      title: "useDebouncedValue",
      contentType: "text" as const,
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
      tags: ["react", "hooks"],
    },
    {
      id: "item_seed_4",
      title: "Python List Comprehension Patterns",
      contentType: "text" as const,
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
      tags: ["python"],
    },
    {
      id: "item_seed_5",
      title: "Code Review Prompt",
      contentType: "text" as const,
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
      tags: ["ai"],
    },
    {
      id: "item_seed_6",
      title: "Explain Code to Junior Dev",
      contentType: "text" as const,
      content: `Explain the following code to a junior developer. Use simple language, avoid jargon, and include an analogy where helpful.

Code:
\`\`\`
{{code}}
\`\`\``,
      description: "Prompt to get beginner-friendly code explanations",
      isFavorite: false,
      isPinned: false,
      itemTypeId: "type_prompt",
      tags: ["ai"],
    },
    {
      id: "item_seed_7",
      title: "Git Undo Last Commit",
      contentType: "text" as const,
      content: "git reset --soft HEAD~1",
      description: "Undo the last commit but keep changes staged",
      language: "bash",
      isFavorite: false,
      isPinned: false,
      itemTypeId: "type_command",
      tags: ["git"],
    },
    {
      id: "item_seed_8",
      title: "Git Interactive Rebase Last 5",
      contentType: "text" as const,
      content: "git rebase -i HEAD~5",
      description: "Interactively rebase the last 5 commits",
      language: "bash",
      isFavorite: false,
      isPinned: false,
      itemTypeId: "type_command",
      tags: ["git"],
    },
    {
      id: "item_seed_9",
      title: "React 19 Key Changes",
      contentType: "text" as const,
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
      tags: ["react"],
    },
    {
      id: "item_seed_10",
      title: "Tailwind CSS v4 Docs",
      contentType: "url" as const,
      url: "https://tailwindcss.com/docs",
      description: "Official Tailwind CSS v4 documentation",
      isFavorite: false,
      isPinned: false,
      itemTypeId: "type_link",
      tags: [],
    },
    {
      id: "item_seed_11",
      title: "shadcn/ui Components",
      contentType: "url" as const,
      url: "https://ui.shadcn.com",
      description: "Accessible component library built on Radix UI",
      isFavorite: false,
      isPinned: false,
      itemTypeId: "type_link",
      tags: ["react"],
    },
  ];

  for (const { tags, ...itemData } of items) {
    await prisma.item.upsert({
      where: { id: itemData.id },
      update: {},
      create: {
        ...itemData,
        userId: user.id,
        tags: {
          create: tags.map((name) => ({
            tag: {
              connect: { id: tagIds[name] },
            },
          })),
        },
      },
    });
  }

  // 5. Collections
  console.log("  → Upserting collections...");

  const collections = [
    {
      id: "col_seed_1",
      name: "React Patterns",
      description: "Common React patterns and hooks",
      isFavorite: true,
      items: ["item_seed_1", "item_seed_2", "item_seed_3"],
    },
    {
      id: "col_seed_2",
      name: "Python Snippets",
      description: "Useful Python code snippets",
      isFavorite: false,
      items: ["item_seed_4"],
    },
    {
      id: "col_seed_3",
      name: "Context Files",
      description: "AI context files for projects",
      isFavorite: true,
      items: [],
    },
    {
      id: "col_seed_4",
      name: "Interview Prep",
      description: "Technical interview preparation",
      isFavorite: false,
      items: ["item_seed_9"],
    },
    {
      id: "col_seed_5",
      name: "Git Commands",
      description: "Frequently used git commands",
      isFavorite: true,
      items: ["item_seed_7", "item_seed_8"],
    },
    {
      id: "col_seed_6",
      name: "AI Prompts",
      description: "Curated AI prompts for coding",
      isFavorite: false,
      items: ["item_seed_5", "item_seed_6"],
    },
  ];

  for (const { items: itemIds, ...colData } of collections) {
    await prisma.collection.upsert({
      where: { id: colData.id },
      update: {},
      create: {
        ...colData,
        userId: user.id,
        items: {
          create: itemIds.map((itemId) => ({ itemId })),
        },
      },
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
