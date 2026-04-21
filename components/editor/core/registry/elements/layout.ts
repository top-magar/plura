import { v4 } from 'uuid';
import { Layout, Square, Columns2, LayoutGrid, PanelTop, RectangleHorizontal, Minus, SeparatorHorizontal } from 'lucide-react';
import { register } from '../types';
import type { El } from '../../types';

const col = (): El => ({ id: v4(), type: 'column', name: 'Column', styles: { display: 'flex', flexDirection: 'column', gap: '16px', flex: '1', padding: '16px' }, content: [] });

register({ type: 'section', name: 'Section', icon: Layout, color: '#7c3aed', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: 'section', name: 'Section', styles: { display: 'flex', flexDirection: 'column', gap: '24px', padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }, content: [] }) });

register({ type: 'container', name: 'Container', icon: Square, color: '#8b5cf6', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: 'container', name: 'Container', styles: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', width: '100%' }, content: [] }) });

register({ type: 'row', name: 'Row', icon: Columns2, color: '#6d28d9', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: 'row', name: 'Row', styles: { display: 'flex', flexDirection: 'row', gap: '24px', width: '100%', alignItems: 'stretch' }, content: [col(), col()] as El[] }) });

register({ type: 'column', name: 'Column', icon: Columns2, color: '#6d28d9', group: 'Layout', isContainer: true,
  factory: () => col() });

register({ type: '2Col', name: '2 Columns', icon: Columns2, color: '#6d28d9', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: '2Col', name: '2 Columns', styles: { display: 'flex', gap: '24px', width: '100%' }, content: [col(), col()] as El[] }) });

register({ type: '3Col', name: '3 Columns', icon: Columns2, color: '#6d28d9', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: '3Col', name: '3 Columns', styles: { display: 'flex', gap: '24px', width: '100%' }, content: [col(), col(), col()] as El[] }) });

register({ type: '4Col', name: '4 Columns', icon: Columns2, color: '#6d28d9', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: '4Col', name: '4 Columns', styles: { display: 'flex', gap: '24px', width: '100%' }, content: [col(), col(), col(), col()] as El[] }) });

register({ type: 'grid', name: 'Grid', icon: LayoutGrid, color: '#5b21b6', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: 'grid', name: 'Grid', styles: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px', width: '100%' }, content: [] }) });

register({ type: 'header', name: 'Header', icon: PanelTop, color: '#7c3aed', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: 'header', name: 'Header', styles: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', width: '100%', position: 'sticky', top: '0', zIndex: '10', backgroundColor: '#ffffff', borderBottom: '1px solid #f0f0f0' }, content: [
    { id: v4(), type: 'text', name: 'Logo', styles: { fontSize: '18px', fontWeight: '700' }, content: { innerText: 'Logo' } },
    { id: v4(), type: 'container', name: 'Actions', styles: { display: 'flex', gap: '12px', alignItems: 'center' }, content: [
      { id: v4(), type: 'link', name: 'Login', styles: { fontSize: '14px', fontWeight: '500', color: 'inherit', textDecoration: 'none' }, content: { innerText: 'Log in', href: '#' } },
      { id: v4(), type: 'button', name: 'Signup', styles: { padding: '8px 20px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '13px', fontWeight: '600', borderRadius: '6px', width: 'fit-content' }, content: { innerText: 'Sign Up', href: '#' } },
    ] as El[] },
  ] as El[] }) });

register({ type: 'card', name: 'Card', icon: RectangleHorizontal, color: '#8b5cf6', group: 'Layout', isContainer: true,
  factory: () => ({ id: v4(), type: 'card', name: 'Card', styles: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '0', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }, content: [
    { id: v4(), type: 'image', name: 'Card Image', styles: { width: '100%', height: '200px', objectFit: 'cover' }, content: { src: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Image', alt: 'Card image' } },
    { id: v4(), type: 'container', name: 'Card Body', styles: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '24px' }, content: [
      { id: v4(), type: 'text', name: 'Card Title', styles: { fontSize: '18px', fontWeight: '600', lineHeight: '1.3' }, content: { innerText: 'Card Title' } },
      { id: v4(), type: 'text', name: 'Card Text', styles: { fontSize: '14px', opacity: '0.6', lineHeight: '1.6' }, content: { innerText: 'A brief description of this card content goes here.' } },
      { id: v4(), type: 'link', name: 'Card Link', styles: { fontSize: '14px', fontWeight: '600', color: '#6366f1', textDecoration: 'none', marginTop: '8px' }, content: { innerText: 'Learn more ->', href: '#' } },
    ] as El[] },
  ] as El[] }) });

register({ type: 'divider', name: 'Divider', icon: Minus, color: '#94a3b8', group: 'Layout', isContainer: false,
  factory: () => ({ id: v4(), type: 'divider', name: 'Divider', styles: { borderTop: '1px solid currentColor', margin: '16px 0', opacity: '0.2' }, content: {} }) });

register({ type: 'spacer', name: 'Spacer', icon: SeparatorHorizontal, color: '#64748b', group: 'Layout', isContainer: false,
  factory: () => ({ id: v4(), type: 'spacer', name: 'Spacer', styles: { height: '48px' }, content: {} }) });
