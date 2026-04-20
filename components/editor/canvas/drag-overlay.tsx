'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type DragInfo = { label: string; x: number; y: number } | null;

const DragOverlayContext = createContext<{
  start: (label: string, e: React.DragEvent) => void;
}>({ start: () => {} });

export function useDragOverlay() { return useContext(DragOverlayContext); }

// 1x1 transparent image to hide native ghost
let emptyImg: HTMLImageElement | null = null;
function getEmptyImg() {
  if (!emptyImg) {
    emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
  return emptyImg;
}

export function DragOverlayProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<DragInfo>(null);

  const start = useCallback((label: string, e: React.DragEvent) => {
    e.dataTransfer.setDragImage(getEmptyImg(), 0, 0);
    setInfo({ label, x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!info) return;
    const onDrag = (e: DragEvent) => {
      // dragover fires on document with coordinates
      if (e.clientX === 0 && e.clientY === 0) return; // browser sends 0,0 at end
      setInfo(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    };
    const onEnd = () => setInfo(null);
    document.addEventListener('dragover', onDrag);
    document.addEventListener('dragend', onEnd);
    document.addEventListener('drop', onEnd);
    return () => {
      document.removeEventListener('dragover', onDrag);
      document.removeEventListener('dragend', onEnd);
      document.removeEventListener('drop', onEnd);
    };
  }, [!!info]);

  return (
    <DragOverlayContext.Provider value={{ start }}>
      {children}
      {info && createPortal(
        <div
          className="pointer-events-none fixed z-[9999]"
          style={{ left: info.x + 12, top: info.y - 12 }}
        >
          <div className="rounded-lg border border-primary/30 bg-background px-3 py-2 text-xs font-medium shadow-lg whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-150">
            {info.label}
          </div>
        </div>,
        document.body
      )}
    </DragOverlayContext.Provider>
  );
}
