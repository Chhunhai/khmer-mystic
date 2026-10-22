import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { restoreFlow } from '../src/state/persistence.ts';
import type { Content } from '../src/engine/types.ts';
import type { FlowState } from '../src/state/flow.tsx';
const content = Object.fromEntries(['cards', 'zodiac', 'topics', 'templates'].map(name =>
  [name, JSON.parse(readFileSync(new URL(`../src/content/${name}.json`, import.meta.url), 'utf8'))])) as unknown as Content;
const initial: FlowState = { lang: 'en', zodiacId: null, topicId: null, questionId: null, timeFrame: null, cardIds: null, flipped: [false, false, false] };
const saved: FlowState = { lang: 'km', zodiacId: 'RAB', topicId: 'LF', questionId: 'LF-02', timeFrame: 'near', cardIds: ['MAJ-00', 'MAJ-01', 'MAJ-02'], flipped: [true, false, true] };
const restore = (value: unknown) => restoreFlow(JSON.stringify(value), initial, content);
assert.deepEqual(restore(saved), saved);
assert.deepEqual(restoreFlow('{broken', initial, content), initial);
assert.deepEqual(restore(null), initial);
assert.deepEqual(restore({ ...saved, zodiacId: 'missing' }), { ...initial, lang: 'km' });
assert.equal(restore({ ...saved, questionId: 'missing' }).timeFrame, null);
assert.equal(restore({ ...saved, cardIds: ['MAJ-00', 'MAJ-00', 'MAJ-02'] }).cardIds, null);
assert.deepEqual(restore({ ...saved, flipped: [true, 'yes', false] }).flipped, initial.flipped);
console.log('Persistence checks passed: valid sessions, malformed data, stale IDs, duplicate cards, and invalid reveal state.');
