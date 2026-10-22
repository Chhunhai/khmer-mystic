// Screen 6: the reading, built by the engine from reviewed content only.
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { buildReading } from '../engine/reading.ts';
import type { Card, Lang, PartKey } from '../engine/types.ts';
import { useFlow, useUi } from '../state/flow.tsx';
import { CardFace } from '../ui/cards.tsx';
import { AppText, GhostButton, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { colors } from '../ui/theme.ts';

const cardParts: Partial<Record<PartKey, number>> = { present: 0, challenge: 1, outcome: 2 };

/** Highlight the card's name inside its sentence, as the prototype does. Presentation only. */
function withCardName(text: string, card: Card | undefined, lang: Lang) {
  const name = card?.name[lang];
  if (!name || !text.includes(name)) return text;
  return text.split(name).map((piece, i) => (
    <Fragment key={i}>
      {i > 0 && <AppText style={styles.cardName}>{name}</AppText>}
      {piece}
    </Fragment>
  ));
}

export default function ReadingScreen() {
  const { state } = useFlow();
  const ui = useUi();
  const { lang, zodiacId, questionId, timeFrame, cardIds } = state;
  if (!zodiacId || !questionId || !timeFrame || !cardIds) return <Redirect href="/" />;

  const reading = buildReading({ lang, zodiacId, questionId, timeFrame, cardIds }, content);

  return (
    <Screen step={5}>
      <Title>{ui.rTitle}</Title>
      <View style={styles.mini}>
        {reading.cards.map((card, i) => (
          <View key={card.id} style={styles.miniSlot}>
            <View style={styles.miniCard}>
              <CardFace card={card} lang={lang} />
            </View>
            <AppText size={12} style={styles.pos}>
              {ui.pos[i]}
            </AppText>
          </View>
        ))}
      </View>
      {reading.parts.map(part => {
        const cardIndex = cardParts[part.key];
        return (
          <AppText
            key={part.key}
            size={part.key === 'opening' ? 17 : part.key === 'disclaimer' ? 13 : 16}
            style={[
              styles.part,
              part.key === 'theme' && styles.theme,
              part.key === 'disclaimer' && styles.disclaimer,
            ]}
          >
            {cardIndex === undefined ? part.text : withCardName(part.text, reading.cards[cardIndex], lang)}
          </AppText>
        );
      })}
      <PrimaryButton label={ui.again} onPress={() => router.dismissTo('/topic')} style={styles.actions} />
      <GhostButton label={ui.restart} onPress={() => router.dismissAll()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  mini: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 20 },
  miniSlot: { flex: 1, alignItems: 'center', gap: 6 },
  miniCard: { width: '100%', aspectRatio: 7 / 12 },
  pos: { color: colors.muted, textAlign: 'center' },
  part: { marginBottom: 14 },
  cardName: { color: colors.gold, fontWeight: '700' },
  theme: { borderLeftWidth: 2, borderLeftColor: colors.gold, paddingLeft: 14 },
  disclaimer: { color: colors.muted, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14, marginTop: 6 },
  actions: { marginTop: 12 },
});
