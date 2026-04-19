'use client';

import React from 'react';
import { useEditor } from '../editor-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type StyleKey = keyof React.CSSProperties;

const groups: { label: string; fields: { key: StyleKey; label: string; type?: string }[] }[] = [
  {
    label: 'Typography',
    fields: [
      { key: 'fontFamily', label: 'Font' },
      { key: 'fontSize', label: 'Size' },
      { key: 'fontWeight', label: 'Weight' },
      { key: 'lineHeight', label: 'Line Height' },
      { key: 'letterSpacing', label: 'Spacing' },
      { key: 'textAlign', label: 'Align' },
      { key: 'color', label: 'Color', type: 'color' },
    ],
  },
  {
    label: 'Spacing',
    fields: [
      { key: 'padding', label: 'Padding' },
      { key: 'margin', label: 'Margin' },
      { key: 'gap', label: 'Gap' },
    ],
  },
  {
    label: 'Size',
    fields: [
      { key: 'width', label: 'Width' },
      { key: 'height', label: 'Height' },
      { key: 'minHeight', label: 'Min H' },
      { key: 'maxWidth', label: 'Max W' },
    ],
  },
  {
    label: 'Background',
    fields: [
      { key: 'backgroundColor', label: 'BG Color', type: 'color' },
      { key: 'backgroundImage', label: 'BG Image' },
    ],
  },
  {
    label: 'Border',
    fields: [
      { key: 'border', label: 'Border' },
      { key: 'borderRadius', label: 'Radius' },
    ],
  },
  {
    label: 'Layout',
    fields: [
      { key: 'display', label: 'Display' },
      { key: 'flexDirection', label: 'Direction' },
      { key: 'justifyContent', label: 'Justify' },
      { key: 'alignItems', label: 'Align' },
    ],
  },
  {
    label: 'Effects',
    fields: [
      { key: 'opacity', label: 'Opacity' },
      { key: 'boxShadow', label: 'Shadow' },
    ],
  },
];

export default function SettingsTab() {
  const { state, dispatch } = useEditor();
  const selected = state.editor.selectedElement;

  if (!selected) {
    return (
      <div className="editor-scroll-panel" style={{ padding: '16px', color: 'var(--muted-foreground)', fontSize: '13px' }}>
        Select an element to edit its properties
      </div>
    );
  }

  function handleChange(key: StyleKey, value: string) {
    if (!selected) return;
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        elementDetails: {
          ...selected,
          styles: { ...selected.styles, [key]: value },
        },
      },
    });
  }

  function handleContentChange(key: string, value: string) {
    if (!selected || Array.isArray(selected.content)) return;
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        elementDetails: {
          ...selected,
          content: { ...selected.content, [key]: value },
        },
      },
    });
  }

  const content = !Array.isArray(selected.content) ? selected.content : null;

  return (
    <div className="editor-scroll-panel" style={{ padding: '12px' }}>
      {/* Element name */}
      <div style={{ marginBottom: '12px' }}>
        <Label style={{ fontSize: '11px' }}>Name</Label>
        <Input
          value={selected.name}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_ELEMENT',
              payload: { elementDetails: { ...selected, name: e.target.value } },
            })
          }
          style={{ height: '28px', fontSize: '13px' }}
        />
      </div>

      {/* Content fields */}
      {content && Object.keys(content).length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '6px' }}>
            Content
          </p>
          {Object.entries(content).map(([key, val]) => (
            <div key={key} style={{ marginBottom: '6px' }}>
              <Label style={{ fontSize: '11px' }}>{key}</Label>
              <Input
                value={val}
                onChange={(e) => handleContentChange(key, e.target.value)}
                style={{ height: '28px', fontSize: '13px' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Style groups */}
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '6px' }}>
            {group.label}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {group.fields.map((field) => (
              <div key={field.key}>
                <Label style={{ fontSize: '10px' }}>{field.label}</Label>
                <Input
                  type={field.type || 'text'}
                  value={(selected.styles[field.key] as string) ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  style={{ height: '28px', fontSize: '12px' }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
