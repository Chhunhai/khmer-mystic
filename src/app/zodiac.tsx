// Screen 2: birth-year animal. Pick one, then Continue.
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { content } from '../content/index.ts';
import { useFlow, useUi } from '../state/flow.tsx';
import { AnimalDrawing } from '../ui/animals.tsx';
import { Icon } from '../ui/icons.tsx';
import { AppText, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { Medallion } from '../ui/medallion.tsx';
import { colors, useWide } from '../ui/theme.ts';

export default function ZodiacScreen() {
  const { state, update } = useFlow();
  const ui = useUi();
  const wide = useWide();
  const size = wide ? 108 : 76;

  return (
    <Screen
      step={1}
      width={900}
      footer={<PrimaryButton label={ui.next} onPress={() => router.push('/topic')} disabled={!state.zodiacId} />}
    >
      <View style={[styles.top, wide && styles.topWide]}>
        <Title>{ui.zTitle}</Title>
        <View style={[styles.note, wide && styles.noteWide]}>
          <Icon name="info" size={18} strokeWidth={1.8} />
          <AppText size={wide ? 14 : 13} style={styles.noteText}>
            {ui.zHint}
          </AppText>
        </View>
      </View>
      <View style={[styles.grid, wide && styles.gridWide]}>
        {content.zodiac.map(z => {
          const on = state.zodiacId === z.id;
          const label = z.name[state.lang];
          return (
            <Pressable
              key={z.id}
              onPress={() => update({ zodiacId: z.id })}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ checked: on }}
              style={[styles.tile, wide && styles.tileWide]}
            >
              <Medallion size={size} selected={on}>
                <AnimalDrawing id={z.id} size={(size * 46) / 76} />
              </Medallion>
              <AppText size={wide ? 16 : 14} style={styles.center}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { gap: 14, paddingHorizontal: 4 },
  topWide: { gap: 24 },
  note: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  noteWide: { maxWidth: 720, alignSelf: 'center', paddingHorizontal: 14 },
  noteText: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, marginTop: 18 },
  gridWide: { rowGap: 22, marginTop: 24, justifyContent: 'center' },
  tile: { width: '33.33%', alignItems: 'center', gap: 6 },
  tileWide: { width: '16.66%', minWidth: 132 },
  center: { textAlign: 'center' },
});
