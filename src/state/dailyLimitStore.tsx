// Keeps the day's reading count in the phone's secure storage (on iOS it usually survives a reinstall;
// see docs.expo.dev SecureStore). The web has no secure storage, so it uses the browser's storage there.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { parseCount, readingsLeft, recordReading, type DailyCount } from './dailyLimit.ts';

const key = 'khmer-mystic.daily-count.v1';

const storage = {
  get: () => (Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key)),
  set: (value: string) =>
    Platform.OS === 'web'
      ? AsyncStorage.setItem(key, value)
      : SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK }),
};

interface DailyLimitContext {
  /** Deals left today. */
  left: () => number;
  /** Use one reading. Returns false (and uses nothing) when none are left. */
  use: () => boolean;
}

const Ctx = createContext<DailyLimitContext | null>(null);

export function DailyLimitProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<DailyCount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    storage
      .get()
      .then(raw => active && setSaved(parseCount(raw)))
      .catch(() => {})
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const left = useCallback(() => readingsLeft(saved, new Date()), [saved]);
  const use = useCallback(() => {
    const now = new Date();
    if (readingsLeft(saved, now) <= 0) return false;
    const next = recordReading(saved, now);
    setSaved(next);
    storage.set(JSON.stringify(next)).catch(() => {});
    return true;
  }, [saved]);

  const value = useMemo(() => ({ left, use }), [left, use]);
  if (!ready) return null;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDailyLimit(): DailyLimitContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDailyLimit must be used inside DailyLimitProvider');
  return ctx;
}
