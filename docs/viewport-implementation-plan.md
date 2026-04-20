# Penpot Viewport Features — Implementation Plan

> Remaining features to port from Penpot's viewport to our editor.
> 12 of 22 viewport files already ported. 10 remaining.

---

## Phase 1: High Impact (Week 1)

### 1.1 Visual Grid Editor
**Source:** `grid_layout_editor.cljs` (1,252 lines)
**Effort:** 2-3 hours
**File:** `canvas/overlays/grid-editor.tsx`

**What it does:**
When a grid container is selected, shows an overlay with:
- Column/row track lines on the canvas
- Drag handles between tracks to resize (1fr → 2fr, auto → 200px)
- Click "+" between tracks to add new column/row
- Track size labels (1fr, auto, 200px)
- Drag cells to reorder children

**Implementation:**
1. Detect when selected element has `display: grid`
2. Parse `gridTemplateColumns` / `gridTemplateRows` into track array
3. Render overlay lines at computed track positions using `getBoundingClientRect`
4. Add drag handles between lines (pointer events for resize)
5. Update CSS grid template on drag
6. Show track size labels above/beside each track

**Dependencies:** None (grid layout panel already exists in design-tab)

---

### 1.2 Marquee Selection (Multi-Select)
**Source:** `widgets.cljs` selection-rect + `actions.cljs` area-selection
**Effort:** 1-1.5 hours
**Files:** `canvas/overlays/marquee.tsx`, update `core/provider.tsx`

**What it does:**
- Click+drag on empty canvas area draws a selection rectangle
- All elements whose bounds intersect the rectangle get selected
- Shift+click adds to selection
- Selected elements share property editing in right panel

**Implementation:**
1. Add `selectedIds: string[]` to EditorState (replace single `selected`)
2. On pointerdown on canvas background, start tracking marquee rect
3. On pointermove, render blue selection rectangle
4. On pointerup, find all elements whose DOM rects intersect marquee
5. Set `selectedIds` to matching element IDs
6. Update right panel to handle multi-select (show shared properties)

**Dependencies:** Provider state change (selected → selectedIds)

---

### 1.3 RAF-Batched Zoom
**Source:** `actions.cljs` schedule-zoom! / schedule-scroll!
**Effort:** 30 min
**File:** Update `canvas/use-canvas.ts`

**What it does:**
Accumulates wheel deltas and flushes once per animation frame instead of updating state on every wheel event. Prevents React re-render storms during fast scrolling.

**Implementation:**
1. Replace direct `setZoom` in wheel handler with RAF accumulator
2. Store pending zoom delta in a ref
3. Flush accumulated delta on next `requestAnimationFrame`

**Dependencies:** None

---

## Phase 2: Medium Impact (Week 2)

### 2.1 Gradient Editor
**Source:** `gradients.cljs` (539 lines)
**Effort:** 1.5-2 hours
**Files:** `canvas/overlays/gradient-editor.tsx`, update `panels/right/design-tab.tsx`

**What it does:**
When a shape has a gradient fill, shows handles on canvas:
- Linear gradient: two endpoint handles (drag to change angle/position)
- Radial gradient: center + radius handle
- Color stops on the gradient line (click to add, drag to move)

**Implementation:**
1. Add gradient support to fill section (linear-gradient CSS)
2. Parse gradient string into stops array
3. Render SVG overlay with draggable endpoint handles
4. Update CSS gradient on drag
5. Add color stop editor (click on line to add stop)

**Dependencies:** Gradient fill support in design-tab

---

### 2.2 Frame Grid Overlay
**Source:** `frame_grid.cljs` (181 lines)
**Effort:** 30 min
**File:** `canvas/overlays/layout-grid.tsx`

