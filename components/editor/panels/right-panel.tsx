"use client";

import { useState, useEffect } from "react";
import { MIcon } from "../ui/m-icon";
import { cn } from "@/lib/utils";
import { useEditor } from "../core/provider";
import SettingsTab from "./settings";

export default function RightPanel() {
  const { state } = useEditor();
  const selected = state.editor.selected;
  const [collapsed, setCollapsed] = useState(false);

  // Auto-open when an element is selected
  useEffect(() => {
    if (selected) setCollapsed(false);
  }, [selected]);

  return (
    <div className={cn("flex h-full border-l border-sidebar-border transition-[width] duration-200", collapsed ? "w-0" : "w-64")}>
      {!collapsed && (
        <div className="flex w-64 flex-col overflow-hidden bg-sidebar">
          {/* Toggle */}
          <div className="flex h-10 items-center justify-between border-b border-sidebar-border px-3">
            <span className="text-xs font-medium">{selected ? "Properties" : "Shortcuts"}</span>
            <button onClick={() => setCollapsed(true)} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent">
              <MIcon name="right_panel_close" size={16} />
            </button>
          </div>

          {selected ? (
            <SettingsTab />
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-4 text-xs text-muted-foreground">Select an element to edit its properties.</p>
              <div className="space-y-1 text-xs leading-relaxed">
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Cmd+S</kbd> Save</div>
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Cmd+Z</kbd> Undo</div>
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Cmd+D</kbd> Duplicate</div>
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Cmd+C/V</kbd> Copy / Paste</div>
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Cmd+↑/↓</kbd> Reorder</div>
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Cmd++/-</kbd> Zoom</div>
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Cmd+0</kbd> Reset Zoom</div>
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Delete</kbd> Remove</div>
                <div><kbd className="rounded border border-sidebar-border bg-sidebar-accent px-1 py-0.5 text-[10px]">Escape</kbd> Deselect</div>
                <p className="mt-3 text-[10px] text-muted-foreground">Auto-saves 5s after changes</p>
              </div>
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className="flex w-12 flex-col items-center border-l border-sidebar-border bg-sidebar py-2">
          <button onClick={() => setCollapsed(false)} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent">
            <MIcon name="right_panel_open" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
