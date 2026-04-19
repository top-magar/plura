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
    <div className="px-2 pb-2 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.label} className="mb-3">
          <p className="text-[10px] font-semibold uppercase text-sidebar-foreground/50 mb-1.5 px-1">
            {group.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {group.items.map((item) => (
              <div
                key={item.type}
                className="flex flex-col items-center justify-center gap-0.5 py-2 px-1.5 rounded-md border border-sidebar-border cursor-grab bg-sidebar hover:bg-sidebar-accent transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
              >
                <item.icon className="size-4 text-sidebar-foreground/70" />
                <span className="text-[11px] text-sidebar-foreground/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
