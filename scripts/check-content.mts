// Checks all content and reproduces the worked example. Run: npm run check
import assert from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { buildReading, drawCards } from '../src/engine/reading.ts';
import type { Content, QuestionReading } from '../src/engine/types.ts';

const load = (f: string) => JSON.parse(readFileSync(new URL(`../src/content/${f}.json`, import.meta.url), 'utf8'));
const content: Content = { cards: load('cards'), zodiac: load('zodiac'), topics: load('topics'), templates: load('templates') };
const genericContent = { ...content };
const questionReadings: Record<string, QuestionReading> = {};
const readingFiles = readdirSync(new URL('../src/content/readings/', import.meta.url)).filter(f => f.endsWith('.json'));
const appContentSource = readFileSync(new URL('../src/content/index.ts', import.meta.url), 'utf8');
const questionIds = new Set(content.topics.flatMap(t => t.questions.map(q => q.id)));
const positions = ['present', 'challenge', 'outcome'] as const;
const languages = ['en', 'km'] as const;
for (const file of readingFiles) {
  const saved: QuestionReading = load(`readings/${file.slice(0, -5)}`);
  assert.equal(file, `${saved.questionId}.json`, 'reading filename matches question ID');
  assert.ok(questionIds.has(saved.questionId), `${file}: known question`);
  assert.ok(appContentSource.includes(`'./readings/${file}'`), `${file}: imported by the app`);
  assert.deepEqual(Object.keys(saved).sort(), ['cards', 'questionId'], `${file}: expected structure`);
  assert.deepEqual(Object.keys(saved.cards).sort(), content.cards.map(c => c.id).sort(), `${file}: exactly the 78 known cards`);
  for (const c of content.cards) {
    const entry = saved.cards[c.id]!;
    assert.deepEqual(Object.keys(entry).sort(), [...positions].sort(), `${file} ${c.id}: all three positions`);
    for (const p of positions) {
      assert.deepEqual(Object.keys(entry[p]).sort(), [...languages].sort(), `${file} ${c.id} ${p}: both languages`);
      for (const lang of languages) {
        const text = entry[p][lang];
        assert.ok(typeof text === 'string' && text.trim() === text && text.length > 20, `${file} ${c.id} ${p} ${lang}: complete text`);
        assert.ok(!/[{}]|undefined|TODO|TBD|interpretation here/i.test(text), `${file} ${c.id} ${p} ${lang}: no placeholders`);
        assert.notEqual(text, c.meaning[p][lang], `${file} ${c.id} ${p} ${lang}: authored interpretation, not copied generic meaning`);
        assert.ok(lang === 'en' ? !/[\u1780-\u17ff]/.test(text) : /[\u1780-\u17ff]/.test(text) && !/[A-Za-z]/.test(text), `${file} ${c.id} ${p} ${lang}: one language only`);
      }
    }
  }
  questionReadings[saved.questionId] = saved;
}
assert.ok(questionReadings['LF-01'], 'first question pilot is present');
content.questionReadings = questionReadings;

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
const kinds = ['state', 'heading', 'lesson', 'who', 'whatif', 'obstacle', 'how', 'yesno', 'when'];
const draws = [['MAJ-19', 'MAJ-16', 'MAJ-17'], ['CUP-03', 'SWO-10', 'PEN-06'], ['SWO-03', 'SWO-09', 'MAJ-15']];
for (const t of content.topics)
  for (const q of t.questions) {
    assert.ok(kinds.includes(q.kind), `${q.id} has an unknown kind ${q.kind}`);
    for (const tf of content.templates.timeFrames)
      for (const cardIds of draws)
        for (const lang of ['en', 'km'] as const) {
          const r = buildReading({ lang, zodiacId: 'TIG', questionId: q.id, timeFrame: tf.id, cardIds }, content);
          if (!questionReadings[q.id]) {
            assert.deepEqual(r, buildReading({ lang, zodiacId: 'TIG', questionId: q.id, timeFrame: tf.id, cardIds }, genericContent), `${q.id}: existing reading unchanged`);
          }
          for (const p of r.parts) assert.ok(p.text && !/[{}]|undefined/.test(p.text), `${q.id} ${tf.id} ${lang} ${p.key}: ${p.text}`);
          if (lang === 'km') assert.ok(r.parts.every(p => !/[A-Za-z]{3,}/.test(p.text)), `${q.id} Khmer has English words`);
          assert.ok(r.parts.some(p => p.key === 'answer'), `${q.id} answer line`);
          const all = r.parts.map(p => p.text).join(' ');
          // The lean and the summary's mood always agree.
          if (lang === 'en' && /towards yes|sooner rather/.test(all)) assert.ok(all.includes('outlook is bright'), `${q.id} yes lean with a non-bright mood`);
          if (lang === 'en' && /not yet|waiting and preparing/.test(all)) assert.ok(all.includes('asks for care'), `${q.id} not-yet lean with a non-testing mood`);
        }
  }

