"use client";

import type { ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

const inputCls = "h-8 w-full rounded border border-border bg-muted px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground";

export default function PaymentFormElement({ element }: { element: El }): ReactNode {
  return (
    <ElementWrapper element={element} style={element.styles}>
      <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
        <input placeholder="1234 5678 9012 3456" className={inputCls} />
        <div className="flex gap-2">
          <input placeholder="MM / YY" className={inputCls} />
          <input placeholder="CVC" className={inputCls} />
        </div>
        <button className="mt-1 h-10 w-full rounded border-0 bg-primary text-[13px] font-medium text-primary-foreground hover:opacity-90">Pay Now</button>
        <p className="text-center text-[10px] text-muted-foreground/60">Powered by Stripe</p>
      </div>
    </ElementWrapper>
  );
}
