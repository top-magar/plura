"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function SocialIconsElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      {(c.platforms || "").split(",").filter(Boolean).map((p, i) => (
        <span key={i} className="rounded-md bg-muted px-2 py-1 text-xs">{p.trim()}</span>
      ))}
    </ElementWrapper>
  );
}
