// Selections made through the reading flow, shared by every screen.
// Selections are only cleared from the language screen ("Start"), when no later screen is mounted.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreFlow, storageKey } from './persistence.ts';
import { content, uiStrings } from '../content/index.ts';
import { buildReading } from '../engine/reading.ts';
import type { Lang, PartKey, TimeFrameId } from '../engine/types.ts';

export type CardIds = [string, string, string];
export type Flipped = [boolean, boolean, boolean];

export interface FlowState {
  lang: Lang;
  zodiacId: string | null;
  topicId: string | null;
  questionId: string | null;
  timeFrame: TimeFrameId | null;
  cardIds: CardIds | null;
  flipped: Flipped;
}

const initial: FlowState = {
  lang: 'en',
  zodiacId: null,
  topicId: null,
  questionId: null,
  timeFrame: null,
  cardIds: null,
  flipped: [false, false, false],
};

interface FlowContext {
  state: FlowState;
  update: (patch: Partial<FlowState>) => void;
  /** Clear every selection but keep the language. */
  reset: () => void;
}

let writes: Promise<void> = Promise.resolve();

const Ctx = createContext<FlowContext | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey).then(raw => {
      if (active) setState(restoreFlow(raw, initial, content));
    }).catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (ready) {
      // Queue writes so an older selection cannot overwrite a newer one.
      writes = writes.then(() => AsyncStorage.setItem(storageKey, JSON.stringify(state))).catch(() => {});
    }
  }, [ready, state]);
  const update = useCallback((patch: Partial<FlowState>) => setState(s => {
    const next = { ...s, ...patch };
    if (['zodiacId', 'topicId', 'questionId', 'timeFrame'].some(key =>
      key in patch && patch[key as keyof FlowState] !== s[key as keyof FlowState])) {
      next.cardIds = null;
      next.flipped = [false, false, false];
    }
    return next;
  }), []);
  const reset = useCallback(() => setState(s => ({ ...initial, lang: s.lang })), []);
  const value = useMemo(() => ({ state, update, reset }), [state, update, reset]);
  if (!ready) return null;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFlow(): FlowContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFlow must be used inside FlowProvider');
  return ctx;
}

/** Interface text for the current language. */
export function useUi() {
  return uiStrings[useFlow().state.lang];
}

export function findTopic(id: string | null) {
  return content.topics.find(t => t.id === id);
}

const khmerDigits = '០១២៣៤៥៦៧៨៩';

/** "Step {n} of 5" with Khmer numerals in Khmer. */
export function stepLabel(template: string, n: number, lang: Lang): string {
  const num = lang === 'km' ? String(n).replace(/\d/g, d => khmerDigits[Number(d)]) : String(n);
  return template.replace('{n}', num);
}

/** The reading for the current selections, or null if the flow is incomplete. */
export function useReading() {
  const { state } = useFlow();
  const { lang, zodiacId, questionId, timeFrame, cardIds } = state;
  const topic = findTopic(state.topicId);
  const question = topic?.questions.find(q => q.id === questionId);
  const zodiac = content.zodiac.find(z => z.id === zodiacId);
  const time = content.templates.timeFrames.find(t => t.id === timeFrame);
  if (!zodiacId || !questionId || !timeFrame || !cardIds || !question || !zodiac || !time) return null;

  const reading = buildReading({ lang, zodiacId, questionId, timeFrame, cardIds }, content);
  const part = (key: PartKey) => reading.parts.find(p => p.key === key)?.text ?? '';
  return { lang, reading, part, question: question[lang], animal: zodiac.name[lang], time: time.label[lang] };
}

/** True once a reading has been started (a birth year chosen). */
export function hasProgress(state: FlowState): boolean {
  return !!state.zodiacId;
}

/** Where "Continue your reading" goes: the first step not yet finished. */
export function resumeRoute(state: FlowState, wide: boolean): '/zodiac' | '/topic' | '/question' | '/time' | '/draw' | '/reading' {
  if (state.cardIds) return state.flipped.every(Boolean) ? '/reading' : '/draw';
  if (state.questionId) return '/time';
  if (state.topicId) return wide ? '/topic' : '/question';
  if (state.zodiacId) return '/topic';
  return '/zodiac';
}

/** The step (1–5) that "Continue your reading" returns to. */
export function resumeStep(state: FlowState): number {
  if (state.cardIds) return state.flipped.every(Boolean) ? 5 : 4;
  if (state.questionId) return 3;
  return state.zodiacId ? 2 : 1;
}
