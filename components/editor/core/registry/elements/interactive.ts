import { v4 } from 'uuid';
import { ChevronDown, Rows3, Timer } from 'lucide-react';
import { register } from '../types';

register({ type: 'accordion', name: 'Accordion', icon: ChevronDown, color: '#f97316', group: 'Interactive', isContainer: false,
  factory: () => ({ id: v4(), type: 'accordion', name: 'Accordion', styles: {}, content: { items: JSON.stringify([
    { title: 'What is this product?', body: 'A brief description of your product or service.' },
    { title: 'How does pricing work?', body: 'Explain your pricing model here.' },
    { title: 'Do you offer support?', body: 'Yes, we offer 24/7 support via email and chat.' },
  ])} }) });

register({ type: 'tabs', name: 'Tabs', icon: Rows3, color: '#fb923c', group: 'Interactive', isContainer: false,
  factory: () => ({ id: v4(), type: 'tabs', name: 'Tabs', styles: {}, content: { items: JSON.stringify([
    { title: 'Tab 1', body: 'Content for the first tab.' },
    { title: 'Tab 2', body: 'Content for the second tab.' },
    { title: 'Tab 3', body: 'Content for the third tab.' },
  ])} }) });

register({ type: 'countdown', name: 'Countdown', icon: Timer, color: '#e11d48', group: 'Interactive', isContainer: false,
  factory: () => ({ id: v4(), type: 'countdown', name: 'Countdown', styles: { display: 'flex', justifyContent: 'center', gap: '16px', padding: '24px', fontSize: '32px', fontWeight: '700', textAlign: 'center' }, content: { targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16) } }) });
