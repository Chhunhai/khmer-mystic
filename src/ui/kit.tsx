// Shared building blocks: screen frame with headers, text styles, buttons and option tiles.
import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type AccessibilityRole,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path } from 'react-native-svg';
import { router, usePathname } from 'expo-router';
import { hasProgress, resumeRoute, stepLabel, useFlow, useUi } from '../state/flow.tsx';
import type { Lang } from '../engine/types.ts';
import { Backdrop } from './backdrop.tsx';
import { Divider, Icon, LotusMark } from './icons.tsx';
import { colors, contentWidth, fonts, frameWidth, headingFont, lineHeight, pageWidth, useWide } from './theme.ts';

const langNames: Record<Lang, string> = { en: 'EN', km: 'ខ្មែរ' };

/** True inside the desktop footer row, where buttons take fixed widths instead of the full column. */
const InFooterRow = createContext(false);

/** On web, Pressable also reports when the mouse is over it; native only reports `pressed`. */
export function isHovered(state: PressableStateCallbackType): boolean {
  return !!(state as PressableStateCallbackType & { hovered?: boolean }).hovered;
}

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

/**
 * Screen heading: Cinzel in English, Moul in Khmer.
 * On wide screens it is larger and sits over the gold divider, as in the desktop frame.
 */
export function Title({ children }: { children: ReactNode }) {
  const { lang } = useFlow().state;
  const wide = useWide();
  const fontSize = wide ? (lang === 'km' ? 24 : 32) : lang === 'km' ? 19 : 26;
  const heading = (
    <Text
      accessibilityRole="header"
      style={[
        styles.title,
        { fontFamily: headingFont(lang), fontSize, lineHeight: Math.round(fontSize * (lang === 'km' ? 1.7 : 1.4)) },
      ]}
    >
      {children}
    </Text>
  );
  if (!wide) return heading;
  return (
    <View style={styles.wideTitle}>
      {heading}
      <Divider />
    </View>
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
    <View style={styles.langToggle} accessibilityRole="radiogroup" accessibilityLabel={useUi().chooseLang}>
      {(['en', 'km'] as const).map(l => {
        const on = state.lang === l;
        return (
          <Pressable
            key={l}
            onPress={() => update({ lang: l })}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={s => [styles.langButton, on && styles.langButtonOn, !on && isHovered(s) && styles.hoverFill]}
          >
            <Text style={[styles.langText, on && styles.langTextOn]}>{langNames[l]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Phone: five segments; the current step is longer, finished steps are gold. */
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

/** Desktop: numbered steps with names; done and current are gold, the current one ringed. */
// Desktop step n lives at stepRoutes[n - 1] (topic and question share one page there).
const stepRoutes = ['/zodiac', '/topic', '/time', '/draw', '/reading'] as const;

/**
 * Desktop: numbered steps with names; done and current are gold, the current one ringed.
 * Finished steps can be clicked to go back to them.
 */
function Stepper({ step }: { step: number }) {
  const ui = useUi();
  return (
    <View style={styles.stepper} accessibilityLabel={ui.steps[step - 1]}>
      {ui.steps.map((name, i) => {
        const n = i + 1;
        const reached = n <= step;
        const now = n === step;
        const content = (hovered: boolean) => (
          <>
            <View style={[styles.stepperDot, reached && styles.stepperDotOn, now && styles.stepperDotNow, hovered && styles.stepperDotHover]}>
              <Text style={[styles.stepperNum, reached && styles.stepperNumOn]}>{n}</Text>
            </View>
            <AppText size={13} style={[styles.stepperName, reached && styles.ivory, now && styles.gold, hovered && styles.gold]}>
              {name}
            </AppText>
          </>
        );
        if (n >= step) {
          return (
            <View key={name} style={styles.stepperItem}>
              {content(false)}
            </View>
          );
        }
        return (
          <Pressable
            key={name}
            onPress={() => router.dismissTo(stepRoutes[i])}
            accessibilityRole="link"
            accessibilityLabel={`${ui.back}: ${name}`}
            style={styles.stepperItem}
          >
            {s => content(isHovered(s))}
          </Pressable>
        );
      })}
    </View>
  );
}

const parentRoutes = { '/zodiac': '/', '/topic': '/zodiac', '/question': '/topic', '/time': '/topic', '/draw': '/time', '/reading': '/draw', '/full': '/reading' } as const;

function useGoBack() {
  const path = usePathname();
  return () => {
    if (router.canGoBack()) router.back();
    else router.replace(parentRoutes[path as keyof typeof parentRoutes] ?? '/');
  };
}

function BackButton() {
  const ui = useUi();
  const goBack = useGoBack();
  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      accessibilityLabel={ui.back}
      style={s => [styles.iconButton, isHovered(s) && styles.iconButtonHover]}
    >
      <Icon name="back" size={22} strokeWidth={2} />
    </Pressable>
  );
}

function goHome() {
  router.dismissTo('/');
}

function startReading() {
  if (router.canDismiss()) router.dismissAll();
  router.push('/zodiac');
}

/** Desktop and tablet header: logo, Home and Tarot Reading links, language. */
export function SiteHeader({ active }: { active: 'home' | 'reading' }) {
  const ui = useUi();
  const { state } = useFlow();
  // A reading in progress is resumed, never cleared, from the header.
  const openReading = () => (hasProgress(state) ? router.push(resumeRoute(state, true)) : startReading());
  const links = [
    { key: 'home', label: ui.nav[0], onPress: goHome },
    { key: 'reading', label: ui.nav[1], onPress: openReading },
  ] as const;
  return (
    <View style={styles.siteInner}>
      <Pressable onPress={goHome} accessibilityRole="link" style={s => [styles.logo, isHovered(s) && styles.hoverDim]}>
        <LotusMark width={40} strokeWidth={4} />
        <Text style={styles.logoText}>KHMER MYSTIC</Text>
      </Pressable>
      <View style={styles.nav}>
        {links.map(l => {
          const on = l.key === active;
          return (
            <Pressable key={l.key} onPress={on ? undefined : l.onPress} accessibilityRole="link" accessibilityState={{ selected: on }}>
              {s => (
                <AppText size={15} style={[styles.navLink, on && styles.navLinkOn, !on && isHovered(s) && styles.navLinkHover]}>
                  {l.label}
                </AppText>
              )}
            </Pressable>
          );
        })}
        <LangToggle />
      </View>
    </View>
  );
}

const cornerTransforms: StyleProp<ViewStyle>[] = [
  { left: -6, top: -6 },
  { right: -6, top: -6, transform: [{ scaleX: -1 }] },
  { left: -6, bottom: -6, transform: [{ scaleY: -1 }] },
  { right: -6, bottom: -6, transform: [{ scaleX: -1 }, { scaleY: -1 }] },
];

/** Lotus-and-kbach corner of the desktop frame, drawn for the top-left. */
function FrameCorner({ style }: { style: StyleProp<ViewStyle> }) {
  return (
    <Svg width={72} height={72} viewBox="0 0 80 80" fill="none" stroke={colors.gold} strokeLinecap="round" style={[styles.corner, style]}>
      <Path d="M20 12 C40 8 58 12 68 26 C73 35 64 42 57 37 C52 33 56 27 61 29" strokeWidth={1.6} />
      <Path d="M12 20 C8 40 12 58 26 68 C35 73 42 64 37 57 C33 52 27 56 29 61" strokeWidth={1.6} />
      <Path d="M30 16 C44 15 52 18 58 24 M16 30 C15 44 18 52 24 58" strokeWidth={0.9} />
      <G fill={colors.gold} stroke="none" transform="translate(32 32) rotate(-45)">
        <Path d="M0 0 C6 -7 6 -16 0 -22 C-6 -16 -6 -7 0 0 Z" />
        <Path d="M0 0 C-7 -2 -13 -9 -14 -17 C-8 -14 -3 -8 0 0 Z" fillOpacity={0.75} />
        <Path d="M0 0 C7 -2 13 -9 14 -17 C8 -14 3 -8 0 0 Z" fillOpacity={0.75} />
      </G>
    </Svg>
  );
}

/**
 * Screen frame.
 * Phone: safe-area padding, header (back, step bar, language), scrolling column, the artwork faint
 * at the bottom, and a footer pinned to the bottom. `header="none"` lets a screen draw its own top.
 * Wide: site header over the full-bleed artwork; flow screens sit in the ornate frame with the
 * numbered stepper, and the footer becomes a row with Back on the left.
 * `width` limits the content column (phone-designed screens stay narrow inside the desktop frame).
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
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { height, fontScale } = useWindowDimensions();
  const wide = useWide();
  const dockFooter = !!footer && height >= 600 && fontScale <= 1.3;
  const ui = useUi();

  if (wide) {
    const home = header === 'none';
    return (
      <View style={styles.screen}>
        <Backdrop variant={home ? 'hero' : 'soft'} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <SiteHeader active={home ? 'home' : 'reading'} />
          {home ? (
            <View style={[styles.page, { maxWidth: pageWidth }]}>{children}</View>
          ) : (
            <View style={styles.frameWrap}>
              <View style={styles.frame}>
                <View style={styles.frameInner}>
                  {step !== undefined && <Stepper step={step} />}
                  <View style={[styles.frameContent, { maxWidth: width }]}>{children}</View>
                </View>
                {cornerTransforms.map((style, i) => (
                  <FrameCorner key={i} style={style} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
        {!home && (footer || back) && (
          // Docked to the bottom of the window, so Continue is always in view on short laptop screens.
          <View style={styles.wideDock}>
            <View style={styles.wideDockInner}>
              {back ? <GhostButton label={ui.back} onPress={goBack} style={styles.backWide} /> : <View />}
              <InFooterRow.Provider value={true}>
                <View style={styles.footerActions}>{footer}</View>
              </InFooterRow.Provider>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: header === 'none' ? 0 : insets.top }]}>
      {header === 'flow' && <Backdrop variant="phone" />}
      {header === 'flow' && (
        // Fixed above the scrolling content, so it never moves when the page is dragged.
        <View style={[styles.headerBar, { maxWidth: Math.min(width, 600) }]}>
          <View style={styles.header}>
            {back ? <BackButton /> : <View style={styles.iconButton} />}
            {step !== undefined && <StepBar step={step} />}
            <LangToggle />
          </View>
        </View>
      )}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: dockFooter ? 20 : insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <View style={[styles.column, { maxWidth: Math.min(width, 600) }]}>
          {children}
          {footer && !dockFooter && <View style={styles.footer}>{footer}</View>}
        </View>
      </ScrollView>
      {dockFooter && (
        <View style={[styles.dockedFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={[styles.footerInner, { maxWidth: Math.min(width, 600) }]}>{footer}</View>
        </View>
      )}
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
  const inRow = useContext(InFooterRow);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={s => [
        styles.primary,
        inRow && styles.primaryRow,
        !disabled && isHovered(s) && styles.primaryHover,
        disabled && styles.disabled,
        s.pressed && styles.pressed,
        style,
      ]}
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
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inRow = useContext(InFooterRow);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={s => [
        styles.ghost,
        inRow && styles.ghostRow,
        !disabled && isHovered(s) && styles.hoverFill,
        disabled && styles.disabled,
        s.pressed && styles.pressed,
        style,
      ]}
    >
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
  selectedStyle,
  label,
  role = 'button',
}: {
  selected?: boolean;
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Extra style when selected, on top of the gold border. */
  selectedStyle?: StyleProp<ViewStyle>;
  label?: string;
  role?: 'button' | 'radio';
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={role === 'radio' ? { checked: !!selected } : { selected: !!selected }}
      style={s => [
        styles.option,
        style,
        !selected && isHovered(s) && styles.optionHover,
        selected && styles.optionOn,
        selected && selectedStyle,
        s.pressed && styles.pressed,
      ]}
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

/** A small confirm / cancel dialog (React Native's Alert does nothing on web). */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <Pressable style={styles.dialogBackdrop} onPress={onCancel} accessible={false} />
      <View style={styles.dialogWrap} pointerEvents="box-none">
        <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
          <PanelHeading size={18}>{title}</PanelHeading>
          <AppText size={15} style={styles.muted}>
            {body}
          </AppText>
          <View style={styles.dialogActions}>
            <GhostButton label={cancelLabel} onPress={onCancel} style={styles.dialogButton} />
            <PrimaryButton label={confirmLabel} onPress={onConfirm} style={styles.dialogButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * "Start a new reading": clears the selections and opens step 1. If a reading is in progress it asks
 * first, so nothing is lost by accident. Render `dialog` somewhere on the screen.
 */
export function useStartNewReading() {
  const { state, reset } = useFlow();
  const ui = useUi();
  const [asking, setAsking] = useState(false);
  const begin = () => {
    setAsking(false);
    reset();
    if (router.canDismiss()) router.dismissAll();
    router.push('/zodiac');
  };
  return {
    request: () => (hasProgress(state) ? setAsking(true) : begin()),
    dialog: (
      <ConfirmDialog
        visible={asking}
        title={ui.confirmNewTitle}
        body={ui.confirmNewBody}
        confirmLabel={ui.confirmNewYes}
        cancelLabel={ui.cancel}
        onConfirm={begin}
        onCancel={() => setAsking(false)}
      />
    ),
  };
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.midnight },
  scroll: { flexGrow: 1 },
  column: { flexGrow: 1, width: '100%', alignSelf: 'center', paddingHorizontal: 20 },
  headerBar: { width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginLeft: -12,
    marginRight: -6,
    paddingTop: 6,
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepWrap: { alignItems: 'center', gap: 4 },
  stepBar: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  stepSeg: { width: 22, height: 4, borderRadius: 2, backgroundColor: colors.faint },
  stepSegNow: { width: 34 },
  stepSegDone: { backgroundColor: colors.gold },
  dockedFooter: { backgroundColor: colors.midnight, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, paddingHorizontal: 20 },
  footerInner: { width: '100%', alignSelf: 'center', gap: 10 },
  footer: { marginTop: 'auto', paddingTop: 24, gap: 12 },
  gold: { color: colors.gold },
  ivory: { color: colors.ivory },
  muted: { color: colors.muted },
  title: { color: colors.gold, textAlign: 'center' },
  wideTitle: { alignItems: 'center', gap: 8 },
  hint: { color: colors.muted, textAlign: 'center' },
  langToggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 999, overflow: 'hidden' },
  langButton: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  langButtonOn: { backgroundColor: colors.gold },
  langText: { color: colors.muted, fontSize: 13, fontFamily: fonts.body },
  langTextOn: { color: colors.midnight, fontFamily: fonts.semibold },
  // Desktop
  siteInner: {
    width: '100%',
    maxWidth: pageWidth,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: { fontFamily: fonts.brand, fontSize: 21, letterSpacing: 1.7, color: colors.gold },
  nav: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 26 },
  navLink: { paddingVertical: 6, paddingHorizontal: 2, borderBottomWidth: 1.5, borderBottomColor: 'transparent' },
  navLinkOn: { color: colors.gold, borderBottomColor: colors.gold },
  navLinkHover: { color: colors.gold },
  hoverDim: { opacity: 0.85 },
  dialogBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(11,21,48,0.8)' },
  dialogWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: {
    width: '100%',
    maxWidth: 420,
    gap: 12,
    padding: 22,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: colors.panel,
    boxShadow: `0 0 36px ${colors.glow}`,
  },
  dialogActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  dialogButton: { flexGrow: 1, flexBasis: 140 },
  hoverFill: { backgroundColor: colors.selected },
  iconButtonHover: { backgroundColor: colors.selected, borderRadius: 22 },
  wideDock: { borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: 'rgba(11,21,48,0.94)', paddingVertical: 14 },
  wideDockInner: {
    width: '100%',
    maxWidth: frameWidth,
    alignSelf: 'center',
    paddingHorizontal: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  page: { width: '100%', alignSelf: 'center', paddingHorizontal: 32 },
  frameWrap: { width: '100%', maxWidth: frameWidth, alignSelf: 'center', paddingHorizontal: 32, marginTop: 12, marginBottom: 40 },
  frame: { borderWidth: 1.5, borderColor: colors.gold, borderRadius: 24, padding: 7, backgroundColor: colors.frame },
  frameInner: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.frameInner,
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 18,
  },
  frameContent: { width: '100%', alignSelf: 'center' },
  corner: { position: 'absolute' },
  stepper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, maxWidth: 720, width: '100%', alignSelf: 'center' },
  stepperItem: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 90, alignItems: 'center', gap: 6 },
  stepperDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.stepIdle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDotOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepperDotNow: { boxShadow: `0 0 0 5px ${colors.stepRing}` },
  stepperDotHover: { boxShadow: `0 0 0 5px ${colors.stepRing}` },
  stepperNum: { fontFamily: fonts.brand, fontSize: 15, color: colors.muted },
  stepperNumOn: { color: colors.midnight },
  stepperName: { color: colors.muted, textAlign: 'center' },
  footerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  backWide: { width: 170 },
  // Buttons
  primary: { backgroundColor: colors.gold, borderRadius: 999, minHeight: 52, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  primaryRow: { minWidth: 240 },
  primaryHover: { backgroundColor: '#D9B86A' },
  primaryText: { color: colors.midnight, fontWeight: '600' },
  ghost: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 999,
    minHeight: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostRow: { minWidth: 170 },
  ghostText: { color: colors.gold, fontWeight: '600' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  option: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 12 },
  optionHover: { borderColor: colors.gold },
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
