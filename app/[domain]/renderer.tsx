"use client";

import { useState, type CSSProperties } from "react";

type El = { id: string; type: string; name: string; styles: CSSProperties; content: El[] | Record<string, string> };

function R({ el }: { el: El }) {
  const c = el.content as Record<string, string>;

  switch (el.type) {
    case "text":
    case "footer":
      return <p style={el.styles}>{c.innerText}</p>;
    case "link":
      return <a href={c.href || "#"} style={el.styles}>{c.innerText}</a>;
    case "button":
      return <a href={c.href || "#"} style={{ ...el.styles, display: "block", textDecoration: "none", color: "inherit" }}>{c.innerText}</a>;
    case "image":
      return <img src={c.src} alt={c.alt || el.name} style={{ width: "100%", ...el.styles }} />; // eslint-disable-line
    case "video":
      return <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0, ...el.styles }} allowFullScreen />;
    case "divider":
      return <div style={el.styles}><hr style={{ border: "none", borderTop: "inherit" }} /></div>;
    case "spacer":
      return <div style={el.styles} />;
    case "quote":
      return <blockquote style={{ margin: 0, ...el.styles }}>{c.innerText}</blockquote>;
    case "badge":
    case "icon":
      return <span style={el.styles}>{c.innerText}</span>;
    case "list":
      return <ul style={{ margin: 0, ...el.styles }}>{(c.innerText || "").split("\n").filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}</ul>;
    case "code":
      return <div style={el.styles}><code>{c.innerText}</code></div>;
    case "accordion":
      return <AccordionLive styles={el.styles} items={c.items} />;
    case "tabs":
      return <TabsLive styles={el.styles} items={c.items} />;
    case "countdown":
      return <CountdownLive styles={el.styles} targetDate={c.targetDate} />;
    case "navbar":
      return (
        <div style={el.styles}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{c.brand}</span>
          <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
            {(c.links || "").split(",").map((l, i) => <a key={i} href="#" style={{ opacity: 0.7, color: "inherit", textDecoration: "none" }}>{l.trim()}</a>)}
          </div>
        </div>
      );
    case "embed":
      return <div style={el.styles} dangerouslySetInnerHTML={{ __html: c.code || "" }} />;
    case "socialIcons":
      return <div style={el.styles}>{(c.platforms || "").split(",").map((p, i) => <span key={i} style={{ opacity: 0.6 }}>{p.trim()}</span>)}</div>;
    case "map":
      return <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address || "New York")}&z=${c.zoom || "13"}&output=embed`} style={{ width: "100%", height: "100%", border: 0, ...el.styles }} />;
    case "gallery": {
      const imgs = (c.images || "").split(",").filter(Boolean);
      return <div style={el.styles}>{imgs.map((src, i) => <img key={i} src={src.trim()} alt={`${i + 1}`} style={{ width: "100%", display: "block" }} />)}</div>; // eslint-disable-line
    }
    case "contactForm":
      return (
        <form style={el.styles} method="POST">
          <input name="name" placeholder="Name" required style={{ display: "block", width: "100%", padding: "8px 12px", marginBottom: 8, border: 0, borderBottom: "1px solid #444", background: "transparent", color: "inherit" }} />
          <input name="email" type="email" placeholder="Email" required style={{ display: "block", width: "100%", padding: "8px 12px", marginBottom: 8, border: 0, borderBottom: "1px solid #444", background: "transparent", color: "inherit" }} />
          <button type="submit" style={{ width: "100%", padding: 10, background: "#6366f1", color: "#fff", border: 0, cursor: "pointer" }}>Submit</button>
        </form>
      );
    case "paymentForm":
      return <div style={el.styles}><button style={{ width: "100%", padding: 10, background: "#6366f1", color: "#fff", border: 0 }}>Pay Now</button></div>;
    default: {
      const children = Array.isArray(el.content) ? el.content : [];
      return <div style={el.styles}>{children.map((ch) => <R key={ch.id} el={ch} />)}</div>;
    }
  }
}

// ── Interactive components (client-side) ─────────────────────

function AccordionLive({ styles, items }: { styles: CSSProperties; items: string }) {
  const parsed: { title: string; body: string }[] = (() => { try { return JSON.parse(items || "[]"); } catch { return []; } })();
  return (
    <div style={styles}>
      {parsed.map((item, i) => (
        <details key={i} style={{ borderBottom: "1px solid #333", padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 500, fontSize: 14 }}>{item.title}</summary>
          <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{item.body}</p>
        </details>
      ))}
    </div>
  );
}

function TabsLive({ styles, items }: { styles: CSSProperties; items: string }) {
  const [active, setActive] = useState(0);
  const parsed: { title: string; body: string }[] = (() => { try { return JSON.parse(items || "[]"); } catch { return []; } })();
  return (
    <div style={styles}>
      <div style={{ display: "flex", borderBottom: "1px solid #333" }}>
        {parsed.map((item, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ padding: "8px 16px", border: 0, borderBottom: active === i ? "2px solid #6366f1" : "2px solid transparent", background: "transparent", color: "inherit", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {item.title}
          </button>
        ))}
      </div>
      <div style={{ padding: 16, fontSize: 14 }}>{parsed[active]?.body}</div>
    </div>
  );
}

function CountdownLive({ styles, targetDate }: { styles: CSSProperties; targetDate: string }) {
  const [now, setNow] = useState(Date.now());
  const target = new Date(targetDate || Date.now()).getTime();
  useState(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); });
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <div style={styles}>
      {([["Days", d], ["Hours", h], ["Min", m], ["Sec", s]] as const).map(([label, val]) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "inherit", fontWeight: "inherit" }}>{String(val).padStart(2, "0")}</div>
          <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Entry point ──────────────────────────────────────────────

export default function PageRenderer({ content }: { content: string | null }) {
  if (!content) return <div style={{ minHeight: "100vh" }} />;
  let els: El[] = [];
  try { els = JSON.parse(content); } catch { return <div style={{ minHeight: "100vh" }} />; }
  const body = els[0];
  if (!body) return null;
  return <R el={body} />;
}
