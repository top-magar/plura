'use client';

/** Pixel grid overlay — shown at zoom >= 800% */
export default function PixelGrid({ zoom }: { zoom: number }) {
  const z = zoom / 100;
  if (z < 8) return null;
  const size = z;
  return (
    <div className="absolute inset-0 pointer-events-none z-40" style={{
      backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.08) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.08) 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
    }} />
  );
}
