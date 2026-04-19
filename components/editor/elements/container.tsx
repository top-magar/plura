"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import { makeEl } from "../element-factory";
import { cn } from "@/lib/utils";
import type { El } from "../types";
import { resolveStyles } from "../types";
import Recursive from "../recursive";

export default function ContainerElement({ element }: { element: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview, dropTarget, device } = state.editor;
  const resolved = resolveStyles(element, device);
  const children = Array.isArray(element.content) ? element.content : [];
  const isEmpty = children.length === 0;
  const isBody = element.type === "__body";
  const isActive = dropTarget === element.id;
  const [dropIdx, setDropIdx] = useState<number>(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isRow = resolved.flexDirection === "row" || resolved.flexDirection === "row-reverse";

  const calcDropIdx = useCallback((e: React.DragEvent) => {
    if (!wrapRef.current) return children.length;
    const els = wrapRef.current.querySelectorAll(":scope > [data-el-id]");
    for (let i = 0; i < els.length; i++) {
      const rect = els[i].getBoundingClientRect();
      if (isRow ? e.clientX < rect.left + rect.width / 2 : e.clientY < rect.top + rect.height / 2) return i;
    }
    return children.length;
  }, [children.length, isRow]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (dropTarget !== element.id) dispatch({ type: "SET_DROP_TARGET", payload: { id: element.id } });
    setDropIdx(calcDropIdx(e));
  }

  function handleDragLeave(e: React.DragEvent) {
    e.stopPropagation();
    // Only clear when actually leaving this container
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
      const newEl = makeEl(type);
      if (newEl) dispatch({ type: "ADD_ELEMENT", payload: { containerId: element.id, element: newEl, index: idx } });
    } else if (moveId && moveId !== element.id) {
      dispatch({ type: "MOVE_ELEMENT", payload: { elId: moveId, targetContainerId: element.id, index: idx } });
    }
  }

  const indicator = (
    <div className={cn(
      "shrink-0 rounded-full bg-primary transition-all",
      isRow ? "w-0.5 self-stretch min-h-[20px]" : "h-0.5 w-full"
    )} />
  );

  return (
    <ElementWrapper element={element} style={element.styles} isContainer>
      <div
        ref={wrapRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "min-h-[40px] transition-colors",
          isActive && !isEmpty && "bg-primary/[0.02]"
        )}
      >
        {children.map((child, i) => (
          <div key={child.id} data-el-id={child.id}>
            {isActive && dropIdx === i && indicator}
            <Recursive element={child} />
          </div>
        ))}
        {isActive && dropIdx === children.length && !isEmpty && indicator}
        {isEmpty && !preview && (
          <div className={cn(
            "flex items-center justify-center border-2 border-dashed rounded-md text-xs transition-all",
            isBody ? "min-h-[calc(100vh-56px)]" : "min-h-[48px]",
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
