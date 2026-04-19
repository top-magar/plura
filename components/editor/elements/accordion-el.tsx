"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function AccordionElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
  return (
    <ElementWrapper element={element} style={element.styles}>
      {items.map((item, i) => (
        <details key={i} style={{ borderBottom: "1px solid var(--ed-border-subtle)", padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500, fontSize: 14 }}>{item.title}</summary>
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{item.body}</p>
        </details>
      ))}
    </ElementWrapper>
  );
}
