"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { useEditor } from "../../core/provider";
import { MIcon } from "../../ui/m-icon";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

function RichToolbar() {
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); };
  return (
    <div className="absolute -top-14 left-0 z-40 flex items-center gap-px rounded-md bg-popover border border-border shadow-lg text-[10px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <button className="flex size-7 items-center justify-center hover:bg-muted transition-colors" onClick={() => exec("bold")} title="Bold (Cmd+B)"><MIcon name="format_bold" size={15} /></button>
      <button className="flex size-7 items-center justify-center hover:bg-muted transition-colors" onClick={() => exec("italic")} title="Italic (Cmd+I)"><MIcon name="format_italic" size={15} /></button>
      <button className="flex size-7 items-center justify-center hover:bg-muted transition-colors" onClick={() => exec("underline")} title="Underline (Cmd+U)"><MIcon name="format_underlined" size={15} /></button>
      <button className="flex size-7 items-center justify-center hover:bg-muted transition-colors" onClick={() => exec("strikeThrough")} title="Strikethrough"><MIcon name="format_strikethrough" size={15} /></button>
      <span className="w-px h-4 bg-border" />
      <button className="flex size-7 items-center justify-center hover:bg-muted transition-colors" onClick={() => { const url = prompt("URL:"); if (url) exec("createLink", url); }} title="Link"><MIcon name="link" size={15} /></button>
      <button className="flex size-7 items-center justify-center hover:bg-muted transition-colors" onClick={() => exec("unlink")} title="Remove link"><MIcon name="link_off" size={15} /></button>
      <span className="w-px h-4 bg-border" />
      <button className="flex size-7 items-center justify-center hover:bg-muted transition-colors" onClick={() => exec("removeFormat")} title="Clear formatting"><MIcon name="format_clear" size={15} /></button>
    </div>
  );
}

export default function TextElement({ element }: { element: El }): ReactNode {
  const { state, dispatch } = useEditor();
  const { preview } = state.editor;
  const c = element.content as Record<string, string>;
  const isSel = state.editor.selected?.id === element.id;
  const [editing, setEditing] = useState(false);
  const editRef = useRef<HTMLSpanElement>(null);

  const saveContent = useCallback(() => {
    if (!editRef.current) return;
    dispatch({ type: "UPDATE_ELEMENT", payload: { element: { ...element, content: { ...c, innerText: editRef.current.innerHTML } } } });
    setEditing(false);
  }, [element, c, dispatch]);

  return (
    <ElementWrapper element={element} style={element.styles}>
      {editing && isSel && !preview ? (
        <div className="relative">
          <RichToolbar />
          <span
            ref={editRef}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: c.innerText || "" }}
            onBlur={saveContent}
            onKeyDown={(e) => { if (e.key === "Escape") { saveContent(); e.stopPropagation(); } }}
            style={{ outline: "none", display: "block", minHeight: 20 }}
          />
        </div>
      ) : (
        <span
          dangerouslySetInnerHTML={{ __html: c.innerText || "Text" }}
          onDoubleClick={(e) => { if (!preview) { e.stopPropagation(); setEditing(true); } }}
        />
      )}
    </ElementWrapper>
  );
}
