import type { CSSProperties } from 'react';

const CONTENT_KEYS = [
  'filter', 'opacity', 'mixBlendMode', 'backdropFilter',
  'color', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
  'letterSpacing', 'lineHeight', 'textAlign', 'textDecoration', 'textTransform',
  'overflow',
] as const;

/** Split styles into wrapper (positioning/visual) and content (effects/text that would leak to handles) */
export function splitContentStyles(resolved: CSSProperties): { wrapperStyles: Record<string, unknown>; contentStyles: Record<string, unknown>; hasContentStyles: boolean } {
  const contentStyles: Record<string, unknown> = {};
  const wrapperStyles = { ...resolved } as Record<string, unknown>;
  for (const k of CONTENT_KEYS) {
    if (wrapperStyles[k] !== undefined && wrapperStyles[k] !== '') {
      contentStyles[k] = wrapperStyles[k];
      delete wrapperStyles[k];
    }
  }
  // Strip sticky/fixed positioning in canvas — these only work in preview
  if (wrapperStyles.position === 'sticky' || wrapperStyles.position === 'fixed') {
    delete wrapperStyles.position;
    delete wrapperStyles.top;
    delete wrapperStyles.bottom;
  }
  return { wrapperStyles, contentStyles, hasContentStyles: Object.keys(contentStyles).length > 0 };
}
