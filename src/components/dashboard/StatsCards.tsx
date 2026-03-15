import { Layers, BookMarked, Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatsCards({
  totalItems,
  totalCollections,
  favoriteItems,
  favoriteCollections,
}: {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}) {
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
