"use client";

import { useState, useRef, type ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import { makeEl } from "../element-factory";
import { cn } from "@/lib/utils";
import type { El } from "../types";
import Recursive from "../recursive";

export default function ContainerElement({ element }: { element: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview, dropTarget } = state.editor;
  const children = Array.isArray(element.content) ? element.content : [];
  const isEmpty = children.length === 0;
  const isBody = element.type === "__body";
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function getDropIndex(e: React.DragEvent) {
    if (!containerRef.current) return children.length;
    const childEls = Array.from(containerRef.current.children).filter(
      (el) => !(el as HTMLElement).dataset.dropIndicator
    );
    for (let i = 0; i < childEls.length; i++) {
      const rect = childEls[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const midX = rect.left + rect.width / 2;
      // Check if flex-direction is row
      const style = element.styles;
      const isRow = style.flexDirection === "row" || style.flexDirection === "row-reverse" || style.display === "grid";
      if (isRow ? e.clientX < midX : e.clientY < midY) return i;
    }
    return children.length;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DROP_TARGET", payload: { id: element.id } });
    setDropIndex(getDropIndex(e));
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the container itself
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setDropIndex(null);
      if (dropTarget === element.id) dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const idx = dropIndex ?? children.length;
    setDropIndex(null);
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

  const isRow = element.styles.flexDirection === "row" || element.styles.flexDirection === "row-reverse" || element.styles.display === "grid";
  const indicatorCls = isRow
    ? "w-0.5 self-stretch bg-primary rounded-full shrink-0"
    : "h-0.5 w-full bg-primary rounded-full shrink-0";

  return (
    <ElementWrapper element={element} style={element.styles} isContainer>
      <div
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ display: "contents" }}
      >
        {children.map((child, i) => (
          <DropSlot key={child.id} index={i} dropIndex={dropIndex} indicatorCls={indicatorCls}>
            <Recursive element={child} />
          </DropSlot>
        ))}
        {/* Indicator after last child */}
        {dropIndex === children.length && dropIndex > 0 && (
          <div data-drop-indicator className={indicatorCls} />
        )}
        {isEmpty && !preview && (
          <div className={cn(
            "flex items-center justify-center border border-dashed border-border text-xs text-muted-foreground transition-colors",
            isBody ? "min-h-[calc(100vh-48px)]" : "min-h-[48px]",
            dropTarget === element.id && "border-primary text-primary bg-primary/[0.04]"
          )}>
            {isBody ? "Drag a component here to start building" : "Drop here"}
          </div>
        )}
      </div>
    </ElementWrapper>
  );
}

function DropSlot({ index, dropIndex, indicatorCls, children }: { index: number; dropIndex: number | null; indicatorCls: string; children: ReactNode }) {
  return (
    <>
      {dropIndex === index && <div data-drop-indicator className={indicatorCls} />}
      {children}
    </>
  );
}
