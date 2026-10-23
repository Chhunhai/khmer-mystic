import cards from './cards.json';
import zodiac from './zodiac.json';
import topics from './topics.json';
import templates from './templates.json';
import uiStrings from './ui-strings.json';
import legalText from './legal.json';
import lifePath from './readings/LF-01.json';
import currentFocus from './readings/LF-02.json';
import comingChallenges from './readings/LF-03.json';
import LF04 from './readings/LF-04.json';
import LF05 from './readings/LF-05.json';
import LF06 from './readings/LF-06.json';
import LF07 from './readings/LF-07.json';
import LF08 from './readings/LF-08.json';
import LF09 from './readings/LF-09.json';
import LF10 from './readings/LF-10.json';
import LR01 from './readings/LR-01.json';
import LR02 from './readings/LR-02.json';
import LR03 from './readings/LR-03.json';
import LR04 from './readings/LR-04.json';
import LR05 from './readings/LR-05.json';
import LR06 from './readings/LR-06.json';
import LR07 from './readings/LR-07.json';
import LR08 from './readings/LR-08.json';
import LR09 from './readings/LR-09.json';
import LR10 from './readings/LR-10.json';
import CW01 from './readings/CW-01.json';
import CW02 from './readings/CW-02.json';
import CW03 from './readings/CW-03.json';
import CW04 from './readings/CW-04.json';
import CW05 from './readings/CW-05.json';
import CW06 from './readings/CW-06.json';
import CW07 from './readings/CW-07.json';
import CW08 from './readings/CW-08.json';
import CW09 from './readings/CW-09.json';
import CW10 from './readings/CW-10.json';
import MF01 from './readings/MF-01.json';
import MF02 from './readings/MF-02.json';
import MF03 from './readings/MF-03.json';
import MF04 from './readings/MF-04.json';
import MF05 from './readings/MF-05.json';
import MF06 from './readings/MF-06.json';
import MF07 from './readings/MF-07.json';
import MF08 from './readings/MF-08.json';
import MF09 from './readings/MF-09.json';
import MF10 from './readings/MF-10.json';
import BI01 from './readings/BI-01.json';
import BI02 from './readings/BI-02.json';
import BI03 from './readings/BI-03.json';
import BI04 from './readings/BI-04.json';
import BI05 from './readings/BI-05.json';
import BI06 from './readings/BI-06.json';
import BI07 from './readings/BI-07.json';
import BI08 from './readings/BI-08.json';
import BI09 from './readings/BI-09.json';
import BI10 from './readings/BI-10.json';
import FF01 from './readings/FF-01.json';
import FF02 from './readings/FF-02.json';
import FF03 from './readings/FF-03.json';
import FF04 from './readings/FF-04.json';
import FF05 from './readings/FF-05.json';
import FF06 from './readings/FF-06.json';
import zodiacReadingText from './zodiac-readings.json';
import type { Content, QuestionReading, ZodiacReading } from '../engine/types.ts';

const questionReadings = {
  'LF-01': lifePath,
  'LF-02': currentFocus,
  'LF-03': comingChallenges,
  'LF-04': LF04,
  'LF-05': LF05,
  'LF-06': LF06,
  'LF-07': LF07,
  'LF-08': LF08,
  'LF-09': LF09,
  'LF-10': LF10,
  'LR-01': LR01,
  'LR-02': LR02,
  'LR-03': LR03,
  'LR-04': LR04,
  'LR-05': LR05,
  'LR-06': LR06,
  'LR-07': LR07,
  'LR-08': LR08,
  'LR-09': LR09,
  'LR-10': LR10,
  'CW-01': CW01,
  'CW-02': CW02,
  'CW-03': CW03,
  'CW-04': CW04,
  'CW-05': CW05,
  'CW-06': CW06,
  'CW-07': CW07,
  'CW-08': CW08,
  'CW-09': CW09,
  'CW-10': CW10,
  'MF-01': MF01,
  'MF-02': MF02,
  'MF-03': MF03,
  'MF-04': MF04,
  'MF-05': MF05,
  'MF-06': MF06,
  'MF-07': MF07,
  'MF-08': MF08,
  'MF-09': MF09,
  'MF-10': MF10,
  'BI-01': BI01,
  'BI-02': BI02,
  'BI-03': BI03,
  'BI-04': BI04,
  'BI-05': BI05,
  'BI-06': BI06,
  'BI-07': BI07,
  'BI-08': BI08,
  'BI-09': BI09,
  'BI-10': BI10,
  'FF-01': FF01,
  'FF-02': FF02,
  'FF-03': FF03,
  'FF-04': FF04,
  'FF-05': FF05,
  'FF-06': FF06,
} satisfies Record<string, QuestionReading>;
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
