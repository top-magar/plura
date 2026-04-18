"use client";

import type { CSSProperties, ReactNode } from "react";

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
  // Text
  if (el.type === "text") {
    const c = el.content as Record<string, string>;
    return <p style={el.styles}>{c.innerText || "Empty text"}</p>;
  }

  // Link
  if (el.type === "link") {
    const c = el.content as Record<string, string>;
    return <a href={c.href || "#"} style={el.styles}>{c.innerText || "Link"}</a>;
  }

  // Image
  if (el.type === "image") {
    const c = el.content as Record<string, string>;
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={c.src || "https://placehold.co/600x300?text=Image"} alt={el.name} style={el.styles} />;
  }

  // Video
  if (el.type === "video") {
    const c = el.content as Record<string, string>;
    return <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", ...el.styles }} allowFullScreen />;
  }

  // Container / Body / Columns
  const children = Array.isArray(el.content) ? el.content : [];
  return (
    <div style={el.styles}>
      {children.map((child) => (
        <RenderElement key={child.id} el={child} />
      ))}
    </div>
  );
}

// ── Hardcoded test tree ──────────────────────────────────────

const testTree: EditorElement = {
  id: "__body",
  type: "__body",
  name: "Body",
  styles: { minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "Inter, sans-serif" },
  content: [
    {
      id: "c1",
      type: "container",
      name: "Hero Section",
      styles: { padding: "64px 32px", textAlign: "center" as const },
      content: [
        {
          id: "t1",
          type: "text",
          name: "Heading",
          styles: { fontSize: "48px", fontWeight: "700", marginBottom: "16px" },
          content: { innerText: "Welcome to Plura" },
        },
        {
          id: "t2",
          type: "text",
          name: "Subheading",
          styles: { fontSize: "18px", color: "#888", marginBottom: "32px" },
          content: { innerText: "Build websites and funnels for your clients" },
        },
        {
          id: "l1",
          type: "link",
          name: "CTA Button",
          styles: {
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "#6366f1",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
          },
          content: { innerText: "Get Started", href: "#" },
        },
      ],
    },
    {
      id: "cols1",
      type: "2Col",
      name: "Features",
      styles: { display: "flex", gap: "24px", padding: "48px 32px" },
      content: [
        {
          id: "col1",
          type: "container",
          name: "Feature 1",
          styles: { flex: "1", padding: "24px", backgroundColor: "#111", borderRadius: "12px" },
          content: [
            {
              id: "ft1",
              type: "text",
              name: "Feature Title",
              styles: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" },
              content: { innerText: "Drag & Drop Builder" },
            },
            {
              id: "fd1",
              type: "text",
              name: "Feature Desc",
              styles: { fontSize: "14px", color: "#888" },
              content: { innerText: "Build pages visually with our intuitive editor." },
            },
          ],
        },
        {
          id: "col2",
          type: "container",
          name: "Feature 2",
          styles: { flex: "1", padding: "24px", backgroundColor: "#111", borderRadius: "12px" },
          content: [
            {
              id: "ft2",
              type: "text",
              name: "Feature Title",
              styles: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" },
              content: { innerText: "Custom Domains" },
            },
            {
              id: "fd2",
              type: "text",
              name: "Feature Desc",
              styles: { fontSize: "14px", color: "#888" },
              content: { innerText: "Host your funnels on any subdomain." },
            },
          ],
        },
      ],
    },
    {
      id: "img1",
      type: "image",
      name: "Preview",
      styles: { width: "100%", maxWidth: "800px", margin: "0 auto", display: "block", borderRadius: "12px" },
      content: { src: "https://placehold.co/800x400/111/333?text=Dashboard+Preview" },
    },
  ],
};

// ── Editor Page ──────────────────────────────────────────────

export default function EditorStep1() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #222", fontSize: "13px", color: "#888" }}>
        Step 1: Hardcoded render — no interactions
      </div>
      <RenderElement el={testTree} />
    </div>
  );
}
