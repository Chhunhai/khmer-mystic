// Card back, card face and the flip animation. The frame and back are drawn from the card template
// (v0.2, royal frame) on its 420 × 720 artboard; artwork comes from assets/cards/ via cardArt.ts.
import { useEffect, useId, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Pattern, Rect, Text as SvgText } from 'react-native-svg';
import type { Card, Lang, SuitId } from '../engine/types.ts';
import { cardArt } from './cardArt.ts';
import { colors, fonts } from './theme.ts';

const useNativeDriver = Platform.OS !== 'web';

// Template colours.
const ink = colors.midnight;
const well = '#101C3B';
const gold = colors.gold;

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

/* ---------- Shared ornaments ---------- */

const leaf = 'M0 0 C3 -4 3 -9 0 -13 C-3 -9 -3 -4 0 0 Z';

function Lotus({ transform }: { transform?: string }) {
  return (
    <G transform={transform} fill={gold}>
      <Path d="M0 0 C6 -7 6 -16 0 -22 C-6 -16 -6 -7 0 0 Z" />
      <Path d="M0 0 C-7 -2 -13 -9 -14 -17 C-8 -14 -3 -8 0 0 Z" fillOpacity={0.75} />
      <Path d="M0 0 C7 -2 13 -9 14 -17 C8 -14 3 -8 0 0 Z" fillOpacity={0.75} />
      <Path d="M0 0 C-10 1 -18 -3 -21 -9 C-13 -8 -6 -5 0 0 Z" fillOpacity={0.5} />
      <Path d="M0 0 C10 1 18 -3 21 -9 C13 -8 6 -5 0 0 Z" fillOpacity={0.5} />
      <Path d="M-12 3 C-4 6 4 6 12 3" fill="none" stroke={gold} strokeWidth={1.2} />
    </G>
  );
}

/** Lotus-and-kbach corner, drawn for the top-left; mirror it with a transform. */
function Corner({ transform }: { transform?: string }) {
  return (
    <G transform={transform} stroke={gold} fill="none" strokeLinecap="round">
      <Path d="M20 12 C40 8 58 12 68 26 C73 35 64 42 57 37 C52 33 56 27 61 29" strokeWidth={1.6} />
      <Path d="M12 20 C8 40 12 58 26 68 C35 73 42 64 37 57 C33 52 27 56 29 61" strokeWidth={1.6} />
      <Path d="M30 16 C44 15 52 18 58 24" strokeWidth={0.9} />
      <Path d="M16 30 C15 44 18 52 24 58" strokeWidth={0.9} />
      <G stroke="none">
        <Lotus transform="translate(40 40) rotate(-45)" />
      </G>
      <Circle cx={74} cy={16} r={1.8} fill={gold} stroke="none" />
      <Circle cx={16} cy={74} r={1.8} fill={gold} stroke="none" />
    </G>
  );
}

/** Leaf flourish running from the centre to the left edge; mirror it for the right. */
function Flourish({ transform }: { transform?: string }) {
  const leaves: [number, number, number][] = [
    [152, 32, -15], [130, 34, -22], [108, 38, -30], [90, 42, -40],
    [142, 35, 165], [119, 38, 160], [98, 42, 150],
  ];
  return (
    <G transform={transform}>
      <Path
        d="M174 30 C150 33 126 35 104 39 C86 42 74 48 68 56 C64 63 71 69 77 65 C81 62 78 57 74 59"
        fill="none"
        stroke={gold}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <G fill={gold}>
        {leaves.map(([x, y, a]) => (
          <Path key={`${x}-${a}`} transform={`translate(${x} ${y}) rotate(${a})`} d={leaf} />
        ))}
      </G>
      <Circle cx={176} cy={30} r={2} fill={gold} />
    </G>
  );
}

/** Double gold rule and bead border shared by front and back. */
function Border() {
  return (
    <>
      <Rect x={6} y={6} width={408} height={708} rx={12} fill="none" stroke={gold} strokeWidth={2} />
      <Rect x={12} y={12} width={396} height={696} rx={8} fill="none" stroke={gold} strokeWidth={0.8} strokeOpacity={0.7} />
      <Rect
        x={19} y={19} width={382} height={682} rx={6}
        fill="none" stroke={gold} strokeWidth={2.4} strokeDasharray="0.1 8" strokeLinecap="round" strokeOpacity={0.8}
      />
    </>
  );
}

