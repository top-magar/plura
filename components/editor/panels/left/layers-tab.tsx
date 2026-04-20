"use client";

import { useState } from "react";
import { MIcon } from "../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { El } from "../../core/types";
import { useEditor } from "../../core/provider";

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  __body:       { icon: "public",           color: "#6366f1", label: "Body" },
  container:    { icon: "check_box_outline_blank", color: "#8b5cf6", label: "Container" },
  section:      { icon: "view_agenda",      color: "#7c3aed", label: "Section" },
  row:          { icon: "view_column",       color: "#6d28d9", label: "Row" },
  column:       { icon: "view_stream",       color: "#5b21b6", label: "Column" },
  "2Col":       { icon: "view_column",       color: "#7c3aed", label: "2 Columns" },
  "3Col":       { icon: "view_column",       color: "#6d28d9", label: "3 Columns" },
  "4Col":       { icon: "view_column",       color: "#5b21b6", label: "4 Columns" },
  grid:         { icon: "grid_view",         color: "#5b21b6", label: "Grid" },
  header:       { icon: "web_asset",         color: "#7c3aed", label: "Header" },
  card:         { icon: "crop_portrait",     color: "#8b5cf6", label: "Card" },
  hero:         { icon: "featured_video",    color: "#6366f1", label: "Hero" },
  text:         { icon: "text_fields",       color: "#3b82f6", label: "Text" },
  heading:      { icon: "title",             color: "#3b82f6", label: "Heading" },
  subheading:   { icon: "text_format",       color: "#60a5fa", label: "Subheading" },
  link:         { icon: "link",              color: "#0ea5e9", label: "Link" },
  button:       { icon: "smart_button",      color: "#2563eb", label: "Button" },
  image:        { icon: "image",             color: "#22c55e", label: "Image" },
  video:        { icon: "videocam",          color: "#ef4444", label: "Video" },
  divider:      { icon: "horizontal_rule",   color: "#94a3b8", label: "Divider" },
  spacer:       { icon: "space_bar",         color: "#64748b", label: "Spacer" },
  quote:        { icon: "format_quote",      color: "#f59e0b", label: "Quote" },
  badge:        { icon: "verified",          color: "#eab308", label: "Badge" },
  icon:         { icon: "star",              color: "#ec4899", label: "Icon" },
  list:         { icon: "format_list_bulleted", color: "#06b6d4", label: "List" },
  code:         { icon: "code",              color: "#10b981", label: "Code" },
  accordion:    { icon: "expand_more",       color: "#f97316", label: "Accordion" },
  tabs:         { icon: "tab",               color: "#fb923c", label: "Tabs" },
  countdown:    { icon: "timer",             color: "#e11d48", label: "Countdown" },
  navbar:       { icon: "menu",              color: "#4f46e5", label: "Navbar" },
  footer:       { icon: "call_to_action",    color: "#475569", label: "Footer" },
  embed:        { icon: "code",              color: "#a855f7", label: "Embed" },
  socialIcons:  { icon: "share",             color: "#14b8a6", label: "Social" },
  map:          { icon: "location_on",       color: "#16a34a", label: "Map" },
  gallery:      { icon: "photo_library",     color: "#84cc16", label: "Gallery" },
  contactForm:  { icon: "contact_mail",      color: "#0891b2", label: "Form" },
  paymentForm:  { icon: "credit_card",       color: "#d97706", label: "Payment" },
};

const fallback = { icon: "widgets", color: "#64748b", label: "Element" };

function matchesChild(el: El, filter: string): boolean {
  if (!filter) return true;
  const lf = filter.toLowerCase();
  if (el.name.toLowerCase().includes(lf) || el.type.toLowerCase().includes(lf)) return true;
  if (Array.isArray(el.content)) return el.content.some((c) => matchesChild(c, filter));
  return false;
}

function LayerNode({ el, depth, filter }: { el: El; depth: number; filter: string }) {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const children = Array.isArray(el.content) ? el.content : [];
  const hasChildren = children.length > 0;
  const matchesFilter = !filter || el.name.toLowerCase().includes(filter.toLowerCase()) || el.type.toLowerCase().includes(filter.toLowerCase());
  const childrenMatch = children.some((c) => matchesChild(c, filter));
  const [expanded, setExpanded] = useState(depth < 2 || !!filter);
  const isSel = selected?.id === el.id;
  const config = typeConfig[el.type] || fallback;
  const iconName = config.icon;

  if (filter && !matchesFilter && !childrenMatch) return null;

  return (
    <div>
      <button
        onClick={() => dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: el } })}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-sm px-1 py-0.5 text-xs hover:bg-sidebar-accent",
          isSel && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: depth * 14 + 4 }}
      >
        {hasChildren ? (
          <span onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="flex size-4 shrink-0 items-center justify-center">
            {expanded ? <MIcon name="expand_more" size={12} /> : <MIcon name="chevron_right" size={12} />}
          </span>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <span style={{ color: config.color }} className="flex shrink-0"><MIcon name={iconName} size={12} /></span>
        <span className="truncate">{el.name}</span>
        {hasChildren && <span className="ml-auto shrink-0 text-[9px] text-muted-foreground">{children.length}</span>}
      </button>
      {expanded && children.map((c) => <LayerNode key={c.id} el={c} depth={depth + 1} filter={filter} />)}
    </div>
  );
}

export default function LayersTab() {
  const { state } = useEditor();
  const [search, setSearch] = useState("");
  const body = state.editor.elements[0];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="p-2 pb-1">
        <div className="relative">
          <MIcon name="search" size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search layers..."
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {body && <LayerNode el={body} depth={0} filter={search} />}
      </div>
    </div>
  );
}
