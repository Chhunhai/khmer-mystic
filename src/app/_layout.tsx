import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { KantumruyPro_400Regular, KantumruyPro_500Medium, KantumruyPro_600SemiBold } from '@expo-google-fonts/kantumruy-pro';
import { Moul_400Regular } from '@expo-google-fonts/moul';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FlowProvider } from '../state/flow.tsx';
import { colors } from '../ui/theme.ts';

export default function RootLayout() {
  // Keys become the font family names used in src/ui/theme.ts.
  const [loaded, error] = useFonts({
    Cinzel_700Bold,
    Moul_400Regular,
    KantumruyPro_400Regular,
    KantumruyPro_500Medium,
    KantumruyPro_600SemiBold,
  });
  // Fonts load in a moment; if they fail, fall back to system fonts rather than block the app.
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <FlowProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.midnight } }} />
        <StatusBar style="light" />
      </FlowProvider>
    </SafeAreaProvider>
  );
}
