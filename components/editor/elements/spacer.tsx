"use client";

import type { ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function SpacerElement({ element }: { element: El }): ReactNode {
  const { state } = useEditor();
  return (
    <ElementWrapper element={element} style={element.styles}>
      {!state.editor.preview && <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground/30">spacer</div>}
    </ElementWrapper>
  );
}
