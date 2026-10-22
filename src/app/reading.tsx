// Screen 6: the result — the three cards and the overall message. Wide screens show the full reading beside the cards.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useReading, useUi } from '../state/flow.tsx';
import { CardFace } from '../ui/cards.tsx';
import { Icon } from '../ui/icons.tsx';
import { AppText, GhostButton, Panel, PanelHeading, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { FullReadingText, Overall } from '../ui/reading.tsx';
import { colors, frameWidth, useWide } from '../ui/theme.ts';

export default function ReadingScreen() {
  const ui = useUi();
  const wide = useWide();
  const r = useReading();
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
                <View key={card.id} style={styles.figure}>
                  <View style={styles.bigCard}>
                    <CardFace card={card} lang={r.lang} />
                  </View>
                  <AppText size={15} style={styles.pos}>
                    {ui.pos[i]}
                  </AppText>
                </View>
              ))}
            </View>
            <Overall wide />
            <View style={styles.wideButtons}>
              <PrimaryButton label={ui.again} onPress={again} style={styles.grow} />
              <GhostButton label={ui.restart} onPress={restart} style={styles.grow} />
            </View>
          </View>
          <View style={styles.article}>
            <FullReadingText wide />
          </View>
        </View>
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
            <View style={styles.card}>
              <CardFace card={card} lang={r.lang} />
            </View>
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
        <AppText size={16}>{r.part('theme')}</AppText>
        <AppText size={14} style={styles.muted}>
          {r.part('advice')}
        </AppText>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { gap: 6, marginBottom: 14 },
  sub: { color: colors.muted, textAlign: 'center' },
  muted: { color: colors.muted },
  cards: { flexDirection: 'row', gap: 8, marginHorizontal: -4 },
  slot: { flex: 1, alignItems: 'center', gap: 6 },
  card: { width: '100%', maxWidth: 106, aspectRatio: 7 / 12 },
  pos: { color: colors.gold, fontWeight: '600', textAlign: 'center' },
  overall: { marginTop: 18, gap: 10 },
  overallHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disclaimer: { color: colors.muted, textAlign: 'center', marginTop: 4 },
  // Wide layout
  wideHead: { gap: 8 },
  wideRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start', marginTop: 24 },
  wideCards: { flexGrow: 1, flexShrink: 1, flexBasis: 480, gap: 22 },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18 },
  figure: { flexGrow: 1, flexBasis: 140, maxWidth: 210, alignItems: 'center', gap: 10 },
  bigCard: { width: '100%', aspectRatio: 7 / 12, borderRadius: 10, boxShadow: '0 0 22px rgba(232,201,136,0.25)' },
  wideButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  grow: { flexGrow: 1, flexBasis: 200 },
  article: { flexGrow: 1, flexShrink: 1, flexBasis: 440, minWidth: 0 },
});
