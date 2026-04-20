<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/License-Private-red" />
</p>

# Plura

A white-labeled multi-tenant SaaS platform for agency owners to build websites and funnels with a visual drag-and-drop editor.

---

## Overview

Plura provides agencies with a complete website builder — from authentication and billing to a full-screen visual editor with 36+ element types, real-time style manipulation, and one-click publishing.

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                        │
├─────────┬───────────────────────────────┬───────────────┤
│  Auth   │           Editor              │   Payments    │
│ (Clerk) │  ┌───┬───────────────┬─────┐  │   (Stripe)   │
│         │  │ L │               │  R  │  │               │
│         │  │ e │    Canvas     │  i  │  │               │
│         │  │ f │  ┌─────────┐  │  g  │  │               │
│         │  │ t │  │ Element │  │  h  │  │               │
│         │  │   │  │ Tree    │  │  t  │  │               │
│         │  │ P │  ├─────────┤  │     │  │               │
│         │  │ a │  │ Handles │  │  P  │  │               │
│         │  │ n │  │ Overlays│  │  a  │  │               │
│         │  │ e │  └─────────┘  │  n  │  │               │
│         │  │ l │               │  e  │  │               │
│         │  └───┴───────────────┴─────┘  │               │
├─────────┴───────────────────────────────┴───────────────┤
│          PostgreSQL (Neon) · Appwrite Storage            │
└─────────────────────────────────────────────────────────┘
```

## Features

**Editor**
- 36+ draggable element types (layout, typography, media, forms, blocks)
- Visual handles — padding, margin, gap, border-radius, resize, font-size
- Context-aware overlays — rulers, guides, distance measurement, grid editor
- 3-tab color picker with eyedropper and saved palette
- Responsive preview — Desktop / Tablet / Mobile with per-device styles
- Layer tree with drag-and-drop reordering
- Rich text editing (bold, italic, underline, links)
- Undo/redo (50 steps), auto-save, keyboard shortcuts

**Platform**
- Multi-tenant with sub-accounts
- Clerk authentication
- Stripe billing integration
- Appwrite file storage
- HTML export and live publishing

## Tech Stack

| | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 |
| **Components** | shadcn/ui |
| **Auth** | Clerk |
| **Database** | PostgreSQL (Neon) |
| **Storage** | Appwrite |
| **Payments** | Stripe |
| **Icons** | Material Symbols Outlined |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
git clone https://github.com/top-magar/plura.git
cd plura
pnpm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

DATABASE_URL=

NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT=
NEXT_PUBLIC_APPWRITE_BUCKET=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
```

## Project Structure

```
├── app/                    Next.js app router pages
│   ├── (main)/             Dashboard, sub-accounts, settings
│   ├── editor/             Full-screen editor page
│   └── api/                API routes (Stripe webhooks, etc.)
├── components/
│   ├── editor/             Visual editor (77 files, ~5300 lines)
│   │   ├── core/           State, types, tree helpers, element factory
│   │   ├── canvas/         Element rendering, handles, overlays
│   │   ├── panels/         Left panel (components, layers) + Right panel (design, content)
│   │   ├── toolbar/        Navigation bar
│   │   └── ui/             Color picker, icon helper
│   ├── ui/                 shadcn/ui components
│   └── global/             Shared layout components
├── lib/                    Database queries, utilities
└── prisma/                 Database schema
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+S` | Save |
| `Cmd+D` | Duplicate |
| `Cmd+C / V` | Copy / Paste element |
| `Cmd+Alt+C / V` | Copy / Paste styles |
| `Delete` | Delete selected |
| `Escape` | Select parent / Deselect |
| `Shift+R` | Toggle rulers |
| `Alt+hover` | Show distances |
| `?` | Shortcuts help |

## License

Private — All rights reserved.
