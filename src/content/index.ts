import cards from './cards.json';
import zodiac from './zodiac.json';
import topics from './topics.json';
import templates from './templates.json';
import uiStrings from './ui-strings.json';
import legalText from './legal.json';
import lifePath from './readings/LF-01.json';
import currentFocus from './readings/LF-02.json';
import zodiacReadingText from './zodiac-readings.json';
import type { Content, QuestionReading, ZodiacReading } from '../engine/types.ts';

const questionReadings = { 'LF-01': lifePath, 'LF-02': currentFocus } satisfies Record<string, QuestionReading>;
const zodiacReadings = zodiacReadingText satisfies Record<string, ZodiacReading>;
export const content = { cards, zodiac, topics, templates, questionReadings, zodiacReadings } as unknown as Content;
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
