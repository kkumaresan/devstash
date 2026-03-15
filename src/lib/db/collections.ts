import { prisma } from "@/lib/prisma";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CollectionTypeInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantType: CollectionTypeInfo | null;
  types: CollectionTypeInfo[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getRecentCollections(
  userId: string,
  limit = 6
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: {
                select: { id: true, name: true, icon: true, color: true },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const itemTypes = col.items.map((ic) => ic.item.itemType);

    // Count occurrences of each type to find the dominant one
    const typeCounts = new Map<string, { count: number; type: CollectionTypeInfo }>();
    for (const type of itemTypes) {
      const existing = typeCounts.get(type.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(type.id, { count: 1, type });
      }
    }

    // Find dominant type (most common)
    let dominantType: CollectionTypeInfo | null = null;
    let maxCount = 0;
    for (const [, value] of typeCounts) {
      if (value.count > maxCount) {
        maxCount = value.count;
        dominantType = value.type;
      }
    }

    // Get unique types present in this collection
    const types = [...typeCounts.values()].map((v) => v.type);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantType,
      types,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
    };
  });
}

export async function getCollectionStats(userId: string) {
  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalCollections, favoriteCollections };
}
