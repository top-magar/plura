'use client';

import { useState, useEffect, type ReactNode } from 'react';
import type { El } from '../types';
import { useDocumentStore } from '../document-store';
import { useEditorStore } from '../editor-store';
import ElementWrapper from '../../canvas/element-wrapper';
import { MIcon } from '../../ui/m-icon';
import { registry } from './types';

// ─── Helpers ────────────────────────────────────────────────

function W({ element, children }: { element: El; children: ReactNode }) {
  return <ElementWrapper element={element} style={element.styles}>{children}</ElementWrapper>;
}
function c(el: El) { return el.content as Record<string, string>; }

// ─── Text (contentEditable) ─────────────────────────────────

function TextRenderer({ element }: { element: El }) {
  const preview = useEditorStore(s => s.preview);
  const selected = useEditorStore(s => s.selected);
  const isSel = selected?.id === element.id;
  const content = c(element);
  return (
    <W element={element}>
      {preview ? (
        <p style={{ whiteSpace: 'pre-wrap' }}>{content.innerText}</p>
      ) : (
        <p
          contentEditable={isSel}
          suppressContentEditableWarning
          spellCheck={false}
          className="outline-none min-h-[1em]"
          style={{ whiteSpace: 'pre-wrap', cursor: isSel ? 'text' : 'default' }}
          onBlur={(e) => {
            const text = e.currentTarget.innerText;
            if (text !== content.innerText) {
              useDocumentStore.getState().updateElement({ ...element, content: { ...content, innerText: text } });
            }
          }}
        >{content.innerText}</p>
      )}
    </W>
  );
}

// ─── Simple renderers ───────────────────────────────────────

function LinkRenderer({ element }: { element: El }) {
  const preview = useEditorStore(s => s.preview);
  return <W element={element}><a href={preview ? c(element).href : undefined} style={{ color: 'inherit' }}>{c(element).innerText || 'Link'}</a></W>;
}

function ButtonRenderer({ element }: { element: El }) {
  const preview = useEditorStore(s => s.preview);
  return <W element={element}><a href={preview ? c(element).href : undefined} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{c(element).innerText || 'Button'}</a></W>;
}

function ImageRenderer({ element }: { element: El }) {
  const content = c(element);
  return (
    <W element={element}>
      {content.src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={content.src} alt={content.alt || element.name} className="block w-full" />
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-2 bg-muted/50 py-12 text-muted-foreground">
          <MIcon name="image" size={24} /><span className="text-xs">Add image</span>
        </div>
      )}
    </W>
  );
}

function VideoRenderer({ element }: { element: El }) {
  return <W element={element}><iframe src={c(element).src} className="w-full aspect-video border-0" allowFullScreen /></W>;
}

function DividerRenderer({ element }: { element: El }) {
  return <W element={element}><hr className="border-current" /></W>;
}

function SpacerRenderer({ element }: { element: El }) {
  const preview = useEditorStore(s => s.preview);
  return <W element={element}>{!preview && <span className="text-[9px] text-muted-foreground/40 absolute inset-0 flex items-center justify-center">{parseInt(String(element.styles.height)) || 48}px</span>}</W>;
}

function QuoteRenderer({ element }: { element: El }) {
  return <W element={element}><blockquote>{c(element).innerText}</blockquote></W>;
}

function BadgeRenderer({ element }: { element: El }) {
  return <W element={element}><span>{c(element).innerText || 'Badge'}</span></W>;
}

function ListRenderer({ element }: { element: El }) {
  return <W element={element}><ul style={{ listStyleType: element.styles.listStyleType as string || 'disc' }}>{(c(element).innerText || '').split('\n').map((li, i) => <li key={i}>{li}</li>)}</ul></W>;
}

function CodeRenderer({ element }: { element: El }) {
  return <W element={element}><pre><code>{c(element).innerText}</code></pre></W>;
}

function IconRenderer({ element }: { element: El }) {
  return <W element={element}><span>{c(element).innerText || '★'}</span></W>;
}