**What it does:**
Shows a repeating grid pattern overlay on containers (like Figma's layout grid):
- Square grid (e.g., 8px grid)
- Column grid with gutters
- Toggle on/off per container

**Implementation:**
1. Add `showGrid` toggle to container elements
2. Render CSS background pattern overlay (repeating-linear-gradient)
3. Add toggle button in design-tab Layout section

**Dependencies:** None

---

### 2.3 Dynamic Cursors
**Source:** `hooks.cljs` setup-cursor
**Effort:** 30 min
**File:** Update `canvas/use-canvas.ts`

**What it does:**
Cursor changes based on current state:
- Default: pointer
- Space held: grab hand
- Space+dragging: grabbing hand
- Alt held: duplicate cursor (crosshair+)
- Over resize handle: ns-resize / ew-resize
- Drawing tool active: crosshair

**Implementation:**
1. Track alt key state in use-canvas
2. Add cursor state that combines space/alt/tool states
3. Apply cursor class to canvas container

**Dependencies:** None

---

## Phase 3: Nice to Have (Week 3)

### 3.1 Eyedropper Color Picker
**Source:** `pixel_overlay.cljs` (366 lines)
**Effort:** 2 hours
**File:** `canvas/overlays/eyedropper.tsx`

**What it does:**
Click anywhere on canvas to pick a color:
- Renders canvas to offscreen buffer
- Shows magnified pixel preview around cursor
- Click to select color
- Feeds picked color back to fill/stroke/text color

**Implementation:**
1. Use `html2canvas` or `dom-to-image` to capture canvas as image
2. On mousemove, sample pixel color from captured image
3. Show magnifier circle around cursor with zoomed pixels
4. On click, set the active color field to picked color

**Dependencies:** `html2canvas` or similar library

---

### 3.2 Multi-User Presence
**Source:** `presence.cljs` (77 lines)
**Effort:** 4+ hours (needs backend)
**Files:** `canvas/overlays/presence.tsx`, backend WebSocket

**What it does:**
Shows other users' cursors on the canvas in real-time with name labels and colors.

**Implementation:**
1. Set up WebSocket connection (Pusher/Ably/custom)
2. Broadcast cursor position on mousemove (throttled)
3. Receive other users' positions
4. Render colored cursor + name label for each user

**Dependencies:** WebSocket backend, user authentication

---

### 3.3 Canvas Comments
**Source:** `comments.cljs` (90 lines)
**Effort:** 2+ hours (needs backend)
**Files:** `canvas/overlays/comments.tsx`, backend API

**What it does:**
Pin comment threads to specific positions on the canvas. Click to open thread.

**Implementation:**
1. Add comments data model (position, thread, user, timestamp)
2. Render pin icons at comment positions
3. Click pin to open comment thread popover
4. Add "Add comment" tool mode

**Dependencies:** Comments backend API

---

## Phase 4: Performance & Polish (Ongoing)

### 4.1 Conditional Rendering Optimization
**Already started.** Expand the flag system:

```typescript
const showSnap = !dropTarget && !!selected && !panning;
const showGuides = !preview && guides.length > 0;
const showRulers = !preview;
const showPixelGrid = zoom >= 800;
const showGridEditor = !!selected && selectedIsGrid;
const showHandles = !!selected && !preview && !panning;
```

### 4.2 Viewport Virtualization
Only render elements visible in the current scroll viewport. For pages with 100+ elements, skip rendering off-screen elements.

### 4.3 Debounced Hover Detection
Throttle hover state updates to 60fps max. Currently every `onMouseEnter` triggers a state update.

---

## Timeline

```
Week 1 (High Impact):
  Day 1: Visual grid editor (2-3 hr)
  Day 2: Marquee multi-select (1.5 hr)
  Day 3: RAF-batched zoom (30 min) + dynamic cursors (30 min)

Week 2 (Medium Impact):
  Day 1: Gradient editor (2 hr)
  Day 2: Frame grid overlay (30 min) + conditional flags expansion (30 min)
  Day 3: Testing & bug fixes

Week 3 (Nice to Have):
  Day 1: Eyedropper (2 hr)
  Day 2-3: Multi-user presence (4+ hr, if backend ready)

Ongoing:
  Performance optimization
  Canvas comments (when backend ready)
```

---

## File Impact

New files to create:
```
canvas/overlays/grid-editor.tsx      ← visual grid editor
canvas/overlays/marquee.tsx          ← marquee selection
canvas/overlays/gradient-editor.tsx  ← gradient handles
canvas/overlays/layout-grid.tsx      ← frame grid overlay
canvas/overlays/eyedropper.tsx       ← color picker from canvas
canvas/overlays/presence.tsx         ← multi-user cursors
canvas/overlays/comments.tsx         ← comment pins
```

Files to update:
```
core/provider.tsx                    ← selectedIds[], gradient state
canvas/use-canvas.ts                 ← RAF zoom, dynamic cursors, alt tracking
panels/right/design-tab.tsx          ← gradient fill, grid toggle
panels/right/settings-tab.tsx        ← multi-select property editing
editor.tsx                           ← wire new overlays
```

---

## Current State

```
Viewport files:     22 total
Already ported:     12 ✅
Remaining:          10
  - Applicable:      7 (grid editor, marquee, gradient, frame grid, cursors, eyedropper, RAF zoom)
  - Future:           2 (presence, comments — need backend)
  - Not applicable:   1 (path editor — no vector paths)
```
