// First-launch notice: shown once, before the first reading, with a single "I understand".
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { legal } from '../content/index.ts';
import { useFlow } from '../state/flow.tsx';
import { LotusMark } from '../ui/icons.tsx';
import { AppText, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { LegalLinks } from '../ui/legal.tsx';

export default function NoticeScreen() {
  const { state, update } = useFlow();
  const { notice } = legal(state.lang);

  const accept = () => {
    update({ noticeSeen: true });
    router.replace('/zodiac');
  };

  return (
    <Screen footer={<PrimaryButton label={notice.button} onPress={accept} />}>
      <View style={styles.top}>
        <LotusMark />
        <Title>{notice.title}</Title>
      </View>
      <View style={styles.body}>
        {notice.body.map(p => (
          <AppText key={p} size={16}>
            {p}
          </AppText>
        ))}
      </View>
      <View style={styles.links}>
        <LegalLinks />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 10, marginBottom: 18 },
  body: { gap: 14, maxWidth: 560, alignSelf: 'center' },
  links: { marginTop: 22 },
});
