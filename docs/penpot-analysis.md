# Penpot Source Analysis — Editor Reference

> Analyzed from `/Volumes/T7 Touch/penpot/source/frontend/src/app/main/ui/workspace/`
> Total: ~45,000 lines ClojureScript across 160+ files

---

## Architecture Overview

- **Language**: ClojureScript (Lisp dialect, compiles to JS)
- **Framework**: Rumext v2 (React wrapper for ClojureScript)
- **Rendering**: SVG canvas (absolute x,y positioning)
- **State**: Potok (reactive state management) + immutable atoms
- **Events**: Beicon (RxJS-like reactive streams)

---

## Directory Map

### Editor Shell (`workspace/*.cljs` — 8,081 lines)

| File | Lines | Purpose | Ported? |
|---|---|---|---|
| `viewport.cljs` | ~800 | Main canvas component, renders all shapes + overlays | — |
| `sidebar.cljs` | ~200 | Left+right sidebar container, tab switching | — |
| `top_toolbar.cljs` | ~400 | Tools bar (select, frame, rect, text, pen, etc) | — |
| `main_menu.cljs` | ~300 | File/Edit/View/Help menu bar | — |
| `context_menu.cljs` | ~500 | Right-click context menu (copy, paste, group, etc) | ✅ |
| `coordinates.cljs` | ~100 | X,Y coordinate display at bottom | — |
| `nudge.cljs` | ~80 | Arrow key nudge amount settings | ✅ |
| `comments.cljs` | ~300 | Comment threads pinned to canvas | — |
| `presence.cljs` | ~200 | Multi-user cursor display | — |
| `color_palette.cljs` | ~400 | Bottom color palette bar | — |
| `text_palette.cljs` | ~300 | Text styles palette bar | — |

### Canvas Overlays (`viewport/` — 7,645 lines)

| File | Lines | Purpose | Ported? |
|---|---|---|---|
| `selection.cljs` | 619 | Selection rect + 8 resize handles + 4 rotation handles | ✅ (different: CSS ring + padding/margin/gap/radius handles) |
| `snap_distances.cljs` | 308 | Red measurement lines between elements | ✅ `snap-distances.tsx` |
| `snap_points.cljs` | 183 | Alignment guide lines when edges match | ✅ `snap-guides.tsx` |
| `outline.cljs` | ~200 | Hover outline on shapes | ✅ (CSS ring-1) |
| `widgets.cljs` | 374 | Pixel grid, cursor tooltip, selection rect, frame titles | Partial |
| `rulers.cljs` | ~400 | Top/left rulers with tick marks and numbers | — |
| `guides.cljs` | 631 | Draggable horizontal/vertical guide lines | — |
| `scroll_bars.cljs` | ~200 | Custom canvas scrollbars | — |
| `gradients.cljs` | ~300 | Gradient editor overlay on canvas | — |
| `grid_layout_editor.cljs` | ~1000 | Visual grid editor (drag columns/rows on canvas) | — |
| `drawarea.cljs` | ~400 | Shape drawing mode (click+drag to create) | — |
| `interactions.cljs` | ~300 | Prototype interaction arrows between frames | — |
| `path_actions.cljs` | ~200 | Path editing toolbar (add/remove points) | — |
| `hooks.cljs` | ~500 | Canvas event hooks (mouse, keyboard, wheel) | Partial |
| `streams.cljs` | ~300 | Reactive event streams for mouse/keyboard | — |
| `actions.cljs` | ~400 | Canvas action handlers (move, resize, rotate) | — |

### Shape Renderers (`shapes/` — 3,094 lines)

| File | Lines | Purpose | Ported? |
|---|---|---|---|
| `common.cljs` | ~200 | Shared shape rendering logic | — |
| `frame.cljs` | ~300 | Frame/artboard renderer | N/A (we use DOM) |
| `group.cljs` | ~150 | Group renderer | N/A |
| `path.cljs` | ~200 | Vector path renderer | N/A |
| `text.cljs` | ~200 | Text shape renderer | N/A |
| `text/editor.cljs` | ~400 | Rich text editor v1 | — |
| `text/v2_editor.cljs` | ~400 | Rich text editor v2 | — |
| `text/v3_editor.cljs` | ~500 | Rich text editor v3 (latest) | — |
| `bool.cljs` | ~150 | Boolean operations (union, subtract) | N/A |

