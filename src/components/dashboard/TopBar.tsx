"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      <span className="text-lg font-semibold text-foreground">DevStash</span>
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
