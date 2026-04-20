"use client";

import type { ReactNode } from "react";
import { MIcon } from "../ui/m-icon";
import ElementWrapper from "./element-wrapper";
import type { El } from "../core/types";

export default function ImageElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      {c.src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={c.src} alt={element.name} className="block w-full" />
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-2 bg-muted/50 py-12 text-muted-foreground">
          <MIcon name="image" size={24} />
          <span className="text-xs">Add image</span>
        </div>
      )}
    </ElementWrapper>
  );
}
