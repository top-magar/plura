"use client";

import React, { useState, useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { useEditor } from "../core/provider";
import { useDocumentStore } from "../core/document-store";
import { useEditorStore } from "../core/editor-store";
import ElementWrapper from "./element-wrapper";
import { makeElInContext } from "../core/registry";
import { cn } from "@/lib/utils";
import type { El } from "../core/types";
import { resolveStyles } from "../core/types";
import Recursive from "./recursive";

/** Split styles: layout props go to wrapRef, visual props go to ElementWrapper */
function splitStyles(styles: CSSProperties) {
  const { display, flexDirection, gap, flexWrap, alignItems, justifyContent, gridTemplateColumns, gridTemplateRows, ...visual } = styles as Record<string, unknown>;
  const layout = { display, flexDirection, gap, flexWrap, alignItems, justifyContent, gridTemplateColumns, gridTemplateRows } as CSSProperties;
  return { layout, visual: visual as CSSProperties };
}

export default function ContainerElement({ element }: { element: El }): ReactNode {
  const { dispatch } = useEditor();
  const preview = useEditorStore(s => s.preview);
  const dropTarget = useEditorStore(s => s.dropTarget);
  const device = useEditorStore(s => s.device);
  const isSel = useEditorStore(s => s.selected?.id === element.id);
  const resolved = resolveStyles(element, device);
  const { layout, visual } = splitStyles(resolved);
  const children = Array.isArray(element.content) ? element.content : [];
  const isEmpty = children.length === 0;
  const isBody = element.type === "__body";
  const isActive = dropTarget === element.id;
  const [dropIdx, setDropIdx] = useState<number>(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isRow = resolved.flexDirection === "row" || resolved.flexDirection === "row-reverse";

  const calcDropIdx = useCallback((e: React.DragEvent) => {
    if (!wrapRef.current) return children.length;
    const els = wrapRef.current.querySelectorAll(":scope > [data-el-id], :scope > [data-wrapper]");
    // Find closest edge between children
    let bestIdx = children.length;
    let bestDist = Infinity;
    for (let i = 0; i <= els.length; i++) {
      let edge: number;
      if (i === 0) {
        const r = els[0]?.getBoundingClientRect();
        edge = r ? (isRow ? r.left : r.top) : 0;
      } else if (i === els.length) {
        const r = els[els.length - 1]?.getBoundingClientRect();
        edge = r ? (isRow ? r.right : r.bottom) : 0;
      } else {
        const prev = els[i - 1].getBoundingClientRect();
        const next = els[i].getBoundingClientRect();
        edge = isRow ? (prev.right + next.left) / 2 : (prev.bottom + next.top) / 2;
      }
      const cursor = isRow ? e.clientX : e.clientY;
      const dist = Math.abs(cursor - edge);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
    return bestIdx;
  }, [children.length, isRow]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (dropTarget !== element.id) dispatch({ type: "SET_DROP_TARGET", payload: { id: element.id } });
    setDropIdx(calcDropIdx(e));
  }

  function handleDragLeave(e: React.DragEvent) {
    e.stopPropagation();
    const related = e.relatedTarget as Node | null;
    if (wrapRef.current && related && wrapRef.current.contains(related)) return;
    setDropIdx(-1);
    if (dropTarget === element.id) dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const idx = dropIdx >= 0 ? dropIdx : children.length;
    setDropIdx(-1);
    dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });

    const type = e.dataTransfer.getData("componentType");
    const moveId = e.dataTransfer.getData("moveElementId");

    if (type) {
      const newEl = makeElInContext(type, element);
      if (newEl) dispatch({ type: "ADD_ELEMENT", payload: { containerId: element.id, element: newEl, index: idx } });
    } else if (moveId && moveId !== element.id) {
      dispatch({ type: "MOVE_ELEMENT", payload: { elId: moveId, targetContainerId: element.id, index: idx } });
    }
  }

  const indicator = (
    <div className={cn(
      "shrink-0 rounded-full bg-primary/70 transition-opacity",
      isRow ? "w-0.5 self-stretch min-h-[20px]" : "h-0.5 w-full"
    )} />
  );

  return (
    <ElementWrapper element={element} style={visual} containerEl>
      <div
        ref={wrapRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "min-h-[40px]",
          isActive && !isEmpty && "bg-primary/[0.02]"
        )}
        style={isBody ? { ...layout, display: 'flex', flexDirection: 'column' as const, gap: layout.gap ?? 0 } : layout}
      >
        {children.map((child, i) => isBody ? (
          <React.Fragment key={child.id}>
            {isActive && dropIdx === i && indicator}
            <Recursive element={child} />
          </React.Fragment>
        ) : (
          <div key={child.id} data-el-id={child.id} className="min-w-0 relative break-words">
            {isActive && dropIdx === i && indicator}
            <Recursive element={child} />
          </div>
        ))}
        {isActive && dropIdx === children.length && !isEmpty && indicator}
        {isEmpty && !preview && (
          <div className={cn(
            "flex items-center justify-center border-2 border-dashed rounded-md text-xs transition-colors flex-1",
            isBody ? "min-h-[calc(100vh-56px)]" : "min-h-[48px] min-w-[48px]",
            isActive
              ? "border-primary/40 text-primary/70 bg-primary/[0.02]"
              : "border-border/30 text-muted-foreground/40"
          )}>
            {isBody ? "Drag a component here to start" : "Drop here"}
          </div>
        )}
      </div>
    </ElementWrapper>
  );
}
