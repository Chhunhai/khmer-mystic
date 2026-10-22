// Shared building blocks: screen frame with headers, text styles, buttons and option tiles.
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type AccessibilityRole,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { stepLabel, useFlow, useUi } from '../state/flow.tsx';
import type { Lang } from '../engine/types.ts';
import { Icon, LotusMark } from './icons.tsx';
import { colors, contentWidth, fonts, headingFont, lineHeight, pageWidth, useWide } from './theme.ts';

const langNames: Record<Lang, string> = { en: 'EN', km: 'ខ្មែរ' };

/**
 * Text in Kantumruy Pro with the line height for the current language.
 * A fontWeight in `style` picks the matching font file, since custom fonts ship one weight per family.
 */
export function AppText({
  children,
  style,
  size = 16,
  role,
  lines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  size?: number;
  role?: AccessibilityRole;
  lines?: number;
}) {
  const { lang } = useFlow().state;
  const { fontWeight, fontFamily, ...rest } = StyleSheet.flatten(style) ?? {};
  const weight = fontWeight === 'bold' ? 700 : Number(fontWeight) || 400;
  const family = fontFamily ?? (weight >= 600 ? fonts.semibold : weight === 500 ? fonts.medium : fonts.body);
  return (
    <Text
      accessibilityRole={role}
      numberOfLines={lines}
      style={[{ color: colors.ivory, fontSize: size, lineHeight: lineHeight(lang, size, 1.55, 1.7) }, rest, { fontFamily: family }]}
    >
      {children}
    </Text>
  );
}

/** Screen heading: Cinzel in English, Moul in Khmer. */
export function Title({
  children,
  align = 'center',
  size,
}: {
  children: ReactNode;
  align?: 'center' | 'left';
  size?: Partial<Record<Lang, number>>;
}) {
  const { lang } = useFlow().state;
  const fontSize = size?.[lang] ?? (lang === 'km' ? 19 : 26);
  return (
    <Text
      accessibilityRole="header"
      style={[
        styles.title,
        { fontFamily: headingFont(lang), fontSize, lineHeight: Math.round(fontSize * (lang === 'km' ? 1.7 : 1.4)), textAlign: align },
      ]}
    >
      {children}
    </Text>
  );
}

