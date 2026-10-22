// Screen 3a: topic.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { useFlow, useUi } from '../state/flow.tsx';
import { AppText, Option, Screen, Title } from '../ui/kit.tsx';
import { colors } from '../ui/theme.ts';

export default function TopicScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  if (!state.zodiacId) return <Redirect href="/" />;

  return (
    <Screen step={2}>
      <Title>{ui.topicTitle}</Title>
      <View style={styles.list}>
        {content.topics.map(t => (
          <Option
            key={t.id}
            onPress={() => {
              update({ topicId: t.id });
              router.push('/question');
            }}
            style={styles.row}
          >
            <AppText style={styles.text}>{t.name[state.lang]}</AppText>
            <AppText size={18} style={styles.chevron}>
              ›
            </AppText>
          </Option>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8, marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  text: { flex: 1 },
  chevron: { color: colors.gold },
});
