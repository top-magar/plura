// Import element definitions first (they register themselves via types.ts)
import './elements/layout';
import './elements/typography';
import './elements/media';
import './elements/interactive';
import './elements/navigation';
import './elements/forms';
import './elements/blocks';
import './renderers';

import type { El } from '../types';
import { registry, type ElementDef } from './types';

export { register } from './types';
export type { ElementDef } from './types';

export function getDef(type: string) { return registry.get(type); }
export function isContainer(type: string) { return type === '__body' || (registry.get(type)?.isContainer ?? false); }

export function makeEl(type: string): El | null {
  const def = registry.get(type);
  return def ? def.factory() : null;
}

const hugTypes = new Set(['button', 'badge', 'link', 'icon', 'socialIcons']);

export function makeElInContext(type: string, parent: El): El | null {
  const el = makeEl(type);
  if (!el) return null;

  const parentIsRow = parent.styles.flexDirection === 'row' || parent.styles.flexDirection === 'row-reverse';
  const parentIsFlex = parent.styles.display === 'flex' || parent.styles.display === 'inline-flex';

  if (hugTypes.has(type)) {
    el.styles.width = 'fit-content';
    if (parentIsFlex) el.styles.alignSelf = 'flex-start';
    return el;
  }

  if (parentIsRow && parentIsFlex) {
    delete el.styles.width;
    el.styles.flex = '1';
    if (type === 'image') el.styles.objectFit = 'cover';
  }

  if (type === 'navbar') { el.styles.width = '100%'; el.styles.position = 'sticky'; el.styles.top = '0'; el.styles.zIndex = '10'; }
  if (type === 'footer') { el.styles.width = '100%'; el.styles.marginTop = 'auto'; }

  return el;
}

export function componentGroups(): { label: string; items: { type: string; label: string; icon: ElementDef['icon']; color: string }[] }[] {
  const groupMap = new Map<string, { type: string; label: string; icon: ElementDef['icon']; color: string }[]>();
  for (const def of registry.values()) {
    if (!groupMap.has(def.group)) groupMap.set(def.group, []);
    groupMap.get(def.group)!.push({ type: def.type, label: def.name, icon: def.icon, color: def.color });
  }
  const order = ['Layout', 'Typography', 'Media & Links', 'Interactive', 'Navigation', 'Forms', 'Blocks'];
  return order.filter(g => groupMap.has(g)).map(g => ({ label: g, items: groupMap.get(g)! }));
}
