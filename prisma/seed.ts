import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── System Item Types ────────────────────────────────────────────────────────

const SYSTEM_TYPES = [
  { id: "type_snippet", name: "snippet", icon: "Code",       color: "#3b82f6" },
  { id: "type_prompt",  name: "prompt",  icon: "Sparkles",   color: "#8b5cf6" },
  { id: "type_command", name: "command", icon: "Terminal",   color: "#f97316" },
  { id: "type_note",    name: "note",    icon: "StickyNote", color: "#fde047" },
  { id: "type_file",    name: "file",    icon: "File",       color: "#6b7280" },
  { id: "type_image",   name: "image",   icon: "Image",      color: "#ec4899" },
  { id: "type_link",    name: "link",    icon: "Link",       color: "#10b981" },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...");

  // 1. System item types
  console.log("  → Upserting system item types...");
  for (const type of SYSTEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: { name: type.name, icon: type.icon, color: type.color },
      create: { ...type, isSystem: true, userId: null },
    });
  }

  // 2. Demo user
  console.log("  → Upserting demo user...");
  const hashedPassword = await hash("12345678", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      id: "user_demo",
      name: "Demo User",
      email: "demo@devstash.io",
      hashedPassword,
      emailVerified: new Date(),
      isPro: false,
    },
  });

  // 3. Clear existing demo items/collections so re-runs stay clean
  await prisma.collection.deleteMany({ where: { userId: user.id } });
  await prisma.item.deleteMany({ where: { userId: user.id } });

  // ─── Helper ───────────────────────────────────────────────────────────────

  const createItem = (
    id: string,
    title: string,
    typeId: string,
    contentType: "text" | "url" | "file",
    extra: {
      content?: string;
      url?: string;
      description?: string;
      language?: string;
      isFavorite?: boolean;
      isPinned?: boolean;
    }
  ) =>
    prisma.item.create({
      data: {
        id,
        title,
        contentType,
        userId: user.id,
        itemTypeId: typeId,
        isFavorite: extra.isFavorite ?? false,
        isPinned: extra.isPinned ?? false,
        ...extra,
      },
    });

  // ─── React Patterns ───────────────────────────────────────────────────────

  console.log("  → Seeding React Patterns...");

  const [useDebounce, useLocalStorage, contextProvider] = await Promise.all([
    createItem("item_rp_1", "useDebounce", "type_snippet", "text", {
      language: "typescript",
      description: "Delays updating a value until after a specified wait time",
      isFavorite: true,
      content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
    }),
    createItem("item_rp_2", "useLocalStorage", "type_snippet", "text", {
      language: "typescript",
      description: "Persist state to localStorage with automatic JSON serialization",
      content: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }
  };

  return [storedValue, setValue] as const;
}`,
    }),
    createItem("item_rp_3", "Compound Component Pattern", "type_snippet", "text", {
      language: "typescript",
      description: "Flexible component composition using React context",
      isPinned: true,
      content: `import { createContext, useContext, useState } from "react";

type AccordionContextType = { openId: string | null; toggle: (id: string) => void };
const AccordionContext = createContext<AccordionContextType | null>(null);

function Accordion({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));
  return <AccordionContext.Provider value={{ openId, toggle }}>{children}</AccordionContext.Provider>;
}

