"use client";

import type { ReactNode } from "react";
import type { El } from "../core/types";
import { isContainer, getDef } from "../core/registry";
import ContainerElement from "./container";

export default function Recursive({ element }: { element: El }): ReactNode {
  if (isContainer(element.type)) return <ContainerElement element={element} />;

  const def = getDef(element.type);
  if (def?.render) {
    const Render = def.render;
    return <Render element={element} />;
  }

  return null;
}
