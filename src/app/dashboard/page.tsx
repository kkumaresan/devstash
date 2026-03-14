import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link2,
  File,
  Image,
  Star,
  Pin,
  Layers,
  Heart,
  BookMarked,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ITEMS,
  COLLECTIONS,
  ITEM_TYPES,
  ITEM_TYPE_COUNTS,
  PINNED_ITEMS,
  FAVORITE_COLLECTIONS,
} from "@/lib/mock-data";
import type { Item, Collection } from "@/lib/mock-data";

// ─── Icon Map ────────────────────────────────────────────────────────────────

type IconComponent = ComponentType<{
  size?: number;
  className?: string;
  style?: CSSProperties;
}>;

const ICON_MAP: Record<string, IconComponent> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: Link2,
  File,
  Image,
};

// ─── Derived Data ─────────────────────────────────────────────────────────────

const totalItems = Object.values(ITEM_TYPE_COUNTS).reduce((a, b) => a + b, 0);
const totalCollections = COLLECTIONS.length;
const favoriteItems = ITEMS.filter((i) => i.isFavorite).length;
const favoriteCollections = FAVORITE_COLLECTIONS.length;

const recentCollections = [...COLLECTIONS]
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .slice(0, 6);

const recentItems = [...ITEMS]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatsCards() {
  const stats = [
    { label: "Total Items", value: totalItems, icon: Layers, color: "text-blue-500" },
    { label: "Collections", value: totalCollections, icon: BookMarked, color: "text-purple-500" },
    { label: "Favorite Items", value: favoriteItems, icon: Heart, color: "text-pink-500" },
    { label: "Favorite Collections", value: favoriteCollections, icon: Star, color: "text-yellow-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon size={20} className={stat.color} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Collection Card ──────────────────────────────────────────────────────────

function CollectionCard({ collection }: { collection: Collection }) {
  const dominantType = ITEM_TYPES.find((t) => t.id === collection.dominantTypeId);

  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4 flex flex-col gap-2 h-full">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm leading-tight">{collection.name}</p>
            {collection.isFavorite && (
              <Star size={14} className="text-yellow-400 fill-yellow-400 shrink-0 mt-0.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {collection.itemCount} items
          </p>
          {collection.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
              {collection.description}
            </p>
          )}
          {dominantType && (
            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border">
              {(() => {
                const Icon = ICON_MAP[dominantType.icon];
                return Icon ? (
                  <Icon size={12} style={{ color: dominantType.color }} />
                ) : null;
              })()}
              <span className="text-xs text-muted-foreground">{dominantType.name}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: Item }) {
  const itemType = ITEM_TYPES.find((t) => t.id === item.itemTypeId);
  const Icon = itemType ? ICON_MAP[itemType.icon] : null;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="shrink-0 mt-0.5">
        {Icon && itemType && (
          <Icon size={16} style={{ color: itemType.color }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{item.title}</p>
          {item.isPinned && <Pin size={12} className="text-muted-foreground shrink-0" />}
          {item.isFavorite && <Heart size={12} className="text-pink-400 fill-pink-400 shrink-0" />}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs px-1.5 py-0 h-4">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground shrink-0 mt-0.5">{formatDate(item.createdAt)}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your developer knowledge hub</p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Recent Collections */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Collections</h2>
          <Link href="/collections" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {PINNED_ITEMS.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Pin size={14} className="text-muted-foreground" />
            <h2 className="text-base font-semibold">Pinned</h2>
          </div>
          <Card>
            <CardContent className="p-4">
              {PINNED_ITEMS.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Recent Items</h2>
          <Link href="/items" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
        <Card>
          <CardContent className="p-4">
            {recentItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
