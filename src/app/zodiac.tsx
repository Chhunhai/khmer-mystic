// Screen 2: birth-year animal.
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { content } from '../content/index.ts';
import { useFlow, useUi } from '../state/flow.tsx';
import { AppText, Hint, Option, Screen, Title } from '../ui/kit.tsx';
import { colors } from '../ui/theme.ts';

const icons: Record<string, string> = {
  RAT: '🐀', OX: '🐂', TIG: '🐅', RAB: '🐇', DRA: '🐉', SNA: '🐍',
  HOR: '🐎', GOA: '🐐', MON: '🐒', ROO: '🐓', DOG: '🐕', PIG: '🐖',
};

export default function ZodiacScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const other = state.lang === 'en' ? 'km' : 'en';

  return (
    <Screen step={1}>
      <Title>{ui.zTitle}</Title>
      <Hint>{ui.zHint}</Hint>
      <View style={styles.grid}>
        {content.zodiac.map(z => (
          <Option
            key={z.id}
            selected={state.zodiacId === z.id}
            label={z.name[state.lang]}
            onPress={() => {
              update({ zodiacId: z.id });
              router.push('/topic');
            }}
            style={styles.tile}
          >
            <Text style={styles.icon} accessible={false}>
              {icons[z.id]}
            </Text>
            <AppText size={15} style={styles.name}>
              {z.name[state.lang]}
            </AppText>
            <AppText size={12} style={styles.sub}>
              {z.name[other]}
            </AppText>
          </Option>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '31%', flexGrow: 1, alignItems: 'center', paddingTop: 12, paddingBottom: 10, paddingHorizontal: 4 },
  icon: { fontSize: 30, lineHeight: 38 },
  name: { fontWeight: '600', textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center' },
});
