import { v4 } from 'uuid';
import { Navigation, PanelBottom } from 'lucide-react';
import { register } from '../types';
import type { El } from '../../types';

register({ type: 'navbar', name: 'Navbar', icon: Navigation, color: '#4f46e5', group: 'Navigation', isContainer: true,
  factory: () => ({ id: v4(), type: 'navbar', name: 'Navbar', styles: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', width: '100%', backgroundColor: '#ffffff' }, content: [
    { id: v4(), type: 'text', name: 'Brand', styles: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }, content: { innerText: 'Brand' } },
    { id: v4(), type: 'container', name: 'Nav Links', styles: { display: 'flex', gap: '32px', alignItems: 'center' }, content: [
      { id: v4(), type: 'link', name: 'Home', styles: { fontSize: '14px', fontWeight: '500', color: 'inherit', textDecoration: 'none' }, content: { innerText: 'Home', href: '#' } },
      { id: v4(), type: 'link', name: 'About', styles: { fontSize: '14px', fontWeight: '500', color: 'inherit', textDecoration: 'none', opacity: '0.6' }, content: { innerText: 'About', href: '#' } },
      { id: v4(), type: 'link', name: 'Services', styles: { fontSize: '14px', fontWeight: '500', color: 'inherit', textDecoration: 'none', opacity: '0.6' }, content: { innerText: 'Services', href: '#' } },
      { id: v4(), type: 'link', name: 'Contact', styles: { fontSize: '14px', fontWeight: '500', color: 'inherit', textDecoration: 'none', opacity: '0.6' }, content: { innerText: 'Contact', href: '#' } },
    ] as El[] },
    { id: v4(), type: 'button', name: 'Nav CTA', styles: { padding: '8px 20px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '13px', fontWeight: '600', borderRadius: '6px', width: 'fit-content' }, content: { innerText: 'Sign Up', href: '#' } },
  ] as El[] }) });

register({ type: 'footer', name: 'Footer', icon: PanelBottom, color: '#475569', group: 'Navigation', isContainer: true,
  factory: () => ({ id: v4(), type: 'footer', name: 'Footer', styles: { display: 'flex', flexDirection: 'column', gap: '40px', padding: '64px 32px 32px', width: '100%' }, content: [
    { id: v4(), type: 'container', name: 'Footer Cols', styles: { display: 'flex', gap: '48px', width: '100%' }, content: [
      { id: v4(), type: 'container', name: 'Brand Col', styles: { display: 'flex', flexDirection: 'column', gap: '12px', flex: '1.5' }, content: [
        { id: v4(), type: 'text', name: 'Brand', styles: { fontSize: '20px', fontWeight: '700' }, content: { innerText: 'Brand' } },
        { id: v4(), type: 'text', name: 'Tagline', styles: { fontSize: '14px', opacity: '0.5', lineHeight: '1.6', maxWidth: '280px' }, content: { innerText: 'Building the future of web design, one pixel at a time.' } },
      ] as El[] },
      { id: v4(), type: 'container', name: 'Product Col', styles: { display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' }, content: [
        { id: v4(), type: 'text', name: 'Label', styles: { fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', opacity: '0.4', marginBottom: '4px' }, content: { innerText: 'Product' } },
        { id: v4(), type: 'link', name: 'Link 1', styles: { fontSize: '14px', color: 'inherit', textDecoration: 'none', opacity: '0.6' }, content: { innerText: 'Features', href: '#' } },
        { id: v4(), type: 'link', name: 'Link 2', styles: { fontSize: '14px', color: 'inherit', textDecoration: 'none', opacity: '0.6' }, content: { innerText: 'Pricing', href: '#' } },
      ] as El[] },
      { id: v4(), type: 'container', name: 'Company Col', styles: { display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' }, content: [
        { id: v4(), type: 'text', name: 'Label', styles: { fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', opacity: '0.4', marginBottom: '4px' }, content: { innerText: 'Company' } },
        { id: v4(), type: 'link', name: 'Link 1', styles: { fontSize: '14px', color: 'inherit', textDecoration: 'none', opacity: '0.6' }, content: { innerText: 'About', href: '#' } },
        { id: v4(), type: 'link', name: 'Link 2', styles: { fontSize: '14px', color: 'inherit', textDecoration: 'none', opacity: '0.6' }, content: { innerText: 'Blog', href: '#' } },
      ] as El[] },
    ] as El[] },
    { id: v4(), type: 'divider', name: 'Divider', styles: { borderTop: '1px solid currentColor', opacity: '0.1' }, content: {} },
    { id: v4(), type: 'text', name: 'Copyright', styles: { fontSize: '13px', opacity: '0.35', textAlign: 'center' }, content: { innerText: '2026 Your Company. All rights reserved.' } },
  ] as El[] }) });
