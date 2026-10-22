// Design tokens from docs/BUILD_SPEC.md (dark theme, matching the prototype's dark mode).
import type { Lang } from '../engine/types.ts';

export const colors = {
  midnight: '#0F1A33',
  panel: '#132042',
  gold: '#C9A45C',
  ivory: '#F3EBDD',
  muted: '#B9B2A3',
  line: 'rgba(201,164,92,0.35)',
  selected: 'rgba(201,164,92,0.14)',
};

/** Khmer runs taller than English: about 1.7× line height (spec), 1.5× for English. */
export function lineHeight(lang: Lang, fontSize: number, en = 1.5, km = 1.75): number {
  return Math.round(fontSize * (lang === 'km' ? km : en));
}

/** Max content width so phones get full width and larger screens get a centred column. */
export const contentWidth = 480;
