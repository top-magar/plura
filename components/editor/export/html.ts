import type { El } from '../core/types';
import { getDef } from '../core/registry';

function cssify(styles: Record<string, unknown>): string {
  return Object.entries(styles).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';');
}

function renderEl(el: El, fonts: Set<string>): string {
  const style = cssify(el.styles as Record<string, unknown>);
  const c = el.content as Record<string, string>;
  if (el.styles.fontFamily) fonts.add(String(el.styles.fontFamily).split(',')[0].trim().replace(/['"]/g, ''));

  // Check registry for custom exportHTML
  const def = getDef(el.type);
  if (def?.exportHTML) return def.exportHTML(el);

  // Built-in leaf renderers
  switch (el.type) {
    case 'text': case 'heading': case 'subheading': return `<p style="${style}">${c.innerText || ''}</p>`;
    case 'link': return `<a href="${c.href || '#'}" style="${style}">${c.innerText || ''}</a>`;
    case 'button': return `<a href="${c.href || '#'}" style="${style};display:inline-block;text-decoration:none">${c.innerText || ''}</a>`;
    case 'image': return `<img src="${c.src || ''}" alt="${c.alt || ''}" style="${style}" />`;
    case 'video': return `<iframe src="${c.src || ''}" style="${style};border:0" allowfullscreen></iframe>`;
    case 'divider': return `<hr style="${style}" />`;
    case 'spacer': return `<div style="${style}"></div>`;
    case 'icon': case 'badge': return `<span style="${style}">${c.innerText || ''}</span>`;
    case 'quote': return `<blockquote style="${style}">${c.innerText || ''}</blockquote>`;
    case 'list': return `<ul style="${style}">${(c.innerText || '').split('\n').map(li => `<li>${li}</li>`).join('')}</ul>`;
    case 'code': return `<pre style="${style}"><code>${c.innerText || ''}</code></pre>`;
    case 'embed': return c.code || '';
    case 'map': return `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(c.address || '')}&z=${c.zoom || '13'}&output=embed" style="${style};border:0" loading="lazy"></iframe>`;
    case 'gallery': return `<div style="${style}">${(c.images || '').split(',').map(src => `<img src="${src.trim()}" style="width:100%;object-fit:cover" />`).join('')}</div>`;
    case 'socialIcons': return `<div style="${style}">${(c.platforms || '').split(',').map(p => `<a href="#" style="opacity:0.7">${p.trim()}</a>`).join('')}</div>`;
    case 'accordion': { const items = JSON.parse(c.items || '[]') as { title: string; body: string }[]; return `<div style="${style}">${items.map(i => `<details><summary style="cursor:pointer;padding:12px 0;font-weight:600">${i.title}</summary><p style="padding:0 0 12px">${i.body}</p></details>`).join('')}</div>`; }
    case 'tabs': { const items = JSON.parse(c.items || '[]') as { title: string; body: string }[]; return `<div style="${style}">${items.map((t, i) => `<div style="padding:16px${i > 0 ? ';display:none' : ''}"><h4>${t.title}</h4><p>${t.body}</p></div>`).join('')}</div>`; }
    case 'countdown': return `<div style="${style}">Countdown to ${c.targetDate || ''}</div>`;
    default: break;
  }
  // Container fallback
  if (Array.isArray(el.content)) return `<div style="${style}">${el.content.map(child => renderEl(child, fonts)).join('')}</div>`;
  return `<div style="${style}">${c.innerText || ''}</div>`;
}

export function generateHTML(elements: El[], options: { title: string; description?: string; ogImage?: string }): string {
  const body = elements[0];
  if (!body) return '';
  const fonts = new Set<string>();
  const bodyHTML = renderEl(body, fonts);

  // Responsive styles
  const responsiveCSS: string[] = [];
  const collectResponsive = (el: El) => {
    if (el.responsiveStyles) {
      for (const [device, styles] of Object.entries(el.responsiveStyles)) {
        const bp = device === 'tablet' ? 768 : device === 'mobile' ? 420 : 0;
        if (bp && styles && Object.keys(styles).length) {
          responsiveCSS.push(`@media(max-width:${bp}px){[data-id="${el.id}"]{${cssify(styles as Record<string, unknown>)}}}`);
        }
      }
    }
    if (Array.isArray(el.content)) el.content.forEach(collectResponsive);
  };
  collectResponsive(body);

  const fontLinks = [...fonts].filter(f => f && f !== 'Inter' && f !== 'system-ui')
    .map(f => `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;500;600;700;800&display=swap" rel="stylesheet">`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${options.title}</title>${options.description ? `<meta name="description" content="${options.description}">` : ''}${options.ogImage ? `<meta property="og:image" content="${options.ogImage}">` : ''}${fontLinks}<style>*{box-sizing:border-box;margin:0}${responsiveCSS.join('')}</style></head><body style="margin:0;font-family:Inter,system-ui,sans-serif">${bodyHTML}</body></html>`;
}

export function downloadHTML(elements: El[], options: { title: string; description?: string; ogImage?: string }) {
  const html = generateHTML(elements, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${options.title.replace(/\s+/g, '-').toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
