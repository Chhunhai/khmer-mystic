// Checks all content and reproduces the worked example. Run: npm run check
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { buildReading, drawCards } from '../src/engine/reading.ts';
import type { Content } from '../src/engine/types.ts';

const load = (f: string) => JSON.parse(readFileSync(new URL(`../src/content/${f}.json`, import.meta.url), 'utf8'));
const content: Content = { cards: load('cards'), zodiac: load('zodiac'), topics: load('topics'), templates: load('templates') };

assert.equal(content.cards.length, 78, '78 cards');
assert.equal(content.zodiac.length, 12, '12 zodiac animals');
assert.equal(content.topics.length, 10, '10 topics');
assert.equal(content.topics.reduce((n, t) => n + t.questions.length, 0), 100, '100 questions');
for (const c of content.cards)
  for (const p of ['present', 'challenge', 'outcome'] as const)
    for (const l of ['en', 'km'] as const) assert.ok(c.meaning[p][l], `missing ${c.id} ${p} ${l}`);

const input = { zodiacId: 'RAB', questionId: 'LF-02', timeFrame: 'near', cardIds: ['MAJ-19', 'MAJ-16', 'MAJ-17'] } as const;
const en = buildReading({ ...input, cardIds: [...input.cardIds], lang: 'en' }, content);
const km = buildReading({ ...input, cardIds: [...input.cardIds], lang: 'km' }, content);
assert.deepEqual(buildReading({ ...input, cardIds: [...input.cardIds], lang: 'en' }, content), en, 'same inputs, same reading');
assert.ok(en.parts[5].text.startsWith('Two or more Major cards'), 'Major theme');
assert.ok(km.parts.every(p => !/[A-Za-z]{3,}/.test(p.text)), 'Khmer reading has no English words');
assert.equal(new Set(drawCards(content.cards)).size, 3, 'three different cards');

console.log(en.parts.map(p => p.text).join('\n\n'));
console.log('\nAll content checks passed.');
