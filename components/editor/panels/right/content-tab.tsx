"use client";

import { MIcon } from "../../ui/m-icon";
import { Field } from "./shared";
import type { El } from "../../core/types";

export default function ContentTab({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  if (!Array.isArray(selected.content) && Object.keys(selected.content as Record<string, string>).length > 0) {
    return (
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {Object.entries(selected.content as Record<string, string>).map(([key, val]) => {
            const setVal = (v: string) => onUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: v } });
            if (key === "innerText") return (
              <div key={key}>
                <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">Text</label>
                <textarea value={val} onChange={(e) => setVal(e.target.value)} className="w-full rounded border border-sidebar-border bg-transparent p-2 text-xs outline-none resize-y focus:border-primary min-h-[48px]" rows={3} />
              </div>
            );
            if (key === "src") return (
              <div key={key}>
                <Field label="Source" value={val} onChange={setVal} placeholder="https://..." />
                {val && <img src={val} alt="" className="mt-1 rounded border border-sidebar-border max-h-16 w-full object-cover" />}
              </div>
            );
            return <Field key={key} label={key} value={val} onChange={setVal} />;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <MIcon name={Array.isArray(selected.content) ? "dashboard_customize" : "block"} size={24} className="text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-[10px] text-muted-foreground/50">
          {Array.isArray(selected.content) ? `Container — ${(selected.content as El[]).length} children` : "No editable content"}
        </p>
      </div>
    </div>
  );
}
