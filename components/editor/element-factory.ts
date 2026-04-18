import { v4 } from "uuid";
import type { El } from "./types";
import {
  Type, Link2, Image, Layout, Columns2, Columns3, Video, Contact, CreditCard,
  ChevronDown, GripVertical, Heading1, Heading2, List, SeparatorHorizontal,
  Square, Code, Quote, Star, MapPin, Phone, Globe, CheckSquare, Minus, Timer,
  PanelBottom, Share2, CodeXml, ImageIcon, Navigation, Rows3, Bookmark,
} from "lucide-react";

export function makeEl(type: string): El | null {
  const id = v4();
  const m: Record<string, () => El> = {
    text: () => ({ id, type: "text", name: "Text", styles: { fontSize: "16px" }, content: { innerText: "Edit this text" } }),
    heading: () => ({ id, type: "text", name: "Heading", styles: { fontSize: "36px", fontWeight: "700", lineHeight: "1.2" }, content: { innerText: "Heading" } }),
    subheading: () => ({ id, type: "text", name: "Subheading", styles: { fontSize: "20px", fontWeight: "500", opacity: "0.7" }, content: { innerText: "Subheading text goes here" } }),
    link: () => ({ id, type: "link", name: "Link", styles: { color: "#6366f1", textDecoration: "underline" }, content: { innerText: "Click here", href: "#" } }),
    button: () => ({ id, type: "button", name: "Button", styles: { padding: "12px 24px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "14px", fontWeight: "600", textAlign: "center", cursor: "pointer" }, content: { innerText: "Click Me", href: "#" } }),
    image: () => ({ id, type: "image", name: "Image", styles: { width: "100%" }, content: { src: "", alt: "Image" } }),
    video: () => ({ id, type: "video", name: "Video", styles: { width: "100%" }, content: { src: "https://www.youtube.com/embed/dQw4w9WgXcQ" } }),
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
    divider: () => ({ id, type: "divider", name: "Divider", styles: { borderTop: "1px solid #333", margin: "16px 0" }, content: {} }),
    spacer: () => ({ id, type: "spacer", name: "Spacer", styles: { height: "48px" }, content: {} }),
    quote: () => ({ id, type: "quote", name: "Quote", styles: { padding: "16px 24px", borderLeft: "3px solid #6366f1", fontStyle: "italic", fontSize: "18px" }, content: { innerText: "This is a quote block" } }),
    badge: () => ({ id, type: "badge", name: "Badge", styles: { display: "inline-block", padding: "4px 12px", fontSize: "12px", fontWeight: "600", backgroundColor: "#6366f1", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }, content: { innerText: "New" } }),
    list: () => ({ id, type: "list", name: "List", styles: { padding: "0 0 0 20px", fontSize: "16px", lineHeight: "1.8" }, content: { innerText: "First item\nSecond item\nThird item" } }),
    code: () => ({ id, type: "code", name: "Code Block", styles: { padding: "16px", backgroundColor: "#111", fontFamily: "monospace", fontSize: "13px", whiteSpace: "pre-wrap", overflow: "auto" }, content: { innerText: "const hello = 'world';" } }),
    contactForm: () => ({ id, type: "contactForm", name: "Contact Form", styles: { padding: "16px" }, content: {} }),
    paymentForm: () => ({ id, type: "paymentForm", name: "Payment", styles: { padding: "16px" }, content: {} }),
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
    footer: () => ({ id, type: "footer", name: "Footer", styles: { padding: "32px 24px", textAlign: "center", fontSize: "13px", opacity: "0.5" }, content: { innerText: "© 2026 Your Company. All rights reserved." } }),
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
  return m[type]?.() ?? null;
}

export const componentGroups = [
  { label: "Layout", items: [
    { type: "container", label: "Container", icon: Square, color: "#8b5cf6" },
    { type: "section", label: "Section", icon: Layout, color: "#7c3aed" },
    { type: "2Col", label: "2 Columns", icon: Columns2, color: "#7c3aed" },
    { type: "3Col", label: "3 Columns", icon: Columns3, color: "#6d28d9" },
    { type: "4Col", label: "4 Columns", icon: GripVertical, color: "#5b21b6" },
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
