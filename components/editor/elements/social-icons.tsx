"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function SocialIconsElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      {(c.platforms || "").split(",").map((p, i) => <span key={i} style={{ opacity: 0.6 }}>{p.trim()}</span>)}
    </ElementWrapper>
  );
}
