// Screen 7: the full reading, every part in order.
import { StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useReading, useUi } from '../state/flow.tsx';
import { useDailyLimit } from '../state/dailyLimitStore.tsx';
import { ReadingsLeft } from '../ui/limit.tsx';
import { Divider } from '../ui/icons.tsx';
import { GhostButton, PrimaryButton, Screen, Title } from '../ui/kit.tsx';
import { FullReadingText } from '../ui/reading.tsx';

export default function FullReadingScreen() {
  const ui = useUi();
  const daily = useDailyLimit();
  if (!useReading()) return <Redirect href="/" />;

  return (
    <Screen
      footer={
        <>
          <PrimaryButton label={ui.again} onPress={() => (daily.left() === 0 ? router.push('/limit') : router.dismissTo('/topic'))} />
          <GhostButton label={ui.restart} onPress={() => router.dismissTo('/')} />
          <ReadingsLeft />
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
