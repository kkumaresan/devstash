import { notFound, redirect } from "next/navigation";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { getItemsByType } from "@/lib/db/items";
import { ICON_MAP } from "@/components/dashboard/icon-map";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const TYPE_TITLES: Record<string, string> = {
  snippet: "Snippets",
  prompt: "Prompts",
  command: "Commands",
  note: "Notes",
  file: "Files",
  image: "Images",
  link: "Links",
};

export default async function ItemsListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { type } = await params;
  const { items, itemType } = await getItemsByType(session.user.id, type);

  if (!itemType) notFound();

  const Icon = ICON_MAP[itemType.icon];
  const title = TYPE_TITLES[type] ?? type;

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={24} style={{ color: itemType.color }} />}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
