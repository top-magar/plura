"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

export default function IconElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      <span>{c.innerText || "★"}</span>
    </ElementWrapper>
  );
}
