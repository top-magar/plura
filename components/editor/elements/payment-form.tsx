"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

export default function PaymentFormElement({ element }: { element: El }): ReactNode {
  return (
    <ElementWrapper element={element} style={element.styles}>
      <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, textAlign: "center", fontSize: 13 }} className="text-muted-foreground">
        <div style={{ height: 40, borderRadius: 6, marginBottom: 8 }} className="bg-muted" />
        <button className="h-10 w-full border-0 bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90">Pay Now</button>
        <p style={{ marginTop: 8, fontSize: 10 }} className="text-muted-foreground/60">Powered by Stripe</p>
      </div>
    </ElementWrapper>
  );
}
