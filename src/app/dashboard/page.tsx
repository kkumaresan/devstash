import Link from "next/link";
import { Pin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemRow } from "@/components/dashboard/ItemRow";
import { getRecentCollections, getCollectionStats } from "@/lib/db/collections";
import { getRecentItems, getPinnedItems, getItemStats } from "@/lib/db/items";

// ─── Constants ───────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "user_demo";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [recentCollections, collectionStats, recentItems, pinnedItems, itemStats] =
    await Promise.all([
      getRecentCollections(DEMO_USER_ID),
      getCollectionStats(DEMO_USER_ID),
      getRecentItems(DEMO_USER_ID),
      getPinnedItems(DEMO_USER_ID),
      getItemStats(DEMO_USER_ID),
    ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your developer knowledge hub</p>
      </div>

      {/* Stats */}
      <StatsCards
        totalItems={itemStats.totalItems}
        totalCollections={collectionStats.totalCollections}
        favoriteItems={itemStats.favoriteItems}
        favoriteCollections={collectionStats.favoriteCollections}
      />

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
      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Pin size={14} className="text-muted-foreground" />
            <h2 className="text-base font-semibold">Pinned</h2>
          </div>
          <Card>
            <CardContent className="p-4">
              {pinnedItems.map((item) => (
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
