"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertFunnelPage } from "@/lib/queries";

// ── Data Model ───────────────────────────────────────────────

export type EditorElement = {
  id: string;
  type: string;
  name: string;
  styles: CSSProperties;
  content: EditorElement[] | Record<string, string>;
};

// ── Renderer ─────────────────────────────────────────────────

function RenderElement({ el }: { el: EditorElement }): ReactNode {
  if (el.type === "text") {
    const c = el.content as Record<string, string>;
    return <p style={el.styles}>{c.innerText || "Empty text"}</p>;
  }
  if (el.type === "link") {
    const c = el.content as Record<string, string>;
    return <a href={c.href || "#"} style={el.styles}>{c.innerText || "Link"}</a>;
  }
  if (el.type === "image") {
    const c = el.content as Record<string, string>;
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={c.src || "https://placehold.co/600x300?text=Image"} alt={el.name} style={el.styles} />;
  }
  if (el.type === "video") {
    const c = el.content as Record<string, string>;
    return <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", ...el.styles }} allowFullScreen />;
  }
  const children = Array.isArray(el.content) ? el.content : [];
  return (
    <div style={el.styles}>
      {children.map((child) => <RenderElement key={child.id} el={child} />)}
      {children.length === 0 && (
        <div style={{ minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #333", borderRadius: 8, color: "#555", fontSize: 12 }}>
          Empty container
        </div>
      )}
    </div>
  );
}

// ── Default tree for new pages ───────────────────────────────

const defaultTree: EditorElement = {
  id: "__body",
  type: "__body",
  name: "Body",
  styles: { minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" },
  content: [],
};

// ── Editor Component ─────────────────────────────────────────

type Props = {
  pageId: string;
  pageName: string;
  funnelId: string;
  subAccountId: string;
  initialContent: string | null;
};

export default function EditorStep2({ pageId, pageName, funnelId, subAccountId, initialContent }: Props) {
  const router = useRouter();

  // Parse saved content or use default
  const [elements] = useState<EditorElement[]>(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* invalid JSON */ }
    }
    return [defaultTree];
  });

  const handleSave = async () => {
    try {
      await upsertFunnelPage({
        id: pageId,
        name: pageName,
        funnelId,
        order: 0,
        content: JSON.stringify(elements),
      });
      toast.success("Saved");
      router.refresh();
    } catch {
      toast.error("Could not save");
    }
  };

  const body = elements[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid #222", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button asChild variant="ghost" size="icon-xs">
            <Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}><ArrowLeft /></Link>
          </Button>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{pageName}</span>
          <span style={{ fontSize: 11, color: "#666" }}>Step 2: Save/Load</span>
        </div>
        <Button size="sm" onClick={handleSave} className="gap-1 text-[12px]">
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflow: "auto", padding: 16, backgroundColor: "#1a1a1a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", backgroundColor: "#0a0a0a", minHeight: "100%" }}>
          {body ? <RenderElement el={body} /> : <p style={{ color: "#666", textAlign: "center", padding: 64 }}>No content</p>}
        </div>
      </div>
    </div>
  );
}
