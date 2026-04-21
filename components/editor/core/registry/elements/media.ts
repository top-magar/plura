import { v4 } from 'uuid';
import { Image, Video, ImageIcon, Link2, CheckSquare, MapPin, CodeXml, Share2 } from 'lucide-react';
import { register } from '../types';

register({ type: 'image', name: 'Image', icon: Image, color: '#22c55e', group: 'Media & Links', isContainer: false,
  factory: () => ({ id: v4(), type: 'image', name: 'Image', styles: { width: '100%', objectFit: 'cover' }, content: { src: '', alt: 'Image' } }) });

register({ type: 'video', name: 'Video', icon: Video, color: '#ef4444', group: 'Media & Links', isContainer: false,
  factory: () => ({ id: v4(), type: 'video', name: 'Video', styles: { width: '100%' }, content: { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' } }) });

register({ type: 'gallery', name: 'Gallery', icon: ImageIcon, color: '#84cc16', group: 'Media & Links', isContainer: false,
  factory: () => ({ id: v4(), type: 'gallery', name: 'Gallery', styles: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '8px' }, content: { images: 'https://placehold.co/400x300/111/333?text=1,https://placehold.co/400x300/111/333?text=2,https://placehold.co/400x300/111/333?text=3,https://placehold.co/400x300/111/333?text=4,https://placehold.co/400x300/111/333?text=5,https://placehold.co/400x300/111/333?text=6' } }) });

register({ type: 'link', name: 'Link', icon: Link2, color: '#0ea5e9', group: 'Media & Links', isContainer: false,
  factory: () => ({ id: v4(), type: 'link', name: 'Link', styles: { color: '#6366f1', textDecoration: 'underline' }, content: { innerText: 'Click here', href: '#' } }) });

register({ type: 'button', name: 'Button', icon: CheckSquare, color: '#2563eb', group: 'Media & Links', isContainer: false,
  factory: () => ({ id: v4(), type: 'button', name: 'Button', styles: { padding: '12px 24px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '14px', fontWeight: '600', textAlign: 'center', cursor: 'pointer', width: 'fit-content', borderRadius: '6px' }, content: { innerText: 'Click Me', href: '#' } }) });

register({ type: 'map', name: 'Map', icon: MapPin, color: '#16a34a', group: 'Media & Links', isContainer: false,
  factory: () => ({ id: v4(), type: 'map', name: 'Map', styles: { width: '100%', height: '300px' }, content: { address: 'New York, NY', zoom: '13' } }) });

register({ type: 'embed', name: 'Embed', icon: CodeXml, color: '#a855f7', group: 'Media & Links', isContainer: false,
  factory: () => ({ id: v4(), type: 'embed', name: 'Embed', styles: { padding: '16px', minHeight: '60px' }, content: { code: "<p style='color:#888;text-align:center'>Paste HTML here</p>" } }) });

register({ type: 'socialIcons', name: 'Social Icons', icon: Share2, color: '#14b8a6', group: 'Media & Links', isContainer: false,
  factory: () => ({ id: v4(), type: 'socialIcons', name: 'Social Icons', styles: { display: 'flex', gap: '12px', justifyContent: 'center', padding: '16px', fontSize: '20px' }, content: { platforms: 'X,Facebook,Instagram,LinkedIn,YouTube' } }) });
