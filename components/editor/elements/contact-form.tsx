"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function ContactFormElement({ element }: { element: El }): ReactNode {
  return (
    <ElementWrapper element={element} style={element.styles}>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="Name" className="h-8 w-full border-0 border-b border-border bg-muted px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-b-primary" />
        <input placeholder="Email" className="h-8 w-full border-0 border-b border-border bg-muted px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-b-primary" />
        <button className="h-10 w-full border-0 bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90">Submit</button>
      </form>
    </ElementWrapper>
  );
}