/** Suit icons on a 60 × 60 grid, as in the template's crest. */
function SuitIcon({ suit, transform, opacity }: { suit: SuitId; transform?: string; opacity?: number }) {
  return (
    <G
      transform={transform}
      opacity={opacity}
      fill="none"
      stroke={gold}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {suit === 'WAN' && (
        <>
          <Path d="M30 54V10" />
          <Path d="M30 20c6-4 10-4 12-10M30 28c-6-4-10-4-12-10M30 36c6-3 9-2 11-7" strokeWidth={2} />
        </>
      )}
      {suit === 'CUP' && (
        <>
          <Path d="M12 22h36c0 12-8 20-18 20S12 34 12 22z" />
          <Path d="M24 42l-2 8h16l-2-8" />
          <Path d="M18 22c2-6 8-9 12-9s10 3 12 9" strokeWidth={2} />
        </>
      )}
      {suit === 'SWO' && (
        <>
          <Path d="M30 6c3 6 3 24 0 34c-3-10-3-28 0-34z" />
          <Path d="M20 42h20M30 42v10" />
        </>
      )}
      {suit === 'PEN' && (
        <>
          <Circle cx={30} cy={30} r={22} />
          <Path
            d="M30 42c-6-6-6-14 0-20c6 6 6 14 0 20zM30 42c-8-1-12-6-13-12c7 0 11 5 13 12zM30 42c8-1 12-6 13-12c-7 0-11 5-13 12z"
            strokeWidth={2}
          />
        </>
      )}
    </G>
  );
}

/* ---------- Card back ---------- */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// Flame petals along the diamond's four edges: start point, step and angle per edge.
const edgeFlames: [number, number, number, number, number][] = [
  [231.1, 127.5, 18.5, 33, 60.7],
  [342.1, 394.5, -18.5, 33, 119.3],
  [188.9, 592.5, -18.5, -33, -119.3],
  [77.9, 325.5, 18.5, -33, -60.7],
];
const flameLeaf = 'M0 0 C5 -5 6 -12 0 -19 C-6 -12 -5 -5 0 0 Z';
const bigFlame = 'M0 0 C10 -9 12 -22 0 -40 C-12 -22 -10 -9 0 0 Z M0 -8 C5 -12 5 -19 0 -27 C-5 -19 -5 -12 0 -8 Z';
const sunFlame = 'M0 0 C6 -7 8 -18 0 -34 C-8 -18 -6 -7 0 0 Z M0 -7 C3 -11 3 -17 0 -23 C-3 -17 -3 -11 0 -7 Z';

function Scroll({ transform }: { transform: string }) {
  return (
    <G transform={transform} fill="none" stroke={gold} strokeLinecap="round" strokeWidth={1.3}>
      <Path d="M0 -44 C-9 -12 9 12 0 44" />
      <Path d="M0 -44 C18 -40 23 -20 11 -9 C3 -3 -6 -9 -2 -15 C1 -19 6 -17 6 -13" />
      <Path d="M0 44 C-18 40 -23 20 -11 9 C-3 3 6 9 2 15 C-1 19 -6 17 -6 13" />
      <G fill={gold} stroke="none">
        <Path transform="translate(-4 -26) rotate(-60)" d={leaf} />
        <Path transform="translate(4 26) rotate(120)" d={leaf} />
        <Path transform="translate(-5 -4) rotate(-80)" d={leaf} />
        <Path transform="translate(5 4) rotate(100)" d={leaf} />
        <Circle cx={0} cy={-46} r={2} />
        <Circle cx={0} cy={46} r={2} />
      </G>
    </G>
  );
}

