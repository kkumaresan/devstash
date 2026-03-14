"use client";

import { useState, useEffect } from "react";
import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link2,
  File,
  Image,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Star,
  Settings,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./SidebarContext";
import {
  ITEM_TYPES,
  ITEM_TYPE_COUNTS,
  FAVORITE_COLLECTIONS,
  COLLECTIONS,
  CURRENT_USER,
} from "@/lib/mock-data";
import type { ItemType } from "@/lib/mock-data";

// ─── Icon Map ────────────────────────────────────────────────────────────────

type IconComponent = ComponentType<{
  size?: number;
  className?: string;
  style?: CSSProperties;
}>;

const ICON_MAP: Record<string, IconComponent> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: Link2,
  File,
  Image,
};

// ─── Derived data ─────────────────────────────────────────────────────────────

const RECENT_COLLECTIONS = [...COLLECTIONS]
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .slice(0, 5);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeItem({ type, isOpen }: { type: ItemType; isOpen: boolean }) {
  const Icon = ICON_MAP[type.icon];
  const count = ITEM_TYPE_COUNTS[type.id] ?? 0;

  return (
    <Link
      href={`/items/${type.slug}`}
      className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {Icon && <Icon size={16} style={{ color: type.color }} className="shrink-0" />}
      <span
        className={`flex-1 transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${
          isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
        }`}
      >
        {type.name}
      </span>
      {isOpen && (
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      )}
    </Link>
  );
}

function SidebarContent({ isOpen }: { isOpen: boolean }) {
  const { toggle } = useSidebar();
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  useEffect(() => {
    if (isOpen) setCollectionsOpen(true);
  }, [isOpen]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <span
          className={`font-semibold text-sm transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${
            isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
          }`}
        >
          DevStash
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="h-7 w-7 shrink-0"
        >
          {isOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </Button>
      </div>

      {/* Types */}
      <nav className="px-2 py-3 space-y-0.5">
        {ITEM_TYPES.map((type) => (
          <TypeItem key={type.id} type={type} isOpen={isOpen} />
        ))}
      </nav>

      {/* Collections — only visible when expanded */}
      {isOpen && (
        <div className="px-2 pb-3">
          <Collapsible open={collectionsOpen} onOpenChange={setCollectionsOpen}>
            <CollapsibleTrigger
              className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              aria-label="Toggle collections"
            >
              Collections
              <ChevronDown size={12} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              {FAVORITE_COLLECTIONS.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {FAVORITE_COLLECTIONS.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Star size={12} className="shrink-0 text-yellow-400 fill-yellow-400" />
                      <span className="truncate">{col.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {RECENT_COLLECTIONS.length > 0 && (
                <div className="mt-2">
                  <p className="px-2 py-1 text-xs text-muted-foreground">Recent</p>
                  <div className="space-y-0.5">
                    {RECENT_COLLECTIONS.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors truncate"
                      >
                        <span className="truncate">{col.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <div className="flex-1" />

      {/* User Avatar */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={CURRENT_USER.image ?? ""} alt={CURRENT_USER.name} />
            <AvatarFallback className="text-xs">
              {getInitials(CURRENT_USER.name)}
            </AvatarFallback>
          </Avatar>
          {isOpen && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{CURRENT_USER.name}</p>
                <p className="text-xs text-muted-foreground truncate">{CURRENT_USER.email}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label="Settings">
                <Settings size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { isOpen, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <SidebarContent isOpen={isOpen} />
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={(open) => !open && closeMobile()}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent isOpen={true} />
        </SheetContent>
      </Sheet>
    </>
  );
}
