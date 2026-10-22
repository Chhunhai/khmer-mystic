// Screen 7: the full reading, every part in order.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useReading, useUi } from '../state/flow.tsx';
import { Divider } from '../ui/icons.tsx';
import { GhostButton, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { FullReadingText } from '../ui/reading.tsx';

export default function FullReadingScreen() {
  const ui = useUi();
  if (!useReading()) return <Redirect href="/" />;

  return (
    <Screen
      footer={
        <>
          <PrimaryButton label={ui.again} onPress={() => router.dismissTo('/topic')} />
          <GhostButton label={ui.restart} onPress={() => router.dismissTo('/')} />
        </>
      }
    >
      <View style={styles.top}>
        <Title>{ui.fullTitle}</Title>
        <Divider />
      </View>
      <FullReadingText />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 8, marginBottom: 18 },
});
