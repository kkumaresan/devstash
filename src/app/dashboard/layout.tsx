import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [itemTypes, sidebarCollections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ]);

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
        <TopBar />
        <div className="flex flex-1 min-h-0">
          <Sidebar
            user={session.user}
            itemTypes={itemTypes}
            favoriteCollections={sidebarCollections.favorites}
            recentCollections={sidebarCollections.recents}
          />
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
