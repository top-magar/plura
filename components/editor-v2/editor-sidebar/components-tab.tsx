'use client';

import React from 'react';
import {
  LayoutGrid,
  Columns2,
  Columns3,
  Type,
  Link,
  Image,
  Video,
  Contact,
  CreditCard,
} from 'lucide-react';

const groups = [
  {
    label: 'Layout',
    items: [
      { type: 'container', label: 'Container', icon: LayoutGrid },
      { type: '2Col', label: '2 Columns', icon: Columns2 },
      { type: '3Col', label: '3 Columns', icon: Columns3 },
    ],
  },
  {
    label: 'Elements',
    items: [
      { type: 'text', label: 'Text', icon: Type },
      { type: 'link', label: 'Link', icon: Link },
      { type: 'image', label: 'Image', icon: Image },
      { type: 'video', label: 'Video', icon: Video },
    ],
  },
  {
    label: 'Forms',
    items: [
      { type: 'contactForm', label: 'Contact', icon: Contact },
      { type: 'paymentForm', label: 'Payment', icon: CreditCard },
    ],
  },
];

export default function ComponentsTab() {
  function handleDragStart(e: React.DragEvent, type: string) {
    e.dataTransfer.setData('componentType', type);
  }

  return (
    <div className="p-3 overflow-y-auto flex-1">
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '8px' }}>
            {group.label}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {group.items.map((item) => (
              <div
                key={item.type}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 border border-border cursor-grab bg-background transition-colors hover:bg-accent"
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
              >
                <item.icon size={20} />
                <span style={{ fontSize: '12px' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