export function CardBack() {
  const lattice = `lat${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={styles.card}>
      <Svg viewBox="0 0 420 720" width="100%" height="100%">
        <Defs>
          <Pattern id={lattice} width={20} height={20} patternUnits="userSpaceOnUse">
            <Path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke={gold} strokeWidth={0.6} />
            <Circle cx={10} cy={10} r={0.9} fill={gold} />
          </Pattern>
        </Defs>
        <Rect x={26} y={26} width={368} height={668} fill={`url(#${lattice})`} opacity={0.13} />
        <Border />
        <Rect x={26} y={26} width={368} height={668} rx={4} fill="none" stroke={gold} strokeWidth={0.8} strokeOpacity={0.5} />
        <Corner transform="scale(1.4)" />
        <Corner transform="translate(420 0) scale(-1.4 1.4)" />
        <Corner transform="translate(0 720) scale(1.4 -1.4)" />
        <Corner transform="translate(420 720) scale(-1.4 -1.4)" />
        <Flourish transform="translate(0 30)" />
        <Flourish transform="translate(420 30) scale(-1 1)" />
        <Flourish transform="translate(0 690) scale(1 -1)" />
        <Flourish transform="translate(420 690) scale(-1 -1)" />
        <Scroll transform="translate(80 214) rotate(-28)" />
        <Scroll transform="translate(340 214) scale(-1 1) rotate(-28)" />
        <Scroll transform="translate(80 506) scale(1 -1) rotate(-28)" />
        <Scroll transform="translate(340 506) scale(-1 -1) rotate(-28)" />
        <G fill={gold}>
          {edgeFlames.flatMap(([x, y, dx, dy, a]) =>
            range(7).map(k => (
              <Path
                key={`${a}-${k}`}
                transform={`translate(${(x + k * dx).toFixed(1)} ${(y + k * dy).toFixed(1)}) rotate(${a})`}
                d={flameLeaf}
              />
            )),
          )}
        </G>
        <Path d="M210 96 L358 360 L210 624 L62 360 Z" fill={ink} stroke={gold} strokeWidth={2.2} />
        <Path
          d="M210 112 L340 360 L210 608 L80 360 Z"
          fill="none" stroke={gold} strokeWidth={2.6} strokeDasharray="0.1 8" strokeLinecap="round"
        />
        <Path d="M210 128 L322 360 L210 592 L98 360 Z" fill={well} stroke={gold} strokeWidth={1.2} />
        <Path d="M210 140 L310 360 L210 580 L110 360 Z" fill="none" stroke={gold} strokeWidth={0.7} strokeOpacity={0.6} />
        <G fill={gold} fillRule="evenodd">
          <Path transform="translate(210 98)" d={bigFlame} />
          <Path transform="translate(210 622) rotate(180)" d={bigFlame} />
        </G>
        <Lotus transform="translate(60 360) rotate(-90)" />
        <Lotus transform="translate(360 360) rotate(90)" />
        <Circle cx={210} cy={148} r={2.4} fill={gold} />
        <Circle cx={210} cy={572} r={2.4} fill={gold} />
        <G transform="translate(210 340)">
          <G stroke={gold} strokeWidth={1.3} strokeLinecap="round" strokeOpacity={0.8}>
            {range(16).map(k => (
              <Line key={k} x1={0} y1={-54} x2={0} y2={-94} transform={`rotate(${11.25 + k * 22.5})`} />
            ))}
          </G>
          <G fill={gold} fillRule="evenodd">
            {range(16).map(k => (
              <Path key={k} transform={`rotate(${k * 22.5}) translate(0 -52)`} d={sunFlame} />
            ))}
          </G>
          <Circle r={50} fill={well} stroke={gold} strokeWidth={2} />
          <Circle r={44} fill="none" stroke={gold} strokeWidth={2.4} strokeDasharray="0.1 6.9" strokeLinecap="round" />
          <Circle r={37} fill={gold} />
          <Circle r={29} fill="none" stroke={well} strokeWidth={1.2} />
          <G fill={well}>
            {range(8).map(k => (
              <Path key={k} transform={`rotate(${k * 45})`} d="M0 -4 C5 -9 5 -17 0 -24 C-5 -17 -5 -9 0 -4 Z" />
            ))}
            <Circle r={4} />
          </G>
        </G>
        <G fill="none" stroke={gold} strokeWidth={1} strokeOpacity={0.55} strokeLinecap="round">
          <Path d="M136 462 C148 458 160 466 172 462 S196 458 208 462 S232 466 244 462 S268 458 280 462" />
          <Path d="M150 472 C162 468 174 476 186 472 S210 468 222 472 S246 476 258 472 S268 468 270 472" />
        </G>
        <Lotus transform="translate(170 506) scale(0.85)" />
        <Lotus transform="translate(210 512) scale(1.15)" />
        <Lotus transform="translate(250 506) scale(0.85)" />
      </Svg>
    </View>
  );
}

/* ---------- Card front ---------- */

// Arch window in artboard coordinates; the artwork (2:3) sits in its bounding box.
const arch =
  'M28 588 L28 114 C28 84 56 70 86 66 C140 58 180 52 210 40 C240 52 280 58 334 66 C364 70 392 84 392 114 L392 588 Z';
const pct = (v: number, of: number) => `${(v / of) * 100}%` as const;

