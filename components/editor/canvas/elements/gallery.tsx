"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

export default function GalleryElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  const imgs = (c.images || "").split(",").filter(Boolean);
  return (
    <ElementWrapper element={element} style={element.styles}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {imgs.map((src, i) => <img key={i} src={src.trim()} alt={`Gallery ${i + 1}`} className="aspect-square w-full object-cover" />)}
    </ElementWrapper>
  );
}
