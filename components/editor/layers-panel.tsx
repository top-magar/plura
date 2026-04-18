"use client";

import { useState } from "react";
import {
  ChevronRight, ChevronDown,
  Type, Link2, Image, Video, Layout, Columns2, Minus, Square,
  Quote, Star, Code, List, MapPin, Timer, Navigation,
  PanelBottom, Share2, CodeXml, ImageIcon, CreditCard, Contact,
  Heading1, CheckSquare, Rows3, Globe,
} from "lucide-react";
import type { El } from "./types";

// Color + icon per element type
const typeConfig: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; label: string }> = {
  __body:       { icon: Globe,       color: "#6366f1", label: "Body" },
  container:    { icon: Square,      color: "#8b5cf6", label: "Container" },
  "2Col":       { icon: Columns2,    color: "#8b5cf6", label: "2 Columns" },
  "3Col":       { icon: Columns2,    color: "#8b5cf6", label: "3 Columns" },
  "4Col":       { icon: Columns2,    color: "#8b5cf6", label: "4 Columns" },
  text:         { icon: Type,        color: "#3b82f6", label: "Text" },
  link:         { icon: Link2,       color: "#06b6d4", label: "Link" },
  button:       { icon: CheckSquare, color: "#6366f1", label: "Button" },
  image:        { icon: Image,       color: "#22c55e", label: "Image" },
  video:        { icon: Video,       color: "#ef4444", label: "Video" },
  divider:      { icon: Minus,       color: "#64748b", label: "Divider" },
  spacer:       { icon: Layout,      color: "#64748b", label: "Spacer" },
  quote:        { icon: Quote,       color: "#f59e0b", label: "Quote" },
  badge:        { icon: Star,        color: "#f59e0b", label: "Badge" },
  icon:         { icon: Star,        color: "#ec4899", label: "Icon" },
  list:         { icon: List,        color: "#3b82f6", label: "List" },
  code:         { icon: Code,        color: "#10b981", label: "Code" },
  accordion:    { icon: ChevronDown, color: "#f97316", label: "Accordion" },
  tabs:         { icon: Rows3,       color: "#f97316", label: "Tabs" },
  countdown:    { icon: Timer,       color: "#ef4444", label: "Countdown" },
  navbar:       { icon: Navigation,  color: "#6366f1", label: "Navbar" },
  footer:       { icon: PanelBottom, color: "#64748b", label: "Footer" },
  embed:        { icon: CodeXml,     color: "#a855f7", label: "Embed" },
  socialIcons:  { icon: Share2,      color: "#3b82f6", label: "Social" },
  map:          { icon: MapPin,      color: "#22c55e", label: "Map" },
  gallery:      { icon: ImageIcon,   color: "#22c55e", label: "Gallery" },
  contactForm:  { icon: Contact,     color: "#06b6d4", label: "Form" },
  paymentForm:  { icon: CreditCard,  color: "#f59e0b", label: "Payment" },
};

const fallback = { icon: Square, color: "#64748b", label: "Element" };

export function LayerTree({ el, depth, selected, onSelect }: { el: El; depth: number; selected: El | null; onSelect: (el: El) => void }) {
  const children = Array.isArray(el.content) ? el.content : [];
  const hasChildren = children.length > 0;
  const [expanded, setExpanded] = useState(depth < 2);
  const isSel = selected?.id === el.id;
  const config = typeConfig[el.type] || fallback;
  const Icon = config.icon;

  return (
    <div>
      <button
        onClick={() => onSelect(el)}
        className={`editor-layer-btn ${isSel ? "active" : ""}`}
        style={{ paddingLeft: depth * 14 + 4 }}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <span
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="layer-chevron"
          >
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
        ) : (
          <span className="layer-chevron-spacer" />
        )}

        {/* Colored type icon */}
        <span style={{ color: config.color, display: "flex", flexShrink: 0 }}><Icon size={12} /></span>

        {/* Name */}
        <span className="layer-name">{el.name}</span>

        {/* Child count badge */}
        {hasChildren && (
          <span className="layer-count">{children.length}</span>
        )}
      </button>

      {/* Children */}
      {expanded && children.map((c) => (
        <LayerTree key={c.id} el={c} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}
