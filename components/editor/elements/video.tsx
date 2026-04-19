"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function VideoElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0 }} allowFullScreen />
    </ElementWrapper>
  );
}
