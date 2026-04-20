"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { v4 } from "uuid";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import { makeElInContext } from "../element-factory";
import { cn } from "@/lib/utils";
import type { El } from "../types";
import { resolveStyles } from "../types";
import Recursive from "../recursive";

type DropInfo = { index: number; side: null | "left" | "right"; siblingId?: string };

export default function ContainerElement({ element }: { element: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview, dropTarget, device } = state.editor;
  const resolved = resolveStyles(element, device);
  const children = Array.isArray(element.content) ? element.content : [];
  const isEmpty = children.length === 0;
  const isBody = element.type === "__body";
  const isActive = dropTarget === element.id;
  const [drop, setDrop] = useState<DropInfo>({ index: -1, side: null });
  const wrapRef = useRef<HTMLDivElement>(null);

  const isRow = resolved.flexDirection === "row" || resolved.flexDirection === "row-reverse";

  const calcDrop = useCallback((e: React.DragEvent): DropInfo => {
    if (!wrapRef.current) return { index: children.length, side: null };
    const els = wrapRef.current.querySelectorAll(":scope > [data-el-id]");

    for (let i = 0; i < els.length; i++) {
      const rect = els[i].getBoundingClientRect();

      if (isRow) {
        // Row: left/right of midpoint = before/after
        if (e.clientX < rect.left + rect.width / 2) return { index: i, side: null };
      } else {
        // Column: check if cursor is on left/right edge first
        const inVerticalRange = e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (inVerticalRange) {
          const edgeZone = Math.max(rect.width * 0.35, 40); // 35% or at least 40px
          if (e.clientX < rect.left + edgeZone) {
            return { index: i, side: "left" as const, siblingId: els[i].getAttribute("data-el-id") ?? undefined };
          }
          if (e.clientX > rect.right - edgeZone) {
            return { index: i, side: "right" as const, siblingId: els[i].getAttribute("data-el-id") ?? undefined };
          }
        }
        // Normal top/bottom
        if (e.clientY < rect.top + rect.height / 2) return { index: i, side: null };
      }
    }
    return { index: children.length, side: null };
  }, [children.length, isRow]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (dropTarget !== element.id) dispatch({ type: "SET_DROP_TARGET", payload: { id: element.id } });
    setDrop(calcDrop(e));
  }

  function handleDragLeave(e: React.DragEvent) {
    e.stopPropagation();
    const related = e.relatedTarget as Node | null;
    if (wrapRef.current && related && wrapRef.current.contains(related)) return;
    setDrop({ index: -1, side: null });
    if (dropTarget === element.id) dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const info = drop.index >= 0 ? drop : { index: children.length, side: null as DropInfo["side"] };
    setDrop({ index: -1, side: null });
    dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });

    const type = e.dataTransfer.getData("componentType");
    const moveId = e.dataTransfer.getData("moveElementId");

    // Determine the new element
    let newEl: El | null = null;
    if (type) {
      newEl = makeElInContext(type, element);
    }

    // Side drop: wrap sibling + new element in a Row
    if (info.side && info.siblingId && (newEl || moveId)) {
      const sibling = children.find((c) => c.id === info.siblingId);
      if (!sibling) return;

      const rowId = v4();
      const col1: El = { id: v4(), type: "column", name: "Col 1", styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [sibling] };
      const col2Content = newEl ?? children.find((c) => c.id === moveId);
      if (!col2Content) return;
      const col2: El = { id: v4(), type: "column", name: "Col 2", styles: { display: "flex", flexDirection: "column", gap: "8px", flex: "1", padding: "8px" }, content: [col2Content] };

      const row: El = {
        id: rowId, type: "row", name: "Row",
        styles: { display: "flex", flexDirection: "row", gap: "16px", width: "100%" },
        content: info.side === "left" ? [col2, col1] : [col1, col2],
      };

      // Remove the sibling from current position, insert row in its place
      if (moveId && moveId !== info.siblingId) {
        dispatch({ type: "DELETE_ELEMENT", payload: { id: moveId } });
      }
      dispatch({ type: "DELETE_ELEMENT", payload: { id: info.siblingId } });
      dispatch({ type: "ADD_ELEMENT", payload: { containerId: element.id, element: row, index: info.index } });
      return;
    }

    // Normal drop: above/below
    if (newEl) {
      dispatch({ type: "ADD_ELEMENT", payload: { containerId: element.id, element: newEl, index: info.index } });
    } else if (moveId && moveId !== element.id) {
      dispatch({ type: "MOVE_ELEMENT", payload: { elId: moveId, targetContainerId: element.id, index: info.index } });
    }
  }

  // Indicators
  const hIndicator = <div className="shrink-0 rounded-full bg-primary transition-all h-0.5 w-full" />;
  const vIndicator = <div className="absolute top-0 bottom-0 w-0.5 rounded-full bg-primary z-10" />;

  return (
    <ElementWrapper element={element} style={element.styles} isContainer>
      <div
        ref={wrapRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "min-h-[40px] transition-colors flex-1",
          isActive && !isEmpty && "bg-primary/[0.02]"
        )}
      >
        {children.map((child, i) => (
          <div key={child.id} data-el-id={child.id} className="relative">
            {isActive && drop.index === i && !drop.side && hIndicator}
            {isActive && drop.index === i && drop.side === "left" && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary z-10" />
            )}
            {isActive && drop.index === i && drop.side === "right" && (
              <div className="absolute right-0 top-0 bottom-0 w-0.5 rounded-full bg-primary z-10" />
            )}
            <Recursive element={child} />
          </div>
        ))}
        {isActive && drop.index === children.length && !drop.side && !isEmpty && hIndicator}
        {isEmpty && !preview && (
          <div className={cn(
            "flex items-center justify-center border-2 border-dashed rounded-md text-xs transition-all flex-1",
            isBody ? "min-h-[calc(100vh-56px)]" : "min-h-[48px] min-w-[48px]",
            isActive
              ? "border-primary/50 text-primary bg-primary/[0.04] scale-[1.01]"
              : "border-border/40 text-muted-foreground/50"
          )}>
            {isBody ? "Drag a component here to start" : "Drop here"}
          </div>
        )}
      </div>
    </ElementWrapper>
  );
}
