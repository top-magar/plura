"use client";

import type { ReactNode } from "react";
import { useEditor } from "../../core/provider";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

/** Strip script tags and on* event handlers from HTML */
function sanitize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*\S+/gi, '');
}

export default function EmbedElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  const { state } = useEditor();
  return (
    <ElementWrapper element={element} style={element.styles}>
      {state.editor.preview ? (
        <div dangerouslySetInnerHTML={{ __html: sanitize(c.code || "") }} />
      ) : (
        <div className="flex items-center justify-center bg-muted/50 py-8 text-xs text-muted-foreground">
          HTML Embed — edit in Content tab
        </div>
      )}
    </ElementWrapper>
  );
}
