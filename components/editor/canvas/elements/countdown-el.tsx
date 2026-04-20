"use client";

import { useState, useEffect, type ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../../core/types";

function CountdownDisplay({ content }: { content: Record<string, string> }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(content.targetDate || Date.now()).getTime();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const units = [["Days", d], ["Hours", h], ["Min", m], ["Sec", s]] as const;
  return (
    <div className="flex justify-center gap-4">
      {units.map(([label, val]) => (
        <div key={label} className="text-center">
          <div className="text-[inherit] font-[inherit]">{String(val).padStart(2, "0")}</div>
          <div className="mt-1 text-[10px] opacity-50">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function CountdownElement({ element }: { element: El }): ReactNode {
  return (
    <ElementWrapper element={element} style={element.styles}>
      <CountdownDisplay content={element.content as Record<string, string>} />
    </ElementWrapper>
  );
}
