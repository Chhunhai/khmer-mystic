import cards from './cards.json';
import zodiac from './zodiac.json';
import topics from './topics.json';
import templates from './templates.json';
import uiStrings from './ui-strings.json';
import legalText from './legal.json';
import lifePath from './readings/LF-01.json';
import type { Content, QuestionReading } from '../engine/types.ts';

const questionReadings = { 'LF-01': lifePath } satisfies Record<string, QuestionReading>;
export const content = { cards, zodiac, topics, templates, questionReadings } as unknown as Content;
export { uiStrings };

type Lang = 'en' | 'km';
const fillLegal = (text: string) =>
  text.replace(/\{(company|email|minAge|effective)\}/g, (_, k: keyof typeof legalText.values) => legalText.values[k]);

/** First-launch notice, privacy notice and terms, with the placeholders filled from legal.json `values`. */
export function legal(lang: Lang) {
  const n = legalText.notice[lang];
  const p = legalText.privacy[lang];
  const t = legalText.terms[lang];
  return {
    notice: { title: n.title, button: n.button, body: n.body.map(fillLegal) },
    privacy: { title: p.title, body: p.body.map(fillLegal) },
    terms: { title: t.title, effective: fillLegal(t.effective), items: t.items.map(([h, body]) => [h, fillLegal(body)] as const) },
  };
}
