import { prisma } from "@/lib/prisma";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ItemTypeInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ItemTagInfo {
  id: string;
  name: string;
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemType: ItemTypeInfo;
  tags: ItemTagInfo[];
  createdAt: Date;
}

// ─── Queries ────────────────────────────────────────────────────────────────

const itemSelect = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  itemType: {
    select: { id: true, name: true, icon: true, color: true },
  },
  tags: {
    include: {
      tag: { select: { id: true, name: true } },
    },
  },
} as const;

function mapItem(item: Awaited<ReturnType<typeof queryItems>>[number]): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    itemType: item.itemType,
    tags: item.tags.map((it) => it.tag),
    createdAt: item.createdAt,
  };
}

async function queryItems(where: object, limit: number, orderBy: object = { createdAt: "desc" }) {
  return prisma.item.findMany({
    where,
    orderBy,
    take: limit,
    select: itemSelect,
  });
}

export async function getRecentItems(
  userId: string,
  limit = 10
): Promise<DashboardItem[]> {
  const items = await queryItems({ userId }, limit);
  return items.map(mapItem);
}

export async function getPinnedItems(
  userId: string
): Promise<DashboardItem[]> {
  const items = await queryItems({ userId, isPinned: true }, 20);
  return items.map(mapItem);
}

export async function getItemStats(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, favoriteItems };
}

// ─── Sidebar Queries ────────────────────────────────────────────────────────

export interface SidebarItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export async function getItemTypesWithCounts(
  userId: string
): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: {
      OR: [{ isSystem: true }, { userId }],
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: { select: { items: { where: { userId } } } },
    },
    orderBy: { name: "asc" },
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    color: t.color,
    count: t._count.items,
  }));
}
