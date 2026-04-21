import { v4 } from 'uuid';
import { Heading1, Heading2, Type, List, Quote, Star, Code } from 'lucide-react';
import { register } from '../types';

register({ type: 'heading', name: 'Heading', icon: Heading1, color: '#3b82f6', group: 'Typography', isContainer: false,
  factory: () => ({ id: v4(), type: 'text', name: 'Heading', styles: { fontSize: '36px', fontWeight: '700', lineHeight: '1.2', width: '100%' }, content: { innerText: 'Heading' } }) });

register({ type: 'subheading', name: 'Subheading', icon: Heading2, color: '#60a5fa', group: 'Typography', isContainer: false,
  factory: () => ({ id: v4(), type: 'text', name: 'Subheading', styles: { fontSize: '20px', fontWeight: '500', opacity: '0.7', width: '100%' }, content: { innerText: 'Subheading text goes here' } }) });

register({ type: 'text', name: 'Paragraph', icon: Type, color: '#3b82f6', group: 'Typography', isContainer: false,
  factory: () => ({ id: v4(), type: 'text', name: 'Text', styles: { fontSize: '16px', width: '100%' }, content: { innerText: 'Edit this text' } }) });

register({ type: 'list', name: 'List', icon: List, color: '#06b6d4', group: 'Typography', isContainer: false,
  factory: () => ({ id: v4(), type: 'list', name: 'List', styles: { padding: '0 0 0 20px', fontSize: '16px', lineHeight: '1.8' }, content: { innerText: 'First item\nSecond item\nThird item' } }) });

register({ type: 'quote', name: 'Quote', icon: Quote, color: '#f59e0b', group: 'Typography', isContainer: false,
  factory: () => ({ id: v4(), type: 'quote', name: 'Quote', styles: { padding: '16px 24px', borderLeft: '3px solid #6366f1', fontStyle: 'italic', fontSize: '18px' }, content: { innerText: 'This is a quote block' } }) });

register({ type: 'badge', name: 'Badge', icon: Star, color: '#eab308', group: 'Typography', isContainer: false,
  factory: () => ({ id: v4(), type: 'badge', name: 'Badge', styles: { display: 'inline-block', padding: '4px 12px', fontSize: '12px', fontWeight: '600', backgroundColor: '#6366f1', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }, content: { innerText: 'New' } }) });

register({ type: 'code', name: 'Code', icon: Code, color: '#10b981', group: 'Typography', isContainer: false,
  factory: () => ({ id: v4(), type: 'code', name: 'Code Block', styles: { padding: '16px', backgroundColor: '#111', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', overflow: 'auto' }, content: { innerText: "const hello = 'world';" } }) });

register({ type: 'icon', name: 'Icon', icon: Star, color: '#ec4899', group: 'Typography', isContainer: false,
  factory: () => ({ id: v4(), type: 'icon', name: 'Icon', styles: { fontSize: '32px', textAlign: 'center' }, content: { innerText: '★' } }) });
