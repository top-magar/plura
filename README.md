# Plura

White-labeled multi-tenant SaaS platform for agency owners. Build websites and funnels with a full-screen drag-and-drop editor.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App                             │
├──────────┬──────────────────────────────────────┬───────────────┤
│          │              Editor                   │               │
│  Clerk   │  ┌────────────────────────────────┐  │   Stripe      │
│  Auth    │  │         Toolbar / Navigation    │  │   Payments    │
│          │  ├──────┬─────────────────┬────────┤  │               │
│          │  │ Left │                 │ Right  │  │               │
│          │  │Panel │     Canvas      │ Panel  │  │               │
│          │  │      │                 │        │  │               │
│          │  │ ┌──┐ │  ┌───────────┐  │ Design │  │               │
│          │  │ │C │ │  │  Recursive │  │ Content│  │               │
│          │  │ │o │ │  │  Element   │  │        │  │               │
│          │  │ │m │ │  │  Renderer  │  │ ┌────┐ │  │               │
│          │  │ │p │ │  └───────────┘  │ │Menu│ │  │               │
│          │  │ │s │ │                 │ │ s  │ │  │               │
│          │  │ ├──┤ │  ┌───────────┐  │ └────┘ │  │               │
│          │  │ │L │ │  │  Overlays  │  │        │  │               │
│          │  │ │a │ │  │  & Handles │  │        │  │               │
│          │  │ │y │ │  └───────────┘  │        │  │               │
│          │  │ │r │ │                 │        │  │               │
│          │  │ │s │ │  ┌───────────┐  │        │  │               │
│          │  │ ├──┤ │  │  Rulers   │  │        │  │               │
│          │  │ │T │ │  │  & Guides │  │        │  │               │
│          │  │ │pl│ │  └───────────┘  │        │  │               │
│          │  │ └──┘ │                 │        │  │               │
│          │  ├──────┴─────────────────┴────────┤  │               │
│          │  │           Breadcrumb             │  │               │
│          │  └────────────────────────────────┘  │               │
├──────────┴──────────────────────────────────────┴───────────────┤
│                     PostgreSQL (Neon)                            │
│                     Appwrite Storage                             │
└─────────────────────────────────────────────────────────────────┘
```

## Editor File Map

```
components/editor/                    77 files, ~5300 lines
├── editor.tsx                        Entry point — shell, overlays, breadcrumb
├── core/
│   ├── types.ts                      El type, Device, resolveStyles
│   ├── provider.tsx                  EditorProvider + useEditor (15 actions, undo/redo)
│   ├── tree-helpers.ts               addEl, deleteEl, moveEl, reorderEl, cloneEl
│   ├── element-factory.ts            makeEl, 36+ element types, componentGroups
│   └── use-shortcuts.ts              Keyboard shortcuts (Cmd+Z/S/D/C/V, arrows, zoom)
├── canvas/
│   ├── element-wrapper.tsx           Selection ring, toolbar, context menu, smart handles
│   ├── container.tsx                 Drop zones, gap handles, style splitting
│   ├── recursive.tsx                 Element type → component router
│   ├── drag-overlay.tsx              Portal-based drag ghost
│   ├── use-canvas.ts                 Zoom, pan, scroll, Alt tracking
│   ├── handles/                      11 files
│   │   ├── use-handles.ts            Drag hook + CSS shorthand helpers
│   │   ├── box-zone.tsx              Padding/margin colored overlay
│   │   ├── box-handle.tsx            Interactive drag target
│   │   ├── radius-corners.tsx        4 corner dots for border-radius
│   │   ├── gap-handle.tsx            Flex gap adjuster (DOM-measured)
│   │   ├── resize-handles.tsx        8-point width/height resize
│   │   ├── dimensions-badge.tsx      W×H badge
│   │   └── font-size-handle.tsx      Vertical drag for font size
│   ├── overlays/                     10 files
│   │   ├── rulers.tsx                Canvas rulers (RAF loop, cached colors)
│   │   ├── guides.tsx                Draggable guide lines
│   │   ├── snap-guides.tsx           Alignment snap lines
│   │   ├── snap-distances.tsx        Alt+hover distance measurement
│   │   ├── grid-editor.tsx           CSS grid track editor
│   │   ├── gradient-editor.tsx       Gradient angle handle
│   │   ├── pixel-grid.tsx            Pixel grid at high zoom
│   │   ├── marquee.tsx               Selection rectangle
│   │   └── eyedropper.tsx            Color picker from canvas
│   └── elements/                     22 leaf element renderers
├── panels/
│   ├── left/
│   │   ├── left-panel.tsx            Icon rail + 3 tabs
│   │   ├── components-tab.tsx        Draggable component library (list/grid view)
│   │   ├── layers-tab.tsx            Tree view with DnD reordering
│   │   └── templates-tab.tsx         Pre-built section templates
│   └── right/
│       ├── right-panel.tsx           Collapsible properties panel
│       ├── settings-tab.tsx          Element name, actions, tab switcher
│       ├── design-tab.tsx            Style properties (compose menus per type)
│       ├── content-tab.tsx           Smart content fields (text/url/csv/code/date)
│       ├── shared.tsx                Reusable UI (Section, ColorField, IconToggle)
│       └── menus/                    9 decomposed property sections
├── toolbar/
│   └── navigation.tsx                Device toggle, zoom, save, publish, page settings
└── ui/
    ├── m-icon.tsx                    Material Symbols helper
    └── color-picker.tsx              HSV color picker (ramp/wheel/HSVA tabs + eyedropper)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (inline, no CSS files) |
| UI Components | shadcn/ui |
| Auth | Clerk |
| Database | PostgreSQL via Neon |
| Storage | Appwrite |
| Payments | Stripe |
| Icons | Material Symbols Outlined (Google Fonts CDN) |
| Font | Inter |
| Package Manager | pnpm |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editor Features

- **36+ element types** — layout, typography, media, interactive, forms, blocks
- **Visual handles** — padding (green), margin (orange), gap (pink), radius (dots), resize (8-point)
- **Smart overlays** — context-aware, priority-based visibility
- **Drag and drop** — canvas drop zones, layer tree reordering
- **Responsive** — Desktop / Tablet / Mobile preview with per-device styles
- **Color picker** — HSV ramp, color wheel, HSVA sliders, eyedropper, saved palette
- **Rulers & guides** — zoom-aware canvas rulers, draggable guide lines
- **Undo/redo** — 50-step history stack
- **Auto-save** — 5-second debounce with indicator
- **Keyboard shortcuts** — Cmd+Z/S/D/C/V, arrow nudge, Shift+R rulers, ? help
- **Context menu** — right-click on any element
- **Rich text** — bold/italic/underline/link toolbar on double-click
- **Export** — HTML export, publish to live URL

## License

Private.
