// Screen 4: time frame, with a summary of the choices so far.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { findTopic, useFlow, useUi } from '../state/flow.tsx';
import { Icon } from '../ui/icons.tsx';
import { AppText, Hint, Option, PanelHeading, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { colors, useWide } from '../ui/theme.ts';

export default function TimeScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const wide = useWide();
  const zodiac = content.zodiac.find(z => z.id === state.zodiacId);
  const topic = findTopic(state.topicId);
  const question = topic?.questions.find(q => q.id === state.questionId);
  if (!zodiac || !topic || !question) return <Redirect href="/" />;

  const next = () => {
    // Every visit to the draw screen starts with a fresh deal.
    update({ cardIds: null, flipped: [false, false, false] });
    router.push('/draw');
  };

  const summary = [
    [ui.sAnimal, zodiac.name[state.lang]],
    [ui.sTopic, topic.name[state.lang]],
    [ui.sQuestion, question[state.lang]],
  ];

  return (
    <Screen width={960} step={3} footer={<PrimaryButton label={ui.next} onPress={next} disabled={!state.timeFrame} />}>
      <View style={styles.top}>
        <Title>{ui.tTitle}</Title>
        <Hint>{ui.tHint}</Hint>
      </View>
      <View style={wide && styles.columns}>
        <View style={[styles.grid, wide && styles.gridWide]}>
          {content.templates.timeFrames.map(tf => {
            const [name, span] = tf.label[state.lang];
            const on = state.timeFrame === tf.id;
            return (
              <Option
                key={tf.id}
                role="radio"
                selected={on}
                label={`${name}, ${span}`}
                onPress={() => update({ timeFrame: tf.id })}
                style={styles.tile}
                selectedStyle={styles.tileOn}
              >
                <Icon name={tf.id} size={30} />
                <AppText size={16} style={styles.name}>
                  {name}
                </AppText>
                <AppText size={13} style={styles.span}>
                  {span}
                </AppText>
              </Option>
            );
          })}
        </View>
        <View style={[styles.summary, wide && styles.summaryWide]}>
          <PanelHeading size={14} style={styles.summaryHeading}>
            {ui.yours}
          </PanelHeading>
          {summary.map(([label, value]) => (
            <View key={label} style={styles.summaryRow}>
              <AppText size={13} style={styles.summaryLabel}>
                {label}
              </AppText>
              <AppText size={14} style={styles.flex}>
                {value}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' },
  gridWide: { flex: 1, minWidth: 300 },
  summaryWide: { flex: 1, minWidth: 260, marginTop: 0, backgroundColor: colors.panel },
  top: { gap: 6, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47%', flexGrow: 1, alignItems: 'center', gap: 6, paddingVertical: 18, paddingHorizontal: 8, borderRadius: 16 },
  tileOn: { borderWidth: 2 },
  name: { fontWeight: '600', textAlign: 'center' },
  span: { color: colors.muted, textAlign: 'center' },
  summary: { marginTop: 22, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 16, gap: 8 },
  summaryHeading: { letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryLabel: { width: 96, color: colors.muted },
  flex: { flex: 1 },
});
