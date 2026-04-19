import { v4 } from 'uuid';
import type { EditorElement } from './types';

const defaults: Record<string, () => EditorElement> = {
  text: () => ({
    id: v4(),
    type: 'text',
    name: 'Text',
    styles: { color: 'black', textAlign: 'left' },
    content: { innerText: 'Text Element' },
  }),
  link: () => ({
    id: v4(),
    type: 'link',
    name: 'Link',
    styles: { color: '#3b82f6', textDecoration: 'underline' },
    content: { innerText: 'Link', href: '#' },
  }),
  button: () => ({
    id: v4(),
    type: 'button',
    name: 'Button',
    styles: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '10px 20px',
      cursor: 'pointer',
      display: 'inline-block',
      textAlign: 'center',
    },
    content: { innerText: 'Button', href: '#' },
  }),
  image: () => ({
    id: v4(),
    type: 'image',
    name: 'Image',
    styles: { width: '100%', height: 'auto' },
    content: { src: 'https://placehold.co/600x400', alt: 'Image' },
  }),
  video: () => ({
    id: v4(),
    type: 'video',
    name: 'Video',
    styles: { width: '100%' },
    content: { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  }),
  container: () => ({
    id: v4(),
    type: 'container',
    name: 'Container',
    styles: { display: 'flex', flexDirection: 'column', padding: '16px', minHeight: '80px', width: '100%' },
    content: [],
  }),
  section: () => ({
    id: v4(),
    type: 'section',
    name: 'Section',
    styles: { display: 'flex', flexDirection: 'column', padding: '20px', width: '100%' },
    content: [],
  }),
  '2Col': () => ({
    id: v4(),
    type: '2Col',
    name: '2 Columns',
    styles: { display: 'flex', flexDirection: 'row', gap: '16px', width: '100%' },
    content: [
      { id: v4(), type: 'container', name: 'Col 1', styles: { flex: '1', padding: '16px', minHeight: '80px' }, content: [] },
      { id: v4(), type: 'container', name: 'Col 2', styles: { flex: '1', padding: '16px', minHeight: '80px' }, content: [] },
    ],
  }),
  '3Col': () => ({
    id: v4(),
    type: '3Col',
    name: '3 Columns',
    styles: { display: 'flex', flexDirection: 'row', gap: '16px', width: '100%' },
    content: [
      { id: v4(), type: 'container', name: 'Col 1', styles: { flex: '1', padding: '16px', minHeight: '80px' }, content: [] },
      { id: v4(), type: 'container', name: 'Col 2', styles: { flex: '1', padding: '16px', minHeight: '80px' }, content: [] },
      { id: v4(), type: 'container', name: 'Col 3', styles: { flex: '1', padding: '16px', minHeight: '80px' }, content: [] },
    ],
  }),
  contactForm: () => ({
    id: v4(),
    type: 'contactForm',
    name: 'Contact Form',
    styles: { padding: '16px', width: '100%' },
    content: {},
  }),
  paymentForm: () => ({
    id: v4(),
    type: 'paymentForm',
    name: 'Payment Form',
    styles: { padding: '16px', width: '100%' },
    content: {},
  }),
};

export function makeElement(type: string): EditorElement | null {
  const factory = defaults[type];
  return factory ? factory() : null;
}
