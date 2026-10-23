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
const partText = (r: typeof en, key: string) => r.parts.find(p => p.key === key)?.text ?? '';
assert.ok(partText(en, 'theme').startsWith('Two or more Major cards'), 'Major theme');
assert.ok(km.parts.every(p => !/[A-Za-z]{3,}/.test(p.text)), 'Khmer reading has no English words');
assert.equal(new Set(drawCards(content.cards)).size, 3, 'three different cards');

// Every question has a kind, and every question, time frame and language builds a complete reading.
const kinds = ['open', 'obstacle', 'how', 'yesno', 'when'];
const draws = [['MAJ-19', 'MAJ-16', 'MAJ-17'], ['CUP-03', 'SWO-10', 'PEN-06'], ['SWO-03', 'SWO-09', 'MAJ-15']];
for (const t of content.topics)
  for (const q of t.questions) {
    assert.ok(kinds.includes(q.kind), `${q.id} has an unknown kind ${q.kind}`);
    for (const tf of content.templates.timeFrames)
      for (const cardIds of draws)
        for (const lang of ['en', 'km'] as const) {
          const r = buildReading({ lang, zodiacId: 'TIG', questionId: q.id, timeFrame: tf.id, cardIds }, content);
          for (const p of r.parts) assert.ok(p.text && !/[{}]|undefined/.test(p.text), `${q.id} ${tf.id} ${lang} ${p.key}: ${p.text}`);
          if (lang === 'km') assert.ok(r.parts.every(p => !/[A-Za-z]{3,}/.test(p.text)), `${q.id} Khmer has English words`);
          assert.equal(r.parts.some(p => p.key === 'answer'), q.kind !== 'open', `${q.id} answer line`);
        }
  }

// Yes/no questions lean with the mood of all three cards.
const lean = (cardIds: string[]) =>
  partText(buildReading({ lang: 'en', zodiacId: 'TIG', questionId: 'LR-03', timeFrame: 'near', cardIds }, content), 'answer');
assert.ok(lean(['MAJ-19', 'MAJ-17', 'MAJ-21']).includes('towards yes'), 'bright draw leans yes');
assert.ok(lean(['SWO-03', 'SWO-09', 'SWO-10']).includes('not yet'), 'testing draw leans not yet');
// A challenges question names the challenge first and no longer says "heading right now".
const obstacle = buildReading({ lang: 'en', zodiacId: 'TIG', questionId: 'LF-03', timeFrame: 'present', cardIds: ['MAJ-18', 'PEN-07', 'WAN-06'] }, content);
assert.ok(partText(obstacle, 'answer').includes('Seven of Pentacles'), 'obstacle answer names the challenge card');
assert.ok(!obstacle.parts.some(p => p.text.includes('heading right now')), 'no "heading right now"');

// Legal text: English and Khmer line up, and only the known placeholders are used.
const legalText = load('legal');
for (const doc of ['notice', 'privacy', 'terms'] as const) {
  const [e, k] = [legalText[doc].en, legalText[doc].km];
  assert.equal((e.body ?? e.items).length, (k.body ?? k.items).length, `${doc}: English and Khmer have the same number of parts`);
  for (const text of JSON.stringify([e, k]).match(/\{[a-zA-Z]+\}/g) ?? [])
    assert.ok(['{company}', '{email}', '{minAge}', '{effective}'].includes(text), `${doc}: unknown placeholder ${text}`);
}
const unfilled = Object.entries(legalText.values).filter(([, v]) => String(v).startsWith('['));
if (unfilled.length) console.log(`Note: legal placeholders still to fill after legal review: ${unfilled.map(([k]) => k).join(', ')}`);

console.log(en.parts.map(p => p.text).join('\n\n'));
console.log('\nAll content checks passed.');
