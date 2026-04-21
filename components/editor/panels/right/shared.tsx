"use client";

import { useState, type ReactNode } from "react";
import { MIcon } from "../../ui/m-icon";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPicker } from "../../ui/color-picker";
import { Input } from "@/components/ui/input";

export type IconOpt = { value: string; label: string; icon: ReactNode };

/** Ensure value has px suffix */
export function px(v: string): string {
  const n = parseFloat(v);
  return isNaN(n) ? v : `${n}px`;
}

/** Strip px suffix, return raw number string */
export function strip(v: string): string {
  return String(parseFloat(v) || 0);
}

export const selectOptions: Record<string, string[]> = {
  display: ["block", "flex", "grid", "inline", "inline-block", "none"],
  overflow: ["visible", "hidden", "auto", "scroll"],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  cursor: ["default", "pointer", "text", "move", "not-allowed"],
  borderStyle: ["none", "solid", "dashed", "dotted"],
  backgroundSize: ["auto", "cover", "contain"],
  backgroundPosition: ["center", "top", "bottom", "left", "right"],
  objectFit: ["fill", "contain", "cover", "none"],
};

export function IconToggle({ value, options, onChange }: { value: string; options: IconOpt[]; onChange: (v: string) => void }) {
  return (
    <TooltipProvider delayDuration={200}>
      <ToggleGroup type="single" value={value} onValueChange={(v) => { if (v) onChange(v); }} className="flex w-full gap-px rounded-md overflow-hidden border border-sidebar-border">
        {options.map((o) => (
          <Tooltip key={o.value}><TooltipTrigger asChild>
            <ToggleGroupItem value={o.value} className="flex h-6 min-w-0 flex-1 items-center justify-center rounded-none border-0 bg-sidebar p-0 text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" aria-label={o.label}>
              {o.icon}
            </ToggleGroupItem>
          </TooltipTrigger><TooltipContent side="bottom" className="text-[10px] px-2 py-0.5">{o.label}</TooltipContent></Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}

export function Section({ title, icon, defaultOpen = true, onAdd, action, children }: { title: string; icon: string; defaultOpen?: boolean; onAdd?: () => void; action?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-sidebar-border">
      <div className="flex items-center h-8 px-3 hover:bg-sidebar-accent/50 transition-colors">
        <CollapsibleTrigger className="flex flex-1 items-center gap-1.5 text-[11px] font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer">
          <MIcon name={open ? "expand_more" : "chevron_right"} size={12} className="text-sidebar-foreground/40" />
          <MIcon name={icon} size={13} className="text-sidebar-foreground/50" />
          <span>{title}</span>
        </CollapsibleTrigger>
        {action}
        {onAdd && (
          <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="flex size-5 items-center justify-center rounded text-sidebar-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors">
            <MIcon name="add" size={14} />
          </button>
        )}
      </div>
      <CollapsibleContent className="px-3 pb-3 pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function ColorField({ label, value, alpha, onChange, onAlphaChange }: { label: string; value: string; alpha?: number; onChange: (v: string) => void; onAlphaChange?: (a: number) => void }) {
  const showAlpha = onAlphaChange !== undefined;
  return (
    <div>
      {label && <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex h-6 w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar px-2 hover:border-sidebar-foreground/30 cursor-pointer">
            <span className="size-3.5 shrink-0 rounded-sm border border-sidebar-border" style={{ background: value || "transparent", opacity: alpha ?? 1 }} />
            <span className="text-[10px] text-sidebar-foreground/60 truncate">{value || "none"}</span>
            {showAlpha && alpha !== undefined && alpha < 1 && <span className="text-[9px] text-muted-foreground/40 ml-auto">{Math.round(alpha * 100)}%</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-3" side="left" align="start">
          <ColorPicker color={value || "#000000"} alpha={alpha} onChange={onChange} onAlphaChange={onAlphaChange} showAlpha={showAlpha} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      {label && <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">{label}</label>}
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-6 text-[10px]" placeholder={placeholder} />
    </div>
  );
}

export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      {label && <label className="mb-0.5 block text-[10px] text-sidebar-foreground/50">{label}</label>}
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-5 text-[10px] px-2"><SelectValue placeholder="—" /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

// Icon option sets
export const textAlignOpts: IconOpt[] = [
  { value: "left", label: "Left", icon: <MIcon name="format_align_left" /> },
  { value: "center", label: "Center", icon: <MIcon name="format_align_center" /> },
  { value: "right", label: "Right", icon: <MIcon name="format_align_right" /> },
  { value: "justify", label: "Justify", icon: <MIcon name="format_align_justify" /> },
];
export const fontStyleOpts: IconOpt[] = [
  { value: "normal", label: "Normal", icon: <MIcon name="text_fields" /> },
  { value: "italic", label: "Italic", icon: <MIcon name="format_italic" /> },
];
export const textDecoOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <MIcon name="text_fields" /> },
  { value: "underline", label: "Underline", icon: <MIcon name="format_underlined" /> },
  { value: "line-through", label: "Strike", icon: <MIcon name="format_strikethrough" /> },
];
export const textTransOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <MIcon name="horizontal_rule" /> },
  { value: "uppercase", label: "Upper", icon: <MIcon name="title" /> },
  { value: "lowercase", label: "Lower", icon: <MIcon name="text_fields" /> },
  { value: "capitalize", label: "Cap", icon: <MIcon name="format_size" /> },
];
export const justifyOpts: IconOpt[] = [
  { value: "flex-start", label: "Start", icon: <MIcon name="align_horizontal_left" /> },
  { value: "center", label: "Center", icon: <MIcon name="align_horizontal_center" /> },
  { value: "flex-end", label: "End", icon: <MIcon name="align_horizontal_right" /> },
  { value: "space-between", label: "Between", icon: <MIcon name="horizontal_distribute" /> },
  { value: "space-around", label: "Around", icon: <MIcon name="horizontal_distribute" /> },
];
export const alignOpts: IconOpt[] = [
  { value: "flex-start", label: "Start", icon: <MIcon name="align_vertical_top" /> },
  { value: "center", label: "Center", icon: <MIcon name="align_vertical_center" /> },
  { value: "flex-end", label: "End", icon: <MIcon name="align_vertical_bottom" /> },
  { value: "stretch", label: "Stretch", icon: <MIcon name="expand" /> },
];
export const directionOpts: IconOpt[] = [
  { value: "row", label: "Row", icon: <MIcon name="arrow_forward" /> },
  { value: "column", label: "Column", icon: <MIcon name="arrow_downward" /> },
  { value: "row-reverse", label: "Row Rev", icon: <MIcon name="arrow_back" /> },
  { value: "column-reverse", label: "Col Rev", icon: <MIcon name="arrow_upward" /> },
];
export const wrapOpts: IconOpt[] = [
  { value: "nowrap", label: "No Wrap", icon: <MIcon name="arrow_forward" /> },
  { value: "wrap", label: "Wrap", icon: <MIcon name="wrap_text" /> },
];
export const borderStyleOpts: IconOpt[] = [
  { value: "none", label: "None", icon: <MIcon name="horizontal_rule" /> },
  { value: "solid", label: "Solid", icon: <MIcon name="remove" /> },
  { value: "dashed", label: "Dashed", icon: <MIcon name="line_style" /> },
];

export type StyleProps = {
  get: (p: string) => string;
  set: (p: string, v: string) => void;
};
