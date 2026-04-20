"use client";

import { componentGroups } from "../element-factory";
import { setDragPreview } from "../element-wrapper";

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
                onDragStart={(e) => { e.dataTransfer.setData("componentType", type); setDragPreview(e, label); }}
                className="flex cursor-grab items-center gap-2 rounded-lg border border-border/50 bg-background p-2.5 text-xs shadow-sm transition-all hover:shadow-md hover:border-border active:cursor-grabbing active:scale-[0.97]"
              >
                <span style={{ color }}><Icon size={14} /></span>
                <span className="truncate font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
