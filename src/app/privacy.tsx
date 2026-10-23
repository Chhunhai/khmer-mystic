// Privacy notice.
import { StyleSheet, View } from 'react-native';
import { legal } from '../content/index.ts';
import { useFlow } from '../state/flow.tsx';
import { AppText, Screen, Title } from '../ui/kit.tsx';

export default function PrivacyScreen() {
  const { state } = useFlow();
  const { privacy } = legal(state.lang);
  return (
    <Screen width={680}>
      <Title>{privacy.title}</Title>
      <View style={styles.body}>
        {privacy.body.map(p => (
          <AppText key={p} size={16}>
            {p}
          </AppText>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 14, marginTop: 18 },
});
