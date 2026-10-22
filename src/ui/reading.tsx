// The full reading text, shared by the full-reading screen (phone) and the wide result screen.
import { StyleSheet, View } from 'react-native';
import type { PartKey } from '../engine/types.ts';
import { useReading, useUi } from '../state/flow.tsx';
import { CardFace } from './cards.tsx';
import { AppText, Panel, PanelHeading } from './kit.tsx';
import { colors } from './theme.ts';

const cardParts: PartKey[] = ['present', 'challenge', 'outcome'];

/**
 * Phone: opening first, each card's text beside a small card. Wide: the overall message leads,
 * card texts sit under their position labels (the cards are shown large next to it).
 */
export function FullReadingText({ wide = false }: { wide?: boolean }) {
  const ui = useUi();
  const r = useReading();
  if (!r) return null;
  const size = wide ? 16 : 15;

  const overall = (
    <View style={[styles.overall, wide && styles.overallWide]}>
      <PanelHeading size={wide ? 16 : 15}>{ui.overall}</PanelHeading>
      <AppText size={size}>{r.part('theme')}</AppText>
    </View>
  );

  return (
    <View style={[styles.stack, wide && styles.stackWide]}>
      {wide && overall}
      <AppText size={16}>{r.part('opening')}</AppText>
      <AppText size={size} style={styles.muted}>
        {r.part('strength')}
      </AppText>
      {cardParts.map((key, i) =>
        wide ? (
          <View key={key} style={styles.wideCard}>
            <AppText size={13} style={styles.pos}>
              {ui.pos[i]}
            </AppText>
            <AppText size={size}>{r.part(key)}</AppText>
          </View>
        ) : (
          <Panel key={key} style={styles.cardRow}>
            <View style={styles.thumb}>
              <CardFace card={r.reading.cards[i]} lang={r.lang} />
            </View>
            <View style={styles.cardText}>
              <AppText size={12} style={styles.pos}>
                {ui.pos[i]}
              </AppText>
              <AppText size={15}>{r.part(key)}</AppText>
            </View>
          </Panel>
        ),
      )}
      {!wide && overall}
      <AppText size={size}>{r.part('advice')}</AppText>
      <AppText size={16} style={[styles.closing, wide && styles.left]}>
        {r.part('closing')}
      </AppText>
      <View style={styles.disclaimer}>
        <AppText size={wide ? 14 : 13} style={styles.muted}>
          {r.part('disclaimer')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  stackWide: { gap: 18 },
  muted: { color: colors.muted },
  pos: { color: colors.gold, fontWeight: '600', letterSpacing: 0.7 },
  cardRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', padding: 14 },
  thumb: { width: 70, height: 120 },
  cardText: { flex: 1, gap: 4 },
  wideCard: { gap: 2 },
  overall: {
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 16,
    backgroundColor: colors.selected,
    gap: 6,
  },
  overallWide: { paddingVertical: 18, paddingHorizontal: 20 },
  closing: { color: colors.gold, textAlign: 'center' },
  left: { textAlign: 'left' },
  disclaimer: { paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12 },
});
