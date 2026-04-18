"use client";

import dynamic from "next/dynamic";
import type { EditorElement } from "./types";

const RichTextRenderer = dynamic(() => import("./rich-text").then((m) => m.RichTextRenderer), { ssr: false });

function RenderElement({ element }: { element: EditorElement }) {
  if (element.type === "text") {
    const content = element.content as { innerText?: string };
    return (
      <div style={element.styles}>
        {content.innerText ? <RichTextRenderer content={content.innerText} /> : null}
      </div>
    );
  }

  if (element.type === "link") {
    const content = element.content as { innerText?: string; href?: string };
    return (
      <a href={content.href || "#"} style={element.styles}>
        {content.innerText || "Link"}
      </a>
    );
  }

  if (element.type === "image") {
    const content = element.content as { src?: string };
    return (
      <div style={element.styles}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.src || ""} alt={element.name} className="w-full" />
      </div>
    );
  }

  if (element.type === "video") {
    const content = element.content as { src?: string };
    return (
      <div style={element.styles}>
        <iframe src={content.src} className="w-full aspect-video" allowFullScreen />
      </div>
    );
  }

  if (element.type === "contactForm") {
    return (
      <div style={element.styles}>
        <form className="space-y-2">
          <input placeholder="Name" className="w-full rounded border px-3 py-2 text-sm" required />
          <input placeholder="Email" type="email" className="w-full rounded border px-3 py-2 text-sm" required />
          <button type="submit" className="w-full rounded bg-primary px-3 py-2 text-sm text-white">Submit</button>
        </form>
      </div>
    );
  }

  if (element.type === "paymentForm") {
    return (
      <div style={element.styles}>
        <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
          Payment form (requires Stripe integration)
        </div>
      </div>
    );
  }

  // Containers
  const children = Array.isArray(element.content) ? element.content : [];
  const isColumn = element.type === "2Col" || element.type === "3Col";

  return (
    <div style={{ ...element.styles, ...(isColumn ? { display: "flex", gap: "8px" } : {}) }}>
      {children.map((child) => (
        <div key={child.id} style={isColumn ? { flex: 1 } : {}}>
          <RenderElement element={child} />
        </div>
      ))}
    </div>
  );
}

export default function FunnelPageRenderer({ content }: { content: string | null }) {
  if (!content) return <div className="min-h-screen bg-background" />;

  let elements: EditorElement[] = [];
  try {
    elements = JSON.parse(content);
  } catch {
    return <div className="min-h-screen bg-background" />;
  }

  const body = elements[0];
  if (!body) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen">
      <RenderElement element={body} />
    </div>
  );
}
