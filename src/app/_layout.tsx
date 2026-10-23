import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { KantumruyPro_400Regular, KantumruyPro_500Medium, KantumruyPro_600SemiBold } from '@expo-google-fonts/kantumruy-pro';
import { Moul_400Regular } from '@expo-google-fonts/moul';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DailyLimitProvider } from '../state/dailyLimitStore.tsx';
import { FlowProvider } from '../state/flow.tsx';
import { colors } from '../ui/theme.ts';

// Web only: a pointer cursor on anything clickable, and a gold focus ring shown for keyboard
// focus (not for mouse clicks), so the app can be used without a mouse.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('km-web-css')) {
  const css = document.createElement('style');
  css.id = 'km-web-css';
  css.textContent = [
    '[role="button"],[role="link"],[role="radio"],[role="checkbox"]{cursor:pointer}',
    '[aria-disabled="true"]{cursor:default}',
    ':focus{outline:none}',
    ':focus-visible{outline:2px solid #E8C988;outline-offset:3px}',
  ].join('');
  document.head.appendChild(css);
}

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
      <DailyLimitProvider>
        <FlowProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.midnight } }} />
          <StatusBar style="light" />
        </FlowProvider>
      </DailyLimitProvider>
    </SafeAreaProvider>
  );
}
