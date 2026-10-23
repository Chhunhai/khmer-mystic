// Terms of use: numbered clauses, each with a bold lead-in.
import { StyleSheet, View } from 'react-native';
import { legal } from '../content/index.ts';
import { stepLabel, useFlow } from '../state/flow.tsx';
import { AppText, Screen, Title } from '../ui/kit.tsx';
import { colors } from '../ui/theme.ts';

export default function TermsScreen() {
  const { state } = useFlow();
  const { terms } = legal(state.lang);
  return (
    <Screen width={680}>
      <Title>{terms.title}</Title>
      <AppText size={14} style={styles.effective}>
        {terms.effective}
      </AppText>
      <View style={styles.list}>
        {terms.items.map(([heading, body], i) => (
          <View key={heading} style={styles.item}>
            {/* Khmer numerals in Khmer, as in the step label. */}
            <AppText size={16} style={styles.num}>
              {stepLabel('{n}.', i + 1, state.lang)}
            </AppText>
            <AppText size={16} style={styles.text}>
              <AppText size={16} style={styles.heading}>
                {heading}
              </AppText>{' '}
              {body}
            </AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  effective: { color: colors.muted, textAlign: 'center', fontStyle: 'italic', marginTop: 6 },
  list: { gap: 14, marginTop: 20 },
  item: { flexDirection: 'row', gap: 10 },
  num: { color: colors.gold, minWidth: 26 },
  text: { flex: 1 },
  heading: { fontWeight: '600' },
});
