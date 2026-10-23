// Links to the privacy notice and terms, shown on the home screen and the first-launch notice.
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useUi } from '../state/flow.tsx';
import { AppText, isHovered } from './kit.tsx';
import { colors } from './theme.ts';

export function LegalLinks() {
  const ui = useUi();
  const links = [
    { label: ui.privacyLink, href: '/privacy' as const },
    { label: ui.termsLink, href: '/terms' as const },
  ];
  return (
    <View style={styles.row}>
      {links.map((l, i) => (
        <View key={l.href} style={styles.item}>
          {i > 0 && (
            <AppText size={13} style={styles.dot}>
              ·
            </AppText>
          )}
          <Pressable onPress={() => router.push(l.href)} accessibilityRole="link" hitSlop={8}>
            {s => (
              <AppText size={13} style={[styles.link, isHovered(s) && styles.linkHover]}>
                {l.label}
              </AppText>
            )}
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center' },
  dot: { color: colors.muted, marginHorizontal: 10 },
  link: { color: colors.muted, textDecorationLine: 'underline' },
  linkHover: { color: colors.gold },
});
