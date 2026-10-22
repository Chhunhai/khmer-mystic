// Screen 4: time frame.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { content } from '../content/index.ts';
import { useFlow, useUi } from '../state/flow.tsx';
import { AppText, Hint, Option, Screen, Title } from '../ui/kit.tsx';
import { colors } from '../ui/theme.ts';

export default function TimeScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  if (!state.zodiacId || !state.questionId) return <Redirect href="/" />;

  return (
    <Screen step={3}>
      <Title>{ui.tTitle}</Title>
      <Hint>{ui.tHint}</Hint>
      <View style={styles.grid}>
        {content.templates.timeFrames.map(tf => {
          const [name, span] = tf.label[state.lang];
          return (
            <Option
              key={tf.id}
              selected={state.timeFrame === tf.id}
              label={`${name}, ${span}`}
              onPress={() => {
                // A new time frame always means a fresh draw.
                update({ timeFrame: tf.id, cardIds: null, flipped: [false, false, false] });
                router.push('/draw');
              }}
              style={styles.tile}
            >
              <AppText style={styles.name}>{name}</AppText>
              <AppText size={13} style={styles.span}>
                {span}
              </AppText>
            </Option>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', flexGrow: 1, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 10 },
  name: { fontWeight: '600', textAlign: 'center' },
  span: { color: colors.muted, textAlign: 'center' },
});