// Every saved interpretation is selected in its actual position, in both languages,
// across every time frame and animal. Checks the same parts consumed by result/full/viewer.
let savedCases = 0;
const contentBefore = JSON.stringify(content);
for (const saved of Object.values(questionReadings))
  for (const [i, c] of content.cards.entries())
    for (const [slot, position] of positions.entries())
      for (const lang of languages)
        for (const tf of content.templates.timeFrames)
          for (const zodiac of content.zodiac) {
            const others = [content.cards[(i + 1) % 78].id, content.cards[(i + 2) % 78].id];
            const cardIds = [...others];
            cardIds.splice(slot, 0, c.id);
            const request = { lang, zodiacId: zodiac.id, questionId: saved.questionId, timeFrame: tf.id, cardIds };
            const r = buildReading(request, content);
            assert.ok(partText(r, position).includes(saved.cards[c.id]![position][lang]), `${saved.questionId} ${c.id} ${position} ${lang}: saved text used`);
            if (slot === 0 && saved.questionId === 'LF-01') {
              assert.ok(partText(r, 'answer').includes(saved.cards[c.id]!.present[lang]), 'overall answer uses saved present text too');
            }
            assert.deepEqual(buildReading(request, content), r, 'saved readings remain deterministic');
            assert.equal(r.parts.at(-1)?.key, 'disclaimer', 'disclaimer remains last');
            for (const p of r.parts) {
              assert.ok(p.text && !/[{}]|undefined/.test(p.text), `${saved.questionId}: complete ${p.key}`);
              assert.ok(lang === 'km' ? !/[A-Za-z]/.test(p.text) : !/[\u1780-\u17ff]/.test(p.text), `${saved.questionId}: entire reading stays in ${lang}`);
            }
            savedCases++;
          }
assert.equal(JSON.stringify(content), contentBefore, 'reading generation does not mutate content');

// A missing entry falls back to the generic meaning without changing other positions.
const pilotInput = { lang: 'en', zodiacId: 'TIG', questionId: 'LF-01', timeFrame: 'present', cardIds: ['CUP-03', 'CUP-10', 'CUP-11'] } as const;
const request = { ...pilotInput, cardIds: [...pilotInput.cardIds] };
const pilot = buildReading(request, content);
const generic = buildReading(request, genericContent);
const partialContent: Content = { ...content, questionReadings: { 'LF-01': { questionId: 'LF-01', cards: { 'CUP-03': questionReadings['LF-01'].cards['CUP-03'] } } } };
const partial = buildReading(request, partialContent);
assert.equal(partText(partial, 'present'), partText(pilot, 'present'), 'available saved entry wins');
assert.equal(partText(partial, 'challenge'), partText(generic, 'challenge'), 'missing challenge falls back');
assert.equal(partText(partial, 'outcome'), partText(generic, 'outcome'), 'missing outcome falls back');
assert.ok(partText(pilot, 'challenge').includes('Expecting your life or relationships to look perfect'), 'screenshot uses question-specific Ten of Cups challenge');
assert.ok(partText(pilot, 'outcome').includes('a kind gesture or a creative possibility'), 'screenshot uses question-specific Page of Cups outcome');
console.log(`Saved reading checks passed: ${readingFiles.length} question files, ${savedCases} card/position/language/time/animal cases; other questions retain existing text.`);

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
