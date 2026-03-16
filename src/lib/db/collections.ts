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
        take: 50,
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
      _count: { select: { items: true } },
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
      itemCount: col._count.items,
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

// ─── Sidebar Queries ────────────────────────────────────────────────────────

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantColor: string | null;
}

export async function getSidebarCollections(
  userId: string
): Promise<{ favorites: SidebarCollection[]; recents: SidebarCollection[] }> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      isFavorite: true,
      items: {
        take: 50,
        include: {
          item: {
            select: {
              itemType: { select: { color: true } },
            },
          },
        },
      },
    },
  });

  function getDominantColor(
    items: { item: { itemType: { color: string } } }[]
  ): string | null {
    if (items.length === 0) return null;
    const counts = new Map<string, number>();
    for (const ic of items) {
      const color = ic.item.itemType.color;
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
    let maxColor: string | null = null;
    let maxCount = 0;
    for (const [color, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        maxColor = color;
      }
    }
    return maxColor;
  }

  const mapped = collections.map((col) => ({
    id: col.id,
    name: col.name,
    isFavorite: col.isFavorite,
    dominantColor: getDominantColor(col.items),
  }));

  return {
    favorites: mapped.filter((c) => c.isFavorite),
    recents: mapped.filter((c) => !c.isFavorite).slice(0, 5),
  };
}
