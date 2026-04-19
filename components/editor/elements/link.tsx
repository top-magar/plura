"use client";

import type { ReactNode } from "react";
import { useEditor } from "../editor-provider";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function LinkElement({ element }: { element: El }): ReactNode {
  const { state } = useEditor();
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      <a href={state.editor.preview ? c.href : undefined} style={{ color: "inherit" }}>{c.innerText || "Link"}</a>
    </ElementWrapper>
  );
}
