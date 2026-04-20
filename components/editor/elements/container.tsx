"use client";

import { createContext, useContext, type ReactNode, type RefCallback } from "react";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import { cn } from "@/lib/utils";
import type { El } from "../types";
import { resolveStyles } from "../types";
import Recursive from "../recursive";

/** Context to pass sortable handleRef down to ElementWrapper's toolbar grip */
const HandleRefContext = createContext<RefCallback<Element> | null>(null);
export function useSortableHandle() { return useContext(HandleRefContext); }

function SortableChild({ element, index, group }: { element: El; index: number; group: string }) {
  const { ref, handleRef } = useSortable({
    id: element.id,
    index,
    group,
    type: "element",
    transition: { duration: 200, easing: "ease" },
    disabled: element.locked,
  });

  return (
    <HandleRefContext.Provider value={handleRef}>
      <div ref={ref} data-el-id={element.id}>
        <Recursive element={element} />
      </div>
    </HandleRefContext.Provider>
  );
}

export default function ContainerElement({ element }: { element: El }): ReactNode {
  const { state } = useEditor();
  const { preview, device } = state.editor;
  const resolved = resolveStyles(element, device);
  const children = Array.isArray(element.content) ? element.content : [];
  const isEmpty = children.length === 0;
  const isBody = element.type === "__body";

  const { ref: dropRef, isDropTarget } = useDroppable({ id: element.id });

  if (preview) {
    return (
      <ElementWrapper element={element} style={resolved}>
        <div>{children.map((child) => <Recursive key={child.id} element={child} />)}</div>
      </ElementWrapper>
    );
  }

  return (
    <ElementWrapper element={element} style={element.styles} isContainer>
      <div
        ref={dropRef}
        className={cn(
          "min-h-[40px] transition-colors",
          isDropTarget && !isEmpty && "bg-primary/[0.03] ring-1 ring-primary/20 rounded"
        )}
      >
        {children.map((child, i) => (
          <SortableChild key={child.id} element={child} index={i} group={element.id} />
        ))}
        {isEmpty && (
          <div className={cn(
            "flex items-center justify-center border-2 border-dashed rounded-md text-xs transition-all",
            isBody ? "min-h-[calc(100vh-56px)]" : "min-h-[48px]",
            isDropTarget
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
