// Round gold medallion: soft radial glow, gold rim and a fine inner ring (birth-year tiles, desktop features).
import { useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Icon } from './icons.tsx';
import { colors } from './theme.ts';

const panelRgb = '#132042';

export function Medallion({
  size,
  selected = false,
  edge = panelRgb,
  edgeOpacity = 0.95,
  glowOpacity,
  children,
}: {
  size: number;
  selected?: boolean;
  /** Colour the glow fades to at the rim. */
  edge?: string;
  edgeOpacity?: number;
  /** Strength of the gold in the centre; defaults to 0.12, or 0.28 when selected. */
  glowOpacity?: number;
  children: ReactNode;
}) {
  const id = `med${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const rim = selected ? 2 : 1.5;
  const r = size / 2;
  return (
    <View style={[{ width: size, height: size, borderRadius: r }, selected && styles.glow]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.gold} stopOpacity={glowOpacity ?? (selected ? 0.28 : 0.12)} />
            <Stop offset="0.7" stopColor={edge} stopOpacity={edgeOpacity} />
            <Stop offset="1" stopColor={edge} stopOpacity={edgeOpacity} />
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r - rim / 2} fill={`url(#${id})`} stroke={colors.gold} strokeWidth={rim} />
        <Circle cx={r} cy={r} r={r - 4.5} fill="none" stroke={colors.gold} strokeOpacity={0.4} strokeWidth={1} />
      </Svg>
      <View style={styles.center}>{children}</View>
      {selected && (
        <View style={styles.badge}>
          <Icon name="check" size={14} color={colors.midnight} strokeWidth={3} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { boxShadow: `0 0 18px ${colors.glow}` },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
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
});
