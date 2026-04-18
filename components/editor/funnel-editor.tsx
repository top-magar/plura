"use client";

import { useState, useCallback, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Undo2, Redo2, Eye, EyeOff, Laptop, Tablet, Smartphone, Type, Link2, Image, Layout, Columns2, Columns3, Video, Contact, CreditCard, ChevronRight, ChevronDown, Copy, Layers, GripVertical, Heading1, Heading2, List, SeparatorHorizontal, Square, Code, Quote, Star, MapPin, Phone, Mail, Globe, Clock, CheckSquare, Minus, ChevronUp, Timer, PanelTop, PanelBottom, Share2, CodeXml, ImageIcon, Navigation, Rows3 } from "lucide-react";
import { toast } from "sonner";
import { v4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { upsertFunnelPage } from "@/lib/queries";
import "./editor.css";

// ── Types ────────────────────────────────────────────────────

type El = { id: string; type: string; name: string; styles: CSSProperties; content: El[] | Record<string, string> };
type Device = "Desktop" | "Tablet" | "Mobile";

// ── Tree helpers ─────────────────────────────────────────────

function addEl(tree: El[], containerId: string, el: El): El[] {
  return tree.map((n) => {
    if (n.id === containerId && Array.isArray(n.content)) return { ...n, content: [...n.content, el] };
    if (Array.isArray(n.content)) return { ...n, content: addEl(n.content, containerId, el) };
    return n;
  });
}

function updateEl(tree: El[], updated: El): El[] {
  return tree.map((n) => {
    if (n.id === updated.id) return updated;
    if (Array.isArray(n.content)) return { ...n, content: updateEl(n.content, updated) };
    return n;
  });
}

function deleteEl(tree: El[], id: string): El[] {
  return tree.filter((n) => n.id !== id).map((n) => {
    if (Array.isArray(n.content)) return { ...n, content: deleteEl(n.content, id) };
    return n;
  });
}

function findEl(tree: El[], id: string): El | null {
  for (const n of tree) {
    if (n.id === id) return n;
    if (Array.isArray(n.content)) { const f = findEl(n.content, id); if (f) return f; }
  }
  return null;
}

function moveEl(tree: El[], elId: string, targetContainerId: string): El[] {
  const el = findEl(tree, elId);
  if (!el) return tree;
  const removed = deleteEl(tree, elId);
  return addEl(removed, targetContainerId, el);
}

function reorderEl(tree: El[], elId: string, direction: "up" | "down"): El[] {
  return tree.map((n) => {
    if (Array.isArray(n.content)) {
      const idx = n.content.findIndex((c) => c.id === elId);
      if (idx >= 0) {
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= n.content.length) return n;
        const arr = [...n.content];
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        return { ...n, content: arr };
      }
      return { ...n, content: reorderEl(n.content, elId, direction) };
    }
    return n;
  });
}

function cloneEl(el: El): El {
  const id = v4();
  if (Array.isArray(el.content)) return { ...el, id, name: el.name + " copy", content: el.content.map(cloneEl) };
  return { ...el, id, name: el.name + " copy" };
}

// ── Element factory ──────────────────────────────────────────

