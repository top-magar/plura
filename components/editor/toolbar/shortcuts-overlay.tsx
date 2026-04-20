'use client';

import { MIcon } from '../ui/m-icon';

const groups = [
  { title: 'General', shortcuts: [
    { keys: '⌘ S', action: 'Save' },
    { keys: '⌘ Z', action: 'Undo' },
    { keys: '⌘ ⇧ Z', action: 'Redo' },
    { keys: '⌘ D', action: 'Duplicate' },
    { keys: '⌘ C / V', action: 'Copy / Paste' },
    { keys: '⌘ ⌥ C', action: 'Copy styles' },
    { keys: '⌘ ⌥ V', action: 'Paste styles' },
    { keys: 'Del', action: 'Delete element' },
    { keys: 'Esc', action: 'Select parent' },
    { keys: '⌘ A', action: 'Select body' },
  ]},
  { title: 'Navigation', shortcuts: [
    { keys: '⌘ + / −', action: 'Zoom in / out' },
    { keys: '⌘ 0', action: 'Zoom to 100%' },
    { keys: '⌘ Wheel', action: 'Zoom' },
    { keys: 'Space + Drag', action: 'Pan canvas' },
    { keys: 'Alt', action: 'Duplicate cursor' },
  ]},
  { title: 'Elements', shortcuts: [
    { keys: '↑ / ↓', action: 'Reorder element' },
    { keys: '⌘ ↑ / ↓', action: 'Move in tree' },
    { keys: 'Double-click', action: 'Edit text' },
    { keys: 'Right-click', action: 'Context menu' },
  ]},
  { title: 'Handles', shortcuts: [
    { keys: 'Drag edge', action: 'Adjust padding/margin' },
    { keys: 'Alt + Drag', action: 'Adjust opposite side' },
    { keys: 'Alt + ⇧ + Drag', action: 'Adjust all sides' },
    { keys: 'Drag corner dot', action: 'Adjust border radius' },
    { keys: 'Drag gap pill', action: 'Adjust gap' },
  ]},
];

export default function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-popover border border-border rounded-xl shadow-2xl w-[520px] max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <MIcon name="close" size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">{g.title}</h3>
              <div className="space-y-1">
                {g.shortcuts.map(({ keys, action }) => (
                  <div key={keys} className="flex items-center justify-between py-0.5">
                    <span className="text-[11px] text-foreground/70">{action}</span>
                    <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">{keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground/40 mt-4 text-center">Press <kbd className="rounded border border-border px-1 py-px text-[8px]">?</kbd> to toggle</p>
      </div>
    </div>
  );
}
