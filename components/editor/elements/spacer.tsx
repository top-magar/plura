"use client";

import type { ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function SpacerElement({ element }: { element: El }): ReactNode {
  const { state } = useEditor();
  return (
    <ElementWrapper element={element} style={element.styles}>
      {!state.editor.preview && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 10, color: "var(--ed-text-placeholder)" }}>spacer</div>}
    </ElementWrapper>
  );
}
