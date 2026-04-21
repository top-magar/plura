"use client";

import { useState, useRef, useCallback } from "react";
import { MIcon } from "../../ui/m-icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { El } from "../../core/types";
import { useEditor } from "../../core/provider";
import { findParentId, findEl } from "../../core/tree-helpers";

const typeConfig: Record<string, { icon: string; color: string }> = {
  __body: { icon: "public", color: "#6366f1" }, container: { icon: "check_box_outline_blank", color: "#8b5cf6" },
  section: { icon: "view_agenda", color: "#7c3aed" }, row: { icon: "view_column", color: "#6d28d9" },
  column: { icon: "view_stream", color: "#5b21b6" }, "2Col": { icon: "view_column", color: "#7c3aed" },
  "3Col": { icon: "view_column", color: "#6d28d9" }, "4Col": { icon: "view_column", color: "#5b21b6" },
  grid: { icon: "grid_view", color: "#5b21b6" }, header: { icon: "web_asset", color: "#7c3aed" },
  card: { icon: "crop_portrait", color: "#8b5cf6" }, hero: { icon: "featured_video", color: "#6366f1" },
  text: { icon: "text_fields", color: "#3b82f6" }, heading: { icon: "title", color: "#3b82f6" },
  subheading: { icon: "text_format", color: "#60a5fa" }, link: { icon: "link", color: "#0ea5e9" },
  button: { icon: "smart_button", color: "#2563eb" }, image: { icon: "image", color: "#22c55e" },
  video: { icon: "videocam", color: "#ef4444" }, divider: { icon: "horizontal_rule", color: "#94a3b8" },
  spacer: { icon: "space_bar", color: "#64748b" }, quote: { icon: "format_quote", color: "#f59e0b" },
  badge: { icon: "verified", color: "#eab308" }, icon: { icon: "star", color: "#ec4899" },
  list: { icon: "format_list_bulleted", color: "#06b6d4" }, code: { icon: "code", color: "#10b981" },
  accordion: { icon: "expand_more", color: "#f97316" }, tabs: { icon: "tab", color: "#fb923c" },
  countdown: { icon: "timer", color: "#e11d48" }, navbar: { icon: "menu", color: "#4f46e5" },
  footer: { icon: "call_to_action", color: "#475569" }, embed: { icon: "code", color: "#a855f7" },
  socialIcons: { icon: "share", color: "#14b8a6" }, map: { icon: "location_on", color: "#16a34a" },
  gallery: { icon: "photo_library", color: "#84cc16" }, contactForm: { icon: "contact_mail", color: "#0891b2" },
  paymentForm: { icon: "credit_card", color: "#d97706" },
};

type DropPos = { targetId: string; position: 'before' | 'after' | 'inside' } | null;

function matchesChild(el: El, q: string): boolean {
  if (!q) return true;
  const lf = q.toLowerCase();
  if (el.name.toLowerCase().includes(lf) || el.type.toLowerCase().includes(lf)) return true;
  return Array.isArray(el.content) && el.content.some((c) => matchesChild(c, q));
}

