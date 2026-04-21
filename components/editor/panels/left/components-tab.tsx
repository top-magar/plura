"use client";

import { useState, useEffect } from "react";
import { MIcon } from "../../ui/m-icon";
import { componentGroups } from "../../core/registry";
import { useDragOverlay } from "../../canvas/drag-overlay";
import { cn } from "@/lib/utils";

// Material icon + color mapping for each component type
const typeIcons: Record<string, string> = {
  section: "view_agenda", container: "check_box_outline_blank", row: "view_column",
  column: "view_stream", grid: "grid_view", header: "web_asset", card: "crop_portrait",
  divider: "horizontal_rule", spacer: "space_bar", heading: "title", subheading: "text_format",
  text: "text_fields", list: "format_list_bulleted", quote: "format_quote", badge: "verified",
  code: "code", icon: "star", image: "image", video: "videocam", gallery: "photo_library",
  link: "link", button: "smart_button", map: "location_on", embed: "code", socialIcons: "share",
  accordion: "expand_more", tabs: "tab", countdown: "timer", navbar: "menu", footer: "call_to_action",
  contactForm: "contact_mail", paymentForm: "credit_card", hero: "featured_video", cta: "campaign",
  testimonial: "format_quote", pricing: "payments", features: "auto_awesome", stats: "bar_chart",
};

const typeColors: Record<string, string> = {
  section: "#7c3aed", container: "#8b5cf6", row: "#6d28d9", column: "#7c3aed",
  grid: "#5b21b6", header: "#7c3aed", card: "#8b5cf6", divider: "#94a3b8",
  spacer: "#64748b", heading: "#3b82f6", subheading: "#60a5fa", text: "#3b82f6",
  list: "#06b6d4", quote: "#f59e0b", badge: "#eab308", code: "#10b981",
  icon: "#ec4899", image: "#22c55e", video: "#ef4444", gallery: "#84cc16",
  link: "#0ea5e9", button: "#2563eb", map: "#16a34a", embed: "#a855f7",
  socialIcons: "#14b8a6", accordion: "#f97316", tabs: "#fb923c", countdown: "#e11d48",
  navbar: "#4f46e5", footer: "#475569", contactForm: "#0891b2", paymentForm: "#d97706",
  hero: "#6366f1", cta: "#2563eb", testimonial: "#f59e0b", pricing: "#d97706",
  features: "#8b5cf6", stats: "#3b82f6",
};

function useRecent(): [string[], (type: string) => void] {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem('editor-recent-components') ?? '[]')); } catch { /* */ }
  }, []);
  const add = (type: string) => {
    const next = [type, ...recent.filter(t => t !== type)].slice(0, 6);
    setRecent(next);
    localStorage.setItem('editor-recent-components', JSON.stringify(next));
  };
  return [recent, add];
}

export default function ComponentsTab() {
  const { start } = useDragOverlay();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [recent, addRecent] = useRecent();
  const [view, setView] = useState<'grid' | 'list'>('list');

  const q = query.toLowerCase().trim();

  // Flat list for search
  const allItems = componentGroups().flatMap(g => g.items);
  const recentItems = recent.map(t => allItems.find(i => i.type === t)).filter(Boolean) as typeof allItems;

  const onDragStart = (type: string, label: string, e: React.DragEvent) => {
    e.dataTransfer.setData("componentType", type);
    start(label, e);
    addRecent(type);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search + view toggle */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        <div className="relative flex-1">
          <MIcon name="search" size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="h-7 w-full rounded-md border border-sidebar-border bg-transparent pl-7 pr-2 text-[11px] outline-none placeholder:text-muted-foreground/30 focus:border-primary" />
          {query && <button onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground"><MIcon name="close" size={12} /></button>}
        </div>
        <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')} className="flex size-7 items-center justify-center rounded-md border border-sidebar-border text-muted-foreground/40 hover:text-foreground transition-colors">
          <MIcon name={view === 'grid' ? 'view_list' : 'grid_view'} size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {/* Recently used */}
        {!q && recentItems.length > 0 && (
          <div className="mb-2">
            <span className="flex items-center gap-1 px-1 py-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/40">
              <MIcon name="history" size={11} /> Recent
            </span>
            <div className="flex flex-wrap gap-1">
              {recentItems.map(({ type, label }) => (
                <div key={type} draggable onDragStart={(e) => onDragStart(type, label, e)}
                  className="flex items-center gap-1 h-6 px-2 rounded-md bg-sidebar-accent/50 text-[10px] cursor-grab hover:bg-sidebar-accent active:cursor-grabbing transition-colors">
                  <span style={{ color: typeColors[type] }}><MIcon name={typeIcons[type] ?? 'widgets'} size={12} /></span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups */}
        {componentGroups().map((group) => {
          const items = q ? group.items.filter(i => i.label.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)) : group.items;
          if (items.length === 0) return null;
          const isCollapsed = !q && collapsed[group.label];

          return (
            <div key={group.label} className="mb-1">
              <button onClick={() => !q && setCollapsed(p => ({ ...p, [group.label]: !p[group.label] }))}
                className="flex w-full items-center gap-1 px-1 py-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground/50 hover:text-foreground transition-colors">
                <MIcon name={isCollapsed ? "chevron_right" : "expand_more"} size={14} className="text-muted-foreground/30" />
                {group.label}
                <span className="ml-auto text-[9px] font-normal text-muted-foreground/30 tabular-nums">{items.length}</span>
              </button>
              {!isCollapsed && (
                view === 'grid' ? (
                  <div className="grid grid-cols-2 gap-1">
                    {items.map(({ type, label }) => (
                      <div key={type} draggable onDragStart={(e) => onDragStart(type, label, e)}
                        className="flex flex-col items-center gap-1 rounded-md border border-border/40 bg-background p-2 cursor-grab hover:border-primary/30 hover:shadow-sm active:cursor-grabbing active:scale-[0.97] transition-all">
                        <span style={{ color: typeColors[type] }}><MIcon name={typeIcons[type] ?? 'widgets'} size={18} /></span>
                        <span className="text-[9px] text-muted-foreground/70 truncate w-full text-center">{label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-px">
                    {items.map(({ type, label }) => (
                      <div key={type} draggable onDragStart={(e) => onDragStart(type, label, e)}
                        className="flex items-center gap-2 h-7 px-2 rounded-md cursor-grab hover:bg-sidebar-accent/60 active:cursor-grabbing active:bg-sidebar-accent transition-colors">
                        <span style={{ color: typeColors[type] }} className="shrink-0"><MIcon name={typeIcons[type] ?? 'widgets'} size={14} /></span>
                        <span className="text-[11px] truncate">{label}</span>
                        <MIcon name="drag_indicator" size={12} className="ml-auto text-muted-foreground/20 shrink-0" />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          );
        })}

        {q && allItems.every(i => !i.label.toLowerCase().includes(q) && !i.type.toLowerCase().includes(q)) && (
          <div className="py-8 text-center">
            <MIcon name="search_off" size={24} className="text-muted-foreground/15 mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground/40">No components match "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