### Left Sidebar (`sidebar/` — 3,772 lines)

| File | Lines | Purpose | Ported? |
|---|---|---|---|
| `layers.cljs` | ~600 | Layers panel — tree view with drag reorder | Partial (basic tree) |
| `layer_item.cljs` | ~500 | Single layer row — icon, name, visibility, lock | Partial |
| `layer_name.cljs` | ~150 | Editable layer name with double-click | — |
| `sitemap.cljs` | ~400 | Pages list with add/delete/reorder | — |
| `history.cljs` | ~300 | Undo history panel with step list | — |
| `versions.cljs` | ~200 | Version history with restore | — |
| `shortcuts.cljs` | ~200 | Keyboard shortcuts reference panel | — |

### Asset Library (`sidebar/assets/` — 2,755 lines)

| File | Lines | Purpose | Ported? |
|---|---|---|---|
| `components.cljs` | ~800 | Component library browser with search | — |
| `colors.cljs` | ~500 | Color library browser | — |
| `typographies.cljs` | ~500 | Typography library browser | — |
| `file_library.cljs` | ~400 | File-level library management | — |
| `groups.cljs` | ~300 | Asset group management | — |

### Right Panel — Design Tab (`sidebar/options/menus/` — 9,943 lines)

| File | Lines | Purpose | Ported? |
|---|---|---|---|
| `layer.cljs` | ~300 | Opacity slider + blend mode dropdown | ✅ |
| `measures.cljs` | ~800 | W/H/X/Y + rotation + border-radius | ✅ |
| `layout_container.cljs` | ~1500 | Flex/Grid layout controls | ✅ |
| `layout_item.cljs` | ~600 | Child sizing (hug/fill/fixed) + constraints | ✅ (sizing mode) |
| `fill.cljs` | ~500 | Fill colors (multiple, with add/remove) | ✅ |
| `stroke.cljs` | ~400 | Stroke color, width, style | ✅ |
| `shadow.cljs` | ~400 | Drop shadows (multiple) | ✅ |
| `blur.cljs` | ~200 | Blur effect slider | ✅ |
| `border_radius.cljs` | ~300 | Corner radius (linked/unlinked) | ✅ |
| `constraints.cljs` | ~400 | Pin-to-edge constraints | — |
| `component.cljs` | ~500 | Component overrides panel | — |
| `interactions.cljs` | ~600 | Prototype interactions editor | — |
| `exports.cljs` | ~400 | Export settings (format, scale) | — |
| `frame_grid.cljs` | ~300 | Frame grid overlay settings | — |
| `grid_cell.cljs` | ~400 | Grid cell properties | — |
| `text.cljs` | ~500 | Text properties (font, size, etc) | ✅ |
| `typography.cljs` | ~400 | Typography token management | — |
| `align.cljs` | ~200 | Alignment buttons | ✅ |
| `color_selection.cljs` | ~300 | All colors used in selection | — |

### Color Picker (`colorpicker/` — 1,580 lines)

| File | Lines | Purpose | Ported? |
|---|---|---|---|
| `hsva.cljs` | ~300 | HSV color area (2D picker) | ✅ (react-colorful) |
| `ramp.cljs` | ~200 | Color ramp/gradient bar | — |
| `slider_selector.cljs` | ~200 | Hue + opacity sliders | ✅ (react-colorful) |
| `color_inputs.cljs` | ~200 | Hex/RGB/HSL input fields | Partial |
| `harmony.cljs` | ~200 | Color harmony wheel | — |
| `gradients.cljs` | ~200 | Gradient editor | — |
| `libraries.cljs` | ~150 | Library color picker | — |

### Design Tokens (`tokens/` — 5,130 lines)

Not relevant to our editor yet. Penpot's token system manages design tokens (colors, spacing, typography) that can be exported to CSS/JSON.

---

## Key Algorithms Worth Porting

### 1. Selection Handles (`selection.cljs`)

**Constants:**
```
resize-point-radius: 4        (corner dot size)
resize-point-circle-radius: 10 (corner hit area)
resize-point-rect-size: 8      (corner rect for outside mode)
resize-side-height: 8           (edge handle hit area)
rotation-handler-size: 20       (rotation zone size)
selection-rect-width: 1         (selection border width)
min-selrect-side: 10            (minimum selection rect)
```

