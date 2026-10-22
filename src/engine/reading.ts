// Khmer Mystic reading engine.
// Pure functions: the same inputs always give the same reading. No network, no AI.
import type { Card, Content, Lang, Reading, ReadingInput } from './types.ts';

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
  const seed = fnv1a([zodiacId, questionId, timeFrame, ...cardIds].join('|'));
  const pick = (variants: Record<Lang, string[]>, bit: number) =>
    variants[lang][(seed >> bit) & 1] ?? variants[lang][0];

  const v: Record<string, string> = {
    question: question[lang],
    focus: topic.focus[lang],
    time: tf.phrase[lang],
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
  let themeKey: keyof typeof T.theme.en = 'MIX';
  if (cards.filter(c => c.arcana === 'major').length >= 2) themeKey = 'MAJ';
  else {
    const count: Record<string, number> = {};
    for (const c of cards) if (c.suit) count[c.suit] = (count[c.suit] ?? 0) + 1;
    for (const s of Object.keys(count)) if (count[s] >= 2) themeKey = s as typeof themeKey;
  }

  return {
    cards,
    parts: [
      { key: 'opening', text: fill(pick(T.parts.opening, 0), v) },
      { key: 'strength', text: fill(pick(T.parts.strength, 1), v) },
      { key: 'present', text: fill(pick(T.parts.present, 2), v) },
      { key: 'challenge', text: fill(pick(T.parts.challenge, 3), v) },
      { key: 'outcome', text: fill(T.parts.outcome[lang][0], v) },
      { key: 'theme', text: T.theme[lang][themeKey] + ' ' + T.tone[cards[2].tag][lang] },
      { key: 'advice', text: fill(pick(T.parts.advice, 4), v) },
      { key: 'closing', text: topic.closing[lang] },
      { key: 'disclaimer', text: T.disclaimer[lang] },
    ],
  };
}

/** Draw three different cards. Pass a seeded random function for a daily lock. */
export function drawCards(cards: Card[], random: () => number = Math.random): [string, string, string] {
  const ids = new Set<string>();
  while (ids.size < 3) ids.add(cards[Math.floor(random() * cards.length)].id);
  return [...ids] as [string, string, string];
}
