"use client";

import type { ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function VideoElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  const { state } = useEditor();
  return (
    <ElementWrapper element={element} style={element.styles}>
      <iframe src={c.src} className="aspect-video w-full border-0" style={!state.editor.preview ? { pointerEvents: "none" } : undefined} allowFullScreen />
    </ElementWrapper>
  );
}
