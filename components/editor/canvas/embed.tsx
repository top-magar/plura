"use client";

import type { ReactNode } from "react";
import { useEditor } from "../core/provider";
import ElementWrapper from "./element-wrapper";
import type { El } from "../core/types";

export default function EmbedElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  const { state } = useEditor();
  return (
    <ElementWrapper element={element} style={element.styles}>
      {state.editor.preview ? (
        <div dangerouslySetInnerHTML={{ __html: c.code || "" }} />
      ) : (
        <div className="flex items-center justify-center bg-muted/50 py-8 text-xs text-muted-foreground">
          HTML Embed — edit in Content tab
        </div>
      )}
    </ElementWrapper>
  );
}
