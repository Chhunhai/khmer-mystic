// Screen 2: birth-year animal. Pick one, then Continue.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { content } from '../content/index.ts';
import { useFlow, useUi } from '../state/flow.tsx';
import { Icon } from '../ui/icons.tsx';
import { AppText, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { colors, fonts } from '../ui/theme.ts';

export default function ZodiacScreen() {
  const { state, update } = useFlow();
  const ui = useUi();

  return (
    <Screen
      step={1}
      back={false}
      footer={<PrimaryButton label={ui.next} onPress={() => router.push('/topic')} disabled={!state.zodiacId} />}
    >
      <View style={styles.top}>
        <Title>{ui.zTitle}</Title>
        <View style={styles.note}>
          <Icon name="info" size={18} strokeWidth={1.8} />
          <AppText size={13} style={styles.noteText}>
            {ui.zHint}
          </AppText>
        </View>
      </View>
      <View style={styles.grid}>
        {content.zodiac.map(z => {
          const on = state.zodiacId === z.id;
          const label = ui.animals[z.id as keyof typeof ui.animals];
          return (
            <Pressable
              key={z.id}
              onPress={() => update({ zodiacId: z.id })}
              accessibilityRole="radio"
              accessibilityLabel={`${z.name.km}, ${label}`}
              accessibilityState={{ checked: on }}
              style={styles.tile}
            >
              <View style={[styles.circle, on && styles.circleOn]}>
                <Text style={styles.yearName}>{z.name.km}</Text>
                {on && (
                  <View style={styles.badge}>
                    <Icon name="check" size={14} color={colors.midnight} strokeWidth={3} />
                  </View>
                )}
              </View>
              <AppText size={14} style={styles.center}>
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
  note: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  noteText: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, marginTop: 18 },
  tile: { width: '33.33%', alignItems: 'center', gap: 6 },
  circle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOn: { borderWidth: 2, borderColor: colors.gold, backgroundColor: colors.selected },
  yearName: { fontFamily: fonts.khmerTitle, fontSize: 20, lineHeight: 34, color: colors.gold },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
});
