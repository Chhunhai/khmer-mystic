// The daily reading limit in the interface: the balance line, and the "come back tomorrow" message.
import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import { format, useFlow, useUi } from '../state/flow.tsx';
import { msUntilReset, readingsPerDay } from '../state/dailyLimit.ts';
import { useDailyLimit } from '../state/dailyLimitStore.tsx';
import { LotusMark } from './icons.tsx';
import { AppText, Hint, Title } from './kit.tsx';
import { colors } from './theme.ts';

/** Time until new readings open, e.g. "4 h 54 min", updated every half minute. */
export function useTimeUntilReset(): string {
  const ui = useUi();
  const { lang } = useFlow().state;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.ceil(msUntilReset(now) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? format(ui.hoursMinutes, { h, m }, lang) : format(ui.minutesOnly, { m }, lang);
}

/** "2 of 3 readings left today", or when none are left, when new ones open. */
export function ReadingsLeft({ size = 13, style }: { size?: number; style?: StyleProp<TextStyle> }) {
  const ui = useUi();
  const { lang } = useFlow().state;
  const left = useDailyLimit().left();
  const time = useTimeUntilReset();
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
