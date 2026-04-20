"use client";

import type { ReactNode } from "react";
import { useEditor } from "../core/provider";
import ElementWrapper from "./element-wrapper";
import type { El } from "../core/types";

export default function TextElement({ element }: { element: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview } = state.editor;
  const c = element.content as Record<string, string>;
  const isSel = state.editor.selected?.id === element.id;

  return (
    <ElementWrapper element={element} style={element.styles}>
      {isSel && !preview ? (
        <span contentEditable suppressContentEditableWarning onBlur={(e) => dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...element, content: { ...c, innerText: (e.target as HTMLElement).innerText } } } })} style={{ outline: "none", display: "block", minHeight: 20 }}>
          {c.innerText || ""}
        </span>
      ) : (
        <span>{c.innerText || "Text"}</span>
      )}
    </ElementWrapper>
  );
}
