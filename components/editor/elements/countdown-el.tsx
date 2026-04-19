"use client";

import { useState, type ReactNode } from "react";
import ElementWrapper from "../element-wrapper";
import type { El } from "../types";

function CountdownDisplay({ content }: { content: Record<string, string> }) {
  const [now, setNow] = useState(Date.now());
  const target = new Date(content.targetDate || Date.now()).getTime();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); });
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const units = [["Days", d], ["Hours", h], ["Min", m], ["Sec", s]] as const;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
      {units.map(([label, val]) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "inherit", fontWeight: "inherit" }}>{String(val).padStart(2, "0")}</div>
          <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>{label}</div>
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
