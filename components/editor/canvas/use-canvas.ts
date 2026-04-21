import { useState, useEffect, useRef, useCallback } from "react";

export function useCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [panning, setPanning] = useState(false);
  const [altHeld, setAltHeld] = useState(false);
  const [scroll, setScroll] = useState({ left: 0, top: 0, w: 0, h: 0 });
  const spaceRef = useRef(false);

  // RAF-batched zoom accumulator
  const zoomAccum = useRef({ delta: 0, raf: 0 });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        zoomAccum.current.delta += -Math.sign(e.deltaY) * 5;
        if (!zoomAccum.current.raf) {
          zoomAccum.current.raf = requestAnimationFrame(() => {
            const d = zoomAccum.current.delta;
            zoomAccum.current.delta = 0;
            zoomAccum.current.raf = 0;
            setZoom((z) => Math.min(200, Math.max(25, z + d)));
          });
        }
      }
    };
    const onScroll = () => {
      setScroll({ left: el.scrollLeft, top: el.scrollTop, w: el.clientWidth, h: el.clientHeight });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      if (zoomAccum.current.raf) cancelAnimationFrame(zoomAccum.current.raf);
    };
  }, []);

  // Space+drag pan + Alt tracking
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { e.preventDefault(); spaceRef.current = true; setPanning(true); }
      if (e.key === "Alt") setAltHeld(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") { spaceRef.current = false; setPanning(false); }
      if (e.key === "Alt") setAltHeld(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  const onCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (!spaceRef.current || !canvasRef.current) return;
    e.preventDefault();
    const el = canvasRef.current;
    const sx = e.clientX, sy = e.clientY;
    const sl = el.scrollLeft, st = el.scrollTop;
    const onMove = (ev: PointerEvent) => { el.scrollLeft = sl - (ev.clientX - sx); el.scrollTop = st - (ev.clientY - sy); };
    const onUp = () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, []);

  // Dynamic cursor
  const cursor = panning ? "cursor-grab active:cursor-grabbing" : altHeld ? "cursor-copy" : "";

  return { canvasRef, zoom, setZoom, panning, altHeld, spaceRef, scroll, onCanvasPointerDown, cursor };
}
