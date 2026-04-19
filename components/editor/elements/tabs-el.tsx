"use client";

import { useState, type ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

function TabsDisplay({ items }: { items: { title: string; body: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex border-b border-border">
        {items.map((item, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setActive(i); }} className={`bg-transparent border-0 border-b-2 px-4 py-2 text-[13px] font-medium cursor-pointer ${active === i ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {item.title}
          </button>
        ))}
      </div>
      <div className="p-4 text-sm">{items[active]?.body}</div>
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
