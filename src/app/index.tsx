// Screen 1: welcome and language choice.
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { useFlow, useUi } from '../state/flow.tsx';
import { AppText, Option, PrimaryButton, Screen } from '../ui/kit.tsx';
import { colors } from '../ui/theme.ts';

const languages = [
  { id: 'en', label: 'English' },
  { id: 'km', label: 'ភាសាខ្មែរ' },
] as const;

function Lotus() {
  return (
    <Svg viewBox="0 0 120 80" width={72} height={48} fill="none" stroke={colors.gold} strokeWidth={2}>
      <Path d="M60 70C48 56 48 34 60 14C72 34 72 56 60 70Z" />
      <Path d="M60 70C44 64 32 48 30 28C46 34 56 50 60 70Z" />
      <Path d="M60 70C76 64 88 48 90 28C74 34 64 50 60 70Z" />
      <Path d="M60 70C40 72 22 62 12 46C32 44 50 56 60 70Z" />
      <Path d="M60 70C80 72 98 62 108 46C88 44 70 56 60 70Z" />
    </Svg>
  );
}

export default function LanguageScreen() {
  const { state, update, reset } = useFlow();
  const ui = useUi();

  const start = () => {
    reset();
    router.push('/zodiac');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Lotus />
        <Text style={styles.brand}>Khmer Mystic</Text>
        <AppText style={styles.tag}>{ui.tag}</AppText>
      </View>
      <AppText size={14} style={styles.label}>
        {ui.chooseLang}
      </AppText>
      <View style={styles.langPick}>
        {languages.map(l => (
          <Option key={l.id} selected={state.lang === l.id} onPress={() => update({ lang: l.id })} style={styles.langOption}>
            <AppText size={18} style={state.lang === l.id && styles.bold}>
              {l.label}
            </AppText>
          </Option>
        ))}
      </View>
      <PrimaryButton label={ui.start} onPress={start} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 36, paddingBottom: 8, gap: 18 },
  brand: { color: colors.gold, fontSize: 40, fontWeight: '700', letterSpacing: 1, textAlign: 'center' },
  tag: { color: colors.muted, textAlign: 'center', marginBottom: 20 },
  label: { color: colors.muted, marginBottom: 8 },
  langPick: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  langOption: { flex: 1, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 8 },
  bold: { fontWeight: '600' },
});
