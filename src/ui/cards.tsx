// Card back, card face and the flip animation. Art is placeholder vector work from the prototype
// until the approved card artwork lands in assets/cards/.
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import type { Card, Lang } from '../engine/types.ts';
import { colors, lineHeight } from './theme.ts';

const useNativeDriver = Platform.OS !== 'web';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

const petals = [0, 45, 90, 135, 180, 225, 270, 315];

export function CardBack() {
  return (
    <View style={styles.card}>
      <Svg viewBox="0 0 70 120" width="100%" height="100%">
        <Rect x={5} y={5} width={60} height={110} rx={4} fill="none" stroke={colors.gold} strokeWidth={0.8} opacity={0.6} />
        <G transform="translate(35 60)" fill={colors.gold}>
          <Circle r={23} fill="none" stroke={colors.gold} strokeWidth={1} />
          {petals.map(a => (
            <Path key={a} transform={`rotate(${a}) translate(0 -5)`} d="M0 0C4 -5 4 -12 0 -17C-4 -12 -4 -5 0 0Z" />
          ))}
          <Circle r={4} fill={colors.midnight} stroke={colors.gold} strokeWidth={1} />
        </G>
        <Path d="M35 14l3 6-3 6-3-6z M35 94l3 6-3 6-3-6z" fill={colors.gold} />
      </Svg>
    </View>
  );
}

function Emblem({ card }: { card: Card }) {
  const kind = card.arcana === 'major' ? 'MAJ' : card.suit;
  const g = colors.gold;
  return (
    <Svg viewBox="0 0 60 60" width="62%" style={{ aspectRatio: 1 }}>
      {kind === 'MAJ' && (
        <>
          <Path d="M30 6l4 18 18-4-14 10 14 10-18-4-4 18-4-18-18 4 14-10L8 20l18 4z" fill={g} />
          <Circle cx={30} cy={30} r={5} fill={colors.midnight} />
        </>
      )}
      {kind === 'WAN' && (
        <G fill="none" stroke={g} strokeLinecap="round">
          <Path d="M30 54V10" strokeWidth={2.4} />
          <Path d="M30 20c6-4 10-4 12-10M30 28c-6-4-10-4-12-10M30 36c6-3 9-2 11-7" strokeWidth={1.6} />
        </G>
      )}
      {kind === 'CUP' && (
        <G fill="none" stroke={g} strokeLinejoin="round">
          <Path d="M12 22h36c0 12-8 20-18 20S12 34 12 22z" strokeWidth={2.2} />
          <Path d="M24 42l-2 8h16l-2-8" strokeWidth={2.2} />
          <Path d="M18 22c2-6 8-9 12-9s10 3 12 9" strokeWidth={1.4} />
        </G>
      )}
      {kind === 'SWO' && (
        <G fill="none" stroke={g} strokeWidth={2.2} strokeLinecap="round">
          <Path d="M30 6c3 6 3 24 0 34c-3-10-3-28 0-34z" fill={g} fillOpacity={0.25} />
          <Path d="M20 42h20M30 42v10" />
          <Circle cx={30} cy={54} r={2} fill={g} />
        </G>
      )}
      {kind === 'PEN' && (
        <G fill="none" stroke={g} strokeWidth={2}>
          <Circle cx={30} cy={30} r={22} />
          <Circle cx={30} cy={30} r={17} strokeWidth={1} />
          <Path
            d="M30 42c-6-6-6-14 0-20c6 6 6 14 0 20zM30 42c-8-1-12-6-13-12c7 0 11 5 13 12zM30 42c8-1 12-6 13-12c-7 0-11 5-13 12z"
            fill={g}
            fillOpacity={0.3}
          />
        </G>
      )}
    </Svg>
  );
}

export function CardFace({ card, lang }: { card: Card; lang: Lang }) {
  const nameSize = lang === 'km' ? 12 : 11;
  return (
    <View style={[styles.card, styles.face]}>
      <View style={styles.innerFrame} pointerEvents="none" />
      <Text style={styles.numeral}>{card.arcana === 'major' ? card.numeral : ''}</Text>
      <Emblem card={card} />
      <Text
        style={[styles.name, { fontSize: nameSize, lineHeight: lineHeight(lang, nameSize, 1.2, 1.5) }]}
        numberOfLines={3}
      >
        {card.name[lang]}
      </Text>
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
  const turn = useRef(new Animated.Value(open ? 1 : 0)).current;

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
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: colors.midnight,
    borderWidth: 1.5,
    borderColor: colors.gold,
    overflow: 'hidden',
  },
  face: { alignItems: 'center', justifyContent: 'space-between', paddingTop: '14%', paddingBottom: '12%', paddingHorizontal: '8%' },
  innerFrame: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(201,164,92,0.55)',
    borderRadius: 7,
  },
  numeral: { color: colors.gold, fontWeight: '700', fontSize: 13, minHeight: 18 },
  name: { color: colors.gold, fontWeight: '700', textAlign: 'center' },
  flip: { width: '100%', aspectRatio: 7 / 12 },
  side: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden' },
});
