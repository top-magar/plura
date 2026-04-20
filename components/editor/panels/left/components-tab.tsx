"use client";

import { useState } from "react";
import { MIcon } from "../../ui/m-icon";
import { componentGroups } from "../../core/element-factory";
import { useDragOverlay } from "../../canvas/drag-overlay";
import { cn } from "@/lib/utils";

export default function ComponentsTab() {
  const { start } = useDragOverlay();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const q = query.toLowerCase().trim();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search */}
      <div className="relative px-2 py-1.5">
        <MIcon name="search" size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components..."
          className="h-7 w-full rounded-md border border-sidebar-border bg-transparent pl-8 pr-2 text-xs outline-none placeholder:text-muted-foreground/40 focus:border-primary"
        />
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {componentGroups.map((group) => {
          const items = q ? group.items.filter(i => i.label.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)) : group.items;
          if (items.length === 0) return null;
          const isCollapsed = !q && collapsed[group.label];

          return (
            <div key={group.label} className="mb-2">
              <button
                onClick={() => !q && setCollapsed(p => ({ ...p, [group.label]: !p[group.label] }))}
                className="flex w-full items-center gap-1 px-1 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <MIcon name="expand_more" size={14} className={cn("transition-transform", isCollapsed && "-rotate-90")} />
                {group.label}
                <span className="ml-auto text-[9px] font-normal tabular-nums">{items.length}</span>
              </button>
              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-1">
                  {items.map(({ type, label, icon: Icon, color }) => (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("componentType", type); start(label, e); }}
                      className="flex cursor-grab items-center gap-2 rounded-lg border border-border/50 bg-background p-2 text-xs shadow-sm transition-[shadow,border-color,transform] hover:shadow-md hover:border-border active:cursor-grabbing active:scale-[0.97]"
                    >
                      <span style={{ color }}><Icon size={13} /></span>
                      <span className="truncate font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {q && componentGroups.every(g => g.items.every(i => !i.label.toLowerCase().includes(q) && !i.type.toLowerCase().includes(q))) && (
          <p className="py-8 text-center text-xs text-muted-foreground/50">No components found</p>
        )}
      </div>
    </div>
  );
}
