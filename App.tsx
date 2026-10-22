// Starter screen: proves the content and engine are wired up by showing the sample reading.
// Replace with the real flow (see docs/BUILD_SPEC.md and docs/prototype/prototype.html).
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { content } from './src/content/index.ts';
import { buildReading } from './src/engine/reading.ts';
import type { Lang } from './src/engine/types.ts';

const colors = { midnight: '#0F1A33', panel: '#132042', gold: '#C9A45C', ivory: '#F3EBDD' };

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const reading = buildReading(
    { lang, zodiacId: 'RAB', questionId: 'LF-02', timeFrame: 'near', cardIds: ['MAJ-19', 'MAJ-16', 'MAJ-17'] },
    content,
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Khmer Mystic</Text>
        <View style={styles.toggle}>
          {(['en', 'km'] as const).map(l => (
            <Pressable key={l} onPress={() => setLang(l)} style={[styles.chip, lang === l && styles.chipOn]}>
              <Text style={styles.chipText}>{l === 'en' ? 'English' : 'ខ្មែរ'}</Text>
            </Pressable>
          ))}
        </View>
        {reading.parts.map(p => (
          <Text key={p.key} style={[styles.part, p.key === 'disclaimer' && styles.disclaimer]}>
            {p.text}
          </Text>
        ))}
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.midnight },
  content: { padding: 24, paddingTop: 64, maxWidth: 640, width: '100%', alignSelf: 'center' },
  title: { color: colors.gold, fontSize: 32, fontWeight: '700', marginBottom: 16 },
  toggle: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  chip: { borderWidth: 1, borderColor: colors.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  chipOn: { backgroundColor: colors.panel },
  chipText: { color: colors.ivory },
  part: { color: colors.ivory, fontSize: 16, lineHeight: 27, marginBottom: 14 },
  disclaimer: { fontSize: 13, opacity: 0.75 },
});
