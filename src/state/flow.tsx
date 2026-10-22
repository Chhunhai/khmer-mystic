// Selections made through the reading flow, shared by every screen.
// Selections are only cleared from the language screen ("Start"), when no later screen is mounted.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
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

const Ctx = createContext<FlowContext | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const update = useCallback((patch: Partial<FlowState>) => setState(s => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setState(s => ({ ...initial, lang: s.lang })), []);
  const value = useMemo(() => ({ state, update, reset }), [state, update, reset]);
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
