"use client";

import type { CSSProperties } from "react";

type El = { id: string; type: string; name: string; styles: CSSProperties; content: El[] | Record<string, string> };

function R({ el }: { el: El }) {
  if (el.type === "text") { const c = el.content as Record<string, string>; return <p style={el.styles}>{c.innerText}</p>; }
  if (el.type === "link") { const c = el.content as Record<string, string>; return <a href={c.href || "#"} style={el.styles}>{c.innerText}</a>; }
  if (el.type === "image") { const c = el.content as Record<string, string>; return <img src={c.src} alt={el.name} style={{ width: "100%", ...el.styles }} />; } // eslint-disable-line
  if (el.type === "video") { const c = el.content as Record<string, string>; return <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0, ...el.styles }} allowFullScreen />; }
  if (el.type === "contactForm") {
    return (
      <form style={el.styles} method="POST">
        <input name="name" placeholder="Name" required style={{ display: "block", width: "100%", padding: "8px 12px", marginBottom: 8, borderRadius: 6, border: "1px solid #333", background: "#111", color: "#fff" }} />
        <input name="email" type="email" placeholder="Email" required style={{ display: "block", width: "100%", padding: "8px 12px", marginBottom: 8, borderRadius: 6, border: "1px solid #333", background: "#111", color: "#fff" }} />
        <button type="submit" style={{ width: "100%", padding: 10, borderRadius: 6, background: "#6366f1", color: "#fff", border: 0, cursor: "pointer" }}>Submit</button>
      </form>
    );
  }
  if (el.type === "paymentForm") {
    return <div style={el.styles}><div style={{ padding: 16, border: "1px solid #333", borderRadius: 8, textAlign: "center" }}><button style={{ width: "100%", padding: 10, borderRadius: 6, background: "#6366f1", color: "#fff", border: 0 }}>Pay Now</button></div></div>;
  }
  const children = Array.isArray(el.content) ? el.content : [];
  return <div style={el.styles}>{children.map((c) => <R key={c.id} el={c} />)}</div>;
}

export default function PageRenderer({ content }: { content: string | null }) {
  if (!content) return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;
  let els: El[] = [];
  try { els = JSON.parse(content); } catch { return <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />; }
  const body = els[0];
  if (!body) return null;
  return <R el={body} />;
}
