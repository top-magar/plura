# @dnd-kit/react — Complete Reference

## Install
```bash
pnpm add @dnd-kit/react
```

---

## Components

### DragDropProvider
Wraps app, manages DnD state, coordinates draggable/droppable elements.

```tsx
import { DragDropProvider } from '@dnd-kit/react';

<DragDropProvider
  onBeforeDragStart={({ source, event }) => {
    // event.preventDefault() to cancel
  }}
  onDragStart={({ source }) => {}}
  onDragMove={({ operation }) => {}}
  onDragOver={({ source, target }) => {}}
  onDragEnd={({ source, target, canceled }) => {
    if (canceled) return; // user pressed Escape
    if (target) { /* dropped on target */ }
  }}
  onCollision={({ collisions }) => {}}
  // Configuration (array replaces defaults, function extends them)
  sensors={[PointerSensor, KeyboardSensor]}
  plugins={(defaults) => [...defaults, Feedback.configure({ dropAnimation: null })]}
  modifiers={(defaults) => [...defaults, RestrictToWindow]}
>
  {children}
</DragDropProvider>
```

### DragOverlay
Renders custom ghost element while dragging. Only render ONCE per DragDropProvider.

```tsx
import { DragOverlay } from '@dnd-kit/react';

// Static content
<DragOverlay>
  <div>Dragging...</div>
</DragOverlay>

// Dynamic based on source
<DragOverlay>
  {(source) => <div>Dragging {source.id}</div>}
</DragOverlay>

// Custom drop animation
<DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
<DragOverlay dropAnimation={null}> // disable animation
```

---

## Hooks

### useDraggable
Makes any element draggable.

```tsx
import { useDraggable } from '@dnd-kit/react';

function Draggable({ id }) {
  const { ref, handleRef, isDragSource } = useDraggable({
    id,                    // required, unique
    type: 'item',          // optional, for accepts filtering
    disabled: false,       // optional
    data: { foo: 'bar' },  // optional, available in event handlers
    modifiers: [],         // optional
    sensors: [],           // optional
  });

  return (
    <div ref={ref}>
      Content
      <button ref={handleRef}>Drag handle</button>  {/* only this triggers drag */}
    </div>
  );
}
```

**Output**: `ref`, `handleRef`, `isDragSource`, `isDragging`, `isDropping`, `draggable`

### useDroppable
Makes any element a drop target.

```tsx
import { useDroppable } from '@dnd-kit/react';

function Droppable({ id, children }) {
  const { ref, isDropTarget } = useDroppable({
    id,                      // required, unique
    accepts: 'item',         // optional, filter by draggable type
    collisionDetector: fn,   // optional, custom collision detection
    collisionPriority: 1,    // optional, higher = wins overlap conflicts
    disabled: false,         // optional
    data: {},                // optional
  });

  return (
    <div ref={ref} style={{ background: isDropTarget ? '#eef' : 'white' }}>
      {children}
    </div>
  );
}
```

**Output**: `ref`, `isDropTarget`, `droppable`

### useSortable
Combines draggable + droppable for reorderable lists.

```tsx
import { useSortable } from '@dnd-kit/react/sortable';

function SortableItem({ id, index, column }) {
  const { ref, handleRef, isDragSource, isDropTarget } = useSortable({
    id,                    // required, unique
    index,                 // required, position in list
    group: column,         // optional, for multi-list
    type: 'item',          // optional
    accept: 'item',        // optional
    transition: {          // optional, animation config
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      idle: false,
    },
    disabled: false,
  });

  return <li ref={ref}>{id}</li>;
}
```

**Output**: `ref`, `targetRef`, `sourceRef`, `handleRef`, `isDragSource`, `isDropTarget`, `isDragging`, `isDropping`

### useDragDropMonitor
Monitor events from any component inside DragDropProvider.

```tsx
import { useDragDropMonitor } from '@dnd-kit/react';

useDragDropMonitor({
  onBeforeDragStart(event, manager) {},  // preventable
  onDragStart(event, manager) {},
  onDragMove(event, manager) {},
  onDragOver(event, manager) {},         // preventable
  onDragEnd(event, manager) {},
  onCollision(event, manager) {},        // preventable
});
```

---

## Sortable Patterns

### Single list
```tsx
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable, isSortable } from '@dnd-kit/react/sortable';

function App() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        const { source } = event.operation;
        if (isSortable(source)) {
          const { initialIndex, index } = source;
          if (initialIndex !== index) {
            setItems(items => {
              const next = [...items];
              const [removed] = next.splice(initialIndex, 1);
              next.splice(index, 0, removed);
              return next;
            });
          }
        }
      }}
    >
      <ul>
        {items.map((id, index) => (
          <SortableItem key={id} id={id} index={index} />
        ))}
      </ul>
    </DragDropProvider>
  );
}
```

### Multiple lists (with move helper)
```tsx
import { move } from '@dnd-kit/helpers';

<DragDropProvider
  onDragStart={() => { snapshot.current = structuredClone(items); }}
  onDragOver={(event) => {
    if (event.operation.source?.type === 'column') return;
    setItems(items => move(items, event));
  }}
  onDragEnd={(event) => {
    if (event.canceled) { setItems(snapshot.current); return; }
    if (event.operation.source.type === 'column') {
      setColumnOrder(cols => move(cols, event));
    }
  }}
>
```

### Multiple lists (manual state)
```tsx
<DragDropProvider
  onDragEnd={(event) => {
    if (event.canceled) { setItems(snapshot.current); return; }
    const { source } = event.operation;
    if (isSortable(source)) {
      const { initialIndex, index, initialGroup, group } = source;
      if (initialGroup === group) {
        // Same group: reorder
        const groupItems = [...items[group]];
        const [removed] = groupItems.splice(initialIndex, 1);
        groupItems.splice(index, 0, removed);
        setItems({ ...items, [group]: groupItems });
      } else {
        // Cross-group transfer
        const sourceItems = [...items[initialGroup]];
        const [removed] = sourceItems.splice(initialIndex, 1);
        const targetItems = [...items[group]];
        targetItems.splice(index, 0, removed);
        setItems({ ...items, [initialGroup]: sourceItems, [group]: targetItems });
      }
    }
  }}
>
```

---

## Optimistic Sorting (default behavior)
- DOM elements reorder visually during drag WITHOUT React re-renders
- `source` and `target` refer to SAME element during drag
- Use `isSortable(source)` to get `index`, `initialIndex`, `group`, `initialGroup`
- Call `event.preventDefault()` in `onDragOver` to skip optimistic update for that event
- Optimistic updates auto-revert on cancel

## Type Guards
```tsx
import { isSortable, isSortableOperation } from '@dnd-kit/react/sortable';

if (isSortable(source)) {
  source.index;         // current position
  source.initialIndex;  // position when drag started
  source.group;         // current group
  source.initialGroup;  // group when drag started
}

if (isSortableOperation(operation)) {
  // both source and target narrowed to sortable
}
```

## Modifiers
```tsx
import { RestrictToHorizontalAxis } from '@dnd-kit/abstract/modifiers';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
```

## Key Imports
```tsx
// Core
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useDraggable, useDroppable, useDragDropMonitor } from '@dnd-kit/react';

// Sortable
import { useSortable, isSortable, isSortableOperation } from '@dnd-kit/react/sortable';

// Helpers
import { move } from '@dnd-kit/helpers';

// Sensors
import { PointerSensor, KeyboardSensor } from '@dnd-kit/dom';

// Plugins
import { Feedback } from '@dnd-kit/dom';
import { AutoScroller, Accessibility } from '@dnd-kit/dom';

// Modifiers
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
```
