// Screen 3a: topic. On wide screens, topic and question share one page with a step list beside them.
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { findTopic, useFlow, useUi } from '../state/flow.tsx';
import { Icon, TopicIcon } from '../ui/icons.tsx';
import { AppText, GhostButton, Option, Panel, PanelHeading, PrimaryButton, Radio, Screen, Title } from '../ui/kit.tsx';
import { colors, fonts, pageWidth, useWide } from '../ui/theme.ts';

function choose(topicId: string, current: string | null, update: ReturnType<typeof useFlow>['update']) {
  // A different topic means its questions change, so the old question no longer applies.
  update(topicId === current ? { topicId } : { topicId, questionId: null });
}

/** Wide screens: where you are in the flow, with your answers so far. */
function StepList({ current }: { current: number }) {
  const { state } = useFlow();
  const ui = useUi();
  const zodiac = content.zodiac.find(z => z.id === state.zodiacId);
  const values = [zodiac?.name[state.lang], findTopic(state.topicId)?.name[state.lang]];
  return (
    <Panel style={styles.steps}>
      <PanelHeading style={styles.stepsHeading}>{ui.yours}</PanelHeading>
      {ui.steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const now = n === current;
        return (
          <View key={label} style={styles.stepRow}>
            <View style={[styles.stepDot, done && styles.stepDone, now && styles.stepNow]}>
              {done ? (
                <Icon name="check" size={14} color={colors.midnight} strokeWidth={3} />
              ) : (
                <Text style={[styles.stepNum, now && styles.stepNumNow]}>{n}</Text>
              )}
            </View>
            <View style={styles.stepText}>
              <AppText size={15} style={!done && !now && styles.muted}>
                {label}
              </AppText>
              {(done || now) && values[i] && (
                <AppText size={14} style={styles.muted}>
                  {values[i]}
                </AppText>
              )}
            </View>
          </View>
        );
      })}
    </Panel>
  );
}

function WideTopicAndQuestion() {
  const { state, update } = useFlow();
  const ui = useUi();
  const topic = findTopic(state.topicId) ?? content.topics[0];

  return (
    <Screen header="none" width={pageWidth}>
      <View style={styles.wideRow}>
        <View style={styles.aside}>
          <StepList current={2} />
        </View>
        <View style={styles.main}>
          <Title align="left" size={{ en: 30, km: 24 }}>
            {ui.dTopicQ}
          </Title>
          <View style={styles.columns}>
            <View style={styles.topicCol}>
              <AppText size={13} style={styles.label}>
                {ui.topicTitle}
              </AppText>
              {content.topics.map(t => (
                <Option
                  key={t.id}
                  selected={t.id === topic.id}
                  onPress={() => choose(t.id, state.topicId, update)}
                  style={styles.wideTopic}
                >
                  <TopicIcon id={t.id} />
                  <AppText size={15} style={styles.flex}>
                    {t.name[state.lang]}
                  </AppText>
                </Option>
              ))}
            </View>
            <View style={styles.questionCol}>
              <AppText size={13} style={styles.label}>
                {ui.qTitle}
              </AppText>
              {topic.questions.map(q => {
                const on = state.questionId === q.id;
                return (
                  <Option
                    key={q.id}
                    role="radio"
                    selected={on}
                    onPress={() => update({ topicId: topic.id, questionId: q.id })}
                    style={styles.wideQuestion}
                  >
                    <Radio on={on} />
                    <AppText size={15} style={styles.flex}>
                      {q[state.lang]}
                    </AppText>
                  </Option>
                );
              })}
            </View>
          </View>
          <View style={styles.wideFoot}>
            <GhostButton label={ui.back} onPress={() => router.back()} style={styles.backButton} />
            <PrimaryButton
              label={ui.next}
              onPress={() => router.push('/time')}
              disabled={!state.questionId}
              style={styles.nextButton}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

export default function TopicScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const wide = useWide();
  if (!state.zodiacId) return <Redirect href="/" />;
  if (wide) return <WideTopicAndQuestion />;

  return (
    <Screen step={2}>
      <Title>{ui.topicTitle}</Title>
      <View style={styles.list}>
        {content.topics.map(t => (
          <Option
            key={t.id}
            onPress={() => {
              choose(t.id, state.topicId, update);
              router.push('/question');
            }}
            style={styles.row}
          >
            <View style={styles.iconCircle}>
              <TopicIcon id={t.id} />
            </View>
            <AppText size={15} style={styles.flex}>
              {t.name[state.lang]}
            </AppText>
            <Icon name="chevron" size={18} strokeWidth={2} />
          </Option>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8, marginTop: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  muted: { color: colors.muted },
  // Wide layout
  wideRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 40, paddingTop: 24, paddingBottom: 40 },
  aside: { flexGrow: 1, flexBasis: 260, maxWidth: 300 },
  steps: { padding: 20, borderRadius: 18, gap: 16 },
  stepsHeading: { marginBottom: 0 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepNow: { backgroundColor: colors.selected, borderWidth: 2, borderColor: colors.gold },
  stepNum: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted },
  stepNumNow: { color: colors.gold },
  stepText: { flex: 1 },
  main: { flexGrow: 999, flexShrink: 1, flexBasis: 560, minWidth: 0, gap: 22 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  topicCol: { flexGrow: 1, flexBasis: 240, gap: 8 },
  questionCol: { flexGrow: 2, flexBasis: 380, gap: 8 },
  label: { color: colors.muted, letterSpacing: 0.5 },
  wideTopic: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingVertical: 6, paddingHorizontal: 12 },
  wideQuestion: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 8, paddingHorizontal: 14 },
  wideFoot: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  backButton: { width: 160 },
  nextButton: { width: 240 },
});
