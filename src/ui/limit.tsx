// The daily reading limit in the interface: the balance line, and the "come back tomorrow" message.
import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import { format, useFlow, useUi } from '../state/flow.tsx';
import { readingsPerDay } from '../state/dailyLimit.ts';
import { useDailyLimit } from '../state/dailyLimitStore.tsx';
import { LotusMark } from './icons.tsx';
import { AppText, Hint, Title, useTimeUntilReset } from './kit.tsx';
import { colors, useWide } from './theme.ts';

/**
 * "2 of 3 readings left today", or when none are left, when new ones open. Phone only: on desktop the
 * site header shows the balance on every screen.
 */
export function ReadingsLeft({ size = 13, style }: { size?: number; style?: StyleProp<TextStyle> }) {
  const ui = useUi();
  const { lang } = useFlow().state;
  const left = useDailyLimit().left();
  const time = useTimeUntilReset();
  if (useWide()) return null;
  return (
    <AppText size={size} style={[styles.left, left === 0 && styles.none, style]}>
      {left === 0
        ? format(ui.noneLeft, { time }, lang)
        : format(ui.leftToday, { n: left, total: readingsPerDay }, lang)}
    </AppText>
  );
}

/** Shown instead of a new reading once today's readings are used. */
export function LimitMessage() {
  const ui = useUi();
  const { lang } = useFlow().state;
  const time = useTimeUntilReset();
  return (
    <View style={styles.message}>
      <LotusMark />
      <Title>{ui.limitTitle}</Title>
      <Hint>{format(ui.limitBody, { total: readingsPerDay, time }, lang)}</Hint>
    </View>
  );
}

const styles = StyleSheet.create({
  left: { color: colors.muted, textAlign: 'center' },
  none: { color: colors.gold },
  message: { alignItems: 'center', gap: 12, marginTop: 40, maxWidth: 520, alignSelf: 'center' },
});