function EmbedRenderer({ element }: { element: El }) {
  const preview = useEditorStore(s => s.preview);
  const sanitize = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  return (
    <W element={element}>
      {preview ? <div dangerouslySetInnerHTML={{ __html: sanitize(c(element).code || '') }} /> : <div className="flex items-center justify-center bg-muted/50 py-8 text-xs text-muted-foreground">HTML Embed — edit in Content tab</div>}
    </W>
  );
}

function SocialIconsRenderer({ element }: { element: El }) {
  return <W element={element}>{(c(element).platforms || '').split(',').map((p, i) => <a key={i} href="#" className="opacity-70 hover:opacity-100">{p.trim()}</a>)}</W>;
}

function MapRenderer({ element }: { element: El }) {
  const content = c(element);
  return <W element={element}><iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(content.address || '')}&z=${content.zoom || '13'}&output=embed`} className="w-full h-full border-0" loading="lazy" /></W>;
}

function GalleryRenderer({ element }: { element: El }) {
  /* eslint-disable @next/next/no-img-element */
  return <W element={element}>{(c(element).images || '').split(',').map((src, i) => <img key={i} src={src.trim()} alt="" className="w-full object-cover" />)}</W>;
}

function AccordionRenderer({ element }: { element: El }) {
  const items = JSON.parse(c(element).items || '[]') as { title: string; body: string }[];
  return <W element={element}><div>{items.map((item, i) => <details key={i} className="border-b border-current/10"><summary className="cursor-pointer py-3 font-medium">{item.title}</summary><p className="pb-3 opacity-70">{item.body}</p></details>)}</div></W>;
}

function TabsRenderer({ element }: { element: El }) {
  const [active, setActive] = useState(0);
  const items = JSON.parse(c(element).items || '[]') as { title: string; body: string }[];
  return (
    <W element={element}>
      <div className="flex border-b border-current/10">{items.map((t, i) => <button key={i} onClick={() => setActive(i)} className={`px-4 py-2 text-sm font-medium ${i === active ? 'border-b-2 border-primary' : 'opacity-50'}`}>{t.title}</button>)}</div>
      <div className="p-4">{items[active]?.body}</div>
    </W>
  );
}

function CountdownRenderer({ element }: { element: El }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const target = new Date(c(element).targetDate || Date.now()).getTime();
  const diff = Math.max(0, target - now);
  const units = [['Days', Math.floor(diff / 86400000)], ['Hrs', Math.floor((diff % 86400000) / 3600000)], ['Min', Math.floor((diff % 3600000) / 60000)], ['Sec', Math.floor((diff % 60000) / 1000)]] as const;
  return <W element={element}><div className="flex justify-center gap-4">{units.map(([l, v]) => <div key={l} className="text-center"><div className="text-[inherit] font-[inherit]">{String(v).padStart(2, '0')}</div><div className="mt-1 text-[10px] opacity-50">{l}</div></div>)}</div></W>;
}

// ─── Register renderers ─────────────────────────────────────

const renderers: Record<string, (props: { element: El }) => ReactNode> = {
  text: TextRenderer, heading: TextRenderer, subheading: TextRenderer,
  link: LinkRenderer, button: ButtonRenderer,
  image: ImageRenderer, video: VideoRenderer,
  divider: DividerRenderer, spacer: SpacerRenderer,
  quote: QuoteRenderer, badge: BadgeRenderer,
  list: ListRenderer, code: CodeRenderer, icon: IconRenderer,
  embed: EmbedRenderer, socialIcons: SocialIconsRenderer,
  map: MapRenderer, gallery: GalleryRenderer,
  accordion: AccordionRenderer, tabs: TabsRenderer, countdown: CountdownRenderer,
};

// Attach renderers to existing registry entries
for (const [type, render] of Object.entries(renderers)) {
  const def = registry.get(type);
  if (def) def.render = render;
}
