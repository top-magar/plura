/** Material Symbols Outlined icon wrapper */
export function MIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  return <span className={`material-symbols-outlined ${className ?? ''}`} style={{ fontSize: size, lineHeight: 1 }}>{name}</span>;
}
