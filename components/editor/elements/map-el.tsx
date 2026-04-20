"use client";

import type { ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function MapElement({ element }: { element: El }): ReactNode {
  const { state } = useEditor();
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      <iframe
        src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address || "New York")}&z=${c.zoom || "13"}&output=embed`}
        style={{ width: "100%", height: "100%", border: 0, pointerEvents: state.editor.preview ? "auto" : "none" }}
      />
    </ElementWrapper>
  );
}
