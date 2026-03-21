import { prisma } from "@/lib/prisma";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  hashedPassword: boolean; // true if user has a password (credentials user)
  createdAt: Date;
}

export interface ItemTypeCount {
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  itemsByType: ItemTypeCount[];
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      hashedPassword: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    hashedPassword: !!user.hashedPassword,
    createdAt: user.createdAt,
  };
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, typeCounts] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: {
        OR: [{ isSystem: true }, { userId }],
      },
      select: {
        name: true,
        icon: true,
        color: true,
        _count: { select: { items: { where: { userId } } } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    totalItems,
    totalCollections,
    itemsByType: typeCounts.map((t) => ({
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    })),
  };
}
