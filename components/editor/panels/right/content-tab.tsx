"use client";

import { useState } from "react";
import { MIcon } from "../../ui/m-icon";
import { Input } from "@/components/ui/input";
import type { El } from "../../core/types";
import { cn } from "@/lib/utils";

// ─── Field type detection ───────────────────────────────

type FieldType = 'text' | 'textarea' | 'url' | 'code' | 'date' | 'number' | 'csv' | 'json' | 'image';

function detectFieldType(key: string, val: string): FieldType {
  if (key === 'innerText' && val.length > 60) return 'textarea';
  if (key === 'innerText') return 'text';
  if (key === 'code') return 'code';
  if (key === 'src' || key === 'href') return 'url';
  if (key === 'alt' || key === 'brand') return 'text';
  if (key === 'targetDate') return 'date';
  if (key === 'zoom') return 'number';
  if (key === 'images' || key === 'platforms' || key === 'links') return 'csv';
  if (key === 'items') return 'json';
  return 'text';
}

const fieldIcons: Record<string, string> = {
  innerText: 'text_fields', src: 'link', href: 'link', alt: 'image',
  code: 'code', address: 'location_on', zoom: 'zoom_in', brand: 'branding_watermark',
  links: 'menu', platforms: 'share', images: 'photo_library', items: 'list',
  targetDate: 'schedule',
};

const fieldLabels: Record<string, string> = {
  innerText: 'Text', src: 'Source URL', href: 'Link URL', alt: 'Alt text',
  code: 'HTML Code', address: 'Address', zoom: 'Zoom level', brand: 'Brand name',
  links: 'Nav links', platforms: 'Platforms', images: 'Image URLs', items: 'Items (JSON)',
  targetDate: 'Target date',
};

// ─── Smart Field Component ──────────────────────────────

function ContentField({ fieldKey, value, onChange }: { fieldKey: string; value: string; onChange: (v: string) => void }) {
  const type = detectFieldType(fieldKey, value);
  const icon = fieldIcons[fieldKey] ?? 'edit';
  const label = fieldLabels[fieldKey] ?? fieldKey;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <MIcon name={icon} size={12} className="text-sidebar-foreground/40" />
        <label className="text-[10px] font-medium text-sidebar-foreground/50">{label}</label>
        {type === 'url' && value && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="ml-auto text-primary/60 hover:text-primary"><MIcon name="open_in_new" size={11} /></a>
        )}
        {value && (
          <button onClick={() => onChange('')} className="ml-auto text-sidebar-foreground/30 hover:text-destructive"><MIcon name="close" size={11} /></button>
        )}
      </div>

      {type === 'textarea' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-sidebar-border bg-sidebar p-2 text-[11px] outline-none resize-y focus:border-primary min-h-[60px]" rows={3} />
      )}

      {type === 'text' && (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" />
      )}

      {type === 'url' && (
        <>
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px] font-mono" placeholder="https://..." />
          {/* Image preview for src fields */}
          {fieldKey === 'src' && value && /\.(jpg|jpeg|png|gif|webp|svg)/i.test(value) && (
            <img src={value} alt="" className="mt-1.5 rounded-md border border-sidebar-border w-full h-20 object-cover" />
          )}
        </>
      )}

      {type === 'code' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-sidebar-border bg-sidebar p-2 text-[10px] font-mono outline-none resize-y focus:border-primary min-h-[80px]" rows={4} spellCheck={false} />
      )}

      {type === 'date' && (
        <Input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" />
      )}

      {type === 'number' && (
        <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" />
      )}

      {type === 'csv' && (
        <>
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-[11px]" placeholder="item1,item2,item3" />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {value.split(',').filter(Boolean).map((item, i) => (
              <span key={i} className="inline-flex items-center gap-0.5 h-5 px-1.5 rounded bg-sidebar-accent text-[9px] text-sidebar-foreground/70">
                {item.trim()}
                <button onClick={() => onChange(value.split(',').filter((_, j) => j !== i).join(','))} className="text-sidebar-foreground/30 hover:text-destructive"><MIcon name="close" size={9} /></button>
              </span>
            ))}
          </div>
        </>
      )}

      {type === 'json' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-sidebar-border bg-sidebar p-2 text-[10px] font-mono outline-none resize-y focus:border-primary min-h-[80px]" rows={4} spellCheck={false} />
      )}

      {/* Character count for text fields */}
      {(type === 'text' || type === 'textarea') && value && (
        <span className="text-[9px] text-sidebar-foreground/30 mt-0.5 block text-right">{value.length} chars</span>
      )}
    </div>
  );
}

// ─── Main Content Tab ───────────────────────────────────

export default function ContentTab({ selected, onUpdate }: { selected: El; onUpdate: (el: El) => void }) {
  const content = selected.content;
  const isContainer = Array.isArray(content);
  const entries = !isContainer ? Object.entries(content as Record<string, string>) : [];
  const hasContent = entries.length > 0;

  if (hasContent) {
    return (
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {entries.map(([key, val]) => (
            <ContentField
              key={key}
              fieldKey={key}
              value={val}
              onChange={(v) => onUpdate({ ...selected, content: { ...(content as Record<string, string>), [key]: v } })}
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  const childCount = isContainer ? (content as El[]).length : 0;
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <MIcon name={isContainer ? "dashboard_customize" : "block"} size={28} className="text-muted-foreground/15 mx-auto mb-2" />
        <p className="text-[11px] text-muted-foreground/40 font-medium">
          {isContainer ? `Container` : "No content"}
        </p>
        {isContainer && (
          <p className="text-[10px] text-muted-foreground/30 mt-0.5">{childCount} {childCount === 1 ? 'child' : 'children'}</p>
        )}
      </div>
    </div>
  );
}
