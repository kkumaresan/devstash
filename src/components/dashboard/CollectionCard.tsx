import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ICON_MAP } from "@/components/dashboard/icon-map";
import type { DashboardCollection } from "@/lib/db/collections";

export function CollectionCard({ collection }: { collection: DashboardCollection }) {
  return (
    <Link href={`/collections/${collection.id}`}>
      <Card
        className="h-full hover:bg-accent/50 transition-colors cursor-pointer border-l-3"
        style={{
          borderLeftColor: collection.dominantType?.color ?? "transparent",
        }}
      >
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
          {collection.types.length > 0 && (
            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border">
              {collection.types.map((type) => {
                const Icon = ICON_MAP[type.icon];
                return Icon ? (
                  <Icon key={type.id} size={14} style={{ color: type.color }} />
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
