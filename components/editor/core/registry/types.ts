import type { ComponentType, ReactNode } from 'react';
import type { El } from '../types';

export type ElementDef = {
  type: string;
  name: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  group: string;
  isContainer: boolean;
  factory: () => El;
  render?: ComponentType<{ element: El }>;
  exportHTML?: (el: El) => string;
};

export const registry = new Map<string, ElementDef>();

export function register(def: ElementDef) { registry.set(def.type, def); }
