// Screen 5: three cards are dealt face down; turn each over, or shuffle again for a new deal.
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { drawCards } from '../engine/reading.ts';
import { useFlow, useUi, type Flipped } from '../state/flow.tsx';
import { FlipCard, useReducedMotion } from '../ui/cards.tsx';
import { AppText, GhostButton, Hint, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { colors, useWide } from '../ui/theme.ts';

const useNativeDriver = Platform.OS !== 'web';

/** Faint rings behind the cards. */
function Rings() {
  return (
    <Svg width={360} height={360} viewBox="0 0 360 360" style={styles.rings}>
      <Circle cx={180} cy={180} r={170} fill="none" stroke={colors.gold} strokeOpacity={0.18} />
      <Circle
        cx={180} cy={180} r={140}
        fill="none" stroke={colors.gold} strokeOpacity={0.25} strokeDasharray="1 7" strokeWidth={2} strokeLinecap="round"
      />
      <Circle cx={180} cy={180} r={110} fill="none" stroke={colors.gold} strokeOpacity={0.15} />
    </Svg>
  );
}

export default function DrawScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const wide = useWide();
  const reduced = useReducedMotion();
  const shake = useState(() => new Animated.Value(0))[0];
  const ready = !!(state.zodiacId && state.questionId && state.timeFrame);

  const deal = () => update({ cardIds: drawCards(content.cards), flipped: [false, false, false] });

  useEffect(() => {
    if (ready && !state.cardIds) deal();
    // Deal once on arrival; later deals come from "Shuffle again".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state.cardIds]);

  if (!ready) return <Redirect href="/" />;

  const shuffle = () => {
    if (reduced) return deal();
    shake.setValue(0);
    Animated.timing(shake, { toValue: 1, duration: 600, useNativeDriver }).start(deal);
  };

  const cards = state.cardIds?.map(id => content.cards.find(c => c.id === id)!);
  const allOpen = state.flipped.every(Boolean);
  const wobble = {
    transform: [
      { translateX: shake.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -10, 8, -4, 0] }) },
      { rotate: shake.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['0deg', '-2deg', '2deg', '-1deg', '0deg'] }) },
    ],
  };

  return (
    <Screen
      width={900}
      step={4}
      footer={
        <>
          <GhostButton label={ui.shuffle} onPress={shuffle} />
          <PrimaryButton label={ui.see} onPress={() => router.push('/reading')} disabled={!allOpen} />
        </>
      }
    >
      <View style={styles.top}>
        <Title>{ui.dTitle}</Title>
        <Hint>{ui.dHint}</Hint>
      </View>
      <View style={[styles.stage, wide && styles.stageWide]}>
        <Rings />
        {cards && (
          <Animated.View style={[styles.slots, wide && styles.slotsWide, wobble]}>
            {cards.map((card, i) => (
              <View key={card.id} style={styles.slot}>
                <View style={[styles.card, wide && styles.cardWide, state.flipped[i] && styles.glow]}>
                  <FlipCard
                    card={card}
                    lang={state.lang}
                    open={state.flipped[i]}
                    label={ui.pos[i]}
                    onOpen={() => update({ flipped: state.flipped.map((f, j) => f || j === i) as Flipped })}
                  />
                </View>
                <AppText size={14} style={styles.pos}>
                  {ui.pos[i]}
                </AppText>
              </View>
            ))}
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stageWide: { height: 440 },
  slotsWide: { top: 24, left: 0, right: 0, gap: 24 },
  cardWide: { maxWidth: 190 },
  top: { gap: 6 },
  stage: { height: 360, marginTop: 24, alignItems: 'center' },
  rings: { position: 'absolute', top: 0 },
  slots: { position: 'absolute', top: 76, left: -4, right: -4, flexDirection: 'row', gap: 8 },
  slot: { flex: 1, alignItems: 'center', gap: 8 },
  card: { width: '100%', maxWidth: 106, borderRadius: 8 },
  glow: { boxShadow: `0 0 24px ${colors.glow}` },
  pos: { color: colors.gold, fontWeight: '600', textAlign: 'center' },
});
