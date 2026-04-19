"use client";

import { componentGroups } from "../element-factory";

export default function ComponentsTab() {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {componentGroups.map((group) => (
        <div key={group.label} className="mb-3">
          <div className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {group.label}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {group.items.map(({ type, label, icon: Icon, color }) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("componentType", type)}
                className="flex cursor-grab items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 text-xs transition-colors hover:bg-sidebar-accent active:cursor-grabbing"
              >
                <span style={{ color }}><Icon size={14} /></span>
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
