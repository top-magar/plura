"use client";

import type { ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import { makeEl } from "../element-factory";
import { cn } from "@/lib/utils";
import type { El } from "../types";
import Recursive from "../recursive";

export default function ContainerElement({ element }: { element: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview } = state.editor;
  const { dropTarget } = state.editor;
  const children = Array.isArray(element.content) ? element.content : [];
  const isEmpty = children.length === 0;
  const isBody = element.type === "__body";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dispatch({ type: "SET_DROP_TARGET", payload: { id: null } });
    const type = e.dataTransfer.getData("componentType");
    const moveId = e.dataTransfer.getData("moveElementId");
    if (type) { const newEl = makeEl(type); if (newEl) dispatch({ type: "ADD_ELEMENT", payload: { containerId: element.id, element: newEl } }); }
    else if (moveId) dispatch({ type: "MOVE_ELEMENT", payload: { elId: moveId, targetContainerId: element.id } });
  };

  return (
    <ElementWrapper element={element} style={element.styles} isContainer>
      <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} style={{ display: "contents" }}>
        {children.map((child) => <Recursive key={child.id} element={child} />)}
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
