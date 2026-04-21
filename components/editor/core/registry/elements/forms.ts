import { v4 } from 'uuid';
import { Contact, CreditCard } from 'lucide-react';
import { register } from '../types';
import type { El } from '../../types';

const field = (label: string, placeholder: string): El => ({ id: v4(), type: 'container', name: label, styles: { display: 'flex', flexDirection: 'column', gap: '6px' }, content: [
  { id: v4(), type: 'text', name: 'Label', styles: { fontSize: '13px', fontWeight: '500' }, content: { innerText: label } },
  { id: v4(), type: 'container', name: 'Input', styles: { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fafafa' }, content: [
    { id: v4(), type: 'text', name: 'Placeholder', styles: { fontSize: '14px', opacity: '0.4' }, content: { innerText: placeholder } },
  ] as El[] },
] as El[] });

register({ type: 'contactForm', name: 'Contact', icon: Contact, color: '#0891b2', group: 'Forms', isContainer: true,
  factory: () => ({ id: v4(), type: 'contactForm', name: 'Contact Form', styles: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', width: '100%', maxWidth: '480px', borderRadius: '16px', border: '1px solid #e5e7eb' }, content: [
    { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '24px', fontWeight: '700' }, content: { innerText: 'Get in Touch' } },
    { id: v4(), type: 'container', name: 'Name Row', styles: { display: 'flex', gap: '12px', width: '100%' }, content: [field('First Name', 'John'), field('Last Name', 'Doe')] as El[] },
    field('Email', 'john@example.com'),
    { id: v4(), type: 'container', name: 'Message', styles: { display: 'flex', flexDirection: 'column', gap: '6px' }, content: [
      { id: v4(), type: 'text', name: 'Label', styles: { fontSize: '13px', fontWeight: '500' }, content: { innerText: 'Message' } },
      { id: v4(), type: 'container', name: 'Textarea', styles: { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#fafafa', minHeight: '100px' }, content: [
        { id: v4(), type: 'text', name: 'Placeholder', styles: { fontSize: '14px', opacity: '0.4' }, content: { innerText: 'Your message...' } },
      ] as El[] },
    ] as El[] },
    { id: v4(), type: 'button', name: 'Submit', styles: { padding: '12px 24px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '15px', fontWeight: '600', borderRadius: '8px', width: '100%', textAlign: 'center' }, content: { innerText: 'Send Message', href: '#' } },
  ] as El[] }) });

register({ type: 'paymentForm', name: 'Payment', icon: CreditCard, color: '#d97706', group: 'Forms', isContainer: true,
  factory: () => ({ id: v4(), type: 'paymentForm', name: 'Payment', styles: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', width: '100%', maxWidth: '420px', borderRadius: '16px', border: '1px solid #e5e7eb' }, content: [
    { id: v4(), type: 'text', name: 'Title', styles: { fontSize: '20px', fontWeight: '700' }, content: { innerText: 'Payment Details' } },
    field('Card Number', '4242 4242 4242 4242'),
    { id: v4(), type: 'container', name: 'Row', styles: { display: 'flex', gap: '12px' }, content: [field('Expiry', 'MM/YY'), field('CVC', '123')] as El[] },
    { id: v4(), type: 'button', name: 'Pay', styles: { padding: '14px 24px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '15px', fontWeight: '600', borderRadius: '8px', width: '100%', textAlign: 'center' }, content: { innerText: 'Pay $49.00', href: '#' } },
  ] as El[] }) });
