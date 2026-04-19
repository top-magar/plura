"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function QuoteElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      <blockquote style={{ margin: 0 }}>{c.innerText || "Quote"}</blockquote>
    </ElementWrapper>
  );
}
