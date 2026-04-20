'use client';

import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { MIcon } from '../../ui/m-icon';

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  const [, r, g, b] = match;
  return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

export default function Eyedropper({ onPick, onClose }: { onPick: (color: string) => void; onClose: () => void }): ReactNode {
  const [preview, setPreview] = useState<{ color: string; x: number; y: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sampleAt = useCallback((x: number, y: number): string | null => {
    const el = overlayRef.current;
    if (!el) return null;
    // Hide overlay so elementFromPoint hits the actual canvas elements
    el.style.pointerEvents = 'none';
    const target = document.elementFromPoint(x, y) as HTMLElement | null;
    el.style.pointerEvents = '';
    if (!target) return null;
    const style = window.getComputedStyle(target);
    const bg = style.backgroundColor;
    const color = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' ? bg : style.color;
    return rgbToHex(color);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    const color = sampleAt(e.clientX, e.clientY);
    if (color) setPreview({ color, x: e.clientX, y: e.clientY });
  }, [sampleAt]);

  const onClick = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const color = sampleAt(e.clientX, e.clientY);
    if (color) {
      onPick(color);
      navigator.clipboard.writeText(color).catch(() => {});
    }
    onClose();
  }, [sampleAt, onPick, onClose]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[200] cursor-crosshair" onPointerMove={onMove} onPointerDown={onClick} onContextMenu={(e) => { e.preventDefault(); onClose(); }}>
      {preview && (
        <div className="fixed pointer-events-none z-[201]" style={{ left: preview.x + 20, top: preview.y + 20 }}>
          <div className="rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
            <div className="size-12 border-b border-border" style={{ backgroundColor: preview.color }} />
            <div className="px-2 py-1 flex items-center gap-1.5">
              <div className="size-3 rounded-sm border border-border shrink-0" style={{ backgroundColor: preview.color }} />
              <span className="text-[10px] font-mono text-foreground">{preview.color}</span>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[201] flex items-center gap-1.5 rounded-md bg-popover border border-border shadow-lg px-3 py-1.5">
        <MIcon name="colorize" size={14} className="text-primary" />
        <span className="text-[10px] text-muted-foreground">Click to pick · Esc or right-click to cancel</span>
      </div>
    </div>
  );
}
