'use client';

/** Pixel grid overlay — shown at zoom >= 800%. Renders inside [data-canvas] which is already scaled. */
export default function PixelGrid({ zoom }: { zoom: number }) {
  if (zoom < 800) return null;
  // Container is already scaled by transform: scale(zoom/100)
  // So 1px here = 1 CSS pixel of the design = zoom/100 screen pixels
  return (
    <div className="absolute inset-0 pointer-events-none z-40" style={{
      backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.08) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.08) 1px, transparent 1px)`,
      backgroundSize: '1px 1px',
    }} />
  );
}
