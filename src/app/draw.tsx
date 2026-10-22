// Screen 5: shuffle, then turn over the three cards.
import { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { drawCards } from '../engine/reading.ts';
import { useFlow, useUi, type Flipped } from '../state/flow.tsx';
import { CardBack, FlipCard, useReducedMotion } from '../ui/cards.tsx';
import { AppText, Hint, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { colors } from '../ui/theme.ts';

const useNativeDriver = Platform.OS !== 'web';

/** The stacked deck, wobbling while it shuffles (like the prototype's shuffle keyframes). */
function Deck({ shake }: { shake: Animated.Value }) {
  const x = (a: number, b: number) => shake.interpolate({ inputRange: [0, 0.3, 0.6, 1], outputRange: [0, a, b, 0] });
  const r = (a: number, b: number, rest: number) =>
    shake.interpolate({ inputRange: [0, 0.3, 0.6, 1], outputRange: [`${rest}deg`, `${a}deg`, `${b}deg`, `${rest}deg`] });
  const lift = shake.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -14, 0] });
  return (
    <View style={styles.deck}>
      <Animated.View style={[styles.deckCard, { transform: [{ translateX: x(-46, 30) }, { rotate: r(-8, 5, 0) }] }]}>
        <CardBack />
      </Animated.View>
      <Animated.View style={[styles.deckCard, { transform: [{ translateX: x(46, -30) }, { rotate: r(8, -5, -4) }] }]}>
        <CardBack />
      </Animated.View>
      <Animated.View style={[styles.deckCard, { transform: [{ translateY: lift }, { rotate: '3deg' }] }]}>
        <CardBack />
      </Animated.View>
    </View>
  );
}

export default function DrawScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const reduced = useReducedMotion();
  const shake = useRef(new Animated.Value(0)).current;
  const [shuffling, setShuffling] = useState(false);

  if (!state.zodiacId || !state.questionId || !state.timeFrame) return <Redirect href="/" />;

  const draw = () => {
    const deal = () => {
      update({ cardIds: drawCards(content.cards), flipped: [false, false, false] });
      setShuffling(false);
    };
    if (reduced) return deal();
    setShuffling(true);
    shake.setValue(0);
    Animated.timing(shake, { toValue: 1, duration: 900, useNativeDriver }).start(deal);
  };

  const cards = state.cardIds?.map(id => content.cards.find(c => c.id === id)!);
  const allOpen = state.flipped.every(Boolean);

  return (
    <Screen step={4}>
      <Title>{ui.dTitle}</Title>
      <Hint>{ui.dHint}</Hint>
      {!cards ? (
        <>
          <Deck shake={shake} />
          <PrimaryButton label={ui.draw} onPress={draw} disabled={shuffling} />
        </>
      ) : (
        <>
          <View style={styles.slots}>
            {cards.map((card, i) => (
              <View key={card.id} style={styles.slot}>
                <FlipCard
                  card={card}
                  lang={state.lang}
                  open={state.flipped[i]}
                  label={ui.pos[i]}
                  onOpen={() => update({ flipped: state.flipped.map((f, j) => f || j === i) as Flipped })}
                />
                <AppText size={13} style={styles.pos}>
                  {ui.pos[i]}
                </AppText>
              </View>
            ))}
          </View>
          <AppText size={14} style={styles.tapNote}>
            {allOpen ? '' : ui.tap}
          </AppText>
          <PrimaryButton label={ui.see} onPress={() => router.push('/reading')} disabled={!allOpen} style={styles.foot} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  deck: { width: 117, height: 200, alignSelf: 'center', marginTop: 12, marginBottom: 28 },
  deckCard: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  slots: { flexDirection: 'row', gap: 12 },
  slot: { flex: 1, alignItems: 'center', gap: 8 },
  pos: { color: colors.muted, textAlign: 'center' },
  tapNote: { color: colors.muted, textAlign: 'center', marginTop: 16, minHeight: 22 },
  foot: { marginTop: 24 },
});
