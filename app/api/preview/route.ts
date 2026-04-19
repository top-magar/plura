import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const pageId = req.nextUrl.searchParams.get("pageId");
  if (!pageId) return new NextResponse("Missing pageId", { status: 400 });

  const page = await db.funnelPage.findUnique({ where: { id: pageId } });
  if (!page?.content) return new NextResponse("<html><body style='margin:0;background:#0a0a0a;color:#666;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui'>Empty page</body></html>", { headers: { "Content-Type": "text/html" } });

  const html = renderToHTML(page.content);
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

function renderToHTML(content: string): string {
  try {
    const els = JSON.parse(content);
    const body = els[0];
    if (!body) return "";
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif}</style></head><body>${renderEl(body)}</body></html>`;
  } catch { return ""; }
}

function renderEl(el: { type: string; styles: Record<string, string>; content: unknown; name: string }): string {
  const style = Object.entries(el.styles || {}).map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`).join(";");
  const c = el.content as Record<string, string>;

  switch (el.type) {
    case "text": case "footer": return `<p style="${style}">${esc(c?.innerText)}</p>`;
    case "link": return `<a href="${esc(c?.href)}" style="${style}">${esc(c?.innerText)}</a>`;
    case "button": return `<a href="${esc(c?.href)}" style="${style};display:block;text-decoration:none;color:inherit">${esc(c?.innerText)}</a>`;
    case "image": return `<img src="${esc(c?.src)}" alt="${esc(c?.alt || "")}" style="width:100%;${style}" />`;
    case "video": return `<iframe src="${esc(c?.src)}" style="width:100%;aspect-ratio:16/9;border:0;${style}" allowfullscreen></iframe>`;
    case "divider": return `<hr style="border:none;${style}" />`;
    case "spacer": return `<div style="${style}"></div>`;
    case "quote": return `<blockquote style="margin:0;${style}">${esc(c?.innerText)}</blockquote>`;
    case "badge": case "icon": return `<span style="${style}">${esc(c?.innerText)}</span>`;
    case "list": return `<ul style="margin:0;${style}">${(c?.innerText || "").split("\n").filter(Boolean).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
    case "code": return `<div style="${style}"><code>${esc(c?.innerText)}</code></div>`;
    case "navbar": return `<div style="${style}"><span style="font-weight:700;font-size:16px">${esc(c?.brand)}</span><div style="display:flex;gap:16px;font-size:14px">${(c?.links || "").split(",").map((l) => `<a href="#" style="opacity:0.7;color:inherit;text-decoration:none">${esc(l.trim())}</a>`).join("")}</div></div>`;
    case "embed": return `<div style="${style}">${c?.code || ""}</div>`;
    case "socialIcons": return `<div style="${style}">${(c?.platforms || "").split(",").map((p) => `<span style="opacity:0.6">${esc(p.trim())}</span>`).join("")}</div>`;
    case "map": return `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(c?.address || "")}&z=${c?.zoom || "13"}&output=embed" style="width:100%;height:100%;border:0;${style}"></iframe>`;
    case "gallery": return `<div style="${style}">${(c?.images || "").split(",").filter(Boolean).map((s) => `<img src="${esc(s.trim())}" style="width:100%;display:block" />`).join("")}</div>`;
    case "contactForm": return `<form style="${style}"><input placeholder="Name" style="display:block;width:100%;padding:8px;margin-bottom:8px;border:0;border-bottom:1px solid #444;background:transparent;color:inherit" /><input placeholder="Email" style="display:block;width:100%;padding:8px;margin-bottom:8px;border:0;border-bottom:1px solid #444;background:transparent;color:inherit" /><button style="width:100%;padding:10px;background:#6366f1;color:#fff;border:0;cursor:pointer">Submit</button></form>`;
    case "paymentForm": return `<div style="${style}"><button style="width:100%;padding:10px;background:#6366f1;color:#fff;border:0">Pay Now</button></div>`;
    case "accordion": {
      const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c?.items || "[]"); } catch { return []; } })();
      return `<div style="${style}">${items.map((i) => `<details style="border-bottom:1px solid #333;padding:12px 0"><summary style="cursor:pointer;font-weight:500">${esc(i.title)}</summary><p style="margin-top:8px;opacity:0.7">${esc(i.body)}</p></details>`).join("")}</div>`;
    }
    case "tabs": {
      const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c?.items || "[]"); } catch { return []; } })();
      return `<div style="${style}"><div style="display:flex;border-bottom:1px solid #333">${items.map((i, idx) => `<div style="padding:8px 16px;${idx === 0 ? "border-bottom:2px solid #6366f1" : ""}">${esc(i.title)}</div>`).join("")}</div><div style="padding:16px">${esc(items[0]?.body || "")}</div></div>`;
    }
    case "countdown": return `<div style="${style}"><span>00</span> : <span>00</span> : <span>00</span> : <span>00</span></div>`;
    default: {
      if (Array.isArray(el.content)) return `<div style="${style}">${(el.content as typeof el[]).map(renderEl).join("")}</div>`;
      return `<div style="${style}">${esc(c?.innerText || "")}</div>`;
    }
  }
}

function esc(s: string | undefined): string {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
