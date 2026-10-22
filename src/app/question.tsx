// Screen 3b: one question from the chosen topic, then Continue.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { findTopic, useFlow, useUi } from '../state/flow.tsx';
import { TopicIcon } from '../ui/icons.tsx';
import { AppText, Option, PrimaryButton, Radio, Screen, Title } from '../ui/kit.tsx';
import { colors } from '../ui/theme.ts';

export default function QuestionScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const topic = findTopic(state.topicId);
  if (!state.zodiacId || !topic) return <Redirect href="/" />;

  return (
    <Screen
      step={2}
      footer={<PrimaryButton label={ui.next} onPress={() => router.push('/time')} disabled={!state.questionId} />}
    >
      <View style={styles.top}>
        <View style={styles.chip}>
          <TopicIcon id={topic.id} size={16} />
          <AppText size={13} style={styles.chipText}>
            {topic.name[state.lang]}
          </AppText>
        </View>
        <Title>{ui.qTitle}</Title>
      </View>
      <View style={styles.list}>
        {topic.questions.map(q => {
          const on = state.questionId === q.id;
          return (
            <Option key={q.id} role="radio" selected={on} onPress={() => update({ questionId: q.id })} style={styles.row}>
              <Radio on={on} />
              <AppText size={14} style={styles.text}>
                {q[state.lang]}
              </AppText>
            </Option>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 8, marginBottom: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
  },
  chipText: { color: colors.gold },
  list: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingVertical: 7, paddingHorizontal: 12 },
  text: { flex: 1 },
});
