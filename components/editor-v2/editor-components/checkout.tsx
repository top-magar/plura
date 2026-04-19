'use client';

import React from 'react';
import ElementWrapper from './element-wrapper';
import type { EditorElement } from '../types';

export default function CheckoutComponent({ element }: { element: EditorElement }) {
  return (
    <ElementWrapper element={element}>
      <div style={{ ...element.styles, border: '2px dashed #ccc', padding: '20px', textAlign: 'center' as const }}>
        <p style={{ color: '#888' }}>Payment Form Placeholder</p>
        <p style={{ fontSize: '12px', color: '#aaa' }}>Connect Stripe to enable payments</p>
      </div>
    </ElementWrapper>
  );
}
