import TopBar from "@/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="flex flex-1">
        <aside className="w-64 border-r border-border p-4">
          <h2 className="text-lg font-semibold">Sidebar</h2>
        </aside>
        <main className="flex-1 p-4">
          <h2 className="text-lg font-semibold">Main</h2>
          {children}
        </main>
      </div>
    </div>
  );
}