function AccordionItem({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const ctx = useContext(AccordionContext)!;
  const isOpen = ctx.openId === id;
  return (
    <div>
      <button onClick={() => ctx.toggle(id)}>{title}</button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

Accordion.Item = AccordionItem;
export { Accordion };`,
    }),
  ]);

  await prisma.collection.create({
    data: {
      id: "col_react_patterns",
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
      isFavorite: true,
      items: {
        create: [
          { itemId: useDebounce.id },
          { itemId: useLocalStorage.id },
          { itemId: contextProvider.id },
        ],
      },
    },
  });

  // ─── AI Workflows ─────────────────────────────────────────────────────────

  console.log("  → Seeding AI Workflows...");

  const [codeReview, docGen, refactoring] = await Promise.all([
    createItem("item_ai_1", "Code Review Prompt", "type_prompt", "text", {
      description: "Thorough code review covering bugs, security, and performance",
      isFavorite: true,
      content: `You are a senior software engineer. Review the following code and provide feedback on:

1. **Bugs & Logic Errors** — identify any incorrect behavior or edge cases
2. **Security** — flag vulnerabilities (injections, auth issues, data exposure)
3. **Performance** — highlight unnecessary re-renders, N+1 queries, or expensive ops
4. **Readability** — suggest naming improvements and structural clarity
5. **Best Practices** — note deviations from idiomatic patterns for the language/framework

For each issue, provide: severity (critical/major/minor), a clear explanation, and a corrected code snippet.

\`\`\`
{{code}}
\`\`\``,
    }),
    createItem("item_ai_2", "Documentation Generator", "type_prompt", "text", {
      description: "Generate JSDoc/TSDoc comments for functions and classes",
      content: `Generate comprehensive JSDoc/TSDoc documentation for the following code.

Requirements:
- Add @param, @returns, @throws, and @example tags where applicable
- Keep descriptions concise but informative
- Include type information even if TypeScript types are present
- Add a practical usage example in @example

Code to document:
\`\`\`
{{code}}
\`\`\``,
    }),
    createItem("item_ai_3", "Refactoring Assistant", "type_prompt", "text", {
      description: "Identify and apply refactoring opportunities to improve code quality",
      content: `Analyze the following code and suggest refactoring improvements.

Focus on:
- Extracting reusable functions or components
- Reducing duplication (DRY principle)
- Simplifying complex conditionals
- Improving variable and function naming
- Applying relevant design patterns

For each suggestion:
1. Explain the problem with the current code
2. Describe the refactoring approach
3. Show the refactored version

\`\`\`
{{code}}
\`\`\``,
    }),
  ]);

  await prisma.collection.create({
    data: {
      id: "col_ai_workflows",
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
      items: {
        create: [
          { itemId: codeReview.id },
          { itemId: docGen.id },
          { itemId: refactoring.id },
        ],
      },
    },
  });

  // ─── DevOps ───────────────────────────────────────────────────────────────

  console.log("  → Seeding DevOps...");

  const [dockerfile, deployCmd, dockerHubLink, ghActionsLink] = await Promise.all([
    createItem("item_do_1", "Dockerfile Multi-Stage Build", "type_snippet", "text", {
      language: "dockerfile",
      description: "Production-ready multi-stage Dockerfile for a Node.js app",
      content: `# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "start"]`,
    }),
    createItem("item_do_2", "Deploy to Production", "type_command", "text", {
      language: "bash",
      description: "Build, tag, push Docker image and trigger rolling deployment",
      content: `docker build -t myapp:$(git rev-parse --short HEAD) . \\
  && docker tag myapp:$(git rev-parse --short HEAD) registry/myapp:latest \\
  && docker push registry/myapp:latest \\
  && kubectl rollout restart deployment/myapp`,
    }),
    createItem("item_do_3", "Docker Hub", "type_link", "url", {
      url: "https://hub.docker.com",
      description: "Official Docker image registry",
    }),
    createItem("item_do_4", "GitHub Actions Docs", "type_link", "url", {
      url: "https://docs.github.com/en/actions",
      description: "GitHub Actions CI/CD documentation",
    }),
  ]);

  await prisma.collection.create({
    data: {
      id: "col_devops",
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
      items: {
        create: [
          { itemId: dockerfile.id },
          { itemId: deployCmd.id },
          { itemId: dockerHubLink.id },
          { itemId: ghActionsLink.id },
        ],
      },
    },
  });

  // ─── Terminal Commands ────────────────────────────────────────────────────

  console.log("  → Seeding Terminal Commands...");

  const [gitStash, dockerCleanup, killPort, npmCache] = await Promise.all([
    createItem("item_tc_1", "Git Stash with Message", "type_command", "text", {
      language: "bash",
      description: "Save current changes to stash with a descriptive name",
      isFavorite: true,
      content: `git stash push -m "wip: {{description}}"`,
    }),
    createItem("item_tc_2", "Docker Cleanup", "type_command", "text", {
      language: "bash",
      description: "Remove all stopped containers, unused images, and dangling volumes",
      content: `docker system prune -af --volumes`,
    }),
    createItem("item_tc_3", "Kill Process on Port", "type_command", "text", {
      language: "bash",
      description: "Find and kill whatever process is listening on a given port",
      isPinned: true,
      content: `lsof -ti :{{port}} | xargs kill -9`,
    }),
    createItem("item_tc_4", "Clear npm Cache", "type_command", "text", {
      language: "bash",
      description: "Verify and clean the npm cache to fix install issues",
      content: `npm cache verify && npm cache clean --force`,
    }),
  ]);

  await prisma.collection.create({
    data: {
      id: "col_terminal",
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
      isFavorite: true,
      items: {
        create: [
          { itemId: gitStash.id },
          { itemId: dockerCleanup.id },
          { itemId: killPort.id },
          { itemId: npmCache.id },
        ],
      },
    },
  });

  // ─── Design Resources ─────────────────────────────────────────────────────

  console.log("  → Seeding Design Resources...");

  const [tailwindLink, shadcnLink, radixLink, lucideLink] = await Promise.all([
    createItem("item_dr_1", "Tailwind CSS Docs", "type_link", "url", {
      url: "https://tailwindcss.com/docs",
      description: "Official Tailwind CSS v4 utility-first CSS framework documentation",
      isFavorite: true,
    }),
    createItem("item_dr_2", "shadcn/ui", "type_link", "url", {
      url: "https://ui.shadcn.com",
      description: "Beautifully designed accessible components built on Radix UI",
    }),
    createItem("item_dr_3", "Radix UI Primitives", "type_link", "url", {
      url: "https://www.radix-ui.com/primitives",
      description: "Unstyled, accessible component primitives for building design systems",
    }),
    createItem("item_dr_4", "Lucide Icons", "type_link", "url", {
      url: "https://lucide.dev/icons",
      description: "Beautiful and consistent open-source icon library",
    }),
  ]);

  await prisma.collection.create({
    data: {
      id: "col_design",
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
      items: {
        create: [
          { itemId: tailwindLink.id },
          { itemId: shadcnLink.id },
          { itemId: radixLink.id },
          { itemId: lucideLink.id },
        ],
      },
    },
  });

  console.log("✅ Seed complete.");
  console.log(`   Demo user: demo@devstash.io / 12345678`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