function LayerNode({ el, depth, filter, dropPos, setDropPos, expandedMap, toggleExpanded }: {
  el: El; depth: number; filter: string;
  dropPos: DropPos; setDropPos: (p: DropPos) => void;
  expandedMap: Record<string, boolean>; toggleExpanded: (id: string) => void;
}) {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selected;
  const elements = state.editor.elements;
  const children = Array.isArray(el.content) ? el.content : [];
  const hasChildren = children.length > 0;
  const isContainer = Array.isArray(el.content);
  const isBody = el.type === '__body';
  const isSel = selected?.id === el.id;
  const config = typeConfig[el.type] || { icon: "widgets", color: "#64748b" };
  const rowRef = useRef<HTMLDivElement>(null);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const expanded = expandedMap[el.id] ?? (depth < 2 || !!filter);

  if (filter && !matchesChild(el, filter)) return null;

  const isDropBefore = dropPos?.targetId === el.id && dropPos.position === 'before';
  const isDropAfter = dropPos?.targetId === el.id && dropPos.position === 'after';
  const isDropInside = dropPos?.targetId === el.id && dropPos.position === 'inside';

  const onDragStart = (e: React.DragEvent) => {
    if (isBody) { e.preventDefault(); return; }
    e.dataTransfer.setData('layerDragId', el.id);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = (e.clientY - rect.top) / rect.height;

    if (isContainer && y > 0.25 && y < 0.75) {
      setDropPos({ targetId: el.id, position: 'inside' });
      // Auto-expand collapsed containers after 500ms hover
      if (!expanded) {
        clearTimeout(expandTimer.current);
        expandTimer.current = setTimeout(() => toggleExpanded(el.id), 500);
      }
    } else {
      clearTimeout(expandTimer.current);
      setDropPos({ targetId: el.id, position: y < 0.5 ? 'before' : 'after' });
    }
  };

  const onDragLeave = () => { clearTimeout(expandTimer.current); };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(expandTimer.current);
    const dragId = e.dataTransfer.getData('layerDragId');
    if (!dragId || dragId === el.id) { setDropPos(null); return; }

    if (dropPos?.position === 'inside') {
      dispatch({ type: 'MOVE_ELEMENT', payload: { elId: dragId, targetContainerId: el.id, index: 0 } });
    } else {
      const parentId = findParentId(elements, el.id);
      if (!parentId) { setDropPos(null); return; }
      const parent = findEl(elements, parentId);
      if (!parent || !Array.isArray(parent.content)) { setDropPos(null); return; }
      const idx = parent.content.findIndex((c: El) => c.id === el.id);
      dispatch({ type: 'MOVE_ELEMENT', payload: { elId: dragId, targetContainerId: parentId, index: dropPos?.position === 'after' ? idx + 1 : idx } });
    }
    dispatch({ type: 'COMMIT_HISTORY' });
    setDropPos(null);
  };

  const toggleVis = (e: React.MouseEvent) => { e.stopPropagation(); dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...el, hidden: !el.hidden } } }); };
  const toggleLock = (e: React.MouseEvent) => { e.stopPropagation(); dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...el, locked: !el.locked } } }); };

  return (
    <div onDragLeave={onDragLeave}>
      {isDropBefore && !isBody && <div className="h-0.5 bg-primary rounded-full" style={{ marginLeft: depth * 12 + 20 }} />}

      <div
        ref={rowRef}
        draggable={!isBody}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: el } })}
        className={cn(
          "group/layer flex w-full items-center gap-0.5 rounded px-0.5 h-6 text-[11px] transition-colors",
          isSel ? "bg-primary/10 text-primary" : "hover:bg-sidebar-accent/50",
          isDropInside && "ring-1 ring-primary/60 bg-primary/5 rounded",
          !isBody && "cursor-grab active:cursor-grabbing",
        )}
        style={{ paddingLeft: depth * 12 + 2 }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <span onClick={(e) => { e.stopPropagation(); toggleExpanded(el.id); }} className="flex size-4 shrink-0 items-center justify-center cursor-pointer rounded hover:bg-sidebar-accent">
            <MIcon name={expanded ? "expand_more" : "chevron_right"} size={11} className="text-muted-foreground/40" />
          </span>
        ) : <span className="size-4 shrink-0" />}

        {/* Type icon */}
        <span style={{ color: config.color }} className="flex shrink-0"><MIcon name={config.icon} size={12} /></span>

        {/* Name */}
        <span className={cn("truncate flex-1 ml-0.5", el.hidden && "opacity-30 line-through")}>{el.name}</span>

        {/* Inline actions — visible on hover */}
        {!isBody && (
          <span className="flex items-center gap-px opacity-0 group-hover/layer:opacity-100 transition-opacity shrink-0">
            <button onClick={toggleVis} className={cn("flex size-4 items-center justify-center rounded hover:bg-sidebar-accent", el.hidden ? "opacity-100 text-muted-foreground/40" : "text-muted-foreground/30")}>
              <MIcon name={el.hidden ? "visibility_off" : "visibility"} size={10} />
            </button>
            <button onClick={toggleLock} className={cn("flex size-4 items-center justify-center rounded hover:bg-sidebar-accent", el.locked ? "opacity-100 text-amber-500/70" : "text-muted-foreground/30")}>
              <MIcon name={el.locked ? "lock" : "lock_open"} size={10} />
            </button>
          </span>
        )}

        {/* Always-visible indicators */}
        {el.locked && <MIcon name="lock" size={9} className="text-amber-500/50 shrink-0 group-hover/layer:hidden" />}
        {hasChildren && <span className="text-[9px] text-muted-foreground/30 tabular-nums shrink-0 group-hover/layer:hidden">{children.length}</span>}
      </div>

      {isDropAfter && !isBody && <div className="h-0.5 bg-primary rounded-full" style={{ marginLeft: depth * 12 + 20 }} />}

      {expanded && children.map((c) => (
        <LayerNode key={c.id} el={c} depth={depth + 1} filter={filter} dropPos={dropPos} setDropPos={setDropPos} expandedMap={expandedMap} toggleExpanded={toggleExpanded} />
      ))}
    </div>
  );
}

export default function LayersTab() {
  const { state } = useEditor();
  const [search, setSearch] = useState("");
  const [dropPos, setDropPos] = useState<DropPos>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const body = state.editor.elements[0];

  const toggleExpanded = useCallback((id: string) => {
    setExpandedMap(m => ({ ...m, [id]: !(m[id] ?? true) }));
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-2 py-1.5">
        <div className="relative">
          <MIcon name="search" size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search layers..." className="h-7 pl-7 text-[11px]" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-0.5" onDragOver={(e) => e.preventDefault()} onDrop={() => setDropPos(null)}>
        {body && <LayerNode el={body} depth={0} filter={search} dropPos={dropPos} setDropPos={setDropPos} expandedMap={expandedMap} toggleExpanded={toggleExpanded} />}
      </div>
    </div>
  );
}
