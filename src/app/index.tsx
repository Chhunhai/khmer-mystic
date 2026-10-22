// Screen 1: welcome and language choice.
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFlow, useUi } from '../state/flow.tsx';
import { cardArt } from '../ui/cardArt.ts';
import { Divider, Icon, LotusMark, type IconName } from '../ui/icons.tsx';
import { AppText, LangToggle, PrimaryButton, Screen } from '../ui/kit.tsx';
import { colors, fonts, pageWidth, useWide } from '../ui/theme.ts';

const languages = [
  { id: 'en', label: 'English' },
  { id: 'km', label: 'ភាសាខ្មែរ' },
] as const;

const hero = cardArt['MAJ-00'];
const heroAlt = 'A young Khmer traveller with a lotus and a white dog on a cliff above misty temples at dawn';
const heroHeight = 440;
const howIcons: IconName[] = ['sun', 'book', 'cards'];

/** The Fool's artwork, cropped from 22% down so the figure sits in view, fading into the page. */
function PhoneHero() {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const imageHeight = width * 1.5;
  return (
    <View style={styles.hero} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Image
          source={hero}
          accessibilityLabel={heroAlt}
          style={{ position: 'absolute', width, height: imageHeight, top: -Math.max(0, imageHeight - heroHeight) * 0.22 }}
        />
      )}
      <Svg width="100%" height={160} style={styles.fade}>
        <Defs>
          <LinearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.midnight} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.midnight} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#heroFade)" />
      </Svg>
      <View style={[styles.heroToggle, { top: insets.top + 6 }]}>
        <LangToggle />
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const { state, update, reset } = useFlow();
  const ui = useUi();
  const wide = useWide();

  const start = () => {
    reset();
    router.push('/zodiac');
  };

  if (wide) {
    return (
      <Screen header="none" width={pageWidth}>
        <View style={styles.wideRow}>
          <View style={styles.arch}>
            <Image source={hero} accessibilityLabel={heroAlt} style={styles.fill} resizeMode="cover" />
          </View>
          <View style={styles.wideText}>
            <AppText style={styles.wideTag}>{ui.tag}</AppText>
            <Text style={styles.wideBrand} accessibilityRole="header">
              KHMER MYSTIC
            </Text>
            <Divider />
            <AppText size={19} style={styles.intro}>
              {ui.intro}
            </AppText>
            <View style={styles.how}>
              {ui.how.map((text, i) => (
                <View key={text} style={styles.howItem}>
                  <View style={styles.howIcon}>
                    <Icon name={howIcons[i]} size={22} />
                  </View>
                  <AppText size={15} style={styles.howText}>
                    {text}
                  </AppText>
                </View>
              ))}
            </View>
            <View style={styles.wideStart}>
              <PrimaryButton label={ui.start} onPress={start} style={styles.startButton} />
              <AppText size={14} style={styles.muted}>
                {ui.note}
              </AppText>
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      header="none"
      footer={
        <View style={styles.foot}>
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
  hero: { height: heroHeight, marginHorizontal: -20, overflow: 'hidden' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  heroToggle: { position: 'absolute', right: 14 },
  intro1: { alignItems: 'center', gap: 10, marginTop: -54, paddingHorizontal: 8 },
  brand: { fontFamily: fonts.brand, fontSize: 36, lineHeight: 40, letterSpacing: 2.9, color: colors.gold, textAlign: 'center' },
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
  // Wide layout
  wideRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 56, paddingTop: 32, paddingBottom: 48 },
  arch: {
    flexGrow: 1,
    flexBasis: 420,
    maxWidth: 560,
    height: 680,
    borderWidth: 2,
    borderColor: colors.gold,
    borderTopLeftRadius: 300,
    borderTopRightRadius: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 'auto',
  },
  fill: { width: '100%', height: '100%' },
  wideText: { flexGrow: 1, flexBasis: 420, gap: 20 },
  wideTag: { color: colors.gold, letterSpacing: 1 },
  wideBrand: { fontFamily: fonts.brand, fontSize: 64, lineHeight: 68, letterSpacing: 2.6, color: colors.gold },
  intro: { maxWidth: 520, lineHeight: 32 },
  how: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  howItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flexGrow: 1, flexBasis: 160 },
  howIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howText: { flex: 1 },
  wideStart: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18 },
  startButton: { width: 300 },
});
