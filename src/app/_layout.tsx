import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FlowProvider } from '../state/flow.tsx';
import { colors } from '../ui/theme.ts';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <FlowProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.midnight } }} />
        <StatusBar style="light" />
      </FlowProvider>
    </SafeAreaProvider>
  );
}
