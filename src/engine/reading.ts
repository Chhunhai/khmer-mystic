// Khmer Mystic reading engine.
// Pure functions: the same inputs always give the same reading. No network, no AI.
import type { AnswerKey, Card, Content, Lang, QuestionKind, Reading, ReadingInput, Tag } from './types.ts';

export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? '');
}

const tagScore: Record<Card['tag'], number> = { bright: 1, steady: 0, testing: -1 };

/** Mood of the whole draw: all three cards count, not only the Outcome card. */
export function moodScore(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + tagScore[c.tag], 0);
}

/**
 * One mood for the whole reading. The summary's tone and the yes/no and timing leans all come
 * from it, so they can never contradict each other.
 */
function mood(cards: Card[]): Tag {
  const score = moodScore(cards);
  return score >= 1 ? 'bright' : score <= -1 ? 'testing' : 'steady';
}

/** How the Outcome card compares with the Present card. */
function arcKey(cards: Card[]): 'better' | 'worse' | 'carry' | 'persist' | 'same' {
  const d = tagScore[cards[2].tag] - tagScore[cards[0].tag];
  if (d > 0) return 'better';
  if (d < 0) return 'worse';
  return cards[0].tag === 'bright' ? 'carry' : cards[0].tag === 'testing' ? 'persist' : 'same';
}

/** The direct answer for this kind of question, if it has one. */
function answerKey(kind: QuestionKind, cards: Card[]): AnswerKey {
  const m = mood(cards);
  switch (kind) {
    case 'yesno':
      return m === 'bright' ? 'yes' : m === 'testing' ? 'notyet' : 'depends';
    case 'when':
      return m === 'bright' ? 'soon' : m === 'testing' ? 'later' : 'ready';
    default:
      return kind;
  }
}

export function buildReading(input: ReadingInput, content: Content): Reading {
  const { lang, zodiacId, questionId, timeFrame, cardIds } = input;
  if (new Set(cardIds).size !== 3) throw new Error('Exactly three different cards are required');

  const z = content.zodiac.find(x => x.id === zodiacId);
  const topic = content.topics.find(t => questionId.startsWith(t.id + '-'));
  const question = topic?.questions.find(q => q.id === questionId);
  const tf = content.templates.timeFrames.find(t => t.id === timeFrame);
  const found = cardIds.map(id => content.cards.find(c => c.id === id));
  if (!z || !topic || !question || !tf || found.some(c => !c)) throw new Error('Unknown input id');
  const cards = found as [Card, Card, Card];

  const T = content.templates;
  const kind = question.kind;
  const seed = fnv1a([zodiacId, questionId, timeFrame, ...cardIds].join('|'));
  const pick = (variants: Record<Lang, string[]>, bit: number) =>
    variants[lang][(seed >> bit) & 1] ?? variants[lang][0];
  // Wording for this kind of question, falling back to the general wording.
  const part = (key: 'present' | 'challenge' | 'outcome' | 'advice') => T.kinds[kind]?.[key] ?? T.parts[key];

  const v: Record<string, string> = {
    question: question[lang],
    focus: topic.focus[lang],
    time: tf.phrase[lang],
    outlook: tf.outlook[lang],
    animal: z.name[lang],
    strength: z.strength[lang],
    advice: z.advice[lang],
    card1: cards[0].name[lang],
    card2: cards[1].name[lang],
    card3: cards[2].name[lang],
    present: cards[0].meaning.present[lang],
    challenge: cards[1].meaning.challenge[lang],
    outcome: cards[2].meaning.outcome[lang],
  };

  // Theme: 2+ Major cards wins, then any suit drawn 2+ times, otherwise mixed.
  type ThemeKey = keyof typeof T.theme.en;
  let themeKey: ThemeKey | null = null;
  if (cards.filter(c => c.arcana === 'major').length >= 2) themeKey = 'MAJ';
  else {
    const count: Record<string, number> = {};
    for (const c of cards) if (c.suit) count[c.suit] = (count[c.suit] ?? 0) + 1;
    for (const s of Object.keys(count)) if (count[s] >= 2) themeKey = s as ThemeKey;
  }

  const answer = answerKey(kind, cards);
  const parts: Reading['parts'] = [{ key: 'opening', text: fill(pick(T.parts.opening, 0), v) }];
  parts.push({ key: 'answer', text: fill(T.answers[answer][lang], v) });
  parts.push(
    { key: 'strength', text: fill(pick(T.parts.strength, 1), v) },
    { key: 'present', text: fill(pick(part('present'), 2), v) },
    { key: 'challenge', text: fill(pick(part('challenge'), 3), v) },
    { key: 'outcome', text: fill(part('outcome')[lang][0], v) },
    {
      key: 'theme',
      // A shared suit or 2+ Major cards (if any), then the path from Present to Outcome, then the mood.
      text: [themeKey && T.theme[lang][themeKey], fill(T.arc[arcKey(cards)][lang], v), T.tone[mood(cards)][lang]]
        .filter(Boolean)
        .join(' '),
    },
    { key: 'advice', text: fill(pick(part('advice'), 4), v) },
    { key: 'closing', text: topic.closing[lang] },
    { key: 'disclaimer', text: T.disclaimer[lang] },
  );
  return { cards, parts };
}

/** Draw three different cards. Pass a seeded random function for a daily lock. */
export function drawCards(cards: Card[], random: () => number = Math.random): [string, string, string] {
  const ids = new Set<string>();
  while (ids.size < 3) ids.add(cards[Math.floor(random() * cards.length)].id);
  return [...ids] as [string, string, string];
}
