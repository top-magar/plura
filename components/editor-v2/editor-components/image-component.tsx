'use client';

import React from 'react';
import ElementWrapper from './element-wrapper';
import type { EditorElement } from '../types';

export default function ImageComponent({ element }: { element: EditorElement }) {
  const content = element.content as Record<string, string>;

  return (
    <ElementWrapper element={element}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.src || undefined} alt={content.alt || ''} style={element.styles} />
    </ElementWrapper>
  );
}
