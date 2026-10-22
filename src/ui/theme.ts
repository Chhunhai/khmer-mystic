// Design tokens from the app screens design (docs/LINKS.md) and docs/BUILD_SPEC.md.
import { useWindowDimensions } from 'react-native';
import type { Lang } from '../engine/types.ts';

export const colors = {
  midnight: '#0B1530',
  panel: '#132042',
  /** Panels over the background artwork. */
  glass: 'rgba(19,32,66,0.85)',
  glassStrong: 'rgba(19,32,66,0.9)',
  frame: 'rgba(11,21,48,0.55)',
  frameInner: 'rgba(11,21,48,0.82)',
  stepIdle: 'rgba(11,21,48,0.8)',
  stepRing: 'rgba(201,164,92,0.22)',
  gold: '#C9A45C',
  ivory: '#F3EBDD',
  muted: '#B9B2A3',
  line: 'rgba(201,164,92,0.35)',
  faint: 'rgba(201,164,92,0.28)',
  selected: 'rgba(201,164,92,0.14)',
  glow: 'rgba(232,201,136,0.35)',
};

/** Font families as registered by useFonts in src/app/_layout.tsx. */
export const fonts = {
  body: 'KantumruyPro_400Regular',
  medium: 'KantumruyPro_500Medium',
  semibold: 'KantumruyPro_600SemiBold',
  brand: 'Cinzel_700Bold',
  khmerTitle: 'Moul_400Regular',
};

/** Headings: Cinzel for English, Moul for Khmer. */
export function headingFont(lang: Lang): string {
  return lang === 'km' ? fonts.khmerTitle : fonts.brand;
}

/** Khmer runs taller than English: about 1.7× line height (spec), 1.5× for English. */
export function lineHeight(lang: Lang, fontSize: number, en = 1.5, km = 1.75): number {
  return Math.round(fontSize * (lang === 'km' ? km : en));
}

/** Phone column width; wider screens centre it, or use the desktop layouts. */
export const contentWidth = 480;
/** Desktop layouts (site header, side-by-side panels) from this window width up. */
export const wideFrom = 900;
export const pageWidth = 1320;
/** Width of the framed desktop panel (flow screens). */
export const frameWidth = 1180;

export function useWide(): boolean {
  return useWindowDimensions().width >= wideFrom;
}
