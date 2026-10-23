// Today's readings are used: shown when starting a new reading or asking another question.
import { router } from 'expo-router';
import { useUi } from '../state/flow.tsx';
import { PrimaryButton, Screen } from '../ui/kit.tsx';
import { LimitMessage } from '../ui/limit.tsx';

export default function LimitScreen() {
  const ui = useUi();
  return (
    <Screen width={900} footer={<PrimaryButton label={ui.backHome} onPress={() => router.dismissTo('/')} />}>
      <LimitMessage />
    </Screen>
  );
}