**Smart sizing logic:**
```
threshold-small = 25px / zoom
threshold-tiny  = 10px / zoom

TINY element (< 10px):
  → Hide corner handles
  → Show dot on edge handles
  → Handles move OUTSIDE element

SMALL element (< 25px):
  → Handles move OUTSIDE element
  → Edge handles limited to 25px length

NORMAL element:
  → Handles INSIDE element bounds
  → Edge handles span full width/height
```

**Status:** ✅ Ported concept (MIN_HIT=8, TINY_THRESH=25)

### 2. Snap Distances (`snap_distances.cljs`)

Measures pixel distance between selected element and siblings. Shows red lines with px labels.

**Algorithm:**
1. Get selected element bounding rect
2. For each sibling, calculate edge-to-edge distances
3. Only show if elements overlap on perpendicular axis
4. Render line + end caps + label

**Status:** ✅ Ported as `snap-distances.tsx`

### 3. Snap Points (`snap_points.cljs`)

Shows alignment guides when edges match within threshold.

**Checks:** left↔left, right↔right, center↔center, left↔right, top↔top, bottom↔bottom, center↔center

**Status:** ✅ Ported as `snap-guides.tsx`

### 4. Flex/Grid Layout Panel (`layout_container.cljs`)

**Flex panel structure:**
```
Row 1: [align-items icons] [direction icons] [wrap toggle]
Row 2: [justify-content icons] [help]
Row 3: [align-content icons] (only when wrap=on)
Row 4: [row-gap] [col-gap] | [padding linked/unlinked]
```

**Grid panel structure:**
```
[Edit grid button] [help]
Row 1: [direction] [align-items-row] [align-items-col]
Row 2: [justify-content-row] [justify-content-col]
Row 3: [row-gap] [col-gap]
Row 4: [padding linked/unlinked]
Columns: [track list with add/remove/reorder]
Rows: [track list with add/remove/reorder]
```

**Padding modes:**
- Simple: `[vertical] [horizontal]` (p1=top+bottom, p2=left+right)
- Multiple: `[top] [right] [bottom] [left]`

**Gap behavior:**
- Flex nowrap + row direction → column-gap active, row-gap disabled
- Flex nowrap + column direction → row-gap active, column-gap disabled
- Flex wrap → both active
- Grid → both always active

**Status:** ✅ Ported exactly

---

## Porting Priority

### Phase 1 — Quick wins (done ✅)
- [x] Design tab section order
- [x] Flex/Grid dual panel
- [x] Linked/unlinked padding + radius
- [x] Snap distances + guides
- [x] Smart handle sizing
- [x] Context menu
- [x] Undo/redo upgrade

### Phase 2 — High impact (next)
- [ ] Layers panel upgrade (drag reorder, search, multi-select)
- [ ] Keyboard shortcuts system (centralized, `?` overlay)
- [ ] Copy/paste styles (Cmd+Alt+C/V)
- [ ] Zoom/pan (scroll-to-zoom, space+drag pan)
- [ ] Rich text editing (bold/italic/link inline)

### Phase 3 — Advanced
- [ ] Rulers + draggable guides
- [ ] Visual grid editor on canvas
- [ ] Component system (reusable with overrides)
- [ ] Version history panel
- [ ] Multi-select with shared property editing
- [ ] Color picker upgrade (harmony, gradients)

### Phase 4 — Future
- [ ] Asset library (components, colors, typography)
- [ ] Prototype interactions
- [ ] Design tokens
- [ ] Multi-user presence
- [ ] Comments on canvas

---

## Key Differences: Penpot vs Our Editor

| Aspect | Penpot | Our Editor |
|---|---|---|
| **Rendering** | SVG canvas (absolute x,y) | DOM/CSS (flex/grid flow) |
| **Positioning** | Absolute coordinates | Flow layout |
| **Output** | .penpot file format | Clean HTML/CSS |
| **Resize** | 8 corner/edge handles | Padding/margin/gap/radius handles |
| **Move** | Drag to any position | Reorder within container |
| **Rotation** | Free rotation with handles | Not applicable (flow layout) |
| **Responsive** | Separate layouts per breakpoint | Device-specific style overrides |
| **Text** | Rich text with inline formatting | contentEditable (basic) |
| **Components** | Instances with overrides | Clone only |
| **Collaboration** | Real-time WebSocket | Not yet |