/** Frame drawn over the art: a matte that hides everything outside the arch, then the ornaments. */
function FrontFrame({ card }: { card: Card }) {
  return (
    <Svg viewBox="0 0 420 720" width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Path d={`M0 0 H420 V720 H0 Z ${arch}`} fill={ink} fillRule="evenodd" />
      <Border />
      <Path d={arch} fill="none" stroke={gold} strokeWidth={1.8} />
      <Path
        d="M28 690 L28 600 C28 584 38 576 54 576 L168 576 C188 576 198 566 210 556 C222 566 232 576 252 576 L366 576 C382 576 392 584 392 600 L392 690 Z"
        fill={ink} stroke={gold} strokeWidth={1.8}
      />
      <Path
        d="M34 684 L34 602 C34 590 42 582 56 582 L170 582 C190 582 200 573 210 564 C220 573 230 582 250 582 L364 582 C378 582 386 590 386 602 L386 684 Z"
        fill="none" stroke={gold} strokeWidth={0.8} strokeOpacity={0.6}
      />
      <Lotus transform="translate(72 646)" />
      <Lotus transform="translate(348 646)" />
      <Flourish />
      <Flourish transform="translate(420 0) scale(-1 1)" />
      <Corner />
      <Corner transform="translate(420 0) scale(-1 1)" />
      <Corner transform="translate(0 720) scale(1 -1)" />
      <Corner transform="translate(420 720) scale(-1 -1)" />
      <Path d="M178 52 L178 26 L210 6 L242 26 L242 52 Z" fill={ink} stroke={gold} strokeWidth={1.8} strokeLinejoin="round" />
      <Path
        d="M184 47 L184 29 L210 13 L236 29 L236 47 Z"
        fill="none" stroke={gold} strokeWidth={0.8} strokeOpacity={0.6} strokeLinejoin="round"
      />
      {card.suit ? (
        <SuitIcon suit={card.suit} transform={`translate(197 25) scale(${26 / 60})`} />
      ) : (
        <SvgText x={210} y={44.5} fill={gold} fontFamily={fonts.brand} fontSize={15} textAnchor="middle">
          {card.numeral ?? ''}
        </SvgText>
      )}
    </Svg>
  );
}

/** The card front. The title band shows the name in the reading's language only. */
export function CardFace({ card, lang }: { card: Card; lang: Lang }) {
  const [width, setWidth] = useState(0);
  const art = cardArt[card.id];
  // Template sizes (23 px English, 15 px Khmer on a 420 px card), raised to stay legible on small cards.
  const scale = width / 420;
  const size = lang === 'km' ? Math.max(10, 18 * scale) : Math.max(8, 23 * scale);

  return (
    <View style={[styles.card, styles.face]} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.window}>
        {art ? (
          <Image source={art} style={styles.art} resizeMode="cover" accessibilityIgnoresInvertColors />
        ) : card.suit ? (
          <Svg viewBox="0 0 60 60" width="45%" style={styles.placeholder}>
            <SuitIcon suit={card.suit} opacity={0.5} />
          </Svg>
        ) : null}
      </View>
      <FrontFrame card={card} />
      <View style={styles.band}>
        {width > 0 && (
          <Text
            style={[
              styles.title,
              lang === 'km'
                ? { fontFamily: fonts.khmerTitle, color: colors.ivory, fontSize: size, lineHeight: Math.round(size * 1.7) }
                : { fontFamily: fonts.brand, fontSize: size, lineHeight: Math.round(size * 1.15), letterSpacing: size * 0.08 },
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {lang === 'en' ? card.name.en.toUpperCase() : card.name.km}
          </Text>
        )}
      </View>
    </View>
  );
}

/** A card that turns over once when tapped. `open` lives in flow state so it survives navigation. */
export function FlipCard({
  card,
  lang,
  open,
  label,
  onOpen,
}: {
  card: Card;
  lang: Lang;
  open: boolean;
  label: string;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const turn = useState(() => new Animated.Value(open ? 1 : 0))[0];

  useEffect(() => {
    if (!open) {
      turn.setValue(0);
      return;
    }
    if (reduced) turn.setValue(1);
    else Animated.timing(turn, { toValue: 1, duration: 700, useNativeDriver }).start();
  }, [open, reduced, turn]);

  const back = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const front = turn.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <Pressable
      onPress={onOpen}
      disabled={open}
      accessibilityRole="button"
      accessibilityLabel={open ? `${label}: ${card.name[lang]}` : label}
      style={styles.flip}
    >
      <Animated.View style={[styles.side, { transform: [{ perspective: 900 }, { rotateY: back }] }]}>
        <CardBack />
      </Animated.View>
      <Animated.View style={[styles.side, { transform: [{ perspective: 900 }, { rotateY: front }] }]}>
        <CardFace card={card} lang={lang} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: ink, overflow: 'hidden' },
  face: { backgroundColor: colors.panel },
  window: {
    position: 'absolute',
    left: pct(28, 420),
    top: pct(40, 720),
    width: pct(364, 420),
    height: pct(548, 720),
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: { width: '100%', height: '100%' },
  placeholder: { aspectRatio: 1 },
  band: {
    position: 'absolute',
    left: pct(96, 420),
    top: pct(588, 720),
    width: pct(228, 420),
    height: pct(96, 720),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: gold, textAlign: 'center' },
  flip: { width: '100%', aspectRatio: 7 / 12 },
  side: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden' },
});
