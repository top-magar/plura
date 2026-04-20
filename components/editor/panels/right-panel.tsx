"use client";

import { useState, useEffect } from "react";
import { MIcon } from "../ui/m-icon";
import { cn } from "@/lib/utils";
import { useEditor } from "../core/provider";
import SettingsTab from "./settings";

const shortcuts = [
  { keys: "Cmd+S", action: "Save" },
  { keys: "Cmd+Z", action: "Undo" },
  { keys: "Cmd+Shift+Z", action: "Redo" },
  { keys: "Cmd+D", action: "Duplicate" },
  { keys: "Cmd+C/V", action: "Copy / Paste" },
  { keys: "Cmd+Alt+C/V", action: "Copy / Paste styles" },
  { keys: "↑ / ↓", action: "Reorder element" },
  { keys: "Cmd++/-", action: "Zoom in / out" },
  { keys: "Delete", action: "Remove element" },
  { keys: "Escape", action: "Select parent" },
  { keys: "Right-click", action: "Context menu" },
];

const typeIcons: Record<string, string> = {
  __body: "public", container: "check_box_outline_blank", section: "view_agenda",
  row: "view_column", column: "view_stream", hero: "featured_video",
  header: "web_asset", footer: "call_to_action", card: "crop_portrait",
  grid: "grid_view", text: "text_fields", heading: "title", subheading: "text_format",
  button: "smart_button", link: "link", image: "image", video: "videocam",
  divider: "horizontal_rule", spacer: "space_bar", navbar: "menu",
};

export default function RightPanel() {
  const { state } = useEditor();
  const selected = state.editor.selected;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { if (selected) setCollapsed(false); }, [selected]);

  return (
    <div className={cn("flex h-full border-l border-sidebar-border transition-[width] duration-200", collapsed ? "w-10" : "w-64")}>
      {collapsed ? (
        <div className="flex w-10 flex-col items-center bg-sidebar py-2">
          <button onClick={() => setCollapsed(false)} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <MIcon name="chevron_left" size={16} />
          </button>
        </div>
      ) : (
        <div className="flex w-64 flex-col overflow-hidden bg-sidebar">
          {/* Header */}
          <div className="flex h-10 items-center gap-2 border-b border-sidebar-border px-3">
            {selected ? (
              <>
                <MIcon name={typeIcons[selected.type] ?? "widgets"} size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium truncate flex-1">{selected.name}</span>
                <span className="text-[9px] text-muted-foreground/50 font-mono">{selected.type}</span>
              </>
            ) : (
              <>
                <MIcon name="keyboard" size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs font-medium flex-1">Shortcuts</span>
              </>
            )}
            <button onClick={() => setCollapsed(true)} className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors shrink-0">
              <MIcon name="chevron_right" size={14} />
            </button>
          </div>

          {/* Content */}
          {selected ? (
            <SettingsTab />
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-0.5">
                {shortcuts.map(({ keys, action }) => (
                  <div key={keys} className="flex items-center justify-between py-1">
                    <span className="text-[10px] text-muted-foreground">{action}</span>
                    <kbd className="rounded border border-sidebar-border bg-sidebar-accent/50 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground/70">{keys}</kbd>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md border border-sidebar-border/50 bg-sidebar-accent/30 p-3">
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                  <MIcon name="info" size={12} className="inline mr-1 -mt-0.5" />
                  Click any element on the canvas to edit its properties. Changes auto-save after 5 seconds.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
