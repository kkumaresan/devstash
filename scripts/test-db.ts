import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔌 Testing database connection...\n");

  // Connection check
  await prisma.$queryRaw`SELECT 1`;
  console.log("✅ Connected to Neon PostgreSQL\n");

  // Row counts per model
  const [
    userCount,
    itemTypeCount,
    itemCount,
    collectionCount,
    tagCount,
    itemCollectionCount,
    itemTagCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
    prisma.itemCollection.count(),
    prisma.itemTag.count(),
  ]);

  console.log("📊 Row counts:");
  console.log(`  Users            : ${userCount}`);
  console.log(`  Item Types       : ${itemTypeCount}`);
  console.log(`  Items            : ${itemCount}`);
  console.log(`  Collections      : ${collectionCount}`);
  console.log(`  Tags             : ${tagCount}`);
  console.log(`  Item↔Collection  : ${itemCollectionCount}`);
  console.log(`  Item↔Tag         : ${itemTagCount}`);

  // System item types
  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: { name: true, icon: true, color: true },
  });
  console.log("\n🏷️  System item types:");
  for (const t of systemTypes) {
    console.log(`  ${t.name.padEnd(10)} icon=${t.icon.padEnd(12)} color=${t.color}`);
  }

  // Test user + their items
  const user = await prisma.user.findFirst({
    select: {
      name: true,
      email: true,
      isPro: true,
      _count: { select: { items: true, collections: true } },
    },
  });
  if (user) {
    console.log(`\n👤 Test user: ${user.name} <${user.email}>`);
    console.log(`   Pro: ${user.isPro} | Items: ${user._count.items} | Collections: ${user._count.collections}`);
  }

  // Pinned items
  const pinned = await prisma.item.findMany({
    where: { isPinned: true },
    select: { title: true, itemType: { select: { name: true } } },
  });
  console.log(`\n📌 Pinned items (${pinned.length}):`);
  for (const item of pinned) {
    console.log(`  [${item.itemType.name}] ${item.title}`);
  }

  // Favorite collections
  const favCollections = await prisma.collection.findMany({
    where: { isFavorite: true },
    select: { name: true, _count: { select: { items: true } } },
  });
  console.log(`\n⭐ Favorite collections (${favCollections.length}):`);
  for (const col of favCollections) {
    console.log(`  ${col.name} (${col._count.items} items)`);
  }

  console.log("\n✅ All checks passed.");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
