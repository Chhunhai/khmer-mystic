// Line icons and ornaments from the app screens design, drawn on a 24 × 24 grid unless noted.
import type { ReactElement } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from './theme.ts';

const sun = (
  <>
    <Circle cx={12} cy={12} r={4} />
    <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </>
);
const book = (
  <>
    <Path d="M3 5c3-1 6-1 9 1c3-2 6-2 9-1v14c-3-1-6-1-9 1c-3-2-6-2-9-1z" />
    <Path d="M12 6v14" />
  </>
);

const glyphs = {
  back: <Path d="M15 5l-7 7 7 7" />,
  chevron: <Path d="M9 5l7 7-7 7" />,
  check: <Path d="M5 12l5 5 9-10" />,
  info: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 11v5M12 8h.01" />
    </>
  ),
  sun,
  book,
  cards: (
    <>
      <Rect x={4} y={5} width={9} height={15} rx={1.5} transform="rotate(-10 8 12)" />
      <Rect x={11} y={4} width={9} height={15} rx={1.5} transform="rotate(8 16 11)" />
    </>
  ),
  // Topics
  LF: sun,
  LR: <Path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  CW: (
    <>
      <Rect x={3} y={7} width={18} height={13} rx={2} />
      <Path d="M9 7V5h6v2M3 13h18" />
    </>
  ),
  MF: (
    <>
      <Circle cx={12} cy={12} r={8} />
      <Path d="M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" />
    </>
  ),
  BI: <Path d="M4 20V10M10 20V5M16 20v-7M22 20H2" />,
  FF: (
    <>
      <Circle cx={8} cy={8} r={3} />
      <Circle cx={16} cy={8} r={3} />
      <Path d="M2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5" />
    </>
  ),
  WB: <Path d="M12 20c-3-3-3-8 0-12c3 4 3 9 0 12zM12 20c-4 0-7-3-8-7c4 0 7 3 8 7zM12 20c4 0 7-3 8-7c-4 0-7 3-8 7z" />,
  EG: book,
  LO: <Path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  CD: <Path d="M12 21V3M12 6h7l2 2.5-2 2.5h-7M12 13H5l-2 2.5L5 18h7" />,
  // Time frames
  present: sun,
  near: <Path d="M12 21v-9M12 12c0-4-3-7-8-7c0 4 3 7 8 7zM12 15c0-4 3-7 8-7c0 4-3 7-8 7z" />,
  mid: <Path d="M14 3a9 9 0 1 0 7 13A7 7 0 0 1 14 3z" />,
  long: (
    <>
      <Path d="M12 3a9 9 0 1 0 9 9" />
      <Path d="M16 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
    </>
  ),
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof glyphs;

export function isIcon(name: string): name is IconName {
  return name in glyphs;
}

export function Icon({
  name,
  size = 20,
  color = colors.gold,
  strokeWidth = 1.6,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyphs[name]}
    </Svg>
  );
}

/** Icon for a topic id (LF, LR, …); nothing if the id has no icon. */
export function TopicIcon({ id, size = 20 }: { id: string; size?: number }) {
  return isIcon(id) ? <Icon name={id} size={size} /> : null;
}

/** The app's lotus mark (120 × 80 grid). */
export function LotusMark({ width = 56, strokeWidth = 3 }: { width?: number; strokeWidth?: number }) {
  return (
    <Svg viewBox="0 0 120 80" width={width} height={(width * 2) / 3} fill="none" stroke={colors.gold} strokeWidth={strokeWidth}>
      <Path d="M60 70C48 56 48 34 60 14C72 34 72 56 60 70Z" />
      <Path d="M60 70C44 64 32 48 30 28C46 34 56 50 60 70Z" />
      <Path d="M60 70C76 64 88 48 90 28C74 34 64 50 60 70Z" />
      <Path d="M60 70C40 72 22 62 12 46C32 44 50 56 60 70Z" />
      <Path d="M60 70C80 72 98 62 108 46C88 44 70 56 60 70Z" />
    </Svg>
  );
}

/** Gold rule with a diamond, used under titles. */
export function Divider() {
  return (
    <Svg width={160} height={14} viewBox="0 0 160 14">
      <Path d="M0 7H62M98 7H160" stroke={colors.gold} strokeWidth={1} strokeOpacity={0.6} />
      <Path d="M80 1L86 7L80 13L74 7Z" fill={colors.gold} />
      <Circle cx={68} cy={7} r={1.6} fill={colors.gold} />
      <Circle cx={92} cy={7} r={1.6} fill={colors.gold} />
    </Svg>
  );
}
