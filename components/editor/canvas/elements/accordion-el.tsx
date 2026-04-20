"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

export default function AccordionElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
  return (
    <ElementWrapper element={element} style={element.styles}>
      {items.map((item, i) => (
        <details key={i} className="border-b border-border py-3">
          <summary className="cursor-pointer text-sm font-medium">{item.title}</summary>
          <p className="mt-2 text-xs text-muted-foreground">{item.body}</p>
        </details>
      ))}
    </ElementWrapper>
  );
}
