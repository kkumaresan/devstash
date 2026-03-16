"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "./SidebarContext";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

const PRO_TYPES = new Set(["file", "image"]);

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

// ─── Constants ───────────────────────────────────────────────────────────────

/** Desired sidebar order + plural display names (keyed by DB name) */
const TYPE_DISPLAY: Record<string, { label: string; order: number }> = {
  snippet: { label: "Snippets", order: 0 },
  prompt:  { label: "Prompts",  order: 1 },
  command: { label: "Commands", order: 2 },
  note:    { label: "Notes",    order: 3 },
  file:    { label: "Files",    order: 4 },
  image:   { label: "Images",   order: 5 },
  link:    { label: "Links",    order: 6 },
};

function sortedItemTypes(types: SidebarItemType[]): SidebarItemType[] {
  return [...types].sort((a, b) => {
    const oa = TYPE_DISPLAY[a.name]?.order ?? 99;
    const ob = TYPE_DISPLAY[b.name]?.order ?? 99;
    return oa - ob;
  });
}

function displayName(name: string): string {
  return TYPE_DISPLAY[name]?.label ?? name;
}

const CURRENT_USER = {
  name: "Demo User",
  email: "demo@devstash.io",
  image: undefined as string | undefined,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  itemTypes: SidebarItemType[];
  favoriteCollections: SidebarCollection[];
  recentCollections: SidebarCollection[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeItem({ type, isOpen }: { type: SidebarItemType; isOpen: boolean }) {
  const Icon = ICON_MAP[type.icon];

  return (
    <Link
      href={`/items/${type.name}`}
      className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {Icon && <Icon size={16} style={{ color: type.color }} className="shrink-0" />}
      <span
        className={`flex-1 transition-[opacity,width] duration-200 overflow-hidden whitespace-nowrap ${
          isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
        }`}
      >
        {displayName(type.name)}
      </span>
      {isOpen && PRO_TYPES.has(type.name) && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-semibold tracking-wide">
          PRO
        </Badge>
      )}
      {isOpen && (
        <span className="text-xs text-muted-foreground tabular-nums">{type.count}</span>
      )}
    </Link>
  );
}

function SidebarContent({
  isOpen,
  itemTypes,
  favoriteCollections,
  recentCollections,
}: { isOpen: boolean } & SidebarProps) {
  const { toggle } = useSidebar();
  const [collectionsUserChoice, setCollectionsUserChoice] = useState(true);
  const collectionsOpen = isOpen ? collectionsUserChoice : true;

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
        {sortedItemTypes(itemTypes).map((type) => (
          <TypeItem key={type.id} type={type} isOpen={isOpen} />
        ))}
      </nav>

      {/* Collections — only visible when expanded */}
      {isOpen && (
        <div className="px-2 pb-3">
          <Collapsible open={collectionsOpen} onOpenChange={setCollectionsUserChoice}>
            <CollapsibleTrigger
              className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              aria-label="Toggle collections"
            >
              Collections
              <ChevronDown size={12} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              {favoriteCollections.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {favoriteCollections.map((col) => (
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
              {recentCollections.length > 0 && (
                <div className="mt-2">
                  <p className="px-2 py-1 text-xs text-muted-foreground">Recent</p>
                  <div className="space-y-0.5">
                    {recentCollections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors truncate"
                      >
                        {col.dominantColor && (
                          <span
                            className="shrink-0 w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: col.dominantColor }}
                          />
                        )}
                        <span className="truncate">{col.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {/* View all collections */}
              <Link
                href="/collections"
                className="block px-2 py-1.5 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all collections
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <div className="flex-1" />

      {/* User Avatar */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 shrink-0">
            {CURRENT_USER.image && (
              <AvatarImage src={CURRENT_USER.image} alt={CURRENT_USER.name} />
            )}
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

export default function Sidebar({
  itemTypes,
  favoriteCollections,
  recentCollections,
}: SidebarProps) {
  const { isOpen, isMobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <SidebarContent
          isOpen={isOpen}
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
        />
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={(open) => !open && closeMobile()}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent
            isOpen={true}
            itemTypes={itemTypes}
            favoriteCollections={favoriteCollections}
            recentCollections={recentCollections}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
