// Screen 3b: one question from the chosen topic.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { findTopic, useFlow, useUi } from '../state/flow.tsx';
import { AppText, Hint, Option, Screen, Title } from '../ui/kit.tsx';

export default function QuestionScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const topic = findTopic(state.topicId);
  if (!state.zodiacId || !topic) return <Redirect href="/" />;

  return (
    <Screen step={2}>
      <Title>{ui.qTitle}</Title>
      <Hint>{topic.name[state.lang]}</Hint>
      <View style={styles.list}>
        {topic.questions.map(q => (
          <Option
            key={q.id}
            selected={state.questionId === q.id}
            onPress={() => {
              update({ questionId: q.id });
              router.push('/time');
            }}
            style={styles.row}
          >
            <AppText>{q[state.lang]}</AppText>
          </Option>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
});
