"use client";

import { useState, useEffect } from "react";
import { MIcon } from "../../ui/m-icon";
import { cn } from "@/lib/utils";
import { useEditor } from "../../core/provider";
import SettingsTab from "./settings-tab";

const typeIcons: Record<string, string> = {
  __body: "public", container: "check_box_outline_blank", section: "view_agenda",
  row: "view_column", column: "view_stream", hero: "featured_video",
  header: "web_asset", footer: "call_to_action", card: "crop_portrait",
  grid: "grid_view", text: "text_fields", heading: "title", subheading: "text_format",
  button: "smart_button", link: "link", image: "image", video: "videocam",
  divider: "horizontal_rule", spacer: "space_bar", navbar: "menu",
};

export default function RightPanel() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { if (selected) setCollapsed(false); }, [selected]);

  const commitHistory = () => dispatch({ type: 'COMMIT_HISTORY' });

  return (
    <div className={cn("flex h-full border-l border-sidebar-border transition-[width] duration-200", collapsed ? "w-10" : "w-64")} onPointerUp={commitHistory} onChange={commitHistory}>
      {collapsed ? (
        <div className="flex w-10 flex-col items-center bg-sidebar py-2">
          <button onClick={() => setCollapsed(false)} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <MIcon name="chevron_left" size={16} />
          </button>
        </div>
      ) : (
        <div className="flex w-64 flex-col overflow-hidden bg-sidebar">
          {/* Header — element name + type badge */}
          <div className="flex h-9 items-center gap-2 border-b border-sidebar-border px-3 shrink-0">
            {selected ? (
              <>
                <MIcon name={typeIcons[selected.type] ?? "widgets"} size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium truncate flex-1">{selected.name}</span>
                <span className="text-[9px] text-muted-foreground/50 font-mono">{selected.type}</span>
              </>
            ) : (
              <>
                <MIcon name="touch_app" size={14} className="text-muted-foreground/40 shrink-0" />
                <span className="text-xs text-muted-foreground/60 flex-1">Select an element</span>
              </>
            )}
            <button onClick={() => setCollapsed(true)} className="flex size-5 items-center justify-center rounded text-muted-foreground/40 hover:text-foreground transition-colors shrink-0">
              <MIcon name="chevron_right" size={14} />
            </button>
          </div>

          {/* Single scrollable column — no tabs */}
          {selected ? (
            <SettingsTab />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <MIcon name="ads_click" size={32} className="text-muted-foreground/15 mx-auto mb-3" />
                <p className="text-[11px] text-muted-foreground/40">Click an element to edit</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
