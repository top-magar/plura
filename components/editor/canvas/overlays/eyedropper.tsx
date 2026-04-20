'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { MIcon } from '../../ui/m-icon';

/**
 * Eyedropper — click any element on canvas to sample its color.
 * Penpot: pixel_overlay.cljs (366 lines) — we use getComputedStyle instead of pixel buffer.
 */
export default function Eyedropper({ onPick, onClose }: { onPick: (color: string) => void; onClose: () => void }): ReactNode {
  const [preview, setPreview] = useState<{ color: string; x: number; y: number } | null>(null);

  const onMove = useCallback((e: React.PointerEvent) => {
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!target) return;
    const style = window.getComputedStyle(target);
    const color = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent'
      ? style.backgroundColor
      : style.color;
    // Convert rgb to hex
    const hex = rgbToHex(color);
    setPreview({ color: hex, x: e.clientX, y: e.clientY });
  }, []);

  const onClick = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (preview) onPick(preview.color);
    onClose();
  }, [preview, onPick, onClose]);

  return (
    <div className="fixed inset-0 z-[200] cursor-crosshair" onPointerMove={onMove} onPointerDown={onClick} onContextMenu={(e) => { e.preventDefault(); onClose(); }}>
      {preview && (
        <div className="fixed pointer-events-none z-[201] flex items-center gap-1.5 rounded-md bg-popover border border-border shadow-lg px-2 py-1" style={{ left: preview.x + 16, top: preview.y + 16 }}>
          <div className="size-5 rounded border border-border shrink-0" style={{ backgroundColor: preview.color }} />
          <span className="text-[10px] font-mono text-foreground">{preview.color}</span>
        </div>
      )}
      {/* Escape hint */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[201] flex items-center gap-1.5 rounded-md bg-popover border border-border shadow-lg px-3 py-1.5">
        <MIcon name="colorize" size={14} className="text-primary" />
        <span className="text-[10px] text-muted-foreground">Click to pick color · Right-click to cancel</span>
      </div>
    </div>
  );
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  const [, r, g, b] = match;
  return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}
