import { useState, useEffect, useRef, useCallback } from "react";

export function useCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [panning, setPanning] = useState(false);
  const [scroll, setScroll] = useState({ left: 0, top: 0, w: 0, h: 0 });
  const spaceRef = useRef(false);

  // Cmd+wheel zoom
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        setZoom((z) => Math.min(200, Math.max(25, z - Math.sign(e.deltaY) * 5)));
      }
    };
    const onScroll = () => { setScroll({ left: el.scrollLeft, top: el.scrollTop, w: el.clientWidth, h: el.clientHeight }); };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { el.removeEventListener("wheel", onWheel); el.removeEventListener("scroll", onScroll); };
  }, []);

  // Space+drag pan
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { if (e.code === "Space" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { e.preventDefault(); spaceRef.current = true; setPanning(true); } };
    const onUp = (e: KeyboardEvent) => { if (e.code === "Space") { spaceRef.current = false; setPanning(false); } };
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

  return { canvasRef, zoom, setZoom, panning, spaceRef, scroll, onCanvasPointerDown };
}
