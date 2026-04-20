"use client";

import { useState, useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import { makeElInContext } from "../element-factory";
import { cn } from "@/lib/utils";
import type { El } from "../types";
import { resolveStyles } from "../types";
import Recursive from "../recursive";

/** Draggable diamond handle between flex children to adjust gap */
function GapHandle({ element, isRow, dispatch }: { element: El; isRow: boolean; dispatch: ReturnType<typeof useEditor>['dispatch'] }) {
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const start = isRow ? e.clientX : e.clientY;
    const startGap = parseInt(String(element.styles.gap ?? '0')) || 0;
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      const delta = (isRow ? ev.clientX : ev.clientY) - start;
      const val = Math.max(0, Math.round((startGap + delta) / 4) * 4);
      dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, styles: { ...element.styles, gap: `${val}px` } } } });
    };
    const onUp = () => {
      setDragging(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center z-10 shrink-0",
        isRow ? "cursor-ew-resize self-stretch w-0 relative" : "cursor-ns-resize w-full h-0 relative"
      )}
      onPointerDown={onPointerDown}
    >
      <div className={cn(
        "absolute rounded-sm transition-colors",
        dragging ? "bg-pink-500" : "bg-pink-500/0 hover:bg-pink-500/80",
        isRow ? "w-1.5 h-4" : "h-1.5 w-4"
      )} />
    </div>
  );
}

/** Split styles: layout props go to wrapRef, visual props go to ElementWrapper */
function splitStyles(styles: CSSProperties) {
  const { display, flexDirection, gap, flexWrap, alignItems, justifyContent, gridTemplateColumns, gridTemplateRows, ...visual } = styles as Record<string, unknown>;
  const layout = { display, flexDirection, gap, flexWrap, alignItems, justifyContent, gridTemplateColumns, gridTemplateRows } as CSSProperties;
  return { layout, visual: visual as CSSProperties };
}

export default function ContainerElement({ element }: { element: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview, dropTarget, device } = state.editor;
  const isSel = state.editor.selected?.id === element.id;
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
      "shrink-0 rounded-full bg-primary transition-all",
      isRow ? "w-0.5 self-stretch min-h-[20px]" : "h-0.5 w-full"
    )} />
  );

  return (
    <ElementWrapper element={element} style={visual} isContainer>
      <div
        ref={wrapRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "min-h-[40px] flex-1",
          isActive && !isEmpty && "bg-primary/[0.03] rounded"
        )}
        style={layout}
      >
        {children.map((child, i) => (
          <div key={child.id} data-el-id={child.id} className="min-w-0 break-words">
            {isActive && dropIdx === i && indicator}
            <Recursive element={child} />
            {isSel && !preview && i < children.length - 1 && (
              <GapHandle element={element} isRow={isRow} dispatch={dispatch} />
            )}
          </div>
        ))}
        {isActive && dropIdx === children.length && !isEmpty && indicator}
        {isEmpty && !preview && (
          <div className={cn(
            "flex items-center justify-center border-2 border-dashed rounded-md text-xs transition-all flex-1",
            isBody ? "min-h-[calc(100vh-56px)]" : "min-h-[48px] min-w-[48px]",
            isActive
              ? "border-primary/50 text-primary bg-primary/[0.04]"
              : "border-border/40 text-muted-foreground/50"
          )}>
            {isBody ? "Drag a component here to start" : "Drop here"}
          </div>
        )}
      </div>
    </ElementWrapper>
  );
}
