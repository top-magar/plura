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
    contactForm: () => ({ id, type: "contactForm", name: "Contact Form", styles: { display: "flex", flexDirection: "column", gap: "20px", padding: "40px", width: "100%", maxWidth: "480px", borderRadius: "16px", border: "1px solid #e5e7eb" }, content: [
      { id: v4(), type: "text", name: "Form Title", styles: { fontSize: "24px", fontWeight: "700" }, content: { innerText: "Get in Touch" } },
      { id: v4(), type: "text", name: "Form Desc", styles: { fontSize: "14px", opacity: "0.6", lineHeight: "1.5" }, content: { innerText: "Fill out the form below and we will get back to you within 24 hours." } },
      { id: v4(), type: "container", name: "Name Row", styles: { display: "flex", gap: "12px", width: "100%" }, content: [
        { id: v4(), type: "container", name: "First Name", styles: { display: "flex", flexDirection: "column", gap: "6px", flex: "1" }, content: [
          { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "500" }, content: { innerText: "First Name" } },
          { id: v4(), type: "container", name: "Input", styles: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fafafa" }, content: [
            { id: v4(), type: "text", name: "Placeholder", styles: { fontSize: "14px", opacity: "0.4" }, content: { innerText: "John" } },
          ] as El[] },
        ] as El[] },
        { id: v4(), type: "container", name: "Last Name", styles: { display: "flex", flexDirection: "column", gap: "6px", flex: "1" }, content: [
          { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "500" }, content: { innerText: "Last Name" } },
          { id: v4(), type: "container", name: "Input", styles: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fafafa" }, content: [
            { id: v4(), type: "text", name: "Placeholder", styles: { fontSize: "14px", opacity: "0.4" }, content: { innerText: "Doe" } },
          ] as El[] },
        ] as El[] },
      ] as El[] },
      { id: v4(), type: "container", name: "Email Field", styles: { display: "flex", flexDirection: "column", gap: "6px" }, content: [
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "500" }, content: { innerText: "Email" } },
        { id: v4(), type: "container", name: "Input", styles: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fafafa" }, content: [
          { id: v4(), type: "text", name: "Placeholder", styles: { fontSize: "14px", opacity: "0.4" }, content: { innerText: "john@example.com" } },
        ] as El[] },
      ] as El[] },
      { id: v4(), type: "container", name: "Message Field", styles: { display: "flex", flexDirection: "column", gap: "6px" }, content: [
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "500" }, content: { innerText: "Message" } },
        { id: v4(), type: "container", name: "Textarea", styles: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fafafa", minHeight: "100px" }, content: [
          { id: v4(), type: "text", name: "Placeholder", styles: { fontSize: "14px", opacity: "0.4" }, content: { innerText: "Your message..." } },
        ] as El[] },
      ] as El[] },
      { id: v4(), type: "button", name: "Submit", styles: { padding: "12px 24px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "15px", fontWeight: "600", borderRadius: "8px", width: "100%", textAlign: "center" }, content: { innerText: "Send Message", href: "#" } },
    ] as El[] }),
    paymentForm: () => ({ id, type: "paymentForm", name: "Payment", styles: { display: "flex", flexDirection: "column", gap: "20px", padding: "40px", width: "100%", maxWidth: "420px", borderRadius: "16px", border: "1px solid #e5e7eb" }, content: [
      { id: v4(), type: "text", name: "Title", styles: { fontSize: "20px", fontWeight: "700" }, content: { innerText: "Payment Details" } },
      { id: v4(), type: "container", name: "Card Number", styles: { display: "flex", flexDirection: "column", gap: "6px" }, content: [
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "500" }, content: { innerText: "Card Number" } },
        { id: v4(), type: "container", name: "Input", styles: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fafafa" }, content: [
          { id: v4(), type: "text", name: "Placeholder", styles: { fontSize: "14px", opacity: "0.4", fontFamily: "monospace" }, content: { innerText: "4242 4242 4242 4242" } },
        ] as El[] },
      ] as El[] },
      { id: v4(), type: "container", name: "Row", styles: { display: "flex", gap: "12px" }, content: [
        { id: v4(), type: "container", name: "Expiry", styles: { display: "flex", flexDirection: "column", gap: "6px", flex: "1" }, content: [
          { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "500" }, content: { innerText: "Expiry" } },
          { id: v4(), type: "container", name: "Input", styles: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fafafa" }, content: [
            { id: v4(), type: "text", name: "Placeholder", styles: { fontSize: "14px", opacity: "0.4" }, content: { innerText: "MM/YY" } },
          ] as El[] },
        ] as El[] },
        { id: v4(), type: "container", name: "CVC", styles: { display: "flex", flexDirection: "column", gap: "6px", flex: "1" }, content: [
          { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "500" }, content: { innerText: "CVC" } },
          { id: v4(), type: "container", name: "Input", styles: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", backgroundColor: "#fafafa" }, content: [
            { id: v4(), type: "text", name: "Placeholder", styles: { fontSize: "14px", opacity: "0.4" }, content: { innerText: "123" } },
          ] as El[] },
        ] as El[] },
      ] as El[] },
      { id: v4(), type: "button", name: "Pay", styles: { padding: "14px 24px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "15px", fontWeight: "600", borderRadius: "8px", width: "100%", textAlign: "center" }, content: { innerText: "Pay $49.00", href: "#" } },
    ] as El[] }),
    hero: () => ({ id, type: "hero", name: "Hero", styles: { display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", padding: "96px 24px", textAlign: "center", width: "100%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }, content: [
      { id: v4(), type: "badge", name: "Badge", styles: { display: "inline-block", padding: "6px 16px", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(99,102,241,0.15)", color: "#818cf8", borderRadius: "100px", letterSpacing: "0.5px" }, content: { innerText: "Now in Beta" } },
      { id: v4(), type: "text", name: "Hero Title", styles: { fontSize: "56px", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.02em", width: "100%", maxWidth: "720px", color: "#ffffff" }, content: { innerText: "Build Something Amazing" } },
      { id: v4(), type: "text", name: "Hero Subtitle", styles: { fontSize: "20px", opacity: "0.6", lineHeight: "1.6", width: "100%", maxWidth: "560px", color: "#ffffff" }, content: { innerText: "Create beautiful websites and funnels with our drag-and-drop builder. No code required." } },
      { id: v4(), type: "container", name: "CTA Row", styles: { display: "flex", gap: "12px", justifyContent: "center", alignItems: "center" }, content: [
        { id: v4(), type: "button", name: "Primary CTA", styles: { padding: "16px 40px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "16px", fontWeight: "600", borderRadius: "8px", width: "fit-content" }, content: { innerText: "Get Started Free", href: "#" } },
        { id: v4(), type: "button", name: "Secondary CTA", styles: { padding: "16px 40px", backgroundColor: "transparent", color: "#ffffff", fontSize: "16px", fontWeight: "600", borderRadius: "8px", width: "fit-content", border: "1px solid rgba(255,255,255,0.2)" }, content: { innerText: "Watch Demo", href: "#" } },
      ] as El[] },
    ] as El[] }),
    cta: () => ({ id, type: "container", name: "CTA Block", styles: { display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", padding: "64px 24px", textAlign: "center", backgroundColor: "#6366f1", borderRadius: "16px", width: "100%" }, content: [
      { id: v4(), type: "text", name: "CTA Title", styles: { fontSize: "32px", fontWeight: "700", color: "#ffffff", lineHeight: "1.2" }, content: { innerText: "Ready to get started?" } },
      { id: v4(), type: "text", name: "CTA Text", styles: { fontSize: "18px", color: "#ffffff", opacity: "0.8", maxWidth: "480px" }, content: { innerText: "Join thousands of happy customers building their dream websites today." } },
      { id: v4(), type: "container", name: "CTA Row", styles: { display: "flex", gap: "12px", justifyContent: "center", alignItems: "center" }, content: [
        { id: v4(), type: "button", name: "CTA Button", styles: { padding: "14px 32px", backgroundColor: "#ffffff", color: "#6366f1", fontSize: "15px", fontWeight: "600", borderRadius: "8px", width: "fit-content" }, content: { innerText: "Sign Up Free", href: "#" } },
        { id: v4(), type: "link", name: "Learn More", styles: { color: "#ffffff", fontSize: "15px", fontWeight: "500", textDecoration: "underline", textUnderlineOffset: "4px" }, content: { innerText: "Learn more", href: "#" } },
      ] as El[] },
    ] as El[] }),
    testimonial: () => ({ id, type: "container", name: "Testimonial", styles: { display: "flex", flexDirection: "column", gap: "20px", padding: "40px", backgroundColor: "#111", borderRadius: "16px", width: "100%" }, content: [
      { id: v4(), type: "text", name: "Stars", styles: { fontSize: "20px", letterSpacing: "4px", color: "#facc15" }, content: { innerText: "★★★★★" } },
      { id: v4(), type: "text", name: "Quote", styles: { fontSize: "20px", fontStyle: "italic", lineHeight: "1.7", color: "#e2e8f0" }, content: { innerText: "\"This product completely transformed how our team works. The intuitive interface and powerful features saved us countless hours. Highly recommended!\"" } },
      { id: v4(), type: "container", name: "Author Row", styles: { display: "flex", gap: "12px", alignItems: "center" }, content: [
        { id: v4(), type: "container", name: "Avatar", styles: { width: "48px", height: "48px", borderRadius: "100px", backgroundColor: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "18px", fontWeight: "700", flexShrink: "0" }, content: [
          { id: v4(), type: "text", name: "Initial", styles: { fontSize: "18px", fontWeight: "700", color: "#ffffff" }, content: { innerText: "J" } },
        ] as El[] },
        { id: v4(), type: "container", name: "Author Info", styles: { display: "flex", flexDirection: "column", gap: "2px" }, content: [
          { id: v4(), type: "text", name: "Name", styles: { fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }, content: { innerText: "Jane Doe" } },
          { id: v4(), type: "text", name: "Role", styles: { fontSize: "13px", color: "#94a3b8" }, content: { innerText: "CEO at TechCorp" } },
        ] as El[] },
      ] as El[] },
    ] as El[] }),
    pricing: () => ({ id, type: "container", name: "Pricing Card", styles: { display: "flex", flexDirection: "column", gap: "24px", padding: "40px", textAlign: "center", border: "1px solid #e5e7eb", borderRadius: "16px", width: "100%" }, content: [
      { id: v4(), type: "badge", name: "Plan Badge", styles: { display: "inline-block", padding: "4px 12px", fontSize: "12px", fontWeight: "600", backgroundColor: "rgba(99,102,241,0.1)", color: "#6366f1", borderRadius: "100px", letterSpacing: "0.5px", alignSelf: "center" }, content: { innerText: "Most Popular" } },
      { id: v4(), type: "text", name: "Plan Name", styles: { fontSize: "20px", fontWeight: "600" }, content: { innerText: "Pro Plan" } },
      { id: v4(), type: "container", name: "Price Row", styles: { display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }, content: [
        { id: v4(), type: "text", name: "Price", styles: { fontSize: "56px", fontWeight: "800", lineHeight: "1" }, content: { innerText: "$49" } },
        { id: v4(), type: "text", name: "Period", styles: { fontSize: "16px", opacity: "0.5" }, content: { innerText: "/month" } },
      ] as El[] },
      { id: v4(), type: "text", name: "Description", styles: { fontSize: "15px", opacity: "0.6", lineHeight: "1.5" }, content: { innerText: "Everything you need to build and grow your online presence." } },
      { id: v4(), type: "container", name: "Features List", styles: { display: "flex", flexDirection: "column", gap: "12px", textAlign: "left", padding: "0 8px" }, content: [
        { id: v4(), type: "text", name: "Feature 1", styles: { fontSize: "14px", lineHeight: "1.5" }, content: { innerText: "-- Unlimited projects" } },
        { id: v4(), type: "text", name: "Feature 2", styles: { fontSize: "14px", lineHeight: "1.5" }, content: { innerText: "-- Custom domains" } },
        { id: v4(), type: "text", name: "Feature 3", styles: { fontSize: "14px", lineHeight: "1.5" }, content: { innerText: "-- Priority support" } },
        { id: v4(), type: "text", name: "Feature 4", styles: { fontSize: "14px", lineHeight: "1.5" }, content: { innerText: "-- Analytics dashboard" } },
      ] as El[] },
      { id: v4(), type: "button", name: "CTA", styles: { padding: "14px 24px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "15px", fontWeight: "600", width: "100%", borderRadius: "8px" }, content: { innerText: "Get Started", href: "#" } },
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
    navbar: () => ({ id, type: "navbar", name: "Navbar", styles: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", width: "100%", backgroundColor: "#ffffff", borderBottom: "1px solid #f0f0f0" }, content: [
      { id: v4(), type: "text", name: "Brand", styles: { fontSize: "20px", fontWeight: "700", letterSpacing: "-0.02em" }, content: { innerText: "Brand" } },
      { id: v4(), type: "container", name: "Nav Links", styles: { display: "flex", gap: "32px", alignItems: "center" }, content: [
        { id: v4(), type: "link", name: "Home", styles: { fontSize: "14px", fontWeight: "500", color: "inherit", textDecoration: "none" }, content: { innerText: "Home", href: "#" } },
        { id: v4(), type: "link", name: "About", styles: { fontSize: "14px", fontWeight: "500", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "About", href: "#" } },
        { id: v4(), type: "link", name: "Services", styles: { fontSize: "14px", fontWeight: "500", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "Services", href: "#" } },
        { id: v4(), type: "link", name: "Contact", styles: { fontSize: "14px", fontWeight: "500", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "Contact", href: "#" } },
      ] as El[] },
      { id: v4(), type: "button", name: "Nav CTA", styles: { padding: "8px 20px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "13px", fontWeight: "600", borderRadius: "6px", width: "fit-content" }, content: { innerText: "Sign Up", href: "#" } },
    ] as El[] }),
    footer: () => ({ id, type: "footer", name: "Footer", styles: { display: "flex", flexDirection: "column", gap: "40px", padding: "64px 32px 32px", width: "100%", borderTop: "1px solid #e5e7eb" }, content: [
      { id: v4(), type: "container", name: "Footer Cols", styles: { display: "flex", gap: "48px", width: "100%" }, content: [
        { id: v4(), type: "container", name: "Brand Col", styles: { display: "flex", flexDirection: "column", gap: "12px", flex: "1.5" }, content: [
          { id: v4(), type: "text", name: "Brand", styles: { fontSize: "20px", fontWeight: "700" }, content: { innerText: "Brand" } },
          { id: v4(), type: "text", name: "Tagline", styles: { fontSize: "14px", opacity: "0.5", lineHeight: "1.6", maxWidth: "280px" }, content: { innerText: "Building the future of web design, one pixel at a time." } },
        ] as El[] },
        { id: v4(), type: "container", name: "Product Col", styles: { display: "flex", flexDirection: "column", gap: "10px", flex: "1" }, content: [
          { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", opacity: "0.4", marginBottom: "4px" }, content: { innerText: "Product" } },
          { id: v4(), type: "link", name: "Link 1", styles: { fontSize: "14px", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "Features", href: "#" } },
          { id: v4(), type: "link", name: "Link 2", styles: { fontSize: "14px", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "Pricing", href: "#" } },
          { id: v4(), type: "link", name: "Link 3", styles: { fontSize: "14px", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "Changelog", href: "#" } },
        ] as El[] },
        { id: v4(), type: "container", name: "Company Col", styles: { display: "flex", flexDirection: "column", gap: "10px", flex: "1" }, content: [
          { id: v4(), type: "text", name: "Label", styles: { fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", opacity: "0.4", marginBottom: "4px" }, content: { innerText: "Company" } },
          { id: v4(), type: "link", name: "Link 1", styles: { fontSize: "14px", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "About", href: "#" } },
          { id: v4(), type: "link", name: "Link 2", styles: { fontSize: "14px", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "Blog", href: "#" } },
          { id: v4(), type: "link", name: "Link 3", styles: { fontSize: "14px", color: "inherit", textDecoration: "none", opacity: "0.6" }, content: { innerText: "Careers", href: "#" } },
        ] as El[] },
      ] as El[] },
      { id: v4(), type: "divider", name: "Divider", styles: { borderTop: "1px solid currentColor", opacity: "0.1" }, content: {} },
      { id: v4(), type: "text", name: "Copyright", styles: { fontSize: "13px", opacity: "0.35", textAlign: "center" }, content: { innerText: "2026 Your Company. All rights reserved." } },
    ] as El[] }),
    grid: () => ({ id, type: "grid", name: "Grid", styles: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "24px", width: "100%" }, content: [] }),
    header: () => ({ id, type: "header", name: "Header", styles: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", width: "100%", position: "sticky", top: "0", zIndex: "10", backgroundColor: "#ffffff", borderBottom: "1px solid #f0f0f0" }, content: [
      { id: v4(), type: "text", name: "Logo", styles: { fontSize: "18px", fontWeight: "700" }, content: { innerText: "Logo" } },
      { id: v4(), type: "container", name: "Actions", styles: { display: "flex", gap: "12px", alignItems: "center" }, content: [
        { id: v4(), type: "link", name: "Login", styles: { fontSize: "14px", fontWeight: "500", color: "inherit", textDecoration: "none" }, content: { innerText: "Log in", href: "#" } },
        { id: v4(), type: "button", name: "Signup", styles: { padding: "8px 20px", backgroundColor: "#6366f1", color: "#ffffff", fontSize: "13px", fontWeight: "600", borderRadius: "6px", width: "fit-content" }, content: { innerText: "Sign Up", href: "#" } },
      ] as El[] },
    ] as El[] }),
    card: () => ({ id, type: "card", name: "Card", styles: { display: "flex", flexDirection: "column", gap: "16px", padding: "0", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)" }, content: [
      { id: v4(), type: "image", name: "Card Image", styles: { width: "100%", height: "200px", objectFit: "cover" }, content: { src: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image", alt: "Card image" } },
      { id: v4(), type: "container", name: "Card Body", styles: { display: "flex", flexDirection: "column", gap: "8px", padding: "24px" }, content: [
        { id: v4(), type: "text", name: "Card Title", styles: { fontSize: "18px", fontWeight: "600", lineHeight: "1.3" }, content: { innerText: "Card Title" } },
        { id: v4(), type: "text", name: "Card Text", styles: { fontSize: "14px", opacity: "0.6", lineHeight: "1.6" }, content: { innerText: "A brief description of this card's content goes here. Keep it concise and informative." } },
        { id: v4(), type: "link", name: "Card Link", styles: { fontSize: "14px", fontWeight: "600", color: "#6366f1", textDecoration: "none", marginTop: "8px" }, content: { innerText: "Learn more →", href: "#" } },
      ] as El[] },
    ] as El[] }),
    embed: () => ({ id, type: "embed", name: "Embed", styles: { padding: "16px", minHeight: "60px" }, content: { code: "<p style='color:#888;text-align:center'>Paste HTML here</p>" } }),
    socialIcons: () => ({ id, type: "socialIcons", name: "Social Icons", styles: { display: "flex", gap: "12px", justifyContent: "center", padding: "16px", fontSize: "20px" }, content: { platforms: "X,Facebook,Instagram,LinkedIn,YouTube" } }),
    map: () => ({ id, type: "map", name: "Map", styles: { width: "100%", height: "300px" }, content: { address: "New York, NY", zoom: "13" } }),
    gallery: () => ({ id, type: "gallery", name: "Gallery", styles: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "8px" }, content: { images: "https://placehold.co/400x300/111/333?text=1,https://placehold.co/400x300/111/333?text=2,https://placehold.co/400x300/111/333?text=3,https://placehold.co/400x300/111/333?text=4,https://placehold.co/400x300/111/333?text=5,https://placehold.co/400x300/111/333?text=6" } }),
    features: () => ({ id, type: "3Col", name: "Features", styles: { display: "flex", gap: "32px", padding: "64px 24px", width: "100%" }, content: [
      { id: v4(), type: "container", name: "Feature 1", styles: { flex: "1", display: "flex", flexDirection: "column", gap: "12px", padding: "24px" }, content: [
        { id: v4(), type: "container", name: "Icon", styles: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }, content: [
          { id: v4(), type: "text", name: "Ico", styles: { fontSize: "20px" }, content: { innerText: "~" } },
        ] as El[] },
        { id: v4(), type: "text", name: "Title", styles: { fontSize: "18px", fontWeight: "600" }, content: { innerText: "Lightning Fast" } },
        { id: v4(), type: "text", name: "Desc", styles: { fontSize: "14px", opacity: "0.6", lineHeight: "1.6" }, content: { innerText: "Optimized for speed with sub-second load times across all devices." } },
      ] as El[] },
      { id: v4(), type: "container", name: "Feature 2", styles: { flex: "1", display: "flex", flexDirection: "column", gap: "12px", padding: "24px" }, content: [
        { id: v4(), type: "container", name: "Icon", styles: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }, content: [
          { id: v4(), type: "text", name: "Ico", styles: { fontSize: "20px" }, content: { innerText: "#" } },
        ] as El[] },
        { id: v4(), type: "text", name: "Title", styles: { fontSize: "18px", fontWeight: "600" }, content: { innerText: "Secure by Default" } },
        { id: v4(), type: "text", name: "Desc", styles: { fontSize: "14px", opacity: "0.6", lineHeight: "1.6" }, content: { innerText: "Enterprise-grade security with end-to-end encryption and SOC 2 compliance." } },
      ] as El[] },
      { id: v4(), type: "container", name: "Feature 3", styles: { flex: "1", display: "flex", flexDirection: "column", gap: "12px", padding: "24px" }, content: [
        { id: v4(), type: "container", name: "Icon", styles: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }, content: [
          { id: v4(), type: "text", name: "Ico", styles: { fontSize: "20px" }, content: { innerText: "?" } },
        ] as El[] },
        { id: v4(), type: "text", name: "Title", styles: { fontSize: "18px", fontWeight: "600" }, content: { innerText: "24/7 Support" } },
        { id: v4(), type: "text", name: "Desc", styles: { fontSize: "14px", opacity: "0.6", lineHeight: "1.6" }, content: { innerText: "Our dedicated team is always available to help you succeed." } },
      ] as El[] },
    ] as El[] }),
    stats: () => ({ id, type: "container", name: "Stats", styles: { display: "flex", justifyContent: "center", gap: "64px", padding: "64px 24px", textAlign: "center", width: "100%" }, content: [
      { id: v4(), type: "container", name: "Stat 1", styles: { display: "flex", flexDirection: "column", gap: "4px" }, content: [
        { id: v4(), type: "text", name: "Num", styles: { fontSize: "48px", fontWeight: "800", lineHeight: "1", color: "#6366f1" }, content: { innerText: "10K+" } },
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "14px", fontWeight: "500", opacity: "0.5" }, content: { innerText: "Active Users" } },
      ] as El[] },
      { id: v4(), type: "container", name: "Stat 2", styles: { display: "flex", flexDirection: "column", gap: "4px" }, content: [
        { id: v4(), type: "text", name: "Num", styles: { fontSize: "48px", fontWeight: "800", lineHeight: "1", color: "#6366f1" }, content: { innerText: "99.9%" } },
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "14px", fontWeight: "500", opacity: "0.5" }, content: { innerText: "Uptime" } },
      ] as El[] },
      { id: v4(), type: "container", name: "Stat 3", styles: { display: "flex", flexDirection: "column", gap: "4px" }, content: [
        { id: v4(), type: "text", name: "Num", styles: { fontSize: "48px", fontWeight: "800", lineHeight: "1", color: "#6366f1" }, content: { innerText: "150+" } },
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "14px", fontWeight: "500", opacity: "0.5" }, content: { innerText: "Countries" } },
      ] as El[] },
      { id: v4(), type: "container", name: "Stat 4", styles: { display: "flex", flexDirection: "column", gap: "4px" }, content: [
        { id: v4(), type: "text", name: "Num", styles: { fontSize: "48px", fontWeight: "800", lineHeight: "1", color: "#6366f1" }, content: { innerText: "4.9" } },
        { id: v4(), type: "text", name: "Label", styles: { fontSize: "14px", fontWeight: "500", opacity: "0.5" }, content: { innerText: "Star Rating" } },
      ] as El[] },
    ] as El[] }),
  };
  return m[type]?.() ?? null;
}

// Hug-by-default element types — these shouldn't stretch full width
const hugTypes = new Set(["button", "badge", "link", "icon", "socialIcons"]);

/** Create an element with styles adapted to its parent context */
export function makeElInContext(type: string, parent: El): El | null {
  const el = makeEl(type);
  if (!el) return el;

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
