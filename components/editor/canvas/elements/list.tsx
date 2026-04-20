"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

export default function ListElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  const items = (c.innerText || "").split("\n").filter(Boolean);
  return (
    <ElementWrapper element={element} style={{ ...element.styles, listStyleType: "disc" }}>
      <ul style={{ margin: 0, paddingLeft: "inherit" }}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </ElementWrapper>
  );
}
