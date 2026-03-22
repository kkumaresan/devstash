import { Pin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ICON_MAP } from "@/components/dashboard/icon-map";
import type { DashboardItem } from "@/lib/db/items";

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ItemCard({ item }: { item: DashboardItem }) {
  const Icon = ICON_MAP[item.itemType.icon];

  return (
    <Card
      className="border-l-3 p-5"
      style={{ borderLeftColor: item.itemType.color }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {Icon && (
            <Icon size={16} style={{ color: item.itemType.color }} />
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
    </Card>
  );
}
