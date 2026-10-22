// Screen 1: welcome and language choice.
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useFlow, useUi } from '../state/flow.tsx';
import { AnimalEmblem } from '../ui/animals.tsx';
import { CoverImage, Fade } from '../ui/backdrop.tsx';
import { Divider, Icon, LotusMark, type IconName } from '../ui/icons.tsx';
import { AppText, GhostButton, PrimaryButton, Screen } from '../ui/kit.tsx';
import { Entrance } from '../ui/entrance.tsx';
import { Medallion } from '../ui/medallion.tsx';
import { colors, fonts, useWide } from '../ui/theme.ts';

const languages = [
  { id: 'en', label: 'English' },
  { id: 'km', label: 'ភាសាខ្មែរ' },
] as const;

const heroAlt = 'A young Khmer traveller with a lotus and a white dog on a cliff above misty temples at dawn';
// Desktop feature medallions: tarot reading, 12 animal years (the Naga emblem), 100 questions, two languages.
const featureIcons: (IconName | 'dragon')[] = ['cards', 'dragon', 'help', 'globe'];

/** The Fool's artwork, cropped from 22% down so the figure sits in view, fading into the page. */
function PhoneHero() {
  const { height } = useWindowDimensions();
  return (
    <View style={[styles.hero, { height: Math.min(320, Math.max(160, height * 0.3)) }]}>
      <CoverImage focus={{ x: 0.5, y: 0.22 }} label={heroAlt} style={StyleSheet.absoluteFill} />
      <View style={styles.fade}>
        <Fade stops={[[0, 0], [1, 1]]} />
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const { state, update, reset } = useFlow();
  const ui = useUi();
  const wide = useWide();

  const resume = () => router.push(state.cardIds ? (state.flipped.every(Boolean) ? '/reading' : '/draw') : state.questionId ? '/time' : state.topicId ? (wide ? '/topic' : '/question') : '/topic');

  const start = () => {
    reset();
    router.push('/zodiac');
  };

  if (wide) {
    return (
      <Screen header="none">
        <View style={styles.wideMain}>
          <Entrance style={styles.wideText}>
            <Text style={styles.wideBrand} accessibilityRole="header">
              KHMER MYSTIC
            </Text>
            <AppText size={22} style={styles.center}>
              {ui.tag}
            </AppText>
            <Divider />
            <AppText size={18} style={styles.intro}>
              {ui.intro}
            </AppText>
            <View style={styles.homeActions}>
              <PrimaryButton label={state.zodiacId ? ui.resume : ui.start} onPress={state.zodiacId ? resume : start} style={styles.action} />
              {state.zodiacId && <GhostButton label={ui.start} onPress={start} style={styles.action} />}
            </View>
            <AppText size={14} style={styles.muted}>{ui.note}</AppText>
            <View style={styles.features}>
              {ui.features.map((label, i) => {
                const icon = featureIcons[i];
                return (
                  <Entrance key={label} delay={120 + i * 70} style={styles.feature}>
                    <Medallion size={56} edge={colors.midnight} edgeOpacity={0.9} glowOpacity={0.18}>
                      {icon === 'dragon' ? <AnimalEmblem id="DRA" size={40} /> : <Icon name={icon} size={26} />}
                    </Medallion>
                    <AppText size={15} style={styles.center}>
                      {label}
                    </AppText>
                  </Entrance>
                );
              })}
            </View>
          </Entrance>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      header="none"
      footer={
        <View style={styles.foot}>
          {state.zodiacId && <GhostButton label={ui.resume} onPress={resume} style={styles.full} />}
          <PrimaryButton label={ui.start} onPress={start} style={styles.full} />
          <AppText size={12} style={styles.muted}>
            {ui.note}
          </AppText>
        </View>
      }
    >
      <PhoneHero />
      <View style={styles.intro1}>
        <LotusMark />
        <Text style={styles.brand} accessibilityRole="header">
          KHMER MYSTIC
        </Text>
        <AppText size={16}>{ui.tag}</AppText>
        <Divider />
        <AppText size={13} style={[styles.muted, styles.chooseLang]}>
          {ui.chooseLang}
        </AppText>
        <View style={styles.langPick}>
          {languages.map(l => {
            const on = state.lang === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => update({ lang: l.id })}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={[styles.langOption, on && styles.langOptionOn]}
              >
                <AppText size={16} style={on ? styles.langTextOn : styles.muted}>
                  {l.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 440, marginHorizontal: -20 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 160 },
  heroToggle: { position: 'absolute', right: 14 },
  intro1: { alignItems: 'center', gap: 10, marginTop: -54, paddingHorizontal: 8, zIndex: 1 },
  brand: { fontFamily: fonts.brand, fontSize: 30, lineHeight: 38, letterSpacing: 2.9, color: colors.gold, textAlign: 'center' },
  center: { textAlign: 'center' },
  gold: { color: colors.gold },
  muted: { color: colors.muted, textAlign: 'center' },
  chooseLang: { marginTop: 8 },
  langPick: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  langOption: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langOptionOn: { backgroundColor: colors.gold },
  langTextOn: { color: colors.midnight, fontWeight: '600' },
  foot: { alignItems: 'center', gap: 12, paddingHorizontal: 8 },
  full: { alignSelf: 'stretch' },
  // Wide layout: text column on the right, over the artwork.
  wideMain: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 24, paddingBottom: 40 },
  wideText: { flexGrow: 0, flexShrink: 1, flexBasis: 640, alignItems: 'center', gap: 16 },
  wideBrand: {
    fontFamily: fonts.brand,
    fontSize: 48,
    lineHeight: 60,
    letterSpacing: 2.5,
    color: colors.gold,
    textAlign: 'center',
    textShadowColor: colors.glow,
    textShadowRadius: 28,
  },
  intro: { maxWidth: 560, textAlign: 'center', lineHeight: 31 },
  features: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 12, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.line },
  feature: { flex: 1, minWidth: 110, alignItems: 'center', gap: 10 },
  homeActions: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  action: { flexGrow: 1, flexBasis: 250, maxWidth: 320 },
});
