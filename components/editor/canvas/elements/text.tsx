"use client";

import { useState, type ReactNode } from "react";
import { useEditor } from "../../core/provider";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

export default function TextElement({ element }: { element: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview } = state.editor;
  const c = element.content as Record<string, string>;
  const isSel = state.editor.selected?.id === element.id;
  const [editing, setEditing] = useState(false);

  return (
    <ElementWrapper element={element} style={element.styles}>
      {editing && isSel && !preview ? (
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...element, content: { ...c, innerText: (e.target as HTMLElement).innerText } } } });
            setEditing(false);
          }}
          onKeyDown={(e) => { if (e.key === "Escape") { setEditing(false); e.stopPropagation(); } }}
          style={{ outline: "none", display: "block", minHeight: 20 }}
          autoFocus
        >
          {c.innerText || ""}
        </span>
      ) : (
        <span onDoubleClick={(e) => { if (!preview) { e.stopPropagation(); setEditing(true); } }}>
          {c.innerText || "Text"}
        </span>
      )}
    </ElementWrapper>
  );
}
