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
        className="block w-full min-h-[200px]"
        style={{ border: 0, height: element.styles.height || "300px", pointerEvents: state.editor.preview ? "auto" : "none" }}
      />
    </ElementWrapper>
  );
}
