"use client";

import type { ReactNode } from "react";
import ElementWrapper from "./element-wrapper";
import type { El } from "../core/types";

export default function NavbarElement({ element }: { element: El }): ReactNode {
  const c = element.content as Record<string, string>;
  return (
    <ElementWrapper element={element} style={element.styles}>
      <div className="flex w-full items-center justify-between">
        <span className="text-base font-bold">{c.brand || "Brand"}</span>
        <div className="flex gap-4 text-sm">
          {(c.links || "").split(",").filter(Boolean).map((l, i) => <a key={i} href="#" className="opacity-70 hover:opacity-100">{l.trim()}</a>)}
        </div>
      </div>
    </ElementWrapper>
  );
}
