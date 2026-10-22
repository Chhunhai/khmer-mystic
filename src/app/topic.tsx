// Screen 3a: topic. On wide screens, topic and question share one page inside the desktop frame.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { findTopic, useFlow, useUi } from '../state/flow.tsx';
import { Icon, TopicIcon } from '../ui/icons.tsx';
import { AppText, Option, PrimaryButton, Radio, Screen, Title } from '../ui/kit.tsx';
import { colors, frameWidth, useWide } from '../ui/theme.ts';

function choose(topicId: string, current: string | null, update: ReturnType<typeof useFlow>['update']) {
  // A different topic means its questions change, so the old question no longer applies.
  update(topicId === current ? { topicId } : { topicId, questionId: null });
}

/** Topic row: icon in a ring, name, chevron. */
function TopicRow({
  id,
  name,
  wide,
  selected,
  onPress,
}: {
  id: string;
  name: string;
  wide: boolean;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Option onPress={onPress} selected={selected} style={[styles.row, wide && styles.rowWide]}>
      <View style={[styles.iconCircle, wide && styles.iconCircleWide]}>
        <TopicIcon id={id} size={wide ? 18 : 20} />
      </View>
      <AppText size={15} style={styles.flex}>
        {name}
      </AppText>
      <Icon name="chevron" size={18} strokeWidth={2} />
    </Option>
  );
}

function WideTopicAndQuestion() {
  const { state, update } = useFlow();
  const ui = useUi();
  const topic = findTopic(state.topicId) ?? content.topics[0];
  const zodiac = content.zodiac.find(z => z.id === state.zodiacId);

  return (
    <Screen
      step={2}
      width={frameWidth}
      footer={<PrimaryButton label={ui.next} onPress={() => router.push('/time')} disabled={!state.questionId} />}
    >
      <View style={styles.wideTop}>
        <Title>{ui.dTopicQ}</Title>
        <AppText style={styles.muted}>{zodiac?.name[state.lang]}</AppText>
      </View>
      <View style={styles.columns}>
        <View style={styles.topicCol}>
          <AppText size={13} style={styles.label}>
            {ui.topicTitle}
          </AppText>
          {content.topics.map(t => (
            <TopicRow
              key={t.id}
              id={t.id}
              name={t.name[state.lang]}
              wide
              selected={t.id === topic.id}
              onPress={() => choose(t.id, state.topicId, update)}
            />
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
          <TopicRow
            key={t.id}
            id={t.id}
            name={t.name[state.lang]}
            wide={false}
            onPress={() => {
              choose(t.id, state.topicId, update);
              router.push('/question');
            }}
          />
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
  rowWide: { minHeight: 50, paddingRight: 14, borderRadius: 12, backgroundColor: colors.glass },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleWide: { width: 34, height: 34, borderRadius: 17 },
  flex: { flex: 1 },
  muted: { color: colors.muted, textAlign: 'center' },
  label: { color: colors.muted },
  // Wide layout
  wideTop: { gap: 8, marginBottom: 24 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 28 },
  topicCol: { flexGrow: 1, flexBasis: 280, gap: 8 },
  questionCol: { flexGrow: 2, flexBasis: 420, gap: 8 },
  wideQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.glass,
  },
});
