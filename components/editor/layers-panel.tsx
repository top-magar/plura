"use client";

import { ChevronRight } from "lucide-react";
import type { El } from "./types";

export function LayerTree({ el, depth, selected, onSelect }: { el: El; depth: number; selected: El | null; onSelect: (el: El) => void }) {
  const children = Array.isArray(el.content) ? el.content : [];
  const isSel = selected?.id === el.id;
  return (
    <div>
      <button onClick={() => onSelect(el)} className={`editor-layer-btn ${isSel ? "active" : ""}`} style={{ paddingLeft: depth * 12 + 6 }}>
        {children.length > 0 && <ChevronRight size={10} />}
        {el.name}
      </button>
      {children.map((c) => <LayerTree key={c.id} el={c} depth={depth + 1} selected={selected} onSelect={onSelect} />)}
    </div>
  );
}
