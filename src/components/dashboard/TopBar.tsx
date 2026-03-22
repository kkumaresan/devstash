"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "./SidebarContext";

export default function TopBar() {
  const { openMobile } = useSidebar();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={openMobile}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </Button>
        <Link href="/dashboard" className="text-lg font-semibold text-foreground hover:text-foreground/80 transition-colors">DevStash</Link>
      </div>
      <div className="flex items-center gap-3">
        <Input
          type="search"
          placeholder="Search items..."
          className="w-64"
        />
        <Button>New Item</Button>
      </div>
    </header>
  );
}