function makeEl(type: string): El | null {
  const id = v4();
  const m: Record<string, () => El> = {
    // Text
    text: () => ({ id, type: "text", name: "Text", styles: { fontSize: "16px" }, content: { innerText: "Edit this text" } }),
    heading: () => ({ id, type: "text", name: "Heading", styles: { fontSize: "36px", fontWeight: "700", lineHeight: "1.2" }, content: { innerText: "Heading" } }),
    subheading: () => ({ id, type: "text", name: "Subheading", styles: { fontSize: "20px", fontWeight: "500", opacity: "0.7" }, content: { innerText: "Subheading text goes here" } }),
    // Interactive
    link: () => ({ id, type: "link", name: "Link", styles: { color: "#6366f1", textDecoration: "underline" }, content: { innerText: "Click here", href: "#" } }),
    button: () => ({ id, type: "button", name: "Button", styles: { padding: "12px 24px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer" }, content: { innerText: "Click Me", href: "#" } }),
    // Media
    image: () => ({ id, type: "image", name: "Image", styles: { width: "100%" }, content: { src: "", alt: "Image" } }),
    video: () => ({ id, type: "video", name: "Video", styles: { width: "100%" }, content: { src: "https://www.youtube.com/embed/dQw4w9WgXcQ" } }),
    // Layout
    container: () => ({ id, type: "container", name: "Container", styles: { padding: "16px" }, content: [] }),
    section: () => ({ id, type: "container", name: "Section", styles: { padding: "64px 24px", maxWidth: "1200px", margin: "0 auto" }, content: [] }),
    "2Col": () => ({ id, type: "2Col", name: "2 Columns", styles: { display: "flex", gap: "16px" }, content: [
      { id: v4(), type: "container", name: "Col 1", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 2", styles: { flex: "1", padding: "8px" }, content: [] },
    ]}),
    "3Col": () => ({ id, type: "3Col", name: "3 Columns", styles: { display: "flex", gap: "16px" }, content: [
      { id: v4(), type: "container", name: "Col 1", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 2", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 3", styles: { flex: "1", padding: "8px" }, content: [] },
    ]}),
    "4Col": () => ({ id, type: "4Col", name: "4 Columns", styles: { display: "flex", gap: "16px" }, content: [
      { id: v4(), type: "container", name: "Col 1", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 2", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 3", styles: { flex: "1", padding: "8px" }, content: [] },
      { id: v4(), type: "container", name: "Col 4", styles: { flex: "1", padding: "8px" }, content: [] },
    ]}),
    // Decorative
    divider: () => ({ id, type: "divider", name: "Divider", styles: { borderTop: "1px solid #333", margin: "16px 0" }, content: {} }),
    spacer: () => ({ id, type: "spacer", name: "Spacer", styles: { height: "48px" }, content: {} }),
    quote: () => ({ id, type: "quote", name: "Quote", styles: { padding: "16px 24px", borderLeft: "3px solid #6366f1", fontStyle: "italic", fontSize: "18px" }, content: { innerText: "This is a quote block" } }),
    badge: () => ({ id, type: "badge", name: "Badge", styles: { display: "inline-block", padding: "4px 12px", fontSize: "12px", fontWeight: "600", backgroundColor: "#6366f1", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }, content: { innerText: "New" } }),
    list: () => ({ id, type: "list", name: "List", styles: { padding: "0 0 0 20px", fontSize: "16px", lineHeight: "1.8" }, content: { innerText: "First item\nSecond item\nThird item" } }),
    code: () => ({ id, type: "code", name: "Code Block", styles: { padding: "16px", backgroundColor: "#111", fontFamily: "monospace", fontSize: "13px", whiteSpace: "pre-wrap", overflow: "auto" }, content: { innerText: "const hello = 'world';" } }),
    // Forms
    contactForm: () => ({ id, type: "contactForm", name: "Contact Form", styles: { padding: "16px" }, content: {} }),
    paymentForm: () => ({ id, type: "paymentForm", name: "Payment", styles: { padding: "16px" }, content: {} }),
    // Pre-built blocks
    hero: () => ({ id, type: "container", name: "Hero", styles: { padding: "80px 24px", textAlign: "center" }, content: [
      { id: v4(), type: "text", name: "Hero Title", styles: { fontSize: "48px", fontWeight: "800", lineHeight: "1.1", marginBottom: "16px" }, content: { innerText: "Build Something Amazing" } },
      { id: v4(), type: "text", name: "Hero Subtitle", styles: { fontSize: "18px", opacity: "0.6", maxWidth: "600px", margin: "0 auto 32px" }, content: { innerText: "Create beautiful websites and funnels with our drag-and-drop builder." } },
      { id: v4(), type: "button", name: "Hero CTA", styles: { padding: "14px 32px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "16px", fontWeight: "600", display: "inline-block" }, content: { innerText: "Get Started", href: "#" } },
    ] as El[] }),
    cta: () => ({ id, type: "container", name: "CTA Block", styles: { padding: "48px 24px", textAlign: "center", backgroundColor: "#6366f1" }, content: [
      { id: v4(), type: "text", name: "CTA Title", styles: { fontSize: "28px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }, content: { innerText: "Ready to get started?" } },
      { id: v4(), type: "text", name: "CTA Text", styles: { fontSize: "16px", color: "#ffffff", opacity: "0.8", marginBottom: "24px" }, content: { innerText: "Join thousands of happy customers today." } },
      { id: v4(), type: "button", name: "CTA Button", styles: { padding: "12px 28px", backgroundColor: "#ffffff", color: "#6366f1", fontSize: "14px", fontWeight: "600", display: "inline-block" }, content: { innerText: "Sign Up Free", href: "#" } },
    ] as El[] }),
    testimonial: () => ({ id, type: "container", name: "Testimonial", styles: { padding: "32px", backgroundColor: "#111" }, content: [
      { id: v4(), type: "text", name: "Quote", styles: { fontSize: "18px", fontStyle: "italic", lineHeight: "1.6", marginBottom: "16px" }, content: { innerText: "\"This product changed the way we work. Highly recommended!\"" } },
      { id: v4(), type: "text", name: "Author", styles: { fontSize: "14px", fontWeight: "600" }, content: { innerText: "— Jane Doe, CEO at Company" } },
    ] as El[] }),
    pricing: () => ({ id, type: "container", name: "Pricing Card", styles: { padding: "32px", textAlign: "center", border: "1px solid #333" }, content: [
      { id: v4(), type: "text", name: "Plan", styles: { fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }, content: { innerText: "Pro Plan" } },
      { id: v4(), type: "text", name: "Price", styles: { fontSize: "48px", fontWeight: "800", marginBottom: "8px" }, content: { innerText: "$49" } },
      { id: v4(), type: "text", name: "Period", styles: { fontSize: "14px", opacity: "0.5", marginBottom: "24px" }, content: { innerText: "per month" } },
      { id: v4(), type: "button", name: "CTA", styles: { padding: "12px 24px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "14px", fontWeight: "600", width: "100%" }, content: { innerText: "Choose Plan", href: "#" } },
    ] as El[] }),
    // ── Interactive ──
    icon: () => ({ id, type: "icon", name: "Icon", styles: { fontSize: "32px", textAlign: "center" }, content: { innerText: "★" } }),
    accordion: () => ({ id, type: "accordion", name: "Accordion", styles: {}, content: { items: JSON.stringify([
      { title: "What is this product?", body: "A brief description of your product or service." },
      { title: "How does pricing work?", body: "Explain your pricing model here." },
      { title: "Do you offer support?", body: "Yes, we offer 24/7 support via email and chat." },
    ])} }),
    countdown: () => ({ id, type: "countdown", name: "Countdown", styles: { display: "flex", justifyContent: "center", gap: "16px", padding: "24px", fontSize: "32px", fontWeight: "700", textAlign: "center" }, content: { targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16) } }),
    tabs: () => ({ id, type: "tabs", name: "Tabs", styles: {}, content: { items: JSON.stringify([
      { title: "Tab 1", body: "Content for the first tab." },
      { title: "Tab 2", body: "Content for the second tab." },
      { title: "Tab 3", body: "Content for the third tab." },
    ])} }),
    // ── Navigation ──
    navbar: () => ({ id, type: "navbar", name: "Navbar", styles: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }, content: { brand: "Brand", links: "Home,About,Services,Contact" } }),
    footer: () => ({ id, type: "footer", name: "Footer", styles: { padding: "32px 24px", textAlign: "center", fontSize: "13px", opacity: "0.5" }, content: { innerText: "© 2026 Your Company. All rights reserved." } }),
    // ── Embed & Social ──
    embed: () => ({ id, type: "embed", name: "Embed", styles: { padding: "16px", minHeight: "60px" }, content: { code: "<p style='color:#888;text-align:center'>Paste HTML here</p>" } }),
    socialIcons: () => ({ id, type: "socialIcons", name: "Social Icons", styles: { display: "flex", gap: "12px", justifyContent: "center", padding: "16px", fontSize: "20px" }, content: { platforms: "X,Facebook,Instagram,LinkedIn,YouTube" } }),
    map: () => ({ id, type: "map", name: "Map", styles: { width: "100%", height: "300px" }, content: { address: "New York, NY", zoom: "13" } }),
    gallery: () => ({ id, type: "gallery", name: "Gallery", styles: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "8px" }, content: { images: "https://placehold.co/400x300/111/333?text=1,https://placehold.co/400x300/111/333?text=2,https://placehold.co/400x300/111/333?text=3,https://placehold.co/400x300/111/333?text=4,https://placehold.co/400x300/111/333?text=5,https://placehold.co/400x300/111/333?text=6" } }),
    // ── More Blocks ──
    features: () => ({ id, type: "3Col", name: "Features Grid", styles: { display: "flex", gap: "24px", padding: "48px 24px" }, content: [
      { id: v4(), type: "container", name: "Feature 1", styles: { flex: "1", padding: "24px" }, content: [
        { id: v4(), type: "text", name: "Title", styles: { fontSize: "18px", fontWeight: "600", marginBottom: "8px" }, content: { innerText: "Fast Performance" } },
        { id: v4(), type: "text", name: "Desc", styles: { fontSize: "14px", opacity: "0.6" }, content: { innerText: "Lightning fast load times." } },
      ] as El[] },
      { id: v4(), type: "container", name: "Feature 2", styles: { flex: "1", padding: "24px" }, content: [
        { id: v4(), type: "text", name: "Title", styles: { fontSize: "18px", fontWeight: "600", marginBottom: "8px" }, content: { innerText: "Secure by Default" } },
        { id: v4(), type: "text", name: "Desc", styles: { fontSize: "14px", opacity: "0.6" }, content: { innerText: "Enterprise-grade security." } },
      ] as El[] },
      { id: v4(), type: "container", name: "Feature 3", styles: { flex: "1", padding: "24px" }, content: [
        { id: v4(), type: "text", name: "Title", styles: { fontSize: "18px", fontWeight: "600", marginBottom: "8px" }, content: { innerText: "24/7 Support" } },
        { id: v4(), type: "text", name: "Desc", styles: { fontSize: "14px", opacity: "0.6" }, content: { innerText: "Always here to help." } },
      ] as El[] },
    ] as El[] }),
    stats: () => ({ id, type: "container", name: "Stats", styles: { display: "flex", justifyContent: "center", gap: "48px", padding: "48px 24px", textAlign: "center" }, content: [
      { id: v4(), type: "container", name: "Stat", styles: {}, content: [
        { id: v4(), type: "text", name: "Num", styles: { fontSize: "36px", fontWeight: "800" }, content: { innerText: "10K+" } },
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "14px", opacity: "0.5" }, content: { innerText: "Customers" } },
      ] as El[] },
      { id: v4(), type: "container", name: "Stat", styles: {}, content: [
        { id: v4(), type: "text", name: "Num", styles: { fontSize: "36px", fontWeight: "800" }, content: { innerText: "99.9%" } },
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "14px", opacity: "0.5" }, content: { innerText: "Uptime" } },
      ] as El[] },
      { id: v4(), type: "container", name: "Stat", styles: {}, content: [
        { id: v4(), type: "text", name: "Num", styles: { fontSize: "36px", fontWeight: "800" }, content: { innerText: "24/7" } },
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "14px", opacity: "0.5" }, content: { innerText: "Support" } },
      ] as El[] },
    ] as El[] }),
  };
  return m[type]?.() ?? null;
}

