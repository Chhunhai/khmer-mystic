// Screen 5: the deck is shuffled, three cards are dealt down into Present / Challenge / Outcome,
// then each is turned over. "Shuffle again" gathers the three back, reshuffles and deals anew.
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { drawCards } from '../engine/reading.ts';
import { useFlow, useUi, type Flipped } from '../state/flow.tsx';
import { CardBack, FlipCard, useReducedMotion } from '../ui/cards.tsx';
import { AppText, GhostButton, Hint, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { colors, useWide } from '../ui/theme.ts';

const useNativeDriver = Platform.OS !== 'web';
const deckSize = 6; // card backs drawn in the deck stack
const slotIndexes = [0, 1, 2] as const;
type Phase = 'shuffling' | 'dealing' | 'ready';

/** Faint rings behind the dealt cards. */
function Rings({ top }: { top: number }) {
  return (
    <Svg width={360} height={360} viewBox="0 0 360 360" style={[styles.rings, { top }]}>
      <Circle cx={180} cy={180} r={170} fill="none" stroke={colors.gold} strokeOpacity={0.18} />
      <Circle
        cx={180} cy={180} r={140}
        fill="none" stroke={colors.gold} strokeOpacity={0.25} strokeDasharray="1 7" strokeWidth={2} strokeLinecap="round"
      />
      <Circle cx={180} cy={180} r={110} fill="none" stroke={colors.gold} strokeOpacity={0.15} />
    </Svg>
  );
}

/**
 * The deck. While `shuffle` runs 0 → 1 the stack splits into two halves that slide out left and right
 * and riffle back together, the odd cards a beat behind the even ones.
 */
function Deck({ width, height, shuffle }: { width: number; height: number; shuffle: Animated.Value }) {
  return (
    <View style={{ width, height }} accessible={false}>
      {Array.from({ length: deckSize }, (_, k) => {
        const side = k % 2 === 0 ? -1 : 1;
        const spread = width * 0.42 + k * 2;
        const lift = -k * 0.8; // a little thickness to the stack
        const input = k % 2 === 0 ? [0, 0.3, 0.5, 0.8, 1] : [0, 0.3, 0.6, 0.9, 1];
        const transform = [
          { translateX: shuffle.interpolate({ inputRange: input, outputRange: [0, side * spread, side * spread, 0, 0] }) },
          { translateY: shuffle.interpolate({ inputRange: input, outputRange: [lift, lift - 6, lift - 6, lift, lift] }) },
          {
            rotate: shuffle.interpolate({
              inputRange: input,
              outputRange: ['0deg', `${side * (5 + k)}deg`, `${side * (5 + k)}deg`, '0deg', '0deg'],
            }),
          },
        ];
        return (
          <Animated.View key={k} style={[StyleSheet.absoluteFill, { transform }]}>
            <CardBack />
          </Animated.View>
        );
      })}
    </View>
  );
}

export default function DrawScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const wide = useWide();
  const reduced = useReducedMotion();
  const ready = !!(state.zodiacId && state.questionId && state.timeFrame);

  // Cards already on the table (back from the reading, or a restored session) skip the animation.
  const startDealt = !!state.cardIds;
  const [shuffle] = useState(() => new Animated.Value(0));
  const [dealt] = useState(() => slotIndexes.map(() => new Animated.Value(startDealt ? 1 : 0)));
  const [phase, setPhase] = useState<Phase>(startDealt ? 'ready' : 'shuffling');
  const [rowWidth, setRowWidth] = useState(0);

  // Layout: deck on top, the three slots below it.
  const gap = wide ? 24 : 8;
  const maxCard = wide ? 190 : 106;
  const column = rowWidth > 0 ? (rowWidth - gap * 2) / 3 : maxCard;
  const cardW = Math.min(maxCard, column);
  const cardH = (cardW * 12) / 7;
  const deckScale = wide ? 0.55 : 0.8;
  const deckW = cardW * deckScale;
  const deckH = cardH * deckScale;
  const slotsTop = deckH + 24;
  const stageHeight = slotsTop + cardH + 8 + 26;
  // From each slot's card centre back to the deck centre.
  const fromX = (i: number) => (1 - i) * (column + gap);
  const fromY = -(slotsTop + cardH / 2 - deckH / 2);

  // With Reduce Motion on, every step runs instantly.
  const ms = (duration: number) => (reduced ? 0 : duration);

  /** Shuffle the deck, then deal the three cards down one after another. Call with phase 'shuffling'. */
  const shuffleAndDeal = () => {
    shuffle.setValue(0);
    Animated.loop(
      Animated.timing(shuffle, { toValue: 1, duration: ms(700), easing: Easing.inOut(Easing.quad), useNativeDriver }),
      { iterations: reduced ? 1 : 2 },
    ).start(() => {
      shuffle.setValue(0);
      setPhase('dealing');
      Animated.stagger(
        ms(170),
        dealt.map(v => Animated.timing(v, { toValue: 1, duration: ms(480), easing: Easing.out(Easing.cubic), useNativeDriver })),
      ).start(() => setPhase('ready'));
    });
  };

  useEffect(() => {
    if (!ready || startDealt) return;
    update({ cardIds: drawCards(content.cards), flipped: [false, false, false] });
    shuffleAndDeal();
    // Runs once on arrival; later deals come from "Shuffle again".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return <Redirect href="/" />;

  const shuffleAgain = () => {
    const newDeal = () => {
      update({ cardIds: drawCards(content.cards), flipped: [false, false, false] });
      shuffleAndDeal();
    };
    // Turn the cards face down and gather them back up into the deck first.
    update({ flipped: [false, false, false] });
    setPhase('shuffling');
    Animated.stagger(
      ms(80),
      [...dealt].reverse().map(v => Animated.timing(v, { toValue: 0, duration: ms(320), easing: Easing.in(Easing.cubic), useNativeDriver })),
    ).start(newDeal);
  };

  const cards = state.cardIds?.map(id => content.cards.find(c => c.id === id)!);
  const allOpen = state.flipped.every(Boolean);

  return (
    <Screen
      width={900}
      step={4}
      footer={
        <>
          <GhostButton label={ui.shuffle} onPress={shuffleAgain} disabled={phase !== 'ready'} />
          <PrimaryButton label={ui.see} onPress={() => router.push('/reading')} disabled={!allOpen || phase !== 'ready'} />
        </>
      }
    >
      <View style={styles.top}>
        <Title>{ui.dTitle}</Title>
        <Hint>{ui.dHint}</Hint>
      </View>
      <View style={[styles.stage, { height: stageHeight }]}>
        <Rings top={slotsTop + cardH / 2 - 180} />
        <View style={styles.deck}>
          <Deck width={deckW} height={deckH} shuffle={shuffle} />
        </View>
        <View
          style={[styles.slots, { top: slotsTop, gap }]}
          onLayout={e => setRowWidth(e.nativeEvent.layout.width)}
          pointerEvents={phase === 'ready' ? 'auto' : 'none'}
        >
          {slotIndexes.map(i => {
            const card = cards?.[i];
            const p = dealt[i];
            const side = i - 1;
            const flight = {
              opacity: p.interpolate({ inputRange: [0, 0.001, 1], outputRange: [0, 1, 1] }),
              transform: [
                { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [fromX(i), 0] }) },
                { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [fromY, 0] }) },
                { rotate: p.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', `${side * 10}deg`, '0deg'] }) },
                { scale: p.interpolate({ inputRange: [0, 1], outputRange: [deckScale, 1] }) },
              ],
            };
            return (
              <View key={i} style={styles.slot}>
                <Animated.View style={[{ width: cardW }, flight, state.flipped[i] && styles.glow]}>
                  {card && (
                    <FlipCard
                      card={card}
                      lang={state.lang}
                      open={state.flipped[i]}
                      label={ui.pos[i]}
                      onOpen={() => update({ flipped: state.flipped.map((f, j) => f || j === i) as Flipped })}
                    />
                  )}
                </Animated.View>
                <AppText size={14} style={styles.pos}>
                  {ui.pos[i]}
                </AppText>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { gap: 6 },
  stage: { marginTop: 24, alignItems: 'center' },
  rings: { position: 'absolute' },
  deck: { position: 'absolute', top: 0 },
  slots: { position: 'absolute', left: 0, right: 0, flexDirection: 'row' },
  slot: { flex: 1, alignItems: 'center', gap: 8 },
  glow: { borderRadius: 8, boxShadow: `0 0 24px ${colors.glow}` },
  pos: { color: colors.gold, fontWeight: '600', textAlign: 'center' },
});
