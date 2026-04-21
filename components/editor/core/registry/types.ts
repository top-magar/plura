import type { ComponentType } from 'react';
import type { El } from '../types';

export type ElementDef = {
  type: string;
  name: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  group: string;
  isContainer: boolean;
  factory: () => El;
};