// ── Sidebar components list ──────────────────────────────────

const componentGroups = [
  { label: "Layout", items: [
    { type: "container", label: "Container", icon: Square },
    { type: "section", label: "Section", icon: Layout },
    { type: "2Col", label: "2 Columns", icon: Columns2 },
    { type: "3Col", label: "3 Columns", icon: Columns3 },
    { type: "4Col", label: "4 Columns", icon: GripVertical },
    { type: "divider", label: "Divider", icon: Minus },
    { type: "spacer", label: "Spacer", icon: SeparatorHorizontal },
  ]},
  { label: "Typography", items: [
    { type: "heading", label: "Heading", icon: Heading1 },
    { type: "subheading", label: "Subheading", icon: Heading2 },
    { type: "text", label: "Paragraph", icon: Type },
    { type: "list", label: "List", icon: List },
    { type: "quote", label: "Quote", icon: Quote },
    { type: "badge", label: "Badge", icon: Star },
    { type: "code", label: "Code", icon: Code },
    { type: "icon", label: "Icon", icon: Star },
  ]},
  { label: "Media & Links", items: [
    { type: "image", label: "Image", icon: Image },
    { type: "video", label: "Video", icon: Video },
    { type: "gallery", label: "Gallery", icon: ImageIcon },
    { type: "link", label: "Link", icon: Link2 },
    { type: "button", label: "Button", icon: CheckSquare },
    { type: "map", label: "Map", icon: MapPin },
    { type: "embed", label: "Embed", icon: CodeXml },
    { type: "socialIcons", label: "Social Icons", icon: Share2 },
  ]},
  { label: "Interactive", items: [
    { type: "accordion", label: "Accordion", icon: ChevronDown },
    { type: "tabs", label: "Tabs", icon: Rows3 },
    { type: "countdown", label: "Countdown", icon: Timer },
  ]},
  { label: "Navigation", items: [
    { type: "navbar", label: "Navbar", icon: Navigation },
    { type: "footer", label: "Footer", icon: PanelBottom },
  ]},
  { label: "Forms", items: [
    { type: "contactForm", label: "Contact", icon: Contact },
    { type: "paymentForm", label: "Payment", icon: CreditCard },
  ]},
  { label: "Blocks", items: [
    { type: "hero", label: "Hero", icon: Globe },
    { type: "cta", label: "CTA", icon: Phone },
    { type: "testimonial", label: "Testimonial", icon: Quote },
    { type: "pricing", label: "Pricing", icon: CreditCard },
    { type: "features", label: "Features", icon: Columns3 },
    { type: "stats", label: "Stats", icon: Heading1 },
  ]},
];

