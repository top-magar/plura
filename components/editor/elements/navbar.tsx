"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function NavbarElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      <span style={{ fontWeight: 700, fontSize: 16 }}>{c.brand || "Brand"}</span>
      <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
        {(c.links || "").split(",").map((l, i) => <a key={i} href="#" style={{ opacity: 0.7 }}>{l.trim()}</a>)}
      </div>
    </ElementWrapper>
  );
}
