"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function DividerElement({ element }: { element: El }): ReactNode {
  return (
    <ElementWrapper element={element} style={element.styles}>
      <hr style={{ border: "none", borderTop: "inherit" }} />
    </ElementWrapper>
  );
}
