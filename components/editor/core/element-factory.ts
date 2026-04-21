import { v4 } from "uuid";
import type { El } from "./types";
import {
  Type, Link2, Image, Layout, Columns2, Columns3, Video, Contact, CreditCard,
  ChevronDown, GripVertical, Heading1, Heading2, List, SeparatorHorizontal,
  Square, Code, Quote, Star, MapPin, Phone, Globe, CheckSquare, Minus, Timer,
  PanelBottom, Share2, CodeXml, ImageIcon, Navigation, Rows3, Bookmark,
  LayoutGrid, PanelTop, RectangleHorizontal,
} from "lucide-react";

export function makeEl(type: string): El | null {
  const id = v4();
  // Per-type default sizes for freeform canvas
  const sizes: Record<string, { w: number; h: number }> = {
    text: { w: 300, h: 40 }, heading: { w: 500, h: 60 }, subheading: { w: 400, h: 40 },
    link: { w: 100, h: 30 }, button: { w: 160, h: 48 }, badge: { w: 80, h: 28 },
    image: { w: 400, h: 300 }, video: { w: 560, h: 315 }, gallery: { w: 600, h: 400 },
    icon: { w: 48, h: 48 }, divider: { w: 400, h: 2 }, spacer: { w: 400, h: 48 },
    quote: { w: 500, h: 80 }, list: { w: 300, h: 120 }, code: { w: 500, h: 120 },
    container: { w: 600, h: 400 }, section: { w: 800, h: 500 },
    row: { w: 800, h: 200 }, column: { w: 300, h: 400 },
    "2Col": { w: 800, h: 200 }, "3Col": { w: 800, h: 200 }, "4Col": { w: 800, h: 200 },
    grid: { w: 600, h: 400 }, card: { w: 360, h: 300 },
    header: { w: 800, h: 64 }, navbar: { w: 800, h: 64 }, footer: { w: 800, h: 200 },
    hero: { w: 800, h: 500 }, cta: { w: 800, h: 300 },
    testimonial: { w: 500, h: 200 }, pricing: { w: 360, h: 400 },
    features: { w: 800, h: 300 }, stats: { w: 800, h: 200 },
    accordion: { w: 500, h: 200 }, tabs: { w: 500, h: 200 }, countdown: { w: 500, h: 120 },
    contactForm: { w: 400, h: 300 }, paymentForm: { w: 400, h: 300 },
    embed: { w: 500, h: 300 }, socialIcons: { w: 300, h: 60 }, map: { w: 500, h: 300 },
  };
  const { w, h } = sizes[type] ?? { w: 400, h: 100 };
  const m: Record<string, () => El> = {
    text: () => ({ id, type: "text", name: "Text", styles: { fontSize: "16px", width: "100%" }, content: { innerText: "Edit this text" } }),
    heading: () => ({ id, type: "text", name: "Heading", styles: { fontSize: "36px", fontWeight: "700", lineHeight: "1.2", width: "100%" }, content: { innerText: "Heading" } }),
    subheading: () => ({ id, type: "text", name: "Subheading", styles: { fontSize: "20px", fontWeight: "500", opacity: "0.7", width: "100%" }, content: { innerText: "Subheading text goes here" } }),
    link: () => ({ id, type: "link", name: "Link", styles: { color: "#6366f1", textDecoration: "underline" }, content: { innerText: "Click here", href: "#" } }),
    button: () => ({ id, type: "button", name: "Button", styles: { padding: "12px 24px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer", width: "fit-content", borderRadius: "6px" }, content: { innerText: "Click Me", href: "#" } }),
    image: () => ({ id, type: "image", name: "Image", styles: { width: "100%", objectFit: "cover" }, content: { src: "", alt: "Image" } }),
    video: () => ({ id, type: "video", name: "Video", styles: { width: "100%" }, content: { src: "https://www.youtube.com/embed/dQw4w9WgXcQ" } }),
    container: () => ({ id, type: "container", name: "Container", styles: { display: "flex", flexDirection: "column", gap: "16px", padding: "24px", width: "100%" }, content: [] }),
    row: () => ({ id, type: "row", name: "Row", styles: { display: "flex", flexDirection: "row", gap: "24px", width: "100%", alignItems: "stretch" }, content: [
      { id: v4(), type: "column", name: "Col 1", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
      { id: v4(), type: "column", name: "Col 2", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
    ] as El[] }),
    column: () => ({ id, type: "column", name: "Column", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] }),
    section: () => ({ id, type: "section", name: "Section", styles: { display: "flex", flexDirection: "column", gap: "24px", padding: "80px 24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }, content: [] }),
    "2Col": () => ({ id, type: "2Col", name: "2 Columns", styles: { display: "flex", gap: "24px", width: "100%" }, content: [
      { id: v4(), type: "column", name: "Col 1", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
      { id: v4(), type: "column", name: "Col 2", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
    ]}),
    "3Col": () => ({ id, type: "3Col", name: "3 Columns", styles: { display: "flex", gap: "24px", width: "100%" }, content: [
      { id: v4(), type: "column", name: "Col 1", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
      { id: v4(), type: "column", name: "Col 2", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
      { id: v4(), type: "column", name: "Col 3", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
    ]}),
    "4Col": () => ({ id, type: "4Col", name: "4 Columns", styles: { display: "flex", gap: "24px", width: "100%" }, content: [
      { id: v4(), type: "column", name: "Col 1", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
      { id: v4(), type: "column", name: "Col 2", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
      { id: v4(), type: "column", name: "Col 3", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
      { id: v4(), type: "column", name: "Col 4", styles: { display: "flex", flexDirection: "column", gap: "16px", flex: "1", padding: "16px" }, content: [] },
    ]}),
    divider: () => ({ id, type: "divider", name: "Divider", styles: { borderTop: "1px solid currentColor", margin: "16px 0", opacity: "0.2" }, content: {} }),
    spacer: () => ({ id, type: "spacer", name: "Spacer", styles: { height: "48px" }, content: {} }),
    quote: () => ({ id, type: "quote", name: "Quote", styles: { padding: "16px 24px", borderLeft: "3px solid #6366f1", fontStyle: "italic", fontSize: "18px" }, content: { innerText: "This is a quote block" } }),
    badge: () => ({ id, type: "badge", name: "Badge", styles: { display: "inline-block", padding: "4px 12px", fontSize: "12px", fontWeight: "600", backgroundColor: "#6366f1", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }, content: { innerText: "New" } }),
    list: () => ({ id, type: "list", name: "List", styles: { padding: "0 0 0 20px", fontSize: "16px", lineHeight: "1.8" }, content: { innerText: "First item\nSecond item\nThird item" } }),
    code: () => ({ id, type: "code", name: "Code Block", styles: { padding: "16px", backgroundColor: "#111", fontFamily: "monospace", fontSize: "13px", whiteSpace: "pre-wrap", overflow: "auto" }, content: { innerText: "const hello = 'world';" } }),
    contactForm: () => ({ id, type: "contactForm", name: "Contact Form", styles: { padding: "16px" }, content: {} }),
    paymentForm: () => ({ id, type: "paymentForm", name: "Payment", styles: { padding: "16px" }, content: {} }),
    hero: () => ({ id, type: "hero", name: "Hero", styles: { display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", padding: "96px 24px", textAlign: "center", width: "100%" }, content: [
      { id: v4(), type: "text", name: "Hero Title", styles: { fontSize: "56px", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.02em", width: "100%", maxWidth: "720px" }, content: { innerText: "Build Something Amazing" } },
      { id: v4(), type: "text", name: "Hero Subtitle", styles: { fontSize: "20px", opacity: "0.6", lineHeight: "1.6", width: "100%", maxWidth: "560px" }, content: { innerText: "Create beautiful websites and funnels with our drag-and-drop builder." } },
      { id: v4(), type: "button", name: "Hero CTA", styles: { padding: "16px 40px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "16px", fontWeight: "600", borderRadius: "8px", width: "fit-content" }, content: { innerText: "Get Started", href: "#" } },
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
    navbar: () => ({ id, type: "navbar", name: "Navbar", styles: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }, content: { brand: "Brand", links: "Home,About,Services,Contact" } }),
    footer: () => ({ id, type: "footer", name: "Footer", styles: { display: "flex", flexDirection: "column", gap: "16px", padding: "48px 24px", textAlign: "center", width: "100%", marginTop: "auto", borderTop: "1px solid currentColor", opacity: "0.9" }, content: [
      { id: v4(), type: "text", name: "Copyright", styles: { fontSize: "13px", opacity: "0.4", width: "100%" }, content: { innerText: "© 2026 Your Company. All rights reserved." } },
    ] as El[] }),
    grid: () => ({ id, type: "grid", name: "Grid", styles: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "24px", width: "100%" }, content: [] }),
    header: () => ({ id, type: "header", name: "Header", styles: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", width: "100%", position: "sticky", top: "0", zIndex: "10", backgroundColor: "#ffffff", borderBottom: "1px solid #f0f0f0" }, content: [] }),
    card: () => ({ id, type: "card", name: "Card", styles: { display: "flex", flexDirection: "column", gap: "16px", padding: "32px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)" }, content: [] }),
    embed: () => ({ id, type: "embed", name: "Embed", styles: { padding: "16px", minHeight: "60px" }, content: { code: "<p style='color:#888;text-align:center'>Paste HTML here</p>" } }),
    socialIcons: () => ({ id, type: "socialIcons", name: "Social Icons", styles: { display: "flex", gap: "12px", justifyContent: "center", padding: "16px", fontSize: "20px" }, content: { platforms: "X,Facebook,Instagram,LinkedIn,YouTube" } }),
    map: () => ({ id, type: "map", name: "Map", styles: { width: "100%", height: "300px" }, content: { address: "New York, NY", zoom: "13" } }),
    gallery: () => ({ id, type: "gallery", name: "Gallery", styles: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "8px" }, content: { images: "https://placehold.co/400x300/111/333?text=1,https://placehold.co/400x300/111/333?text=2,https://placehold.co/400x300/111/333?text=3,https://placehold.co/400x300/111/333?text=4,https://placehold.co/400x300/111/333?text=5,https://placehold.co/400x300/111/333?text=6" } }),
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
  const raw = m[type]?.() ?? null;
  if (!raw) return null;
  // Inject freeform defaults on root element only — children inside containers use flow layout
  return { ...raw, x: 0, y: 0, w, h };
}

// Hug-by-default element types — these shouldn't stretch full width
const hugTypes = new Set(["button", "badge", "link", "icon", "socialIcons"]);

/** Create an element with styles adapted to its parent context */
export function makeElInContext(type: string, parent: El): El | null {
  const el = makeEl(type);
  if (!el) return el;

  // Only root-level elements (direct children of body) get freeform coords
  // Nested elements inside containers use flow layout
  if (parent.type !== '__body') {
    delete el.x; delete el.y; delete el.w; delete el.h;
  }

  const parentIsRow = parent.styles.flexDirection === "row" || parent.styles.flexDirection === "row-reverse";
  const parentIsFlex = parent.styles.display === "flex" || parent.styles.display === "inline-flex";

  // Hug elements: don't stretch
  if (hugTypes.has(type)) {
    el.styles.width = "fit-content";
    if (parentIsFlex) el.styles.alignSelf = "flex-start";
    return el;
  }

  // In a row parent: use flex:1 instead of width:100%
  if (parentIsRow && parentIsFlex) {
    delete el.styles.width;
    el.styles.flex = "1";
    if (type === "image") el.styles.objectFit = "cover";
  }

  // Navbar: always full width + sticky
  if (type === "navbar") {
    el.styles.width = "100%";
    el.styles.position = "sticky";
    el.styles.top = "0";
    el.styles.zIndex = "10";
  }

  // Footer: push to bottom
  if (type === "footer") {
    el.styles.width = "100%";
    el.styles.marginTop = "auto";
  }

  return el;
}

export const componentGroups = [
  { label: "Layout", items: [
    { type: "section", label: "Section", icon: Layout, color: "#7c3aed" },
    { type: "container", label: "Container", icon: Square, color: "#8b5cf6" },
    { type: "row", label: "Row", icon: Columns2, color: "#6d28d9" },
    { type: "grid", label: "Grid", icon: LayoutGrid, color: "#5b21b6" },
    { type: "header", label: "Header", icon: PanelTop, color: "#7c3aed" },
    { type: "card", label: "Card", icon: RectangleHorizontal, color: "#8b5cf6" },
    { type: "divider", label: "Divider", icon: Minus, color: "#94a3b8" },
    { type: "spacer", label: "Spacer", icon: SeparatorHorizontal, color: "#64748b" },
  ]},
  { label: "Typography", items: [
    { type: "heading", label: "Heading", icon: Heading1, color: "#3b82f6" },
    { type: "subheading", label: "Subheading", icon: Heading2, color: "#60a5fa" },
    { type: "text", label: "Paragraph", icon: Type, color: "#3b82f6" },
    { type: "list", label: "List", icon: List, color: "#06b6d4" },
    { type: "quote", label: "Quote", icon: Quote, color: "#f59e0b" },
    { type: "badge", label: "Badge", icon: Star, color: "#eab308" },
    { type: "code", label: "Code", icon: Code, color: "#10b981" },
    { type: "icon", label: "Icon", icon: Star, color: "#ec4899" },
  ]},
  { label: "Media & Links", items: [
    { type: "image", label: "Image", icon: Image, color: "#22c55e" },
    { type: "video", label: "Video", icon: Video, color: "#ef4444" },
    { type: "gallery", label: "Gallery", icon: ImageIcon, color: "#84cc16" },
    { type: "link", label: "Link", icon: Link2, color: "#0ea5e9" },
    { type: "button", label: "Button", icon: CheckSquare, color: "#2563eb" },
    { type: "map", label: "Map", icon: MapPin, color: "#16a34a" },
    { type: "embed", label: "Embed", icon: CodeXml, color: "#a855f7" },
    { type: "socialIcons", label: "Social Icons", icon: Share2, color: "#14b8a6" },
  ]},
  { label: "Interactive", items: [
    { type: "accordion", label: "Accordion", icon: ChevronDown, color: "#f97316" },
    { type: "tabs", label: "Tabs", icon: Rows3, color: "#fb923c" },
    { type: "countdown", label: "Countdown", icon: Timer, color: "#e11d48" },
  ]},
  { label: "Navigation", items: [
    { type: "navbar", label: "Navbar", icon: Navigation, color: "#4f46e5" },
    { type: "footer", label: "Footer", icon: PanelBottom, color: "#475569" },
  ]},
  { label: "Forms", items: [
    { type: "contactForm", label: "Contact", icon: Contact, color: "#0891b2" },
    { type: "paymentForm", label: "Payment", icon: CreditCard, color: "#d97706" },
  ]},
  { label: "Blocks", items: [
    { type: "hero", label: "Hero", icon: Globe, color: "#6366f1" },
    { type: "cta", label: "CTA", icon: Phone, color: "#2563eb" },
    { type: "testimonial", label: "Testimonial", icon: Quote, color: "#f59e0b" },
    { type: "pricing", label: "Pricing", icon: CreditCard, color: "#d97706" },
    { type: "features", label: "Features", icon: Columns3, color: "#8b5cf6" },
    { type: "stats", label: "Stats", icon: Heading1, color: "#3b82f6" },
  ]},
];
