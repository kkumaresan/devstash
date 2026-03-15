import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔌 Testing database connection...\n");

  await prisma.$queryRaw`SELECT 1`;
  console.log("✅ Connected to Neon PostgreSQL\n");

  // ─── System item types ─────────────────────────────────────────────────────

  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: { name: true, icon: true, color: true },
  });

  console.log(`🏷️  System item types (${systemTypes.length}):`);
  for (const t of systemTypes) {
    console.log(`  ${t.name.padEnd(10)} icon=${t.icon.padEnd(12)} color=${t.color}`);
  }

  // ─── Demo user ─────────────────────────────────────────────────────────────

  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: {
      name: true,
      email: true,
      emailVerified: true,
      isPro: true,
      hashedPassword: true,
      _count: { select: { items: true, collections: true } },
    },
  });

  if (!user) {
    console.error("\n❌ Demo user not found. Run: npm run db:seed");
    process.exit(1);
  }

  console.log(`\n👤 Demo user:`);
  console.log(`   Name           : ${user.name}`);
  console.log(`   Email          : ${user.email}`);
  console.log(`   Email verified : ${user.emailVerified?.toISOString() ?? "—"}`);
  console.log(`   Password hash  : ${user.hashedPassword ? "✅ set" : "❌ missing"}`);
  console.log(`   isPro          : ${user.isPro}`);
  console.log(`   Items          : ${user._count.items}`);
  console.log(`   Collections    : ${user._count.collections}`);

  // ─── Collections with items ────────────────────────────────────────────────

  const collections = await prisma.collection.findMany({
    where: { user: { email: "demo@devstash.io" } },
    orderBy: { name: "asc" },
    select: {
      name: true,
      description: true,
      isFavorite: true,
      items: {
        select: {
          item: {
            select: {
              title: true,
              contentType: true,
              isPinned: true,
              isFavorite: true,
              itemType: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  console.log(`\n📚 Collections (${collections.length}):`);
  for (const col of collections) {
    const fav = col.isFavorite ? " ⭐" : "";
    console.log(`\n  ${col.name}${fav}`);
    console.log(`  ${col.description}`);
    for (const { item } of col.items) {
      const pin = item.isPinned ? " 📌" : "";
      const heart = item.isFavorite ? " ❤️" : "";
      console.log(`    [${item.itemType.name.padEnd(8)}] ${item.title}${pin}${heart}`);
    }
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n📊 Demo user totals:`);
  const itemsByType = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: { user: { email: "demo@devstash.io" } },
    _count: true,
  });
  const typeMap = await prisma.itemType.findMany({
    where: { id: { in: itemsByType.map((r) => r.itemTypeId) } },
    select: { id: true, name: true },
  });
  const typeNameById = Object.fromEntries(typeMap.map((t) => [t.id, t.name]));
  for (const row of itemsByType.sort((a, b) => b._count - a._count)) {
    console.log(`  ${typeNameById[row.itemTypeId].padEnd(10)}: ${row._count}`);
  }

  console.log("\n✅ All checks passed.");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
