import type { Content } from '../engine/types.ts';
import type { FlowState } from './flow.tsx';

export const storageKey = 'khmer-mystic.flow.v1';

/** Restore only known content IDs, and discard dependent choices when a parent is invalid. */
export function restoreFlow(raw: string | null, initial: FlowState, content: Content): FlowState {
  if (!raw) return initial;
  try {
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return initial;
    const state = { ...initial, lang: saved.lang === 'km' ? 'km' as const : 'en' as const, noticeSeen: saved.noticeSeen === true };
    if (!content.zodiac.some(z => z.id === saved.zodiacId)) return state;
    state.zodiacId = saved.zodiacId;
    const topic = content.topics.find(t => t.id === saved.topicId);
    if (!topic) return state;
    state.topicId = topic.id;
    if (!topic.questions.some(q => q.id === saved.questionId)) return state;
    state.questionId = saved.questionId;
    if (!content.templates.timeFrames.some(t => t.id === saved.timeFrame)) return state;
    state.timeFrame = saved.timeFrame;
    if (!Array.isArray(saved.cardIds) || saved.cardIds.length !== 3 || new Set(saved.cardIds).size !== 3 ||
        !saved.cardIds.every((id: unknown) => content.cards.some(c => c.id === id))) return state;
    state.cardIds = saved.cardIds;
    if (Array.isArray(saved.flipped) && saved.flipped.length === 3 && saved.flipped.every((v: unknown) => typeof v === 'boolean')) {
      state.flipped = saved.flipped;
    }
    return state;
  } catch {
    return initial;
  }
}
