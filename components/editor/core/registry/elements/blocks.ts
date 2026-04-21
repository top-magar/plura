import { v4 } from 'uuid';
import { Globe, Phone, Quote, CreditCard, Columns3, Heading1 } from 'lucide-react';
import { register } from '../types';
import type { El } from '../../types';

register({ type: 'hero', name: 'Hero', icon: Globe, color: '#6366f1', group: 'Blocks', isContainer: true,
  factory: () => ({ id: v4(), type: 'hero', name: 'Hero', styles: { display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', padding: '96px 24px', textAlign: 'center', width: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }, content: [
    { id: v4(), type: 'badge', name: 'Badge', styles: { display: 'inline-block', padding: '6px 16px', fontSize: '12px', fontWeight: '600', backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '100px', letterSpacing: '0.5px' }, content: { innerText: 'Now in Beta' } },
    { id: v4(), type: 'text', name: 'Hero Title', styles: { fontSize: '56px', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-0.02em', width: '100%', maxWidth: '720px', color: '#ffffff' }, content: { innerText: 'Build Something Amazing' } },
    { id: v4(), type: 'text', name: 'Hero Subtitle', styles: { fontSize: '20px', opacity: '0.6', lineHeight: '1.6', width: '100%', maxWidth: '560px', color: '#ffffff' }, content: { innerText: 'Create beautiful websites and funnels with our drag-and-drop builder. No code required.' } },
    { id: v4(), type: 'container', name: 'CTA Row', styles: { display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }, content: [
      { id: v4(), type: 'button', name: 'Primary CTA', styles: { padding: '16px 40px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '16px', fontWeight: '600', borderRadius: '8px', width: 'fit-content' }, content: { innerText: 'Get Started Free', href: '#' } },
      { id: v4(), type: 'button', name: 'Secondary CTA', styles: { padding: '16px 40px', backgroundColor: 'transparent', color: '#ffffff', fontSize: '16px', fontWeight: '600', borderRadius: '8px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.2)' }, content: { innerText: 'Watch Demo', href: '#' } },
    ] as El[] },
  ] as El[] }) });

register({ type: 'cta', name: 'CTA', icon: Phone, color: '#2563eb', group: 'Blocks', isContainer: true,
  factory: () => ({ id: v4(), type: 'container', name: 'CTA Block', styles: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '64px 24px', textAlign: 'center', backgroundColor: '#6366f1', borderRadius: '16px', width: '100%' }, content: [
    { id: v4(), type: 'text', name: 'CTA Title', styles: { fontSize: '32px', fontWeight: '700', color: '#ffffff', lineHeight: '1.2' }, content: { innerText: 'Ready to get started?' } },
    { id: v4(), type: 'text', name: 'CTA Text', styles: { fontSize: '18px', color: '#ffffff', opacity: '0.8', maxWidth: '480px' }, content: { innerText: 'Join thousands of happy customers building their dream websites today.' } },
    { id: v4(), type: 'button', name: 'CTA Button', styles: { padding: '14px 32px', backgroundColor: '#ffffff', color: '#6366f1', fontSize: '15px', fontWeight: '600', borderRadius: '8px', width: 'fit-content' }, content: { innerText: 'Sign Up Free', href: '#' } },
  ] as El[] }) });

register({ type: 'testimonial', name: 'Testimonial', icon: Quote, color: '#f59e0b', group: 'Blocks', isContainer: true,
  factory: () => ({ id: v4(), type: 'container', name: 'Testimonial', styles: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', backgroundColor: '#111', borderRadius: '16px', width: '100%' }, content: [
    { id: v4(), type: 'text', name: 'Stars', styles: { fontSize: '20px', letterSpacing: '4px', color: '#facc15' }, content: { innerText: '★★★★★' } },
    { id: v4(), type: 'text', name: 'Quote', styles: { fontSize: '20px', fontStyle: 'italic', lineHeight: '1.7', color: '#e2e8f0' }, content: { innerText: '"This product completely transformed how our team works. Highly recommended!"' } },
    { id: v4(), type: 'container', name: 'Author Row', styles: { display: 'flex', gap: '12px', alignItems: 'center' }, content: [
      { id: v4(), type: 'container', name: 'Avatar', styles: { width: '48px', height: '48px', borderRadius: '100px', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }, content: [
        { id: v4(), type: 'text', name: 'Initial', styles: { fontSize: '18px', fontWeight: '700', color: '#ffffff' }, content: { innerText: 'J' } },
      ] as El[] },
      { id: v4(), type: 'container', name: 'Info', styles: { display: 'flex', flexDirection: 'column', gap: '2px' }, content: [
        { id: v4(), type: 'text', name: 'Name', styles: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }, content: { innerText: 'Jane Doe' } },
        { id: v4(), type: 'text', name: 'Role', styles: { fontSize: '13px', color: '#94a3b8' }, content: { innerText: 'CEO at TechCorp' } },
      ] as El[] },
    ] as El[] },
  ] as El[] }) });

register({ type: 'pricing', name: 'Pricing', icon: CreditCard, color: '#d97706', group: 'Blocks', isContainer: true,
  factory: () => ({ id: v4(), type: 'container', name: 'Pricing Card', styles: { display: 'flex', flexDirection: 'column', gap: '24px', padding: '40px', textAlign: 'center', border: '1px solid #e5e7eb', borderRadius: '16px', width: '100%' }, content: [
    { id: v4(), type: 'text', name: 'Plan', styles: { fontSize: '20px', fontWeight: '600' }, content: { innerText: 'Pro Plan' } },
    { id: v4(), type: 'container', name: 'Price Row', styles: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }, content: [
      { id: v4(), type: 'text', name: 'Price', styles: { fontSize: '56px', fontWeight: '800', lineHeight: '1' }, content: { innerText: '$49' } },
      { id: v4(), type: 'text', name: 'Period', styles: { fontSize: '16px', opacity: '0.5' }, content: { innerText: '/month' } },
    ] as El[] },
    { id: v4(), type: 'button', name: 'CTA', styles: { padding: '14px 24px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '15px', fontWeight: '600', width: '100%', borderRadius: '8px' }, content: { innerText: 'Get Started', href: '#' } },
  ] as El[] }) });

register({ type: 'features', name: 'Features', icon: Columns3, color: '#8b5cf6', group: 'Blocks', isContainer: true,
  factory: () => {
    const feat = (title: string, desc: string, bg: string): El => ({ id: v4(), type: 'container', name: title, styles: { flex: '1', display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }, content: [
      { id: v4(), type: 'container', name: 'Icon', styles: { width: '48px', height: '48px', borderRadius: '12px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }, content: [
        { id: v4(), type: 'text', name: 'Ico', styles: { fontSize: '20px' }, content: { innerText: '~' } },
      ] as El[] },
      { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '18px', fontWeight: '600' }, content: { innerText: title } },
      { id: v4(), type: 'text', name: 'Desc', styles: { fontSize: '14px', opacity: '0.6', lineHeight: '1.6' }, content: { innerText: desc } },
    ] as El[] });
    return { id: v4(), type: '3Col', name: 'Features', styles: { display: 'flex', gap: '32px', padding: '64px 24px', width: '100%' }, content: [
      feat('Lightning Fast', 'Optimized for speed with sub-second load times.', 'rgba(99,102,241,0.1)'),
      feat('Secure by Default', 'Enterprise-grade security with encryption.', 'rgba(16,185,129,0.1)'),
      feat('24/7 Support', 'Our team is always available to help.', 'rgba(245,158,11,0.1)'),
    ] as El[] };
  } });

register({ type: 'stats', name: 'Stats', icon: Heading1, color: '#3b82f6', group: 'Blocks', isContainer: true,
  factory: () => {
    const stat = (num: string, label: string): El => ({ id: v4(), type: 'container', name: label, styles: { display: 'flex', flexDirection: 'column', gap: '4px' }, content: [
      { id: v4(), type: 'text', name: 'Num', styles: { fontSize: '48px', fontWeight: '800', lineHeight: '1', color: '#6366f1' }, content: { innerText: num } },
      { id: v4(), type: 'text', name: 'Label', styles: { fontSize: '14px', fontWeight: '500', opacity: '0.5' }, content: { innerText: label } },
    ] as El[] });
    return { id: v4(), type: 'container', name: 'Stats', styles: { display: 'flex', justifyContent: 'center', gap: '64px', padding: '64px 24px', textAlign: 'center', width: '100%' }, content: [
      stat('10K+', 'Active Users'), stat('99.9%', 'Uptime'), stat('150+', 'Countries'), stat('4.9', 'Star Rating'),
    ] as El[] };
  } });
