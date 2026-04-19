"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function ImageElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.src || "https://placehold.co/600x300/111/333?text=Image"} alt={element.name} style={{ width: "100%", display: "block" }} />
    </ElementWrapper>
  );
}
