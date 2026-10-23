// The full reading text, shared by the full-reading screen (phone) and the wide result screen.
import { StyleSheet, View } from 'react-native';
import type { PartKey } from '../engine/types.ts';
import { useReading, useUi } from '../state/flow.tsx';
import { useCardViewer, ZoomableCard } from './cardViewer.tsx';
import { AppText, Panel, PanelHeading } from './kit.tsx';
import { colors } from './theme.ts';

const cardParts: PartKey[] = ['present', 'challenge', 'outcome'];

/**
 * Phone: each card's text beside a small card, then the overall message.
 * Wide: card texts sit under their position labels; the large cards and the overall message
 * are shown beside this column by the result screen.
 */
export function FullReadingText({ wide = false }: { wide?: boolean }) {
  const ui = useUi();
  const r = useReading();
  const viewer = useCardViewer();
  if (!r) return null;
  const size = 16;


  return (
    <View style={[styles.stack, wide && styles.stackWide]}>
      <AppText size={16}>{r.part('opening')}</AppText>
      {/* The birth-year line, when the animal has no guidance woven into the cards. */}
      {r.part('strength') ? (
        <AppText size={size} style={styles.muted}>
          {r.part('strength')}
        </AppText>
      ) : null}
      {cardParts.map((key, i) =>
        wide ? (
          <View key={key} style={styles.wideCard}>
            <AppText size={15} style={styles.pos}>
              {ui.pos[i]}
            </AppText>
            <AppText size={size}>{r.part(key)}</AppText>
          </View>
        ) : (
          <Panel key={key} style={styles.cardRow}>
            <ZoomableCard
              viewer={viewer}
              viewKey={r.reading.cards[i].id}
              card={r.reading.cards[i]}
              lang={r.lang}
              label={ui.pos[i]}
              caption={r.part(key)}
              style={styles.thumb}
            />
            <View style={styles.cardText}>
              <AppText size={12} style={styles.pos}>
                {ui.pos[i]}
              </AppText>
              <AppText size={16}>{r.part(key)}</AppText>
            </View>
          </Panel>
        ),
      )}
      {!wide && <Overall />}
      <AppText size={size}>{r.part('advice')}</AppText>
      <AppText size={16} style={[styles.closing, wide && styles.left]}>
        {r.part('closing')}
      </AppText>
      <View style={styles.disclaimer}>
        <AppText size={wide ? 14 : 13} style={styles.muted}>
          {r.part('disclaimer')}
        </AppText>
      </View>
      {viewer.modal}
    </View>
  );
}

/** The overall message (the reading's theme) in a gold-bordered box. */
export function Overall({ wide = false }: { wide?: boolean }) {
  const ui = useUi();
  const r = useReading();
  if (!r) return null;
  return (
    <View style={[styles.overall, wide && styles.overallWide]}>
      <PanelHeading size={wide ? 16 : 15}>{ui.overall}</PanelHeading>
      {/* The direct answer to the question (not for open questions), then the mood of the draw. */}
      {r.part('answer') ? (
        <AppText size={wide ? 17 : 16} style={styles.answer}>
          {r.part('answer')}
        </AppText>
      ) : null}
      <AppText size={wide ? 16 : 15}>{r.part('theme')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  answer: { fontWeight: '600' },
  stack: { gap: 14 },
  stackWide: { gap: 16 },
  muted: { color: colors.muted },
  pos: { color: colors.gold, fontWeight: '600', letterSpacing: 0.7 },
  cardRow: { flexDirection: 'column', gap: 14, alignItems: 'flex-start', padding: 14 },
  thumb: { width: 70, height: 120 },
  cardText: { width: '100%', gap: 8 },
  wideCard: { gap: 8, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 16 },
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