// ── CSS property groups ──────────────────────────────────────

const selectOptions: Record<string, string[]> = {
  display: ["block", "flex", "grid", "inline", "inline-flex", "none"],
  flexDirection: ["row", "column", "row-reverse", "column-reverse"],
  justifyContent: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
  alignItems: ["flex-start", "center", "flex-end", "stretch", "baseline"],
  textAlign: ["left", "center", "right", "justify"],
  fontWeight: ["300", "400", "500", "600", "700", "800"],
};

const propGroups = [
  { title: "Typography", props: ["fontSize", "fontWeight", "color", "textAlign", "lineHeight", "letterSpacing"] },
  { title: "Spacing", props: ["padding", "margin", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom"] },
  { title: "Size", props: ["width", "height", "maxWidth", "minHeight", "overflow"] },
  { title: "Background", props: ["backgroundColor", "backgroundImage", "backgroundSize"] },
  { title: "Border", props: ["borderWidth", "borderColor", "borderStyle"] },
  { title: "Layout", props: ["display", "flexDirection", "justifyContent", "alignItems", "gap", "flex"] },
  { title: "Effects", props: ["opacity", "boxShadow", "cursor"] },
];

// ── Default body ─────────────────────────────────────────────

const defaultBody: El = { id: "__body", type: "__body", name: "Body", styles: { minHeight: "100vh" }, content: [] };

// ── Main Editor ──────────────────────────────────────────────

type Props = { pageId: string; pageName: string; funnelId: string; subAccountId: string; initialContent: string | null };

export default function FunnelEditor({ pageId, pageName, funnelId, subAccountId, initialContent }: Props) {
  const router = useRouter();

  // State
  const [elements, setElements] = useState<El[]>(() => {
    if (initialContent) { try { const p = JSON.parse(initialContent); if (Array.isArray(p) && p.length) return p; } catch {} }
    return [defaultBody];
  });
  const [selected, setSelected] = useState<El | null>(null);
  const [device, setDevice] = useState<Device>("Desktop");
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState<El[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<El | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"components" | "layers">("components");
  const [propsTab, setPropsTab] = useState<"design" | "content">("design");
  const [pageTitle, setPageTitle] = useState(pageName);

  // History
  const pushHistory = useCallback((prev: El[]) => {
    setHistory((h) => [...h.slice(0, historyIdx + 1), prev]);
    setHistoryIdx((i) => i + 1);
  }, [historyIdx]);

  const undo = () => {
    if (historyIdx < 0) return;
    const prev = history[historyIdx];
    setElements(prev);
    setHistoryIdx((i) => i - 1);
    setSelected(null);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 2] || history[historyIdx + 1];
    if (next) { setElements(next); setHistoryIdx((i) => i + 1); }
  };

  // Actions
  const doAdd = (containerId: string, type: string) => {
    const el = makeEl(type);
    if (!el) return;
    pushHistory(elements);
    setElements((prev) => addEl(prev, containerId, el));
    setDirty(true);
  };

  const doUpdate = (updated: El) => {
    pushHistory(elements);
    setElements((prev) => updateEl(prev, updated));
    if (selected?.id === updated.id) setSelected(updated);
    setDirty(true);
  };

  const doDelete = (id: string) => {
    pushHistory(elements);
    setElements((prev) => deleteEl(prev, id));
    setSelected(null);
    setDirty(true);
  };

  const doMove = (elId: string, targetId: string) => {
    if (elId === targetId) return;
    pushHistory(elements);
    setElements((prev) => moveEl(prev, elId, targetId));
    setDirty(true);
  };

  const doDuplicate = () => {
    if (!selected || selected.type === "__body") return;
    const clone = cloneEl(selected);
    // Find parent container and add clone there
    pushHistory(elements);
    setElements((prev) => {
      const addToParent = (tree: El[]): El[] => tree.map((n) => {
        if (Array.isArray(n.content)) {
          const idx = n.content.findIndex((c) => c.id === selected.id);
          if (idx >= 0) return { ...n, content: [...n.content.slice(0, idx + 1), clone, ...n.content.slice(idx + 1)] };
          return { ...n, content: addToParent(n.content) };
        }
        return n;
      });
      return addToParent(prev);
    });
    setSelected(clone);
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await upsertFunnelPage({ id: pageId, name: pageTitle, funnelId, order: 0, content: JSON.stringify(elements) });
      toast.success("Saved");
      setDirty(false);
    } catch { toast.error("Could not save"); }
  };

  // Keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "d") { e.preventDefault(); doDuplicate(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "c" && selected && selected.type !== "__body") { e.preventDefault(); setClipboard(selected); toast.success("Copied"); }
    if ((e.metaKey || e.ctrlKey) && e.key === "v" && clipboard) {
      e.preventDefault();
      const target = selected && Array.isArray(selected.content) ? selected.id : "__body";
      const clone = cloneEl(clipboard);
      pushHistory(elements);
      setElements((prev) => addEl(prev, target, clone));
      setDirty(true);
    }
    if ((e.key === "Delete" || e.key === "Backspace") && selected && selected.type !== "__body") {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      doDelete(selected.id);
    }
    if (e.key === "Escape") setSelected(null);
    if (e.key === "ArrowUp" && (e.metaKey || e.ctrlKey) && selected && selected.type !== "__body") {
      e.preventDefault();
      pushHistory(elements);
      setElements((prev) => reorderEl(prev, selected.id, "up"));
      setDirty(true);
    }
    if (e.key === "ArrowDown" && (e.metaKey || e.ctrlKey) && selected && selected.type !== "__body") {
      e.preventDefault();
      pushHistory(elements);
      setElements((prev) => reorderEl(prev, selected.id, "down"));
      setDirty(true);
    }
  }, [selected, elements]);

  // ── Render element (recursive) ─────────────────────────────

  function R({ el }: { el: El }): ReactNode {
    const isSel = selected?.id === el.id;
    const isBody = el.type === "__body";
    const isContainer = Array.isArray(el.content);

    const isHov = !preview && hovered === el.id && !isSel;

    const elClass = `editor-el${isBody ? " is-body" : ""}${isSel && !preview ? " is-selected" : ""}${!preview && dropTarget === el.id && isContainer ? " is-drop-target" : ""}${isHov ? " is-hovered" : ""}`;

    const wrapStyle: CSSProperties = {
      ...el.styles,
    };

    const handleClick = (e: React.MouseEvent) => { e.stopPropagation(); if (!preview) setSelected(el); };
    const handleMouseEnter = () => { if (!preview) setHovered(el.id); };
    const handleMouseLeave = () => { if (hovered === el.id) setHovered(null); };
    const handleDragOver = (e: React.DragEvent) => {
      if (isContainer) { e.preventDefault(); e.stopPropagation(); setDropTarget(el.id); }
    };
    const handleDragLeave = () => { if (dropTarget === el.id) setDropTarget(null); };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      setDropTarget(null);
      const type = e.dataTransfer.getData("componentType");
      const moveId = e.dataTransfer.getData("moveElementId");
      if (type && isContainer) doAdd(el.id, type);
      else if (moveId && isContainer) doMove(moveId, el.id);
    };
    const handleDragStart = (e: React.DragEvent) => {
      if (isBody || preview) return;
      e.stopPropagation();
      e.dataTransfer.setData("moveElementId", el.id);
    };

    // Static elements
    if (el.type === "text") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          {isSel && !preview ? (
            <span contentEditable suppressContentEditableWarning onBlur={(e) => doUpdate({ ...el, content: { ...c, innerText: (e.target as HTMLElement).innerText } })} style={{ outline: "none", display: "block", minHeight: 20 }}>
              {c.innerText || ""}
            </span>
          ) : (
            <span>{c.innerText || "Text"}</span>
          )}
        </div>
      );
    }

    if (el.type === "link") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <a href={preview ? c.href : undefined} style={{ color: "inherit" }}>{c.innerText || "Link"}</a>
        </div>
      );
    }

    if (el.type === "image") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.src || "https://placehold.co/600x300/111/333?text=Image"} alt={el.name} style={{ width: "100%", display: "block" }} />
        </div>
      );
    }

    if (el.type === "video") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <iframe src={c.src} style={{ width: "100%", aspectRatio: "16/9", border: 0 }} allowFullScreen />
        </div>
      );
    }

    if (el.type === "button") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <a href={preview ? c.href : undefined} style={{ display: "block", textDecoration: "none", color: "inherit" }}>{c.innerText || "Button"}</a>
        </div>
      );
    }

    if (el.type === "divider") {
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <hr style={{ border: "none", borderTop: "inherit" }} />
        </div>
      );
    }

    if (el.type === "spacer") {
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          {!preview && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 10, color: "var(--ed-text-placeholder)" }}>spacer</div>}
        </div>
      );
    }

    if (el.type === "quote") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <blockquote style={{ margin: 0 }}>{c.innerText || "Quote"}</blockquote>
        </div>
      );
    }

    if (el.type === "badge") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <span>{c.innerText || "Badge"}</span>
        </div>
      );
    }

    if (el.type === "list") {
      const c = el.content as Record<string, string>;
      const items = (c.innerText || "").split("\n").filter(Boolean);
      return (
        <div className={elClass} style={{ ...wrapStyle, listStyleType: "disc" }} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <ul style={{ margin: 0, paddingLeft: "inherit" }}>
            {items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      );
    }

    if (el.type === "code") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <code>{c.innerText || "// code"}</code>
        </div>
      );
    }

    if (el.type === "icon") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <span>{c.innerText || "★"}</span>
        </div>
      );
    }

    if (el.type === "accordion") {
      const c = el.content as Record<string, string>;
      const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          {items.map((item, i) => (
            <details key={i} style={{ borderBottom: "1px solid var(--ed-border-subtle)", padding: "12px 0" }}>
              <summary style={{ cursor: "pointer", fontWeight: 500, fontSize: 14 }}>{item.title}</summary>
              <p style={{ marginTop: 8, fontSize: 13, opacity: 0.7 }}>{item.body}</p>
            </details>
          ))}
        </div>
      );
    }

    if (el.type === "countdown") {
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <CountdownDisplay content={el.content as Record<string, string>} />
        </div>
      );
    }

    if (el.type === "tabs") {
      const c = el.content as Record<string, string>;
      const items: { title: string; body: string }[] = (() => { try { return JSON.parse(c.items || "[]"); } catch { return []; } })();
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <TabsDisplay items={items} />
        </div>
      );
    }

    if (el.type === "navbar") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <span style={{ fontWeight: 700, fontSize: 16 }}>{c.brand || "Brand"}</span>
          <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
            {(c.links || "").split(",").map((l, i) => <a key={i} href="#" style={{ opacity: 0.7 }}>{l.trim()}</a>)}
          </div>
        </div>
      );
    }

    if (el.type === "embed") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <div dangerouslySetInnerHTML={{ __html: c.code || "" }} />
        </div>
      );
    }

    if (el.type === "socialIcons") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          {(c.platforms || "").split(",").map((p, i) => <span key={i} style={{ opacity: 0.6 }}>{p.trim()}</span>)}
        </div>
      );
    }

    if (el.type === "map") {
      const c = el.content as Record<string, string>;
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address || "New York")}&z=${c.zoom || "13"}&output=embed`} style={{ width: "100%", height: "100%", border: 0 }} />
        </div>
      );
    }

    if (el.type === "gallery") {
      const c = el.content as Record<string, string>;
      const imgs = (c.images || "").split(",").filter(Boolean);
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name={el.name} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {imgs.map((src, i) => <img key={i} src={src.trim()} alt={`Gallery ${i + 1}`} style={{ width: "100%", display: "block" }} />)}
        </div>
      );
    }

    if (el.type === "contactForm") {
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name="Contact Form" onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name="Contact Form" />}
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input placeholder="Name" className="editor-form-input" />
            <input placeholder="Email" className="editor-form-input" />
            <button className="editor-form-submit">Submit</button>
          </form>
        </div>
      );
    }

    if (el.type === "paymentForm") {
      return (
        <div className={elClass} style={wrapStyle} onClick={handleClick} draggable={!preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {isSel && !preview && <SelectBadge name="Payment" onDelete={() => doDelete(el.id)} />}
          {isHov && <HoverBadge name="Payment" />}
          <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8, textAlign: "center", fontSize: 13 }} className="text-muted-foreground">
            <div style={{ height: 40, borderRadius: 6, marginBottom: 8 }} className="bg-muted" />
            <button className="editor-form-submit">Pay Now</button>
            <p style={{ marginTop: 8, fontSize: 10 }} className="text-muted-foreground/60">Powered by Stripe</p>
          </div>
        </div>
      );
    }

    // Containers
    const children = Array.isArray(el.content) ? el.content : [];
    const isEmpty = children.length === 0;

    return (
      <div className={elClass} style={wrapStyle} onClick={handleClick} onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} draggable={!isBody && !preview} onDragStart={handleDragStart} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isSel && !isBody && !preview && <SelectBadge name={el.name} onDelete={() => doDelete(el.id)} />}
        {isHov && !isBody && <HoverBadge name={el.name} />}
        {children.map((child) => <R key={child.id} el={child} />)}
        {isEmpty && !preview && (
          <div onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} className={`editor-dropzone ${isBody ? "body" : "child"} ${dropTarget === el.id ? "active" : ""}`}>
            {isBody ? "Drag a component here to start building" : "Drop here"}
          </div>
        )}
      </div>
    );
  }

  // ── Layout ─────────────────────────────────────────────────

  const body = elements[0];
  const deviceWidth = device === "Desktop" ? "100%" : device === "Tablet" ? 768 : 420;

  return (
    <div className="editor-root" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Toolbar */}
      {!preview && (
        <div className="editor-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button asChild variant="ghost" size="icon-xs"><Link href={`/sub-account/${subAccountId}/funnels/${funnelId}`}><ArrowLeft /></Link></Button>
            <input className="editor-props-name-input" value={pageTitle} onChange={(e) => { setPageTitle(e.target.value); setDirty(true); }} style={{ width: 140 }} />
          </div>
          <div className="editor-device-toggle">
            {([["Desktop", Laptop], ["Tablet", Tablet], ["Mobile", Smartphone]] as const).map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d as Device)} className={`editor-device-btn ${device === d ? "active" : ""}`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Button variant="ghost" size="icon-xs" onClick={() => setPreview(true)}><Eye /></Button>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="icon-xs" onClick={undo} disabled={historyIdx < 0}><Undo2 /></Button>
            <Button variant="ghost" size="icon-xs" onClick={redo} disabled={historyIdx >= history.length - 1}><Redo2 /></Button>
            <Separator orientation="vertical" className="h-5" />
            <Button size="sm" onClick={handleSave} className="gap-1 text-[12px] relative">
              <Save className="h-3.5 w-3.5" /> Save
              {dirty && <span className="editor-dirty-dot" />}
            </Button>
          </div>
        </div>
      )}

      <div className="editor-body">
        {/* Sidebar */}
        {!preview && (
          <div className="editor-sidebar">
            <div className="editor-sidebar-tabs">
              <button className={`editor-sidebar-tab ${sidebarTab === "components" ? "active" : ""}`} onClick={() => setSidebarTab("components")}>Components</button>
              <button className={`editor-sidebar-tab ${sidebarTab === "layers" ? "active" : ""}`} onClick={() => setSidebarTab("layers")}>Layers</button>
            </div>

            {sidebarTab === "components" && (
              <ScrollArea className="flex-1">
                {componentGroups.map((group) => (
                  <div key={group.label} className="editor-component-group">
                    <div className="editor-component-group-label">{group.label}</div>
                    <div className="editor-component-grid">
                      {group.items.map(({ type, label, icon: Icon }) => (
                        <div key={type} draggable onDragStart={(e) => e.dataTransfer.setData("componentType", type)} className="editor-component-card">
                          <Icon size={16} /> {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}

            {sidebarTab === "layers" && (
              <ScrollArea className="flex-1">
                <div style={{ padding: "4px 8px" }}>
                  {body && <LayerTree el={body} depth={0} selected={selected} onSelect={setSelected} />}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Canvas */}
        <div className={`editor-canvas ${preview ? "preview" : ""}`} onClick={() => !preview && setSelected(null)}>
          <div className="editor-canvas-inner" style={{ maxWidth: deviceWidth }}>
            {body && <R el={body} />}
          </div>
        </div>

        {/* Properties */}
        {!preview && !selected && (
          <div className="editor-props">
            <div className="editor-props-section" style={{ paddingTop: 24 }}>
              <div className="editor-empty-state">
                <p style={{ marginBottom: 16 }}>Select an element to edit its properties.</p>
                <div style={{ fontSize: 11, lineHeight: 2 }}>
                  <div><kbd>Cmd+S</kbd> Save</div>
                  <div><kbd>Cmd+Z</kbd> Undo</div>
                  <div><kbd>Cmd+D</kbd> Duplicate</div>
                  <div><kbd>Cmd+C/V</kbd> Copy / Paste</div>
                  <div><kbd>Cmd+Up/Down</kbd> Reorder</div>
                  <div><kbd>Delete</kbd> Remove element</div>
                  <div><kbd>Escape</kbd> Deselect</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!preview && selected && (
          <div className="editor-props">
            {/* Header: name + type */}
            <div className="editor-props-header">
              <input className="editor-props-name-input" value={selected.name} onChange={(e) => doUpdate({ ...selected, name: e.target.value })} />
              <div className="editor-props-type">{selected.type}</div>
            </div>

            {/* Actions bar */}
            <div className="editor-props-actions">
              <button className="editor-action-btn" title="Duplicate (Cmd+D)" onClick={doDuplicate}><Copy size={13} /></button>
              {selected.type !== "__body" && (
                <button className="editor-action-btn danger" title="Delete" onClick={() => doDelete(selected.id)}><Trash2 size={13} /></button>
              )}
            </div>

            {/* Tabs */}
            <div className="editor-sidebar-tabs">
              <button className={`editor-sidebar-tab ${propsTab === "design" ? "active" : ""}`} onClick={() => setPropsTab("design")}>Design</button>
              <button className={`editor-sidebar-tab ${propsTab === "content" ? "active" : ""}`} onClick={() => setPropsTab("content")}>Content</button>
            </div>

            <ScrollArea className="flex-1">
              {propsTab === "content" && (
                <div className="editor-props-section">
                  {!Array.isArray(selected.content) ? (
                    Object.entries(selected.content as Record<string, string>).map(([key, val]) => (
                      <div key={key} className="editor-content-field">
                        <label className="editor-content-label">{key}</label>
                        {key === "innerText" ? (
                          <textarea value={val} onChange={(e) => doUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="editor-textarea" rows={3} />
                        ) : (
                          <Input value={val} onChange={(e) => doUpdate({ ...selected, content: { ...(selected.content as Record<string, string>), [key]: e.target.value } })} className="h-7 text-[11px]" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="editor-empty-state">Container element — no editable content. Add child elements by dragging from the sidebar.</div>
                  )}
                </div>
              )}

              {propsTab === "design" && (
                <div className="editor-props-section">
                  {propGroups.map((g) => (
                    <PropGroup key={g.title} title={g.title} props={g.props} selected={selected} onUpdate={doUpdate} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Preview exit */}
      {preview && (
        <button onClick={() => setPreview(false)} className="editor-preview-exit">
          <EyeOff size={14} /> Exit Preview
        </button>
      )}
    </div>
  );
}

// ── Small components ─────────────────────────────────────────

function SelectBadge({ name, onDelete }: { name: string; onDelete: () => void }) {
  return (
    <div className="editor-badge-select">
      <span className="editor-badge-select-name">{name}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="editor-badge-select-delete">
        <Trash2 size={10} />
      </button>
    </div>
  );
}

function HoverBadge({ name }: { name: string }) {
  return (
    <div className="editor-badge-hover">
      <span className="editor-badge-hover-name">{name}</span>
    </div>
  );
}

const colorProps = new Set(["color", "backgroundColor", "borderColor"]);

function PropGroup({ title, props, selected, onUpdate }: { title: string; props: string[]; selected: El; onUpdate: (el: El) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 4 }}>
      <button onClick={() => setOpen(!open)} className="editor-prop-group-toggle">
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />} {title}
      </button>
      {open && (
        <div className="editor-style-grid">
          {props.map((p) => {
            const val = String((selected.styles as Record<string, unknown>)[p] ?? "");
            const isColor = colorProps.has(p);
            const options = selectOptions[p];
            const update = (v: string) => onUpdate({ ...selected, styles: { ...selected.styles, [p]: v } as CSSProperties });
            return (
              <div key={p}>
                <label className="editor-prop-label">{p.replace(/([A-Z])/g, " $1")}</label>
                <div className="editor-style-field">
                  {isColor && (
                    <input type="color" value={val || "#000000"} onChange={(e) => update(e.target.value)} className="editor-color-picker" />
                  )}
                  {options ? (
                    <select value={val} onChange={(e) => update(e.target.value)} className="editor-select">
                      <option value="">—</option>
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <Input value={val} onChange={(e) => update(e.target.value)} className="h-6 text-[10px] flex-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LayerTree({ el, depth, selected, onSelect }: { el: El; depth: number; selected: El | null; onSelect: (el: El) => void }) {
  const children = Array.isArray(el.content) ? el.content : [];
  const isSel = selected?.id === el.id;
  return (
    <div>
      <button onClick={() => onSelect(el)} className={`editor-layer-btn ${isSel ? "active" : ""}`} style={{ paddingLeft: depth * 12 + 6 }}>
        {children.length > 0 && <ChevronRight size={10} />}
        {el.name}
      </button>
      {children.map((c) => <LayerTree key={c.id} el={c} depth={depth + 1} selected={selected} onSelect={onSelect} />)}
    </div>
  );
}

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

function TabsDisplay({ items }: { items: { title: string; body: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", borderBottom: "1px solid var(--ed-border-subtle)" }}>
        {items.map((item, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setActive(i); }} style={{ padding: "8px 16px", border: 0, borderBottom: active === i ? "2px solid var(--ed-interactive)" : "2px solid transparent", background: "transparent", color: active === i ? "var(--ed-interactive)" : "inherit", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {item.title}
          </button>
        ))}
      </div>
      <div style={{ padding: 16, fontSize: 14 }}>{items[active]?.body}</div>
    </div>
  );
}
