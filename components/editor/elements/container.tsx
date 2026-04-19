"use client";

import { useRef, type ReactNode } from "react";
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

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DROP_TARGET", payload: { id: element.id } });
  }

  function handleDragLeave(e: React.DragEvent) {
    e.stopPropagation();
    if (dropTarget === element.id) dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });

    const type = e.dataTransfer.getData("componentType");
    const moveId = e.dataTransfer.getData("moveElementId");

    if (type) {
      const newEl = makeEl(type);
      if (newEl) dispatch({ type: "ADD_ELEMENT", payload: { containerId: element.id, element: newEl } });
    } else if (moveId && moveId !== element.id) {
      dispatch({ type: "MOVE_ELEMENT", payload: { elId: moveId, targetContainerId: element.id } });
    }
  }

  const isActive = dropTarget === element.id;

  return (
    <ElementWrapper element={element} style={element.styles} isContainer>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="contents"
      >
        {children.map((child) => (
          <Recursive key={child.id} element={child} />
        ))}
        {isEmpty && !preview && (
          <div className={cn(
            "flex items-center justify-center border border-dashed text-xs text-muted-foreground transition-colors",
            isBody ? "min-h-[calc(100vh-48px)] border-border/40" : "min-h-[48px] border-border",
            isActive && "border-primary text-primary bg-primary/[0.04]"
          )}>
            {isBody ? "Drag a component here to start building" : "Drop here"}
          </div>
        )}
      </div>
    </ElementWrapper>
  );
}
