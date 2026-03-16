import type { ReactNode } from "react";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export const dynamic = "force-dynamic";

const DEMO_USER_ID = "user_demo";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [itemTypes, sidebarCollections] = await Promise.all([
    getItemTypesWithCounts(DEMO_USER_ID),
    getSidebarCollections(DEMO_USER_ID),
  ]);

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
        <TopBar />
        <div className="flex flex-1 min-h-0">
          <Sidebar
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