/** Small heading inside panels (also Cinzel / Moul). */
export function PanelHeading({ children, size = 15, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  const { lang } = useFlow().state;
  const fontSize = lang === 'km' ? size - 2 : size;
  return (
    <Text style={[{ color: colors.gold, fontFamily: headingFont(lang), fontSize, lineHeight: lineHeight(lang, fontSize, 1.4, 1.8) }, style]}>
      {children}
    </Text>
  );
}

export function Hint({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <AppText size={14} style={[styles.hint, style]}>
      {children}
    </AppText>
  );
}

export function LangToggle() {
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

/** Five segments; the current step is longer, finished steps are gold. */
function StepBar({ step }: { step: number }) {
  const ui = useUi();
  const { lang } = useFlow().state;
  return (
    <View style={styles.stepWrap}>
      <View style={styles.stepBar}>
        {[1, 2, 3, 4, 5].map(n => (
          <View key={n} style={[styles.stepSeg, n === step && styles.stepSegNow, n <= step && styles.stepSegDone]} />
        ))}
      </View>
      <AppText size={12} style={styles.muted}>
        {stepLabel(ui.step, step, lang)}
      </AppText>
    </View>
  );
}

function BackButton() {
  const ui = useUi();
  return (
    <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={ui.back} style={styles.iconButton}>
      <Icon name="back" size={22} strokeWidth={2} />
    </Pressable>
  );
}

function goHome() {
  if (router.canDismiss()) router.dismissAll();
}

/** Desktop and tablet header: logo and language. */
export function SiteHeader() {
  return (
    <View style={styles.siteHeader}>
      <View style={styles.siteInner}>
        <Pressable onPress={goHome} accessibilityRole="link" style={styles.logo}>
          <LotusMark width={36} strokeWidth={4} />
          <Text style={styles.logoText}>KHMER MYSTIC</Text>
        </Pressable>
        <LangToggle />
      </View>
    </View>
  );
}

/**
 * Screen frame: safe-area padding, header, scrolling column and a footer pinned to the bottom.
 * `header="none"` lets a screen draw its own top (the welcome screen).
 * On wide screens the site header replaces the language toggle in the row.
 */
export function Screen({
  step,
  back = true,
  header = 'flow',
  footer,
  width = contentWidth,
  children,
}: {
  step?: number;
  back?: boolean;
  header?: 'flow' | 'none';
  footer?: ReactNode;
  width?: number;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const wide = useWide();

  return (
    <View style={[styles.screen, { paddingTop: wide ? 0 : header === 'none' ? 0 : insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
      >
        {wide && <SiteHeader />}
        <View style={[styles.column, { maxWidth: width }, wide && styles.columnWide]}>
          {header === 'flow' && (
            <View style={styles.header}>
              {back ? <BackButton /> : <View style={styles.iconButton} />}
              {step !== undefined && <StepBar step={step} />}
              {wide ? <View style={styles.iconButton} /> : <LangToggle />}
            </View>
          )}
          {children}
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
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
      <AppText size={16} style={styles.primaryText}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.ghost, pressed && styles.pressed, style]}>
      <AppText size={15} style={styles.ghostText}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** A selectable tile or list row: night panel, gold border when selected. */
export function Option({
  selected,
  onPress,
  children,
  style,
  label,
  role = 'button',
}: {
  selected?: boolean;
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  label?: string;
  role?: 'button' | 'radio';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={role === 'radio' ? { checked: !!selected } : { selected: !!selected }}
      style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

/** Round radio mark used in question lists. */
export function Radio({ on }: { on: boolean }) {
  return <View style={styles.radio}>{on && <View style={styles.radioDot} />}</View>;
}

/** Bordered night panel. */
export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.midnight },
  scroll: { flexGrow: 1 },
  column: { flexGrow: 1, width: '100%', alignSelf: 'center', paddingHorizontal: 20 },
  columnWide: { paddingHorizontal: 32, paddingTop: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginLeft: -12,
    marginRight: -6,
    paddingTop: 6,
    marginBottom: 14,
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepWrap: { alignItems: 'center', gap: 4 },
  stepBar: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  stepSeg: { width: 22, height: 4, borderRadius: 2, backgroundColor: colors.faint },
  stepSegNow: { width: 34 },
  stepSegDone: { backgroundColor: colors.gold },
  footer: { marginTop: 'auto', paddingTop: 24, gap: 12 },
  gold: { color: colors.gold },
  muted: { color: colors.muted },
  title: { color: colors.gold },
  hint: { color: colors.muted, textAlign: 'center' },
  langToggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 999, overflow: 'hidden' },
  langButton: { height: 32, paddingHorizontal: 12, justifyContent: 'center' },
  langButtonOn: { backgroundColor: colors.gold },
  langText: { color: colors.muted, fontSize: 13, fontFamily: fonts.body },
  langTextOn: { color: colors.midnight, fontFamily: fonts.semibold },
  siteHeader: { borderBottomWidth: 1, borderBottomColor: colors.line },
  siteInner: {
    width: '100%',
    maxWidth: pageWidth,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: { fontFamily: fonts.brand, fontSize: 20, letterSpacing: 1.6, color: colors.gold },
  primary: { backgroundColor: colors.gold, borderRadius: 999, height: 52, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.midnight, fontWeight: '600' },
  ghost: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 999,
    height: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { color: colors.gold, fontWeight: '600' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  option: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 12 },
  optionOn: { borderColor: colors.gold, borderWidth: 1.5, backgroundColor: colors.selected },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  panel: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16 },
});
