// Shared building blocks: screen frame with header, text styles, buttons and option tiles.
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { stepLabel, useFlow, useUi } from '../state/flow.tsx';
import type { Lang } from '../engine/types.ts';
import { colors, contentWidth, lineHeight } from './theme.ts';

const langNames: Record<Lang, string> = { en: 'EN', km: 'ខ្មែរ' };

/** Text that picks its line height from the current language. */
export function AppText({
  children,
  style,
  size = 16,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  size?: number;
}) {
  const { lang } = useFlow().state;
  return <Text style={[{ color: colors.ivory, fontSize: size, lineHeight: lineHeight(lang, size) }, style]}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  const { lang } = useFlow().state;
  const size = lang === 'km' ? 20 : 24;
  return (
    <Text
      accessibilityRole="header"
      style={[styles.title, { fontSize: size, lineHeight: lineHeight(lang, size, 1.25, 1.8) }]}
    >
      {children}
    </Text>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <AppText size={14} style={styles.hint}>
      {children}
    </AppText>
  );
}

function LangToggle() {
  const { state, update } = useFlow();
  return (
    <View style={styles.langToggle} accessibilityRole="radiogroup" accessibilityLabel="Language">
      {(['en', 'km'] as const).map(l => {
        const on = state.lang === l;
        return (
          <Pressable
            key={l}
            onPress={() => update({ lang: l })}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.langButton, on && styles.langButtonOn]}
          >
            <Text style={[styles.langText, on && styles.langTextOn]}>{langNames[l]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Screen frame: safe-area padding, header (back, step, language), scrolling centred column.
 * `step` is 1–5 for the flow screens; omit it on the language screen.
 */
export function Screen({ step, children }: { step?: number; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const ui = useUi();
  const { lang } = useFlow().state;
  const canGoBack = step !== undefined;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {canGoBack ? (
            <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={8} style={styles.back}>
              <AppText size={15} style={styles.gold}>
                ‹ {ui.back}
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          {step !== undefined && (
            <AppText size={13} style={styles.muted}>
              {stepLabel(ui.step, step, lang)}
            </AppText>
          )}
          <LangToggle />
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.primary, disabled && styles.disabled, pressed && styles.pressed, style]}
    >
      <AppText size={17} style={styles.primaryText}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.ghost, pressed && styles.pressed]}
    >
      <AppText style={styles.ghostText}>{label}</AppText>
    </Pressable>
  );
}

/** A selectable tile or list row. */
export function Option({
  selected,
  onPress,
  children,
  style,
  label,
}: {
  selected?: boolean;
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.midnight },
  content: { paddingHorizontal: 20, paddingTop: 8, width: '100%', maxWidth: contentWidth, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44 },
  back: { minWidth: 72, paddingVertical: 8 },
  gold: { color: colors.gold },
  muted: { color: colors.muted },
  title: { color: colors.gold, fontWeight: '700', marginTop: 12 },
  hint: { color: colors.muted, marginTop: 6, marginBottom: 18 },
  langToggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 999, overflow: 'hidden' },
  langButton: { paddingHorizontal: 12, paddingVertical: 6 },
  langButtonOn: { backgroundColor: colors.selected },
  langText: { color: colors.muted, fontSize: 13 },
  langTextOn: { color: colors.ivory, fontWeight: '600' },
  primary: { backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  primaryText: { color: colors.midnight, fontWeight: '600' },
  ghost: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  ghostText: { color: colors.gold, fontWeight: '600' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  option: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 14 },
  optionOn: { borderColor: colors.gold, backgroundColor: colors.selected },
});
