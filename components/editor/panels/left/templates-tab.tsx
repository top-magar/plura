"use client";

import { useState, useEffect } from "react";
import { MIcon } from "../../ui/m-icon";
import { toast } from "sonner";
import { savePageTemplate, getPageTemplates, deletePageTemplate } from "@/lib/queries";
import { useEditor } from "../../core/provider";

export default function TemplatesTab() {
  const { state, dispatch, agencyId } = useEditor();
  const elements = state.editor.elements;
  const [templates, setTemplates] = useState<{ id: string; name: string; content: string; category: string }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    getPageTemplates(agencyId)
      .then((t) => {
        setTemplates(t.map((x) => ({ id: x.id, name: x.name, content: x.content, category: x.category })));
        setLoaded(true);
      })
      .catch(() => {});
  }, [loaded, agencyId]);

  const handleSave = async () => {
    const name = prompt("Template name:");
    if (!name) return;
    await savePageTemplate({ name, content: JSON.stringify(elements), agencyId });
    setLoaded(false);
    toast.success("Template saved");
  };

  const handleLoad = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length) {
        dispatch({ type: "SET_ELEMENTS", payload: { elements: parsed } });
        dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element: null } });
        toast.success("Template loaded");
      }
    } catch { toast.error("Invalid template"); }
  };

  const handleDelete = async (id: string) => {
    await deletePageTemplate(id);
    setTemplates((t) => t.filter((x) => x.id !== id));
    toast.success("Template deleted");
  };

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <button
        onClick={handleSave}
        className="mb-2 flex w-full items-center justify-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 text-xs transition-colors hover:bg-sidebar-accent"
      >
        <MIcon name="bookmark" size={14} /> Save Current Page
      </button>
      {templates.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">No saved templates yet.</div>
      )}
      {templates.map((t) => (
        <div key={t.id} className="mb-1 flex items-center justify-between rounded-md border border-sidebar-border p-2">
          <button onClick={() => handleLoad(t.content)} className="flex-1 text-left">
            <div className="text-xs font-medium">{t.name}</div>
            <div className="text-[10px] text-muted-foreground">{t.category}</div>
          </button>
          <button onClick={() => handleDelete(t.id)} className="shrink-0 p-1 text-destructive hover:text-destructive/80">
            <MIcon name="delete" size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
