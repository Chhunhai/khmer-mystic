// Screen 6: the result — the three cards and the overall message. Wide screens show the full reading beside the cards.
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useReading, useUi } from '../state/flow.tsx';
import type { PartKey } from '../engine/types.ts';
import { useCardViewer, ZoomableCard } from '../ui/cardViewer.tsx';
import { Entrance } from '../ui/entrance.tsx';
import { Icon } from '../ui/icons.tsx';
import { AppText, GhostButton, Panel, PanelHeading, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { FullReadingText, Overall } from '../ui/reading.tsx';
import { colors, frameWidth, useWide } from '../ui/theme.ts';

const cardParts: PartKey[] = ['present', 'challenge', 'outcome'];

export default function ReadingScreen() {
  const ui = useUi();
  const wide = useWide();
  const r = useReading();
  // Phone cards get an exact 7:12 size: iOS ignores aspectRatio once maxWidth clamps a percentage width.
  const { width: screenWidth } = useWindowDimensions();
  const rowWidth = Math.min(screenWidth, 600) - 40 + 8;
  const cardW = Math.min(106, (rowWidth - 16) / 3);
  // Tap a card to see it large, with its line of the reading underneath.
  const viewer = useCardViewer();
  if (!r) return <Redirect href="/" />;

  const again = () => router.dismissTo('/topic');
  const restart = () => router.dismissTo('/');

  if (wide) {
    return (
      <Screen step={5} back={false} width={frameWidth}>
        <View style={styles.wideHead}>
          <Title>{ui.rTitle}</Title>
          <AppText style={styles.sub}>
            “{r.question}” · {r.animal} · {r.time.join(' · ')}
          </AppText>
        </View>
        <View style={styles.wideRow}>
          <View style={styles.wideCards}>
            <View style={styles.cardRow}>
              {r.reading.cards.map((card, i) => (
                <Entrance key={card.id} delay={i * 90} style={styles.figure}>
                  <ZoomableCard
                    viewer={viewer}
                    viewKey={card.id}
                    card={card}
                    lang={r.lang}
                    label={ui.pos[i]}
                    caption={r.part(cardParts[i])}
                    style={styles.bigCard}
                  />
                  <AppText size={15} style={styles.pos}>
                    {ui.pos[i]}
                  </AppText>
                </Entrance>
              ))}
            </View>
            <View style={styles.wideButtons}>
              <PrimaryButton label={ui.again} onPress={again} style={styles.grow} />
              <GhostButton label={ui.restart} onPress={restart} style={styles.grow} />
            </View>
          </View>
          <Entrance delay={120} style={styles.article}>
            <Overall wide />
            <PanelHeading size={17}>{ui.fullTitle}</PanelHeading>
            <FullReadingText wide />
          </Entrance>
        </View>
        {viewer.modal}
      </Screen>
    );
  }

  return (
    <Screen
      step={5}
      footer={
        <>
          <PrimaryButton label={ui.full} onPress={() => router.push('/full')} />
          <GhostButton label={ui.again} onPress={again} />
          <AppText size={14} style={styles.disclaimer}>
            {r.part('disclaimer')}
          </AppText>
        </>
      }
    >
      <View style={styles.top}>
        <Title>{ui.rTitle}</Title>
        <AppText size={14} style={styles.sub}>
          “{r.question}” · {r.time[0]}
        </AppText>
      </View>
      <View style={styles.cards}>
        {r.reading.cards.map((card, i) => (
          <View key={card.id} style={styles.slot}>
            <ZoomableCard
              viewer={viewer}
              viewKey={card.id}
              card={card}
              lang={r.lang}
              label={ui.pos[i]}
              caption={r.part(cardParts[i])}
              style={{ width: cardW, height: (cardW * 12) / 7 }}
            />
            <AppText size={13} style={styles.pos}>
              {ui.pos[i]}
            </AppText>
          </View>
        ))}
      </View>
      <Panel style={styles.overall}>
        <View style={styles.overallHead}>
          <Icon name="sun" size={18} />
          <PanelHeading>{ui.overall}</PanelHeading>
        </View>
        {/* The direct answer to the question (not for open questions), then the mood of the draw. */}
        {r.part('answer') ? (
          <AppText size={17} style={styles.answer}>
            {r.part('answer')}
          </AppText>
        ) : null}
        <AppText size={16}>{r.part('theme')}</AppText>
        <AppText size={14} style={styles.muted}>
          {r.part('advice')}
        </AppText>
      </Panel>
      {viewer.modal}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { gap: 6, marginBottom: 14 },
  sub: { color: colors.muted, textAlign: 'center' },
  muted: { color: colors.muted },
  cards: { flexDirection: 'row', gap: 8, marginHorizontal: -4 },
  slot: { flex: 1, alignItems: 'center', gap: 6 },
  pos: { color: colors.gold, fontWeight: '600', textAlign: 'center' },
  overall: { marginTop: 18, gap: 10 },
  answer: { fontWeight: '600', color: colors.ivory },
  overallHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disclaimer: { color: colors.muted, textAlign: 'center', marginTop: 4 },
  // Wide layout
  wideHead: { gap: 8 },
  wideRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start', marginTop: 24 },
  wideCards: { flexGrow: 1, flexShrink: 1, flexBasis: 300, gap: 20 },
  cardRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  figure: { flexGrow: 1, flexBasis: 0, flexShrink: 1, maxWidth: 150, alignItems: 'center', gap: 10 },
  bigCard: { width: '100%', aspectRatio: 7 / 12, borderRadius: 10, boxShadow: '0 0 22px rgba(232,201,136,0.25)' },
  wideButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  grow: { flexGrow: 1, flexBasis: 200 },
  article: { flexGrow: 2, flexShrink: 1, flexBasis: 360, minWidth: 0, gap: 22 },
});
