"use client";

import { useState, type ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

function TabsDisplay({ items }: { items: { title: string; body: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", borderBottom: "1px solid var(--ed-border-subtle)" }}>
        {items.map((item, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setActive(i); }} style={{ padding: "8px 16px", border: 0, borderBottom: active === i ? "2px solid var(--ed-interactive)" : "2px solid transparent", background: "transparent", color: active === i ? "var(--ed-interactive)" : "inherit", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {item.title}
          </button>
        ))}
      </div>
      <div style={{ padding: 16, fontSize: 14 }}>{items[active]?.body}</div>
    </div>
  );
}

export default function TabsElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
  return (
    <ElementWrapper element={element} style={element.styles}>
      <TabsDisplay items={items} />
    </ElementWrapper>
  );
}
