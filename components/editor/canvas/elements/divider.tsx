"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

export default function DividerElement({ element }: { element: El }): ReactNode {
  return (
    <ElementWrapper element={element} style={element.styles}>
      <hr className="border-t border-current" />
    </ElementWrapper>
  );
}
